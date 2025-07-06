"use client"
import type React from "react"
import { useState, useEffect } from "react"

interface Budget {
  id: string
  category: string
  limit: number
  spent: number
}

interface EditBudgetModalProps {
  isOpen: boolean
  onClose: () => void
  onUpdate: (budget: Budget) => void
  budget?: Budget
  budgets: Budget[] 
}

const budgetCategories = [
  "Food & Dining",
  "Transportation",
  "Entertainment",
  "Shopping",
  "Bills & Utilities",
  "Healthcare",
  "Education",
  "Groceries",
  "Gas & Fuel",
  "Personal Care",
  "Other",
]

function EditBudgetModal({ isOpen, onClose, onUpdate, budget, budgets }: EditBudgetModalProps) {
  const [formData, setFormData] = useState({
    category: "",
    limit: 0,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const availableCategories = budgetCategories.filter((cat) => {
    if (budget && budget.category === cat) {
      return true
    }
    return !budgets.some((existingBudget) => existingBudget.category === cat)
  })

  const existingCategories = budgets.map((b) => b.category)

  useEffect(() => {
    if (budget) {
      setFormData({
        category: budget.category,
        limit: budget.limit,
      })
    } else {
      setFormData({
        category: "",
        limit: 0,
      })
    }
    setErrors({})
  }, [budget])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}

    if (!formData.category) {
      newErrors.category = "Category is required"
    }

    if (!budget && formData.category) {
      const isDuplicate = budgets.some((existingBudget) => existingBudget.category === formData.category)
      if (isDuplicate) {
        newErrors.category = "A budget for this category already exists"
      }
    }

    const limitValue = Number.parseFloat(formData.limit.toString())
    if (!formData.limit || isNaN(limitValue) || limitValue <= 0) {
      newErrors.limit = "Budget limit must be greater than 0"
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length === 0) {
      const updatedBudget: Budget = {
        id: budget?.id || Date.now().toString(),
        category: formData.category,
        limit: limitValue,
        spent: budget?.spent || 0,
      }
      onUpdate(updatedBudget)

      if (!budget) {
        setFormData({
          category: "",
          limit: 0,
        })
      }
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const percentage = budget && budget?.limit > 0 && (budget.spent / budget.limit) * 100 
  const isOverBudget = percentage && percentage > 100

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{budget ? "Edit Budget" : "Set Budget"}</h2>
            <p className="text-sm text-gray-600 mt-1">
              {budget ? "Update your budget settings" : "Set spending limits for your expense categories"}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {!budget && availableCategories.length === 0 ? (
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

              {/* Show all existing budget categories as tags */}
              <div className="mb-4">
                <p className="text-xs text-green-600 mb-2">Your budget categories:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {existingCategories.map((cat) => (
                    <span
                      key={cat}
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              </div>

              <p className="text-xs text-green-600 mb-4">
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
          <>
            {/* Current Budget Status - only show when editing */}
            {budget && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Current Status</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Spent:</span>
                    <span className="font-medium">
                      ₱{budget.spent.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Current Limit:</span>
                    <span className="font-medium">
                      ₱{budget.limit.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        isOverBudget ? "bg-red-500" :  percentage && percentage > 80 ? "bg-yellow-500" : "bg-green-500"
                      }`}
                      style={{ width:   ` ${ percentage && Math.min( percentage, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{ percentage&& percentage.toFixed(1)}% used</span>
                    {isOverBudget && (
                      <span className="text-red-600 font-medium">
                        Over by ₱{(budget.spent - budget.limit).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleChange("category", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.category ? "border-red-500" : "border-gray-300"
                  }`}
                  required
                >
                  <option value="">Select expense category</option>
                  {availableCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
                {!budget && (
                  <p className="text-xs text-gray-500 mt-1">
                    {availableCategories.length} of {budgetCategories.length} categories available for budgeting
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Budget Limit (PHP)
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                    ₱
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formData.limit}
                    onChange={(e) => handleChange("limit", e.target.value)}
                    className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.limit ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="5000.00"
                    required
                  />
                </div>
                {errors.limit && <p className="text-red-500 text-sm mt-1">{errors.limit}</p>}
                <p className="text-xs text-gray-500 mt-1">Set your monthly spending limit for this category</p>
              </div>

              {/* Show existing budgets info when creating new budget */}
              {!budget && budgets.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <svg
                      className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0"
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
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-blue-900 mb-2">Existing Budgets</h4>
                      <div className="flex flex-wrap gap-1">
                        {existingCategories.map((cat) => (
                          <span
                            key={cat}
                            className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200"
                          >
                            {cat}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {formData.limit !== 0  && !isNaN(Number.parseFloat(formData.limit.toString())) && Number.parseFloat(formData.limit.toString()) !== 0 && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="text-sm font-medium text-green-900 mb-2">Preview</h4>
                  <div className="space-y-1 text-sm text-green-800">
                    <div className="flex justify-between">
                      <span>New Limit:</span>
                      <span className="font-medium">
                        ₱{Number.parseFloat(formData.limit.toString()).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    {budget && (
                      <>
                        <div className="flex justify-between">
                          <span>Already Spent:</span>
                          <span className="font-medium">
                            ₱{budget.spent.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Remaining:</span>
                          <span
                            className={`font-medium ${
                              Number.parseFloat(formData.limit.toString()) - budget.spent >= 0 ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            ₱
                            {(Number.parseFloat(formData.limit.toString()) - budget.spent).toLocaleString("en-PH", {
                              minimumFractionDigits: 2,
                            })}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Budget Tip */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start">
                  <svg
                    className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0"
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
                      {budget
                        ? "Adjusting your budget limit will affect future spending calculations."
                        : "Start with realistic amounts based on your past spending. You can always adjust budgets later."}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    !formData.category ||
                    !formData.limit ||
                    isNaN(Number.parseFloat(formData.limit.toString())) ||
                    Number.parseFloat(formData.limit.toString()) <= 0
                  }
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {budget ? "Update Budget" : "Set Budget"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

export default EditBudgetModal
