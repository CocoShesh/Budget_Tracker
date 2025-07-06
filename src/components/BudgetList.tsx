import type { BudgetsListProps } from "../utils/type"



const formatPHP = (amount: number): string => {
  return amount.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

const BudgetsList  = ({ budgets } :BudgetsListProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {budgets.map((budget) => {
        const percentage = budget.limit > 0 ?(budget.spent / budget.limit) * 100  : 0
        const isOverBudget =  percentage > 100

        return (
          <div key={budget.id} className="bg-gray-50 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{budget.category}</h3>
              <span
                className={`px-2 py-1 rounded text-sm font-medium ${
                  isOverBudget
                    ? "bg-red-100 text-red-800"
                    :percentage && percentage > 80
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-green-100 text-green-800"
                }`}
              >
                {percentage.toFixed(0)}%
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Spent: {formatPHP(budget.spent)}</span>
                <span>Budget: {formatPHP(budget.limit)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    isOverBudget ? "bg-red-500" : percentage  && percentage  > 80 ? "bg-yellow-500" : "bg-green-500"
                  }`}
                  style={{ width: `${Math.min(percentage && percentage, 100)}%` }}
                />
              </div>
              {isOverBudget && (
                <p className="text-sm text-red-600">Over budget by {formatPHP(budget.spent - budget.limit)}</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default BudgetsList
