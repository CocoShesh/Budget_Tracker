"use client"
import type React from "react"
import { useState } from "react"
import { categories, type BudgetModalProps } from "../utils/type"



function BudgetModal({ budgets, onSubmit, onClose }: BudgetModalProps) {
  const [category, setCategory] = useState("")
  const [limit, setLimit] = useState("")

  const availableCategories = categories.filter((cat) => !budgets.some((budget) => budget.category === cat))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!category || !limit) {
      return
    }
    onSubmit(category, Number.parseFloat(limit))
     setCategory("")
    setLimit("")
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Set Budget</h2>
            <p className="text-sm text-gray-600 mt-1">Set spending limits for your expense categories</p>
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

        {availableCategories.length === 0 ? (
          <div className="text-center py-8">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <svg
                className="mx-auto h-12 w-12 text-green-500 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="text-lg font-semibold text-green-900 mb-2">All Categories Have Budgets!</h3>
              <p className="text-sm text-green-700 mb-4">
                You've successfully set budgets for all available expense categories.
              </p>
              <p className="text-xs text-green-600">
                You can edit existing budgets from the dashboard or delete a budget to create a new one.
              </p>
            </div>
            <button
              onClick={onClose}
              className="mt-4 bg-green-600 text-white py-2 px-6 rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Category
                <span className="text-red-500 ml-1">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                required
              >
                <option value="">Select expense category</option>
                {availableCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {availableCategories.length} of {categories.length} categories available
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Monthly Limit (PHP)
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium text-lg">
                  ₱
                </span>
                <input
                  type="number"
                  step="0.01"
                  placeholder="5000.00"
                  value={limit}
                  onChange={(e) => setLimit(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg pl-8 pr-3 py-2.5 text-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Set your monthly spending limit for this category</p>
            </div>

            {budgets.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <svg
                    className="w-5 h-5 text-blue-600 mt-0.5 mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div>
                    <h4 className="text-sm font-medium text-blue-900">Existing Budgets</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      You already have budgets set for: {budgets.map((b) => b.category).join(", ")}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start">
                <svg
                  className="w-5 h-5 text-green-600 mt-0.5 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <h4 className="text-sm font-medium text-green-900">Budget Tip</h4>
                  <p className="text-sm text-green-700 mt-1">
                    Start with realistic amounts based on your past spending. You can always adjust budgets later from
                    the dashboard.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium shadow-lg"
              >
                Set Budget
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default BudgetModal
