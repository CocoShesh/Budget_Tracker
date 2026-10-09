import test from "node:test";
import assert from "node:assert/strict";
import {
  emptyLedger,
  saveTransaction,
  deleteTransaction,
  saveAccount,
  deleteAccount,
  budgetsForMonth,
  monthlyHistory,
  positiveAmount,
  localDate,
  inMonth,
} from "../src/utils/ledger.ts";
import {
  loadLedger,
  parseLedger,
  persistLedger,
  STORAGE_KEY,
} from "../src/utils/storage.ts";
const fixture = () => ({
  ...emptyLedger(),
  accounts: [
    {
      id: "a",
      name: "Cash",
      type: "cash",
      balance: 1000,
      color: "bg-blue-500",
    },
    {
      id: "b",
      name: "Bank",
      type: "checking",
      balance: 500,
      color: "bg-green-500",
    },
  ],
  budgets: [{ id: "food", category: "Food & Dining", limit: 200, spent: 0 }],
});
const expense = (extra = {}) => ({
  type: "expense",
  amount: 100,
  category: "Food & Dining",
  description: "Groceries",
  date: "2026-10-10",
  accountId: "a",
  hasBudget: true,
  ...extra,
});
class MemoryStorage {
  data = new Map();
  getItem(key) {
    return this.data.get(key) ?? null;
  }
  setItem(key, value) {
    this.data.set(key, value);
  }
  removeItem(key) {
    this.data.delete(key);
  }
}
test("budgeted expense debits its account and counts toward its monthly limit", () => {
  const next = saveTransaction(fixture(), expense(), "t");
  assert.equal(next.accounts[0].balance, 900);
  assert.equal(budgetsForMonth(next, "2026-10")[0].spent, 100);
  assert.equal(budgetsForMonth(next, "2025-10")[0].spent, 0);
});
test("editing amount and funding account reverses the original exactly once", () => {
  let next = saveTransaction(fixture(), expense(), "t");
  next = saveTransaction(next, expense({ amount: 150, accountId: "b" }), "t");
  assert.deepEqual(
    next.accounts.map((a) => a.balance),
    [1000, 350],
  );
  assert.equal(budgetsForMonth(next, "2026-10")[0].spent, 150);
  next = deleteTransaction(next, "t");
  assert.deepEqual(
    next.accounts.map((a) => a.balance),
    [1000, 500],
  );
  assert.equal(budgetsForMonth(next, "2026-10")[0].spent, 0);
});
test("income edits and deletes update the proper account", () => {
  let next = saveTransaction(
    fixture(),
    expense({
      type: "income",
      amount: 250,
      hasBudget: false,
      category: "Salary",
    }),
    "t",
  );
  assert.equal(next.accounts[0].balance, 1250);
  next = saveTransaction(
    next,
    expense({
      type: "income",
      amount: 200,
      accountId: "b",
      category: "Salary",
    }),
    "t",
  );
  assert.deepEqual(
    next.accounts.map((a) => a.balance),
    [1000, 700],
  );
  assert.deepEqual(
    deleteTransaction(next, "t").accounts.map((a) => a.balance),
    [1000, 500],
  );
});
test("invalid amounts, dates and missing accounts are rejected without mutation", () => {
  const ledger = fixture(),
    original = structuredClone(ledger);
  for (const amount of [-1, 0, NaN, Infinity, 1e30])
    assert.throws(() => positiveAmount(amount));
  for (const extra of [
    { date: "2026-02-30" },
    { accountId: "missing" },
    { description: "  " },
  ])
    assert.throws(() => saveTransaction(ledger, expense(extra), "t"));
  assert.deepEqual(ledger, original);
});
test("legacy budget-only entries can be edited without changing account balances", () => {
  const ledger = {
    ...fixture(),
    transactions: [{ ...expense({ accountId: "" }), id: "old" }],
  };
  const next = saveTransaction(
    ledger,
    expense({ accountId: "", amount: 75 }),
    "old",
  );
  assert.deepEqual(next.accounts, ledger.accounts);
  assert.equal(budgetsForMonth(next, "2026-10")[0].spent, 75);
  assert.equal(parseLedger(next).transactions[0].hasBudget, true);
  assert.throws(() =>
    saveTransaction(ledger, expense({ accountId: "", type: "income" }), "old"),
  );
});
test("assigning an account to a legacy expense applies the full debit", () => {
  const ledger = {
    ...fixture(),
    transactions: [{ ...expense({ accountId: "" }), id: "old" }],
  };
  assert.equal(
    saveTransaction(ledger, expense(), "old").accounts[0].balance,
    900,
  );
});
test("decimal arithmetic does not accumulate balance drift", () => {
  let ledger = fixture();
  for (let i = 0; i < 10; i++)
    ledger = saveTransaction(ledger, expense({ amount: 0.1 }), String(i));
  assert.equal(ledger.accounts[0].balance, 999);
  for (let i = 0; i < 10; i++) ledger = deleteTransaction(ledger, String(i));
  assert.equal(ledger.accounts[0].balance, 1000);
});
test("linked accounts cannot be deleted; zero starting balance is supported", () => {
  const ledger = saveTransaction(fixture(), expense(), "t");
  assert.throws(() => deleteAccount(ledger, "a"));
  assert.equal(
    saveAccount(fixture(), {
      id: "zero",
      name: "Empty wallet",
      balance: 0,
      type: "cash",
      color: "bg-blue-500",
    }).accounts[2].balance,
    0,
  );
});
test("month history distinguishes years and preserves all transactions", () => {
  const ledger = {
    ...fixture(),
    transactions: [
      { ...expense(), id: "new" },
      { ...expense({ date: "2025-10-10", amount: 300 }), id: "old" },
    ],
  };
  const history = monthlyHistory(ledger);
  assert.deepEqual(
    history.map((h) => [h.month, h.totalExpenses]),
    [
      ["2026-10", 100],
      ["2025-10", 300],
    ],
  );
  assert.equal(ledger.transactions.length, 2);
  assert.equal(inMonth("2025-10-10", "2026-10"), false);
});
test("local date uses the selected local calendar day", () => {
  assert.equal(localDate(new Date(2026, 9, 10, 1, 0)), "2026-10-10");
});
test("corrupt legacy JSON is preserved and never written over during load", () => {
  const storage = new MemoryStorage();
  storage.setItem("transactions", "{broken");
  storage.setItem("accounts", JSON.stringify(fixture().accounts));
  const before = new Map(storage.data);
  assert.ok(loadLedger(storage).error);
  assert.deepEqual(storage.data, before);
});
test("a corrupt modern snapshot does not silently fall back to old data", () => {
  const storage = new MemoryStorage();
  storage.setItem(STORAGE_KEY, "null");
  assert.ok(loadLedger(storage).error);
  assert.equal(storage.getItem(STORAGE_KEY), "null");
});
test("legacy migration preserves keys; modern snapshot wins after the first edit", () => {
  const storage = new MemoryStorage();
  storage.setItem("accounts", JSON.stringify(fixture().accounts));
  storage.setItem("transactions", "[]");
  storage.setItem("budgets", "[]");
  const loaded = loadLedger(storage);
  assert.equal(loaded.error, null);
  const next = saveTransaction(loaded.ledger, expense(), "t");
  persistLedger(storage, next);
  assert.equal(storage.getItem("transactions"), "[]");
  assert.deepEqual(loadLedger(storage).ledger, next);
});
test("invalid backup schemas, duplicate IDs and orphan accounts are rejected", () => {
  assert.throws(() => parseLedger({ version: 99 }));
  assert.throws(() =>
    parseLedger({
      ...fixture(),
      transactions: [{ ...expense({ accountId: "lost" }), id: "t" }],
    }),
  );
  assert.throws(() =>
    parseLedger({
      ...fixture(),
      accounts: [fixture().accounts[0], fixture().accounts[0]],
    }),
  );
  assert.throws(() => parseLedger({ ...fixture(), accounts: null }));
});
test("storage quota failure leaves the original snapshot intact", () => {
  const storage = new MemoryStorage();
  persistLedger(storage, fixture());
  const before = storage.getItem(STORAGE_KEY);
  storage.setItem = () => {
    throw new Error("Quota exceeded");
  };
  assert.throws(() => persistLedger(storage, emptyLedger()));
  assert.equal(storage.getItem(STORAGE_KEY), before);
});

test("archived snapshots remain visible alongside new records from the same month", () => {
  const ledger = fixture();
  ledger.transactions = [
    {
      id: "new",
      type: "expense",
      amount: 10,
      category: "Food & Dining",
      description: "new",
      date: "2026-10-10",
      accountId: "a",
      hasBudget: true,
    },
  ];
  const snapshot = monthlyHistory(ledger)[0];
  ledger.history = [{ ...snapshot, totalExpenses: 40, transactions: [] }];
  const history = monthlyHistory(ledger);
  assert.equal(history.length, 2);
  assert.equal(history.find((h) => h.isArchive).totalExpenses, 40);
  assert.equal(history.find((h) => !h.isArchive).totalExpenses, 10);
});
