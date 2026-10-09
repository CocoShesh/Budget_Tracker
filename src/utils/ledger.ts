import type { Account, Budget, Transaction } from "./type";
import type { MonthlyData } from "./MonthlyStorage";

export interface Ledger {
  version: 1;
  accounts: Account[];
  transactions: Transaction[];
  budgets: Budget[];
  history: MonthlyData[];
}
export const emptyLedger = (): Ledger => ({
  version: 1,
  accounts: [],
  transactions: [],
  budgets: [],
  history: [],
});
export const localDate = (date = new Date()) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
export const monthKey = (date = new Date()) => localDate(date).slice(0, 7);
export const inMonth = (date: string, month: string) =>
  date.slice(0, 7) === month;
export const cents = (value: number) =>
  Math.round((value + Number.EPSILON) * 100);
export const money = (value: number) => cents(value) / 100;
export function positiveAmount(value: number) {
  if (
    !Number.isFinite(value) ||
    cents(value) <= 0 ||
    !Number.isSafeInteger(cents(value))
  )
    throw new Error("Enter a valid amount of at least ₱0.01.");
  return money(value);
}
export function validDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(value + "T12:00:00Z");
  return (
    Number.isFinite(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === value
  );
}
export function budgetsForMonth(ledger: Ledger, month: string): Budget[] {
  return ledger.budgets.map((budget) => ({
    ...budget,
    spent: money(
      ledger.transactions
        .filter(
          (t) =>
            t.type === "expense" &&
            t.category === budget.category &&
            inMonth(t.date, month),
        )
        .reduce((sum, t) => sum + t.amount, 0),
    ),
  }));
}
function accountDelta(transaction: Transaction) {
  return (transaction.type === "income" ? 1 : -1) * cents(transaction.amount);
}
export function saveTransaction(
  ledger: Ledger,
  input: Omit<Transaction, "id">,
  id: string = crypto.randomUUID(),
): Ledger {
  const old = ledger.transactions.find((t) => t.id === id);
  const legacyBudgetOnly =
    !!old &&
    old.hasBudget &&
    !old.accountId &&
    !input.accountId &&
    input.type === "expense";
  if (
    !legacyBudgetOnly &&
    !ledger.accounts.some((a) => a.id === input.accountId)
  )
    throw new Error("Choose an existing account.");
  if (
    !input.description.trim() ||
    !input.category.trim() ||
    !validDate(input.date)
  )
    throw new Error("Enter a category, description, and valid date.");
  const transaction: Transaction = {
    ...input,
    id,
    amount: positiveAmount(input.amount),
    description: input.description.trim(),
    hasBudget:
      input.type === "expense" &&
      (legacyBudgetOnly ||
        ledger.budgets.some((b) => b.category === input.category)),
  };
  const accounts = ledger.accounts.map((account) => {
    let balance = cents(account.balance);
    if (old?.accountId === account.id) balance -= accountDelta(old);
    if (transaction.accountId === account.id)
      balance += accountDelta(transaction);
    if (!Number.isSafeInteger(balance))
      throw new Error("This change exceeds the supported balance range.");
    return { ...account, balance: balance / 100 };
  });
  return {
    ...ledger,
    accounts,
    transactions: old
      ? ledger.transactions.map((t) => (t.id === id ? transaction : t))
      : [transaction, ...ledger.transactions],
  };
}
export function deleteTransaction(ledger: Ledger, id: string): Ledger {
  const old = ledger.transactions.find((t) => t.id === id);
  if (!old) return ledger;
  return {
    ...ledger,
    transactions: ledger.transactions.filter((t) => t.id !== id),
    accounts: ledger.accounts.map((a) =>
      a.id === old.accountId
        ? { ...a, balance: (cents(a.balance) - accountDelta(old)) / 100 }
        : a,
    ),
  };
}
export function saveAccount(ledger: Ledger, input: Account): Ledger {
  if (
    !input.name.trim() ||
    !Number.isFinite(input.balance) ||
    !Number.isSafeInteger(cents(input.balance))
  )
    throw new Error("Enter an account name and valid balance.");
  if (
    ledger.accounts.some(
      (a) =>
        a.id !== input.id &&
        a.name.trim().toLowerCase() === input.name.trim().toLowerCase(),
    )
  )
    throw new Error("An account with this name already exists.");
  const account = {
    ...input,
    name: input.name.trim(),
    balance: money(input.balance),
  };
  return {
    ...ledger,
    accounts: ledger.accounts.some((a) => a.id === input.id)
      ? ledger.accounts.map((a) => (a.id === input.id ? account : a))
      : [...ledger.accounts, account],
  };
}
export function deleteAccount(ledger: Ledger, id: string): Ledger {
  if (ledger.transactions.some((t) => t.accountId === id))
    throw new Error(
      "This account has transactions. Move or delete those transactions first.",
    );
  return { ...ledger, accounts: ledger.accounts.filter((a) => a.id !== id) };
}
export function saveBudget(ledger: Ledger, input: Budget): Ledger {
  if (!input.category.trim()) throw new Error("Choose a budget category.");
  if (
    ledger.budgets.some(
      (b) => b.id !== input.id && b.category === input.category,
    )
  )
    throw new Error("This category already has a budget.");
  const budget = { ...input, limit: positiveAmount(input.limit), spent: 0 };
  return {
    ...ledger,
    budgets: ledger.budgets.some((b) => b.id === input.id)
      ? ledger.budgets.map((b) => (b.id === input.id ? budget : b))
      : [...ledger.budgets, budget],
  };
}
export function monthlyHistory(ledger: Ledger): MonthlyData[] {
  const months = [
    ...new Set(ledger.transactions.map((t) => t.date.slice(0, 7))),
  ];
  const derived = months.map((month) => {
    const transactions = ledger.transactions.filter((t) =>
      inMonth(t.date, month),
    );
    const budgets = budgetsForMonth(ledger, month);
    const totalLimit = budgets.reduce((sum, b) => sum + b.limit, 0);
    return {
      month,
      year: Number(month.slice(0, 4)),
      monthName: new Date(month + "-01T12:00:00").toLocaleDateString("en-PH", {
        month: "long",
        year: "numeric",
      }),
      transactions,
      budgets,
      accounts: [],
      totalBalance: 0,
      totalExpenses: money(
        transactions
          .filter((t) => t.type === "expense")
          .reduce((sum, t) => sum + t.amount, 0),
      ),
      totalIncome: money(
        transactions
          .filter((t) => t.type === "income")
          .reduce((sum, t) => sum + t.amount, 0),
      ),
      budgetUtilization: totalLimit
        ? (budgets.reduce((sum, b) => sum + b.spent, 0) / totalLimit) * 100
        : 0,
    };
  });
  // Archived snapshots remain available; no automatic monthly transaction deletion.
  return [
    ...ledger.history.map((h) => ({ ...h, isArchive: true })),
    ...derived,
  ].sort((a, b) => b.month.localeCompare(a.month));
}
