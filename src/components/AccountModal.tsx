"use client"
import type React from "react"
import { useState } from "react"
import { accountTypes, colors, philippineBanks } from "../utils/data"
import type { Account, AccountModalProps } from "../utils/type"

interface EnhancedAccountModalProps extends AccountModalProps {
  accounts: Account[] // Add existing accounts prop
}

function AccountModal({ onSubmit, onClose, accounts }: EnhancedAccountModalProps) {
  const [name, setName] = useState("")
  const [type, setType] = useState("checking")
  const [balance, setBalance] = useState("")
  const [color, setColor] = useState("bg-blue-500")
  const [bankName, setBankName] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}

    if (!name.trim()) {
      newErrors.name = "Account name is required"
    }

    if (name.trim()) {
      const isDuplicate = accounts.some((account) => account.name.toLowerCase() === name.trim().toLowerCase())
      if (isDuplicate) {
        newErrors.name = "An account with this name already exists"
      }
    }

    if (bankName && type) {
      const isDuplicateBankType = accounts.some((account) => account.bankName === bankName && account.type === type)
      if (isDuplicateBankType) {
        newErrors.bankName = `You already have a ${type} account with ${bankName}`
      }
    }

    if (!balance.trim()) {
      newErrors.balance = "Balance is required"
    } else {
      const balanceValue = Number.parseFloat(balance)
      if (isNaN(balanceValue)) {
        newErrors.balance = "Please enter a valid amount"
      }
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length === 0) {
      onSubmit({
        name: name.trim(),
        type,
        balance: Number.parseFloat(balance),
        color,
        bankName,
      })

      setName("")
      setType("checking")
      setBalance("")
      setColor("bg-blue-500")
      setBankName("")
      setErrors({})
    }
  }

  const handleChange = (field: string, value: string) => {
    if (field === "name") setName(value)
    else if (field === "type") setType(value)
    else if (field === "balance") setBalance(value)
    else if (field === "bankName") setBankName(value)

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const existingAccountNames = accounts.map((account) => account.name)
  const existingBankAccounts = accounts
    .filter((account) => account.bankName)
    .map((account) => `${account.bankName} (${account.type})`)

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Add Account</h2>
            <p className="text-sm text-gray-600 mt-1">Create a new account to track your finances</p>
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
              value={name}
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
              value={bankName}
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
                value={type}
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
                  value={balance}
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
                    color === colorOption
                      ? "ring-4 ring-offset-2 ring-gray-400 scale-110"
                      : "hover:scale-105 hover:ring-2 hover:ring-offset-1 hover:ring-gray-300"
                  }`}
                  onClick={() => setColor(colorOption)}
                  title={`Select ${colorOption.replace("bg-", "").replace("-500", "")} color`}
                />
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">Choose a color to easily identify this account</p>
          </div>

          {/* Show existing accounts info */}
          {accounts.length > 0 && (
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
                  <h4 className="text-sm font-medium text-blue-900 mb-2">Existing Accounts</h4>
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

          {/* Preview section */}
          {name && balance && !isNaN(Number.parseFloat(balance)) && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-green-900 mb-2">Preview</h4>
              <div className="flex items-center space-x-3">
                <div className={`w-4 h-4 rounded-full ${color}`} />
                <div className="flex-1">
                  <p className="font-medium text-green-900">{name}</p>
                  <p className="text-sm text-green-700">
                    {bankName && `${bankName} • `}
                    {accountTypes.find((t) => t.value === type)?.label} • ₱
                    {Number.parseFloat(balance).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Account Tip */}
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
                  Use descriptive names like "Emergency Fund" or "Daily Expenses" to easily identify your accounts. You
                  can always edit account details later.
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
              disabled={!name.trim() || !balance.trim() || Object.keys(errors).length > 0}
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Account
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AccountModal
