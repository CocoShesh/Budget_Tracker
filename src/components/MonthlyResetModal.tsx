"use client"
import { useState } from "react"
import type { MonthlyResetModalProps } from "../utils/type"


function MonthlyResetModal({ isOpen, onConfirm, onClose, previousMonthData }: MonthlyResetModalProps) {
  const [isConfirming, setIsConfirming] = useState(false)

  if (!isOpen) return null

  const handleConfirm = async () => {
    setIsConfirming(true)
    await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate processing
    onConfirm()
    setIsConfirming(false)
  }

  const formatPHP = (amount: number): string => {
    return amount.toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6">
        <div className="text-center mb-6">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
            <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">New Month Detected!</h3>
          <p className="text-sm text-gray-600">
            Welcome to {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}! Your previous
            month's data will be saved and a fresh start begins.
          </p>
        </div>

        {/* Previous Month Summary */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-gray-900 mb-3">{previousMonthData.monthName} Summary</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Total Expenses</p>
              <p className="font-semibold text-red-600">₱{formatPHP(previousMonthData.totalExpenses)}</p>
            </div>
            <div>
              <p className="text-gray-600">Total Income</p>
              <p className="font-semibold text-green-600">₱{formatPHP(previousMonthData.totalIncome)}</p>
            </div>
            <div>
              <p className="text-gray-600">Transactions</p>
              <p className="font-semibold text-gray-900">{previousMonthData.transactions.length}</p>
            </div>
            <div>
              <p className="text-gray-600">Budget Usage</p>
              <p className="font-semibold text-purple-600">{previousMonthData.budgetUtilization.toFixed(0)}%</p>
            </div>
          </div>
        </div>

        {/* What will happen */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-blue-900 mb-2">What happens next:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li className="flex items-center">
              <svg className="w-4 h-4 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Your account balances will be preserved
            </li>
            <li className="flex items-center">
              <svg className="w-4 h-4 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Previous month data will be saved to history
            </li>
            <li className="flex items-center">
              <svg className="w-4 h-4 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Transactions and budgets will be reset
            </li>
          </ul>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isConfirming}
            className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50"
          >
            Not Now
          </button>
          <button
            onClick={handleConfirm}
            disabled={isConfirming}
            className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center"
          >
            {isConfirming ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              </>
            ) : (
              "Start New Month"
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default MonthlyResetModal
