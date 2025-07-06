"use client"
import type React from "react"
import { useState, useEffect } from "react"
import { expenseCategories, type TransactionModalProps } from "../utils/type"



function formatPHP(amount: number) {
  return amount.toLocaleString("en-PH", {
    style: "currency",
    currency: "PHP",
  })
}

export default function TransactionModal({ accounts, budgets, onSubmit, onClose }: TransactionModalProps) {
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [accountId, setAccountId] = useState("")

  const selectedBudget = budgets.find((budget) => budget.category === category)
  const hasBudget = !!selectedBudget

  const remainingBudget = selectedBudget ? selectedBudget.limit - selectedBudget.spent : 0
  const expenseAmount = Number.parseFloat(amount) || 0
  const willExceedBudget = hasBudget && expenseAmount > remainingBudget

  useEffect(() => {
    if (!hasBudget && accounts.length > 0 && !accountId) {
      setAccountId(accounts[0].id)
    }
  }, [hasBudget, accounts, accountId])

  useEffect(() => {
    if (hasBudget) {
      setAccountId("")
    }
  }, [hasBudget])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!amount || !category || !description) return
    if (!hasBudget && !accountId) return

    onSubmit({
      type: "expense",
      amount: Number.parseFloat(amount),
      category,
      description,
      date,
      accountId: hasBudget ? "" : accountId, 
      hasBudget, 
    })

    setAmount("")
    setCategory("")
    setDescription("")
    setAccountId("")
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Add Expense</h2>
            <p className="text-sm text-gray-600 mt-1">Track your spending and stay within budget</p>
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

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Amount (PHP)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">₱</span>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg pl-8 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white"
              required
            >
              <option value="">Select expense category</option>
              {expenseCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat} {budgets.find((b) => b.category === cat) ? "💰" : ""}
                </option>
              ))}
            </select>

            {category && (
              <div className="mt-2">
                {hasBudget ? (
                  <div
                    className={`p-3 rounded-lg border ${willExceedBudget ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div
                          className={`w-2 h-2 rounded-full mr-2 ${willExceedBudget ? "bg-red-500" : "bg-green-500"}`}
                        ></div>
                        <span className={`text-sm font-medium ${willExceedBudget ? "text-red-700" : "text-green-700"}`}>
                          Budget Category
                        </span>
                      </div>
                      <span className={`text-sm ${willExceedBudget ? "text-red-600" : "text-green-600"}`}>
                        ₱{formatPHP(remainingBudget).replace("₱", "")} remaining
                      </span>
                    </div>
                    {willExceedBudget && expenseAmount > 0 && (
                      <p className="text-xs text-red-600 mt-1">
                        ⚠️ This expense will exceed your budget by ₱
                        {formatPHP(expenseAmount - remainingBudget).replace("₱", "")}
                      </p>
                    )}
                    <p className="text-xs text-gray-600 mt-1">
                      💰 This expense will be deducted from your "{category}" budget
                    </p>
                  </div>
                ) : (
                  <div className="p-3 rounded-lg border bg-blue-50 border-blue-200">
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full mr-2 bg-blue-500"></div>
                      <span className="text-sm font-medium text-blue-700">No Budget Set</span>
                    </div>
                    <p className="text-xs text-blue-600 mt-1">
                      💳 This expense will be deducted directly from your selected account
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {!hasBudget && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Account
                <span className="text-red-500 ml-1">*</span>
              </label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white"
                required={!hasBudget}
              >
                <option value="">Select account</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                {account.bankName ? `(${account.bankName})` : ""} - {formatPHP(account.balance)}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                The expense amount will be deducted from this account's balance
              </p>
            </div>
          )}

          {hasBudget && (
            <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
              <div className="flex items-center">
                <svg className="w-4 h-4 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-sm font-medium text-gray-700">Account Selection Not Required</span>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Since this category has a budget, the expense will be tracked against your budget allocation rather than
                a specific account.
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
            <textarea
              placeholder="What did you spend on? (e.g., Lunch at McDonald's, Gas for car)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              rows={3}
              required
            />
          </div>

          <div className="flex gap-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`flex-1 text-white py-3 px-4 rounded-lg transition-colors font-medium shadow-lg ${
                willExceedBudget ? "bg-orange-600 hover:bg-orange-700" : "bg-red-600 hover:bg-red-700"
              }`}
            >
              {willExceedBudget ? "Add Expense (Over Budget)" : "Add Expense"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
