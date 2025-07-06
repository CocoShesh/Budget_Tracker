"use client"
import { useState } from "react"
import type { MonthlyData } from "../utils/MonthlyStorage"
import type { MonthlyHistoryModalProps } from "../utils/type"



function MonthlyHistoryModal({ isOpen, onClose, monthlyData, onDeleteMonth }: MonthlyHistoryModalProps) {
  const [selectedMonth, setSelectedMonth] = useState<MonthlyData | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  if (!isOpen) return null

  const formatPHP = (amount: number): string => {
    return amount.toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  const handleDeleteMonth = (month: string) => {
    onDeleteMonth(month)
    setDeleteConfirm(null)
    if (selectedMonth?.month === month) {
      setSelectedMonth(null)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Monthly History</h2>
            <p className="text-sm text-gray-600 mt-1">View your past months' financial data</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Months List */}
          <div className="w-1/3 border-r bg-gray-50 overflow-y-auto">
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Select Month</h3>
              {monthlyData.length === 0 ? (
                <p className="text-gray-500 text-sm">No historical data available</p>
              ) : (
                <div className="space-y-2">
                  {monthlyData.map((data) => (
                    <div
                      key={data.month}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedMonth?.month === data.month
                          ? "bg-blue-100 border-blue-200 border"
                          : "bg-white hover:bg-gray-100 border border-gray-200"
                      }`}
                      onClick={() => setSelectedMonth(data)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">{data.monthName}</p>
                          <p className="text-xs text-gray-500">{data.transactions.length} transactions</p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setDeleteConfirm(data.month)
                          }}
                          className="text-red-400 hover:text-red-600 p-1"
                          title="Delete month data"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Month Details */}
          <div className="flex-1 overflow-y-auto">
            {selectedMonth ? (
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">{selectedMonth.monthName}</h3>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-600 font-medium">Total Balance</p>
                    <p className="text-lg font-bold text-blue-900">₱{formatPHP(selectedMonth.totalBalance)}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-green-600 font-medium">Income</p>
                    <p className="text-lg font-bold text-green-900">₱{formatPHP(selectedMonth.totalIncome)}</p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <p className="text-sm text-red-600 font-medium">Expenses</p>
                    <p className="text-lg font-bold text-red-900">₱{formatPHP(selectedMonth.totalExpenses)}</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-sm text-purple-600 font-medium">Budget Used</p>
                    <p className="text-lg font-bold text-purple-900">{selectedMonth.budgetUtilization.toFixed(0)}%</p>
                  </div>
                </div>

                {/* Transactions */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Transactions ({selectedMonth.transactions.length})
                  </h4>
                  <div className="bg-gray-50 rounded-lg max-h-60 overflow-y-auto">
                    {selectedMonth.transactions.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">No transactions</p>
                    ) : (
                      <div className="divide-y divide-gray-200">
                        {selectedMonth.transactions.slice(0, 10).map((transaction, index) => (
                          <div key={index} className="p-3 flex justify-between items-center">
                            <div>
                              <p className="font-medium text-gray-900">{transaction.description}</p>
                              <p className="text-sm text-gray-500">{transaction.category}</p>
                            </div>
                            <div
                              className={`font-semibold ${transaction.type === "income" ? "text-green-600" : "text-red-600"}`}
                            >
                              {transaction.type === "income" ? "+" : "-"}₱{formatPHP(transaction.amount)}
                            </div>
                          </div>
                        ))}
                        {selectedMonth.transactions.length > 10 && (
                          <div className="p-3 text-center text-gray-500 text-sm">
                            And {selectedMonth.transactions.length - 10} more transactions...
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Budgets */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Budgets ({selectedMonth.budgets.length})</h4>
                  <div className="space-y-2">
                    {selectedMonth.budgets.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">No budgets were set</p>
                    ) : (
                      selectedMonth.budgets.map((budget, index) => {
                        const percentage = budget.limit > 0 ? (budget.spent / budget.limit) * 100 : 0
                        return (
                          <div key={index} className="bg-gray-50 p-3 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-medium">{budget.category}</span>
                              <span className="text-sm text-gray-600">
                                ₱{formatPHP(budget.spent)} / ₱{formatPHP(budget.limit)}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  percentage > 100 ? "bg-red-500" : percentage > 80 ? "bg-yellow-500" : "bg-green-500"
                                }`}
                                style={{ width: `${Math.min(percentage, 100)}%` }}
                              />
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p>Select a month to view details</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Delete Confirmation */}
        {deleteConfirm && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Month Data?</h3>
              <p className="text-gray-600 mb-4">
                This will permanently delete all data for{" "}
                {monthlyData.find((d) => d.month === deleteConfirm)?.monthName}. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteMonth(deleteConfirm)}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MonthlyHistoryModal
