export interface MonthlyData {
  month: string
  year: number
  monthName: string
  transactions: any[]
  budgets: any[]
  accounts: any[]
  totalBalance: number
  totalExpenses: number
  totalIncome: number
  budgetUtilization: number
}

const STORAGE_KEY = "budget_tracker_monthly_data"
const CURRENT_MONTH_KEY = "budget_tracker_current_month"

export const MonthlyStorageManager = {
  getCurrentMonth(): string {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  },

  getMonthName(monthKey: string): string {
    const [year, month] = monthKey.split("-")
    const date = new Date(Number.parseInt(year), Number.parseInt(month) - 1)
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" })
  },

  getStoredMonth(): string | null {
    return localStorage.getItem(CURRENT_MONTH_KEY)
  },

  setStoredMonth(month: string): void {
    localStorage.setItem(CURRENT_MONTH_KEY, month)
  },

  isNewMonth(): boolean {
    const currentMonth = this.getCurrentMonth()
    const storedMonth = this.getStoredMonth()
    return currentMonth !== storedMonth
  },

  saveMonthlyData(data: MonthlyData): void {
    const existingData = this.getAllMonthlyData()
    const updatedData = existingData.filter((d) => d.month !== data.month)
    updatedData.push(data)

    // Sort by month (newest first)
    updatedData.sort((a, b) => b.month.localeCompare(a.month))

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData))
  },

  getAllMonthlyData(): MonthlyData[] {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  },

  getMonthData(month: string): MonthlyData | null {
    const allData = this.getAllMonthlyData()
    return allData.find((d) => d.month === month) || null
  },

  deleteMonthData(month: string): void {
    const allData = this.getAllMonthlyData()
    const filteredData = allData.filter((d) => d.month !== month)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredData))
  },

  clearAllHistoricalData(): void {
    localStorage.removeItem(STORAGE_KEY)
  }
}
