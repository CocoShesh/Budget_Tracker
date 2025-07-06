"use client"

import { useMemo } from "react"
import type { ExpenseChartProps } from "../utils/type"
import { colors } from "../utils/data"


const formatPHP = (amount: number): string => {
  return amount.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

const ExpenseChart  = ({ transactions }:ExpenseChartProps) => {
  const expenseData = useMemo(() => {
    const currentMonth = new Date().getMonth()
    const expenses = transactions.filter((t) => t.type === "expense" && new Date(t.date).getMonth() === currentMonth)

    const categoryTotals = expenses.reduce(
      (acc, transaction) => {
        acc[transaction.category] = (acc[transaction.category] || 0) + transaction.amount
        return acc
      },
      {} as Record<string, number>,
    )

    const total = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0)

    return Object.entries(categoryTotals)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: total > 0 ? (amount / total) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount)
  }, [transactions])

  if (expenseData.length === 0) {
    return <div className="text-center text-gray-500 py-8">No expense data for this month</div>
  }

  return (
    <div className="space-y-4">
      {expenseData.map((item, index) => (
        <div key={item.category} className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${colors[index % colors.length]}`} />
              <span className="font-medium">{item.category}</span>
            </div>
            <div className="text-right">
              <div className="font-semibold">{formatPHP(item.amount)}</div>
              <div className="text-sm text-gray-500">{item.percentage.toFixed(1)}%</div>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${colors[index % colors.length]}`}
              style={{ width: `${item.percentage}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

export default ExpenseChart
