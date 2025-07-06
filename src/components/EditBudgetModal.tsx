"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { budgetCategories, type EditBudgetModalProps } from "../utils/type"


function EditBudgetModal({ isOpen, onClose, onUpdate, budget }: EditBudgetModalProps) {
  const [formData, setFormData] = useState({
    category: "",
    limit: 0,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

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
    if (!formData.limit || Number.parseFloat(formData.limit.toString()) <= 0) {
      newErrors.limit = "Budget limit must be greater than 0"
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length === 0) {
      const updatedBudget: any = {
        ...budget,
        category: formData.category,
        limit: Number.parseFloat(formData.limit.toString()),
      }

      onUpdate(updatedBudget)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const percentage =  budget && budget?.limit > 0 ? (budget.spent / budget.limit) * 100 : 0
  const isOverBudget = percentage > 100

  return (
     <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">{budget ? "Edit Budget" : "Set Budget"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

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
                    isOverBudget ? "bg-red-500" : percentage > 80 ? "bg-yellow-500" : "bg-green-500"
                  }`}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>{percentage.toFixed(1)}% used</span>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={formData.category}
              onChange={(e) => handleChange("category", e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.category ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="">Select a category</option>
              {budgetCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Budget Limit</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₱</span>
              <input
                type="number"
                step="0.01"
                value={formData.limit}
                onChange={(e) => handleChange("limit", e.target.value)}
                className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.limit ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="0.00"
              />
            </div>
            {errors.limit && <p className="text-red-500 text-sm mt-1">{errors.limit}</p>}
          </div>

          {formData.limit && Number.parseFloat(formData.limit.toString()) > 0 && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Preview</h4>
              <div className="space-y-1 text-sm text-blue-800">
                <div className="flex justify-between">
                  <span>New Limit:</span>
                  <span className="font-medium">
                    ₱{Number.parseFloat(formData.limit.toString()).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Already Spent:</span>
                  <span className="font-medium">
                    ₱{budget &&  budget.spent.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Remaining:</span>
                  <span
                    className={`font-medium ${ budget && Number.parseFloat(formData.limit.toString()) -budget.spent >= 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    ₱
                    {budget &&  (Number.parseFloat(formData.limit.toString()) - budget.spent).toLocaleString("en-PH", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {budget ? "Update Budget" : "Create Budget"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditBudgetModal
