import type { MonthlyData } from "./MonthlyStorage"
export interface Account {
  id: string
  name: string
  type: string
  balance: number
  color: string
  bankName?: string
  bank_name?:string
}

export interface Budget {
  id: string
  category: string
  limit: number
  spent: number
}

export interface BudgetsListProps {
  budgets: Budget[]
}

export interface DeleteConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  itemName: string
  itemType: string
}


export interface BudgetModalProps {
  budgets: Budget[] 
  onSubmit: (category: string, limit: number) => void
  onClose: () => void
}

export interface MonthlyResetModalProps {
  isOpen: boolean
  onConfirm: () => void
  onClose: () => void
  previousMonthData: MonthlyData
}
export interface Transaction {
  id: string
  type: "income" | "expense"
  amount: number
  category: string
  description: string
  date: string
  accountId: string
  hasBudget?: boolean
}


export interface EditAccountModalProps {
  isOpen: boolean
  onClose: () => void
  onUpdate: (account: Account) => void
  account?: Account
}

export const accountTypes = [
  { value: "checking", label: "Checking" },
  { value: "savings", label: "Savings" },
  { value: "credit", label: "Credit Card" },
  { value: "investment", label: "Investment" },
  { value: "cash", label: "Cash" },
]

export const colorOptions = [
  { value: "bg-blue-500", label: "Blue", class: "bg-blue-500" },
  { value: "bg-green-500", label: "Green", class: "bg-green-500" },
  { value: "bg-red-500", label: "Red", class: "bg-red-500" },
  { value: "bg-yellow-500", label: "Yellow", class: "bg-yellow-500" },
  { value: "bg-purple-500", label: "Purple", class: "bg-purple-500" },
  { value: "bg-pink-500", label: "Pink", class: "bg-pink-500" },
  { value: "bg-indigo-500", label: "Indigo", class: "bg-indigo-500" },
  { value: "bg-gray-500", label: "Gray", class: "bg-gray-500" },
]




export interface StatsCardsProps {
  transactions: Transactions[]
  accounts: Account[]
  budgets: Budget[]
}


export interface TransactionFormProps {
  accounts: Account[]
  onSubmit: (transaction: any) => void
  onClose: () => void
}

export const expenseCategories = [
  "Food",
  "Transportation",
  "Entertainment",
  "Shopping",
  "Bills",
  "Healthcare",
  "Education",
  "Travel",
  "Other",
]


export interface EditBudgetModalProps {
  isOpen: boolean
  onClose: () => void
  onUpdate: (budget: Budget) => void
  budget?: Budget
}

export const budgetCategories = [
  "Food",
  "Transportation",
  "Housing",
  "Utilities",
  "Healthcare",
  "Entertainment",
  "Shopping",
  "Education",
  "Insurance",
  "Personal Care",
  "Gifts",
  "Travel",
  "Subscriptions",
  "Other",
]



export interface TransactionModalProps {
  accounts: Account[]
  budgets: Budget[]
  onSubmit: (transaction: {
    type: "expense"
    amount: number
    category: string
    description: string
    date: string
    accountId: string
    hasBudget: boolean 
  }) => void
  onClose: () => void
}




export interface Transactions {
  id: string
  type: "income" | "expense"
  amount: number
  category: string
  description: string
  date: string
  accountId: string
}

export interface MonthlyHistoryModalProps {
  isOpen: boolean
  onClose: () => void
  monthlyData: MonthlyData[]
  onDeleteMonth: (month: string) => void
}

export interface EditTransactionModalProps {
  isOpen: boolean
  onClose: () => void
  onUpdate: (transaction: Transactions) => void
  transaction?: Transaction
  accounts: Account[]
}


export interface ExpenseChartProps {
  transactions: Transaction[]
}

export const incomeCategories = ["Salary", "Freelance", "Business", "Investment", "Gift", "Other Income"]


export interface TransactionListProps {
  transactions: Transactions[]
  accounts: Account[]
  showSearch?: boolean
}



export interface DashboardProps {
  transactions: Transaction[]
  accounts: Account[]
  budgets: Budget[]
  onOpenModal: (modal: string, data?: any) => void
  onClearData: () => void
  onDeleteTransaction: (id: string) => void
  onDeleteAccount: (id: string) => void
  onDeleteBudget: (id: string) => void
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>
  setAccounts: React.Dispatch<React.SetStateAction<Account[]>>
  setBudgets: React.Dispatch<React.SetStateAction<Budget[]>>
}

export interface DeleteModalState {
  isOpen: boolean
  type: string
  id: string
  name: string
}

export interface ModalState {
  isOpen: boolean
  type: string
  data?: any
}

export const categories = [
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

export interface AccountsListProps {
  accounts: Account[]
}

export interface AccountModalProps {
  onSubmit: (account: any) => void
  onClose: () => void
}

export interface AccountFormProps {
  onSubmit: (account: any) => void
  onClose: () => void
}

export interface BankSummaryProps {
  accounts: Account[]
}

export interface BudgetFormProps {
  onSubmit: (category: string, limit: number) => void
  onClose: () => void
}
