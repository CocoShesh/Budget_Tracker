import { formatPHP } from "../utils/currency"
import type { Account, BankSummaryProps } from "../utils/type"


export function BankSummary({ accounts }: BankSummaryProps) {
  // Group accounts by bank
  const bankGroups = accounts.reduce(
    (groups, account) => {
      const bankName = account.bank_name || "Cash/Other"
      if (!groups[bankName]) {
        groups[bankName] = []
      }
      groups[bankName].push(account)
      return groups
    },
    {} as Record<string, Account[]>,
  )

  const bankSummaries = Object.entries(bankGroups)
    .map(([bankName, bankAccounts]) => {
      const totalBalance = bankAccounts.reduce((sum, account) => sum + account.balance, 0)
      const accountCount = bankAccounts.length
      const assets = bankAccounts.filter((acc) => acc.balance > 0).reduce((sum, acc) => sum + acc.balance, 0)
      const debts = bankAccounts.filter((acc) => acc.balance < 0).reduce((sum, acc) => sum + Math.abs(acc.balance), 0)

      return {
        bankName,
        accounts: bankAccounts,
        totalBalance,
        accountCount,
        assets,
        debts,
      }
    })
    .sort((a, b) => b.totalBalance - a.totalBalance)

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold mb-4">Banks Overview</h3>

      {bankSummaries.map((bank) => (
        <div key={bank.bankName} className="bg-gray-50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-lg">{bank.bankName}</h4>
                <p className="text-sm text-gray-600">
                  {bank.accountCount} account{bank.accountCount !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-xl font-bold ${bank.totalBalance >= 0 ? "text-green-600" : "text-red-600"}`}>
                {formatPHP(Math.abs(bank.totalBalance))}
              </div>
              {bank.totalBalance < 0 && <span className="text-sm text-red-600">Net Debt</span>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-white rounded p-3">
              <p className="text-sm text-gray-600">Assets</p>
              <p className="text-lg font-semibold text-green-600">{formatPHP(bank.assets)}</p>
            </div>
            <div className="bg-white rounded p-3">
              <p className="text-sm text-gray-600">Debts</p>
              <p className="text-lg font-semibold text-red-600">{formatPHP(bank.debts)}</p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Accounts:</p>
            {bank.accounts.map((account) => (
              <div key={account.id} className="flex items-center justify-between bg-white rounded p-3">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${account.color}`} />
                  <span className="font-medium">{account.name}</span>
                  <span className="text-sm text-gray-500">({account.type})</span>
                </div>
                <span className={`font-semibold ${account.balance >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {formatPHP(Math.abs(account.balance))}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
