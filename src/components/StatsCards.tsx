import type { StatsCardsProps } from "../utils/type"



const formatPHP = (amount: number): string => {
  return amount.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

const StatsCards = ({ transactions, accounts, budgets }:StatsCardsProps) => {
  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0)

  const currentMonth = new Date().getMonth()
  const monthlyIncome = transactions
    .filter((t) => t.type === "income" && new Date(t.date).getMonth() === currentMonth)
    .reduce((sum, t) => sum + t.amount, 0)

  const monthlyExpenses = transactions
    .filter((t) => t.type === "expense" && new Date(t.date).getMonth() === currentMonth)
    .reduce((sum, t) => sum + t.amount, 0)

  const totalBudget = budgets.reduce((sum, b) => sum + b.limit, 0)
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0)
  const budgetPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0

  const stats = [
    {
      title: "Total Balance",
      value: formatPHP(totalBalance),
      subtitle: "Across all accounts",
      color: totalBalance >= 0 ? "text-blue-600" : "text-red-600",
      bg: totalBalance >= 0 ? "bg-blue-50" : "bg-red-50",
    },
    {
      title: "Monthly Income",
      value: formatPHP(monthlyIncome),
      subtitle: "This month",
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "Monthly Expenses",
      value: formatPHP(monthlyExpenses),
      subtitle: "This month",
      color: "text-red-600",
      bg: "bg-red-50",
    },
    {
      title: "Budget Used",
      value: `${budgetPercentage.toFixed(0)}%`,
      subtitle: `${formatPHP(totalSpent)} of ${formatPHP(totalBudget)}`,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{stat.title}</p>
              <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-gray-500 mt-1">{stat.subtitle}</p>
            </div>
            <div className={`${stat.bg} ${stat.color} p-3 rounded-full`}>
              <div className="w-6 h-6"></div>
            </div>
          </div>
          {stat.title === "Budget Used" && (
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    budgetPercentage > 100 ? "bg-red-500" : budgetPercentage > 80 ? "bg-yellow-500" : "bg-green-500"
                  }`}
                  style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default StatsCards
