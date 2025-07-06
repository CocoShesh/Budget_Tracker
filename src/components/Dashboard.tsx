"use client"
import { useState, useEffect } from "react"
import DeleteConfirmationModal from "./DeleteConfirmationModal"
import EditTransactionModal from "./EditTransactionModal"
import EditAccountModal from "./EditAccountModal"
import EditBudgetModal from "./EditBudgetModal"
import MonthlyResetModal from "./MonthlyResetModal"
import MonthlyHistoryModal from "./MonthlyHistoryModal"
import { MonthlyStorageManager, type MonthlyData } from "../utils/MonthlyStorage"
import type { Account, Budget, DashboardProps, DeleteModalState, ModalState, Transaction } from "../utils/type"

const formatPHP = (amount: number): string => {
  return amount.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function Dashboard({
  transactions,
  accounts,
  budgets,
  onClearData,
  onOpenModal,
  onDeleteTransaction,
  onDeleteAccount,
  onDeleteBudget,
  setTransactions,
  setAccounts,
  setBudgets,
}: DashboardProps) {
  const [deleteModal, setDeleteModal] = useState<DeleteModalState>({
    isOpen: false,
    type: "",
    id: "",
    name: "",
  })

  const [editModal, setEditModal] = useState<ModalState>({
    isOpen: false,
    type: "",
    data: undefined,
  })

  const [showMonthlyReset, setShowMonthlyReset] = useState(false)
  const [showMonthlyHistory, setShowMonthlyHistory] = useState(false)
  const [monthlyHistoryData, setMonthlyHistoryData] = useState<MonthlyData[]>([])
  const [pendingMonthlyData, setPendingMonthlyData] = useState<MonthlyData | null>(null)

  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0)
  const currentMonth = new Date().getMonth()
  const monthlyBudget = budgets.reduce((sum, budget) => sum + budget.limit, 0)
  const totalBudgetSpent = budgets.reduce((sum, budget) => sum + budget.spent, 0)
  const remainingBudget = monthlyBudget - totalBudgetSpent

  const monthlyExpenses = transactions
    .filter((t) => t.type === "expense" && new Date(t.date).getMonth() === currentMonth)
    .reduce((sum, t) => sum + t.amount, 0)

  const totalBudget = budgets.reduce((sum, b) => sum + b.limit, 0)
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0)
  const budgetPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0

  const hasAccounts = accounts.length > 0
  const hasTransactions = transactions.length > 0
  const hasBudgets = budgets.length > 0
  const hasHistoryData = monthlyHistoryData.length > 0

  const canDeleteAccount = (accountId: string) => {
    return !transactions.some((t) => t.accountId === accountId)
  }

  const openDeleteModal = (type: string, id: string, name: string) => {
    setDeleteModal({
      isOpen: true,
      type,
      id,
      name,
    })
  }

  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      type: "",
      id: "",
      name: "",
    })
  }

  const handleDeleteConfirm = () => {
    const { type, id } = deleteModal
    if (type === "transaction") {
      onDeleteTransaction(id)
    } else if (type === "account") {
      onDeleteAccount(id)
    } else if (type === "budget") {
      onDeleteBudget(id)
    }
  }

  const handleOpenModal = (type: string, data?: any) => {
    setEditModal({
      isOpen: true,
      type,
      data,
    })
  }

  const closeEditModal = () => {
    setEditModal({
      isOpen: false,
      type: "",
      data: undefined,
    })
  }

  const handleCreateTransaction = (newTransaction: Omit<Transaction, "id"> & { hasBudget: boolean }) => {
    const transaction: Transaction = {
      ...newTransaction,
      id: Date.now().toString(),
    }

    setTransactions((prev) => [transaction, ...prev])

    if (transaction.type === "expense") {
      if (transaction.hasBudget) {
        setBudgets((prev) =>
          prev.map((budget) =>
            budget.category === transaction.category ? { ...budget, spent: budget.spent + transaction.amount } : budget,
          ),
        )
        setAccounts((prev) =>
          prev.map((account) =>
            account.id === transaction.accountId
              ? { ...account, balance: account.balance - transaction.amount }
              : account,
          ),
        )
      } else {
        setAccounts((prev) =>
          prev.map((account) =>
            account.id === transaction.accountId
              ? { ...account, balance: account.balance - transaction.amount }
              : account,
          ),
        )
      }
    } else if (transaction.type === "income") {
      setAccounts((prev) =>
        prev.map((account) =>
          account.id === transaction.accountId
            ? { ...account, balance: account.balance + transaction.amount }
            : account,
        ),
      )
    }
    closeEditModal()
  }

  const handleCreateAccount = (newAccount: Omit<Account, "id">) => {
    const account: Account = {
      ...newAccount,
      id: Date.now().toString(),
    }
    setAccounts((prev) => [...prev, account])
    closeEditModal()
  }

  const handleCreateBudget = (newBudget: Omit<Budget, "id" | "spent">) => {
    const budget: Budget = {
      ...newBudget,
      id: Date.now().toString(),
      spent: 0,
    }
    setBudgets((prev) => [...prev, budget])
    closeEditModal()
  }

  const handleUpdateTransaction = (updatedTransaction: any & { hasBudget?: boolean }) => {
    if (editModal.data) {
      const originalTransaction = editModal.data as Transaction

      if (originalTransaction.type === "expense") {
        if (originalTransaction.hasBudget) {
          setBudgets((prev) =>
            prev.map((budget) =>
              budget.category === originalTransaction.category
                ? { ...budget, spent: Math.max(0, budget.spent - originalTransaction.amount) }
                : budget,
            ),
          )
          setAccounts((prev) =>
            prev.map((account) =>
              account.id === originalTransaction.accountId
                ? { ...account, balance: account.balance + originalTransaction.amount }
                : account,
            ),
          )
        } else {
          setAccounts((prev) =>
            prev.map((account) =>
              account.id === originalTransaction.accountId
                ? { ...account, balance: account.balance + originalTransaction.amount }
                : account,
            ),
          )
        }
      } else if (originalTransaction.type === "income") {
        setAccounts((prev) =>
          prev.map((account) =>
            account.id === originalTransaction.accountId
              ? { ...account, balance: account.balance - originalTransaction.amount }
              : account,
          ),
        )
      }

      if (updatedTransaction.type === "expense") {
        if (updatedTransaction.hasBudget) {
          setBudgets((prev) =>
            prev.map((budget) =>
              budget.category === updatedTransaction.category
                ? { ...budget, spent: budget.spent + updatedTransaction.amount }
                : budget,
            ),
          )
          setAccounts((prev) =>
            prev.map((account) =>
              account.id === updatedTransaction.accountId
                ? { ...account, balance: account.balance - updatedTransaction.amount }
                : account,
            ),
          )
        } else {
          setAccounts((prev) =>
            prev.map((account) =>
              account.id === updatedTransaction.accountId
                ? { ...account, balance: account.balance - updatedTransaction.amount }
                : account,
            ),
          )
        }
      } else if (updatedTransaction.type === "income") {
        setAccounts((prev) =>
          prev.map((account) =>
            account.id === updatedTransaction.accountId
              ? { ...account, balance: account.balance + updatedTransaction.amount }
              : account,
          ),
        )
      }

      setTransactions((prev) => prev.map((t) => (t.id === updatedTransaction.id ? updatedTransaction : t)))
    } else {
      handleCreateTransaction(updatedTransaction)
      return
    }
    closeEditModal()
  }

  const handleUpdateAccount = (updatedAccount: Account) => {
    if (editModal.data) {
      setAccounts((prev) => prev.map((a) => (a.id === updatedAccount.id ? updatedAccount : a)))
    } else {
      handleCreateAccount(updatedAccount)
      return
    }
    closeEditModal()
  }

  const handleUpdateBudget = (updatedBudget: Budget) => {
    if (editModal.data) {
      setBudgets((prev) => prev.map((b) => (b.id === updatedBudget.id ? updatedBudget : b)))
    } else {
      handleCreateBudget(updatedBudget)
      return
    }
    closeEditModal()
  }

  const handleMonthlyReset = () => {
    if (pendingMonthlyData) {
      MonthlyStorageManager.saveMonthlyData(pendingMonthlyData)
      setTransactions([])
      setBudgets((prev) => prev.map((budget) => ({ ...budget, spent: 0 })))
      MonthlyStorageManager.setStoredMonth(MonthlyStorageManager.getCurrentMonth())
      setMonthlyHistoryData(MonthlyStorageManager.getAllMonthlyData())
      setShowMonthlyReset(false)
      setPendingMonthlyData(null)
    }
  }

  const handleDeleteMonthData = (month: string) => {
    MonthlyStorageManager.deleteMonthData(month)
    setMonthlyHistoryData(MonthlyStorageManager.getAllMonthlyData())
  }

  useEffect(() => {
    const checkForNewMonth = () => {
      if (MonthlyStorageManager.isNewMonth()) {
        const storedMonth = MonthlyStorageManager.getStoredMonth()
        if (storedMonth && (transactions.length > 0 || budgets.length > 0)) {
          const totalIncome = transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)
          const totalExpenses = transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)
          const totalBudgetLimit = budgets.reduce((sum, b) => sum + b.limit, 0)
          const totalBudgetSpent = budgets.reduce((sum, b) => sum + b.spent, 0)
          const budgetUtilization = totalBudgetLimit > 0 ? (totalBudgetSpent / totalBudgetLimit) * 100 : 0

          const monthlyData: MonthlyData = {
            month: storedMonth,
            year: Number.parseInt(storedMonth.split("-")[0]),
            monthName: MonthlyStorageManager.getMonthName(storedMonth),
            transactions: [...transactions],
            budgets: [...budgets],
            accounts: [...accounts],
            totalBalance: totalBalance,
            totalExpenses,
            totalIncome,
            budgetUtilization,
          }

          setPendingMonthlyData(monthlyData)
          setShowMonthlyReset(true)
        } else {
          MonthlyStorageManager.setStoredMonth(MonthlyStorageManager.getCurrentMonth())
        }
      }
      setMonthlyHistoryData(MonthlyStorageManager.getAllMonthlyData())
    }

    checkForNewMonth()
    const interval = setInterval(checkForNewMonth, 60 * 60 * 1000)
    return () => clearInterval(interval)
  }, [transactions, budgets, accounts, totalBalance])

  return (
    <div className="w-full xl:mx-10 p-4 space-y-6 mt-5">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Budget Tracker</h1>
          <p className="text-gray-600">Manage your finances and track expenses</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="relative group">
            <button
              onClick={() => hasAccounts && onOpenModal("transaction")}
              disabled={!hasAccounts}
              className={`px-4 py-2 rounded-lg transition-colors ${
                hasAccounts
                  ? "bg-blue-600 text-white cursor-pointer hover:bg-blue-700"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              Add Expense
            </button>
          </div>
          <button
            onClick={() => onOpenModal("account")}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors"
          >
            Add Account
          </button>
          <div className="relative group">
            <button
              onClick={() => hasAccounts && handleOpenModal("budget")}
              disabled={!hasAccounts}
              className={`px-4 py-2 rounded-lg transition-colors ${
                hasAccounts
                  ? "bg-green-600 text-white cursor-pointer hover:bg-green-700"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              Set Budget
            </button>
          </div>
          <div className="relative group">
            <button
              onClick={() => (hasAccounts || hasTransactions || hasBudgets) && onClearData()}
              disabled={!hasAccounts && !hasTransactions && !hasBudgets}
              className={`px-4 py-2 rounded-lg transition-colors ${
                hasAccounts || hasTransactions || hasBudgets
                  ? "bg-red-600 text-white cursor-pointer hover:bg-red-700"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              Clear Data
            </button>
            {!hasAccounts && !hasTransactions && !hasBudgets && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded opacity-0 group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap">
                No data to clear
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
              </div>
            )}
          </div>
          <button
            onClick={() => hasHistoryData && setShowMonthlyHistory(true)}
            disabled={!hasHistoryData}
            className={`px-4 py-2 rounded-lg transition-colors ${
              hasHistoryData
                ? "bg-purple-600 text-white cursor-pointer hover:bg-purple-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            View History
          </button>
        </div>
      </div>

      {!hasAccounts && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Get started:</strong> Create your first account to begin tracking expenses and managing your
                budget.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-600">Total Balance</p>
              <p
                className={`text-2xl sm:text-3xl font-bold mt-1 break-words ${totalBalance >= 0 ? "text-blue-600" : "text-red-600"}`}
              >
                ₱{formatPHP(totalBalance)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Across all accounts</p>
            </div>
            <div
              className={`${totalBalance >= 0 ? "bg-blue-50 text-blue-600" : "bg-red-50 text-red-600"} p-3 rounded-full flex items-center justify-center shrink-0`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Remaining Budget</p>
              <p className={`text-2xl font-bold mt-1 ${remainingBudget >= 0 ? "text-green-600" : "text-red-600"}`}>
                ₱{formatPHP(remainingBudget)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {remainingBudget >= 0 ? "Available to spend" : "Over budget"}
              </p>
            </div>
            <div
              className={`${remainingBudget >= 0 ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"} p-3 rounded-full`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Monthly Expenses</p>
              <p className="text-2xl font-bold mt-1 text-red-600">₱{formatPHP(monthlyExpenses)}</p>
              <p className="text-xs text-gray-500 mt-1">This month</p>
            </div>
            <div className="bg-red-50 text-red-600 p-3 rounded-full">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Budget Used</p>
              <p className="text-2xl font-bold mt-1 text-purple-600">{budgetPercentage.toFixed(0)}%</p>
              <p className="text-xs text-gray-500 mt-1">
                ₱{formatPHP(totalSpent)} of ₱{formatPHP(totalBudget)}
              </p>
            </div>
            <div className="bg-purple-50 text-purple-600 p-3 rounded-full">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  budgetPercentage > 100 ? "bg-red-500" : budgetPercentage > 80 ? "bg-yellow-500" : "bg-green-500"
                }`}
                style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6 h-[420px] overflow-y-auto">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Accounts</h2>
          <div className="space-y-4">
            {accounts.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400 mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
                <p className="text-lg font-medium text-gray-900 mb-2">No accounts found</p>
                <p className="text-gray-500 mb-4">Create your first account to get started</p>
                <button
                  onClick={() => onOpenModal("account")}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Account
                </button>
              </div>
            ) : (
              accounts.map((account) => (
                <div
                  key={account.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg group hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${account.color}`} />
                    <div>
                      <p className="font-semibold text-gray-900">{account.name}</p>
                      <p className="text-sm text-gray-500">
                        {account.bankName && `${account.bankName} • `}
                        {account.type.charAt(0).toUpperCase() + account.type.slice(1)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <p className={`text-lg font-bold ${account.balance >= 0 ? "text-gray-900" : "text-red-600"}`}>
                        ₱{formatPHP(Math.abs(account.balance))}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleOpenModal("editaccount", account)}
                        className="p-2 text-blue-600 hover:bg-blue-100 cursor-pointer rounded-full transition-colors"
                        title="Edit Account"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                      {canDeleteAccount(account.id) ? (
                        <button
                          onClick={() => openDeleteModal("account", account.id, account.name)}
                          className="p-2 text-red-600 hover:bg-red-100 cursor-pointer rounded-full transition-colors"
                          title="Delete Account"
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
                      ) : (
                        <div className="relative group/tooltip">
                          <button
                            className="p-2 text-gray-400 cursor-not-allowed rounded-full"
                            disabled
                            title="Cannot delete account with transactions"
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
                          <div className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap">
                            Has transactions
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 h-[420px] overflow-y-auto max-sm:h-fit">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Budget Overview</h2>
          <div className="space-y-4">
            {budgets.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400 mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                <p className="text-lg font-medium text-gray-900 mb-2">No budgets set</p>
                <p className="text-gray-500 mb-4">Set your first budget to track spending</p>
                {hasAccounts ? (
                  <button
                    onClick={() => handleOpenModal("budget")}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Set Budget
                  </button>
                ) : (
                  <p className="text-sm text-gray-400">Create an account first</p>
                )}
              </div>
            ) : (
              budgets.map((budget) => {
                const percentage = budget.limit > 0 ? (budget.spent / budget.limit) * 100 : 0
                const isOverBudget = percentage > 100
                return (
                  <div key={budget.id} className="space-y-2 group hover:bg-gray-50 p-3 rounded-lg transition-colors">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-900">{budget.category}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">
                          ₱{formatPHP(budget.spent)} / ₱{formatPHP(budget.limit)}
                        </span>
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleOpenModal("budget", budget)}
                            className="p-1 text-blue-600 hover:bg-blue-100 cursor-pointer rounded transition-colors"
                            title="Edit Budget"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => openDeleteModal("budget", budget.id, budget.category)}
                            className="p-1 text-red-600 hover:bg-red-100 cursor-pointer rounded transition-colors"
                            title="Delete Budget"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          isOverBudget ? "bg-red-500" : percentage > 80 ? "bg-yellow-500" : "bg-green-500"
                        }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500">{percentage.toFixed(1)}% used</span>
                      {isOverBudget && (
                        <span className="text-red-600 font-medium">
                          Over by ₱{formatPHP(budget.spent - budget.limit)}
                        </span>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Transactions</h2>
        <div className="space-y-3">
          {transactions.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <svg
                className="mx-auto h-12 w-12 text-gray-400 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <p className="text-lg font-medium text-gray-900 mb-2">No transactions found</p>
              <p className="text-gray-500 mb-4">Add your first expense to get started</p>
              {hasAccounts ? (
                <button
                  onClick={() => onOpenModal("transaction")}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Expense
                </button>
              ) : (
                <p className="text-sm text-gray-400">Create an account first</p>
              )}
            </div>
          ) : (
            transactions.slice(0, 8).map((transaction) => {
              const account = accounts.find((a) => a.id === transaction.accountId)
              const hasBudgetIndicator = transaction.hasBudget ? "💰" : "💳"
              return (
                <div
                  key={transaction.id}
                  className="bg-gray-50 rounded-lg p-3 sm:p-4 group hover:bg-gray-100 transition-colors"
                >
                  {/* Mobile Layout */}
                  <div className="block sm:hidden">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div
                          className={`p-2 rounded-full flex-shrink-0 ${
                            transaction.type === "income" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                          }`}
                        >
                          {transaction.type === "income" ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 11l5-5m0 0l5 5m-5-5v12"
                              />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 13l-5 5m0 0l-5-5m5 5V6"
                              />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{transaction.description}</p>
                          <div
                            className={`font-semibold text-lg ${
                              transaction.type === "income" ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {transaction.type === "income" ? "+" : "-"}₱{formatPHP(transaction.amount)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 flex-shrink-0 ml-2">
                        <button
                          onClick={() => handleOpenModal("editTransaction", transaction)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors touch-manipulation"
                          title="Edit Transaction"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => openDeleteModal("transaction", transaction.id, transaction.description)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors touch-manipulation"
                          title="Delete Transaction"
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
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="bg-white px-2 py-1 rounded-full shadow-sm text-xs font-medium flex items-center gap-1">
                          {transaction.type === "expense" && hasBudgetIndicator}
                          {transaction.category}
                        </span>
                        <span className="text-xs text-gray-500">
                          {account?.bankName ? (
                            <>
                              {account?.name}
                              {account?.bankName ? ` (${account.bankName})` : ""}
                            </>
                          ) : (
                            "Budget"
                          )}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">{new Date(transaction.date).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div className="hidden sm:flex sm:items-center sm:justify-between">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div
                        className={`p-2 rounded-full flex-shrink-0 ${
                          transaction.type === "income" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                        }`}
                      >
                        {transaction.type === "income" ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 11l5-5m0 0l5 5m-5-5v12"
                            />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 13l-5 5m0 0l-5-5m5 5V6"
                            />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{transaction.description}</p>
                        <div className="flex items-center gap-3 mt-2 text-sm text-gray-600 flex-wrap">
                          <span className="bg-white px-3 py-1 rounded-full shadow-sm font-medium flex items-center gap-1 flex-shrink-0">
                            {transaction.type === "expense" && hasBudgetIndicator}
                            {transaction.category}
                          </span>
                          <span className="hidden lg:inline">•</span>
                          <span className="truncate">
                            {account?.bankName ? (
                              <>
                                {account?.name}
                                {account?.bankName ? ` (${account.bankName})` : ""}
                              </>
                            ) : (
                              "Budget"
                            )}
                          </span>
                          <span className="hidden xl:inline">•</span>
                          <span className="flex-shrink-0">{new Date(transaction.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 flex-shrink-0 ml-4">
                      <div
                        className={`font-semibold text-lg ${
                          transaction.type === "income" ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {transaction.type === "income" ? "+" : "-"}₱{formatPHP(transaction.amount)}
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleOpenModal("editTransaction", transaction)}
                          className="p-2 text-blue-600 hover:bg-blue-100 cursor-pointer rounded-full transition-colors"
                          title="Edit Transaction"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => openDeleteModal("transaction", transaction.id, transaction.description)}
                          className="p-2 text-red-600 hover:bg-red-100 cursor-pointer rounded-full transition-colors"
                          title="Delete Transaction"
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
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteConfirm}
        itemName={deleteModal.name}
        itemType={deleteModal.type}
      />

      <EditTransactionModal
        isOpen={editModal.isOpen && editModal.type === "editTransaction"}
        onClose={closeEditModal}
        onUpdate={handleUpdateTransaction}
        transaction={editModal.data}
        accounts={accounts}
      />

      <EditAccountModal
        isOpen={editModal.isOpen && editModal.type === "editaccount"}
        onClose={closeEditModal}
        onUpdate={handleUpdateAccount}
        account={editModal.data}
        accounts={accounts}
      />

      <EditBudgetModal
        isOpen={editModal.isOpen && editModal.type === "budget"}
        onClose={closeEditModal}
        onUpdate={handleUpdateBudget}
        budget={editModal.data}
        budgets={budgets}
      />

      {showMonthlyReset && pendingMonthlyData && (
        <MonthlyResetModal
          isOpen={showMonthlyReset}
          onConfirm={handleMonthlyReset}
          onClose={() => setShowMonthlyReset(false)}
          previousMonthData={pendingMonthlyData}
        />
      )}

      <MonthlyHistoryModal
        isOpen={showMonthlyHistory}
        onClose={() => setShowMonthlyHistory(false)}
        monthlyData={monthlyHistoryData}
        onDeleteMonth={handleDeleteMonthData}
      />
    </div>
  )
}

export default Dashboard
