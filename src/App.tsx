"use client"
import { useState, useEffect } from "react"
import Dashboard from "./components/Dashboard"
import TransactionModal from "./components/TransactionModal"
import AccountModal from "./components/AccountModal"
import BudgetModal from "./components/BudgetModal"

interface Transaction {
  id: string
  type: "income" | "expense"
  amount: number
  category: string
  description: string
  date: string
  accountId: string
  hasBudget?: boolean // New optional field for smart budget logic
}

interface Account {
  id: string
  name: string
  type: string
  balance: number
  color: string
  bankName?: string
}

interface Budget {
  id: string
  category: string
  limit: number
  spent: number
}

function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [activeModal, setActiveModal] = useState<string | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    try {
      const savedTransactions = localStorage.getItem("transactions")
      const savedAccounts = localStorage.getItem("accounts")
      const savedBudgets = localStorage.getItem("budgets")

      if (savedTransactions) {
        setTransactions(JSON.parse(savedTransactions))
      } else {
        const sampleTransactions: Transaction[] = [
          {
            id: "1",
            type: "income",
            amount: 50000,
            category: "Salary",
            description: "Monthly salary",
            date: "2024-01-01",
            accountId: "1",
          },
          {
            id: "2",
            type: "expense",
            amount: 1500,
            category: "Food & Dining",
            description: "Grocery shopping",
            date: "2024-01-15",
            accountId: "1",
            hasBudget: true,
          },
        ]
        setTransactions(sampleTransactions)
      }

      if (savedAccounts) {
        setAccounts(JSON.parse(savedAccounts))
      } else {
        const sampleAccounts: Account[] = [
          {
            id: "1",
            name: "Main Account",
            type: "checking",
            balance: 48500,
            color: "bg-blue-500",
            bankName: "Sample Bank",
          },
        ]
        setAccounts(sampleAccounts)
      }

      if (savedBudgets) {
        setBudgets(JSON.parse(savedBudgets))
      } else {
        const sampleBudgets: Budget[] = [
          { id: "1", category: "Food & Dining", limit: 10000, spent: 1500 },
          { id: "2", category: "Transportation", limit: 5000, spent: 0 },
          { id: "3", category: "Entertainment", limit: 3000, spent: 0 },
        ]
        setBudgets(sampleBudgets)
      }
    } catch (error) {
      console.error("Error loading data from localStorage:", error)
    } finally {
      setIsLoaded(true)
    }
  }, [])

  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem("transactions", JSON.stringify(transactions))
      } catch (error) {
        console.error("Error saving transactions to localStorage:", error)
      }
    }
  }, [transactions, isLoaded])

  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem("accounts", JSON.stringify(accounts))
      } catch (error) {
        console.error("Error saving accounts to localStorage:", error)
      }
    }
  }, [accounts, isLoaded])

  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem("budgets", JSON.stringify(budgets))
      } catch (error) {
        console.error("Error saving budgets to localStorage:", error)
      }
    }
  }, [budgets, isLoaded])

  const addTransaction = (transaction: Omit<Transaction, "id"> & { hasBudget: boolean }) => {
    const newTransaction = {
      ...transaction,
      id: Date.now().toString(),
    }
    setTransactions((prev) => [newTransaction, ...prev])

    if (transaction.type === "expense") {
      if (transaction.hasBudget) {
        setBudgets((prev) =>
          prev.map((budget) =>
            budget.category === transaction.category ? { ...budget, spent: budget.spent + transaction.amount } : budget,
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
    setActiveModal(null)
  }

  const addAccount = (account: Omit<Account, "id">) => {
    const newAccount = {
      ...account,
      id: Date.now().toString(),
    }
    setAccounts((prev) => [...prev, newAccount])
    setActiveModal(null)
  }

  const setBudget = (category: string, limit: number) => {
    const existingBudget = budgets.find((b) => b.category === category)
    if (existingBudget) {
      setBudgets((prev) => prev.map((b) => (b.category === category ? { ...b, limit } : b)))
    } else {
      const newBudget: Budget = {
        id: Date.now().toString(),
        category,
        limit,
        spent: 0,
      }
      setBudgets((prev) => [...prev, newBudget])
    }
    setActiveModal(null)
  }

  const clearAllData = () => {
    if (window.confirm("Are you sure you want to clear all data?")) {
      setTransactions([])
      setAccounts([])
      setBudgets([])
      try {
        localStorage.removeItem("transactions")
        localStorage.removeItem("accounts")
        localStorage.removeItem("budgets")
      } catch (error) {
        console.error("Error clearing localStorage:", error)
      }
    }
  }

  const handleDeleteTransaction = (id: string) => {
    const transaction = transactions.find((t) => t.id === id)
    if (transaction) {
      if (transaction.type === "expense") {
        if (transaction.hasBudget) {
          setBudgets((prev) =>
            prev.map((budget) =>
              budget.category === transaction.category
                ? { ...budget, spent: Math.max(0, budget.spent - transaction.amount) }
                : budget,
            ),
          )
        } else {
          setAccounts((prev) =>
            prev.map((account) =>
              account.id === transaction.accountId
                ? { ...account, balance: account.balance + transaction.amount }
                : account,
            ),
          )
        }
      } else if (transaction.type === "income") {
        setAccounts((prev) =>
          prev.map((account) =>
            account.id === transaction.accountId
              ? { ...account, balance: account.balance - transaction.amount }
              : account,
          ),
        )
      }
    }
    setTransactions((prev) => prev.filter((t) => t.id !== id))
  }

  const handleDeleteAccount = (id: string) => {
    setAccounts((prev) => prev.filter((a) => a.id !== id))
  }

  const handleDeleteBudget = (id: string) => {
    setBudgets((prev) => prev.filter((b) => b.id !== id))
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <div className="text-lg text-gray-600">Loading your budget tracker...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center w-full bg-gray-50">
      <Dashboard
        transactions={transactions}
        accounts={accounts}
        budgets={budgets}
        onOpenModal={setActiveModal}
        onClearData={clearAllData}
        onDeleteTransaction={handleDeleteTransaction}
        onDeleteAccount={handleDeleteAccount}
        onDeleteBudget={handleDeleteBudget}
        setTransactions={setTransactions}
        setAccounts={setAccounts}
        setBudgets={setBudgets}
      />

      {activeModal === "transaction" && (
        <TransactionModal
          accounts={accounts}
          budgets={budgets}
          onSubmit={addTransaction}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === "account" && (
        <AccountModal accounts={accounts} onSubmit={addAccount} onClose={() => setActiveModal(null)} />
      )}

      {activeModal === "budget" && (
        <BudgetModal budgets={budgets} onSubmit={setBudget} onClose={() => setActiveModal(null)} />
      )}
    </div>
  )
}

export default App
