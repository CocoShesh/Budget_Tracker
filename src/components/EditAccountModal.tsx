"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { accountTypes, colorOptions, type EditAccountModalProps } from "../utils/type"

function EditAccountModal({ isOpen, onClose, onUpdate, account }: EditAccountModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    type: "checking",
    balance: 0,
    color: "bg-blue-500",
    bankName: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (account) {
      setFormData({
        name: account.name,
        type: account.type,
        balance: account.balance,
        color: account.color,
        bankName: account.bankName || "",
      })
    } else {
      setFormData({
        name: "",
        type: "checking",
        balance: 0,
        color: "bg-blue-500",
        bankName: "",
      })
    }
    setErrors({})
  }, [account])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Account name is required"
    }
    if (!formData.balance || isNaN(Number.parseFloat(formData.balance.toString()))) {
      newErrors.balance = "Valid balance is required"
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length === 0) {
      const updatedAccount: any = {
        ...account,
        name: formData.name.trim(),
        type: formData.type,
        balance: Number.parseFloat(formData.balance.toString()),
        color: formData.color,
        bankName: formData.bankName.trim() || undefined,
      }

      onUpdate(updatedAccount)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  return (
     <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900"> Edit Account</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Account Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter account name"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
            <select
              value={formData.type}
              onChange={(e) => handleChange("type", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {accountTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Balance</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₱</span>
              <input
                type="number"
                step="0.01"
                value={formData.balance}
                onChange={(e) => handleChange("balance", e.target.value)}
                className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.balance ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="0.00"
              />
            </div>
            {errors.balance && <p className="text-red-500 text-sm mt-1">{errors.balance}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name (Optional)</label>
            <input
              type="text"
              value={formData.bankName}
              onChange={(e) => handleChange("bankName", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter bank name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
            <div className="grid grid-cols-4 gap-2">
              {colorOptions.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => handleChange("color", color.value)}
                  className={`w-full h-10 rounded-lg border-2 transition-all ${
                    formData.color === color.value ? "border-gray-800 scale-105" : "border-gray-300"
                  } ${color.class}`}
                  title={color.label}
                />
              ))}
            </div>
          </div>

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
              {account ? "Update Account" : "Create Account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditAccountModal
