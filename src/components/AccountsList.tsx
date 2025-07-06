import type { AccountsListProps } from "../utils/type"


const formatPHP = (amount: number): string => {
  return amount.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

const AccountsList  = ({ accounts } :AccountsListProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      
        {accounts.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No transactions found</p>
        ) : (
      accounts.map((account) => (
        <div key={account.id} className="bg-gray-50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-lg">{account.name}</h3>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-gray-200 px-2 py-1 rounded">PHP</span>
              <div className={`w-4 h-4 rounded-full ${account.color}`} />
            </div>
          </div>
          {account.bankName && <p className="text-sm text-gray-600 mb-3">{account.bankName}</p>}
          <div className={`text-2xl font-bold mb-2 ${account.balance >= 0 ? "text-green-600" : "text-red-600"}`}>
            {formatPHP(Math.abs(account.balance))}
          </div>
          <div className="flex items-center justify-between">
            <span
              className={`px-2 py-1 rounded text-sm ${
                account.type === "credit" ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"
              }`}
            >
              {account.type}
            </span>
            {account.balance < 0 && <span className="text-sm text-red-600 font-medium">Debt</span>}
          </div>
        </div>
     )
          )
        )}
    </div>
  )
}

export default AccountsList
