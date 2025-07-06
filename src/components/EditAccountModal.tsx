"use client"
import type React from "react"
import { useState, useEffect } from "react"
import { accountTypes, colors, philippineBanks } from "../utils/data"
import type { Account } from "../utils/type"

interface EditAccountModalProps {
  isOpen: boolean
  onClose: () => void
  onUpdate: (account: Account) => void
  account?: Account
  accounts: Account[] 
}
function EditAccountModal({ isOpen, onClose, onUpdate, account, accounts }: EditAccountModalProps) {
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
        balance:0,
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

    if (formData.name.trim()) {
      const isDuplicate = accounts.some(
        (existingAccount) =>
          existingAccount.name.toLowerCase() === formData.name.trim().toLowerCase() &&
          existingAccount.id !== account?.id, 
      )
      if (isDuplicate) {
        newErrors.name = "An account with this name already exists"
      }
    }

    if (formData.bankName && formData.type) {
      const isDuplicateBankType = accounts.some(
        (existingAccount) =>
          existingAccount.bankName === formData.bankName &&
          existingAccount.type === formData.type &&
          existingAccount.id !== account?.id, 
      )
      if (isDuplicateBankType) {
        newErrors.bankName = `You already have a ${formData.type} account with ${formData.bankName}`
      }
    }

    if (!formData.balance) {
      newErrors.balance = "Balance is required"
    } else {
      const balanceValue = Number.parseFloat(formData.balance.toString())
      if (isNaN(balanceValue)) {
        newErrors.balance = "Please enter a valid amount"
      }
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length === 0) {
      const updatedAccount: Account = {
        id: account?.id || Date.now().toString(),
        name: formData.name.trim(),
        type: formData.type,
        balance: Number.parseFloat(formData.balance.toString()),
        color: formData.color,
        bankName: formData.bankName.trim() || undefined,
      }
      onUpdate(updatedAccount)

      if (!account) {
        setFormData({
          name: "",
          type: "checking",
          balance: 0,
          color: "bg-blue-500",
          bankName: "",
        })
        setErrors({})
      }
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const existingAccountNames = accounts.filter((acc) => acc.id !== account?.id).map((acc) => acc.name)
  const existingBankAccounts = accounts
    .filter((acc) => acc.bankName && acc.id !== account?.id)
    .map((acc) => `${acc.bankName} (${acc.type})`)

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{account ? "Edit Account" : "Add Account"}</h2>
            <p className="text-sm text-gray-600 mt-1">
              {account ? "Update your account details" : "Create a new account to track your finances"}
            </p>
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
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Account Name
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g., Main Checking, Emergency Fund"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className={`w-full border rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.name ? "border-red-500" : "border-gray-300"
              }`}
              required
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            <p className="text-xs text-gray-500 mt-1">Choose a unique name to identify this account</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Bank Name</label>
            <select
              value={formData.bankName}
              onChange={(e) => handleChange("bankName", e.target.value)}
              className={`w-full border rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white ${
                errors.bankName ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="">Select a bank (optional)</option>
              {philippineBanks.map((bank) => (
                <option key={bank} value={bank}>
                  {bank}
                </option>
              ))}
            </select>
            {errors.bankName && <p className="text-red-500 text-sm mt-1">{errors.bankName}</p>}
            <p className="text-xs text-gray-500 mt-1">Optional: Select your bank for better organization</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Account Type
                <span className="text-red-500 ml-1">*</span>
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleChange("type", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                {accountTypes.map((accountType) => (
                  <option key={accountType.value} value={accountType.value}>
                    {accountType.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Balance (PHP)
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">₱</span>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.balance}
                  onChange={(e) => handleChange("balance", e.target.value)}
                  className={`w-full border rounded-lg pl-8 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.balance ? "border-red-500" : "border-gray-300"
                  }`}
                  required
                />
              </div>
              {errors.balance && <p className="text-red-500 text-sm mt-1">{errors.balance}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Color Theme</label>
            <div className="flex flex-wrap gap-3 mt-2">
              {colors.map((colorOption) => (
                <button
                  key={colorOption}
                  type="button"
                  className={`w-10 h-10 rounded-full ${colorOption} transition-all duration-200 ${
                    formData.color === colorOption
                      ? "ring-4 ring-offset-2 ring-gray-400 scale-110"
                      : "hover:scale-105 hover:ring-2 hover:ring-offset-1 hover:ring-gray-300"
                  }`}
                  onClick={() => setFormData((prev) => ({ ...prev, color: colorOption }))}
                  title={`Select ${colorOption.replace("bg-", "").replace("-500", "")} color`}
                />
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">Choose a color to easily identify this account</p>
          </div>

          {/* Show existing accounts info (excluding current account) */}
          {existingAccountNames.length > 0 && (
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
                  <h4 className="text-sm font-medium text-blue-900 mb-2">Other Accounts</h4>
                  <div className="space-y-2">
                    {existingAccountNames.length > 0 && (
                      <div>
                        <p className="text-xs text-blue-700 mb-1">Account names:</p>
                        <div className="flex flex-wrap gap-1">
                          {existingAccountNames.map((accountName) => (
                            <span
                              key={accountName}
                              className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200"
                            >
                              {accountName}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {existingBankAccounts.length > 0 && (
                      <div>
                        <p className="text-xs text-blue-700 mb-1">Bank accounts:</p>
                        <div className="flex flex-wrap gap-1">
                          {existingBankAccounts.map((bankAccount) => (
                            <span
                              key={bankAccount}
                              className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200"
                            >
                              {bankAccount}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {formData.name && formData.balance && !isNaN(Number.parseFloat(formData.balance.toString())) && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-green-900 mb-2">Preview</h4>
              <div className="flex items-center space-x-3">
                <div className={`w-4 h-4 rounded-full ${formData.color}`} />
                <div className="flex-1">
                  <p className="font-medium text-green-900">{formData.name}</p>
                  <p className="text-sm text-green-700">
                    {formData.bankName && `${formData.bankName} • `}
                    {accountTypes.find((t) => t.value === formData.type)?.label} • ₱
                    {Number.parseFloat(formData.balance.toString()).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>
          )}

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
                <h4 className="text-sm font-medium text-green-900">Account Tip</h4>
                <p className="text-sm text-green-700 mt-1">
                  {account
                    ? "Updating account details will not affect your transaction history."
                    : "Use descriptive names like 'Emergency Fund' or 'Daily Expenses' to easily identify your accounts."}
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
              disabled={!formData.name.trim() || !formData.balance || Object.keys(errors).length > 0}
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {account ? "Update Account" : "Add Account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditAccountModal
    