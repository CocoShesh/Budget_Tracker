import type { Account, Budget, Transaction } from "./type";
import type { MonthlyData } from "./MonthlyStorage";
import { emptyLedger, validDate, type Ledger } from "./ledger.ts";
export const STORAGE_KEY = "tipid-track:ledger:v1";
export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}
const record = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);
const text = (v: unknown): v is string => typeof v === "string";
const number = (v: unknown): v is number =>
  typeof v === "number" &&
  Number.isFinite(v) &&
  Number.isSafeInteger(Math.round(v * 100));
const account = (v: unknown): v is Account =>
  record(v) &&
  text(v.id) &&
  !!v.id &&
  text(v.name) &&
  text(v.type) &&
  number(v.balance) &&
  text(v.color) &&
  (v.bankName === undefined || text(v.bankName));
const transaction = (v: unknown): v is Transaction =>
  record(v) &&
  text(v.id) &&
  !!v.id &&
  (v.type === "income" || v.type === "expense") &&
  number(v.amount) &&
  v.amount > 0 &&
  text(v.category) &&
  text(v.description) &&
  text(v.date) &&
  validDate(v.date) &&
  text(v.accountId) &&
  (v.hasBudget === undefined || typeof v.hasBudget === "boolean");
const budget = (v: unknown): v is Budget =>
  record(v) &&
  text(v.id) &&
  !!v.id &&
  text(v.category) &&
  number(v.limit) &&
  v.limit > 0 &&
  number(v.spent) &&
  v.spent >= 0;
function array<T>(
  v: unknown,
  check: (value: unknown) => value is T,
  name: string,
): T[] {
  if (!Array.isArray(v) || !v.every(check))
    throw new Error(
      `Saved ${name} are invalid. Export the original data before resetting.`,
    );
  return v;
}
function unique(items: { id: string }[], name: string) {
  if (new Set(items.map((item) => item.id)).size !== items.length)
    throw new Error(`Saved ${name} contain duplicate IDs.`);
}
function history(v: unknown): MonthlyData[] {
  if (!Array.isArray(v)) throw new Error("Monthly history must be an array.");
  return v.map((item) => {
    if (
      !record(item) ||
      !text(item.month) ||
      !/^\d{4}-(0[1-9]|1[0-2])$/.test(item.month) ||
      !number(item.year) ||
      !text(item.monthName) ||
      !number(item.totalBalance) ||
      !number(item.totalExpenses) ||
      !number(item.totalIncome) ||
      !number(item.budgetUtilization)
    )
      throw new Error("Saved monthly history is invalid.");
    return {
      ...item,
      transactions: array(
        item.transactions,
        transaction,
        "historical transactions",
      ),
      accounts: array(item.accounts, account, "historical accounts"),
      budgets: array(item.budgets, budget, "historical budgets"),
    } as unknown as MonthlyData;
  });
}
export function parseLedger(value: unknown): Ledger {
  if (!record(value) || value.version !== 1)
    throw new Error(
      "Unsupported backup format. Use a Tipid Track version 1 backup.",
    );
  const ledger: Ledger = {
    version: 1,
    accounts: array(value.accounts, account, "accounts"),
    transactions: array(value.transactions, transaction, "transactions"),
    budgets: array(value.budgets, budget, "budgets"),
    history: history(value.history),
  };
  unique(ledger.accounts, "accounts");
  unique(ledger.transactions, "transactions");
  unique(ledger.budgets, "budgets");
  if (
    ledger.transactions.some(
      (t) => t.accountId && !ledger.accounts.some((a) => a.id === t.accountId),
    )
  )
    throw new Error("A saved transaction refers to a missing account.");
  if (ledger.transactions.some((t) => !t.accountId && !t.hasBudget))
    throw new Error("A saved transaction is missing its account.");
  return ledger;
}
export function loadLedger(storage: StorageLike): {
  ledger: Ledger;
  error: string | null;
} {
  try {
    const saved = storage.getItem(STORAGE_KEY);
    if (saved !== null)
      return { ledger: parseLedger(JSON.parse(saved)), error: null };
    const read = (key: string) =>
      JSON.parse(storage.getItem(key) ?? "[]") as unknown;
    const ledger = parseLedger({
      version: 1,
      accounts: read("accounts"),
      transactions: read("transactions"),
      budgets: read("budgets"),
      history: read("budget_tracker_monthly_data"),
    });
    // Legacy keys are preserved; the first real edit writes the atomic new snapshot.
    return { ledger, error: null };
  } catch (error) {
    return {
      ledger: emptyLedger(),
      error:
        error instanceof Error
          ? error.message
          : "Browser storage is unavailable.",
    };
  }
}
export function persistLedger(storage: StorageLike, ledger: Ledger) {
  storage.setItem(STORAGE_KEY, JSON.stringify(parseLedger(ledger)));
}
export const legacyKeys = [
  "transactions",
  "accounts",
  "budgets",
  "budget_tracker_monthly_data",
  "budget_tracker_current_month",
];
export function rawBackup(storage: StorageLike) {
  return Object.fromEntries(
    [STORAGE_KEY, ...legacyKeys].map((key) => [key, storage.getItem(key)]),
  );
}
