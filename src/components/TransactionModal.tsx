import { useState, type FormEvent } from "react";
import Dialog from "./Dialog";
import {
  expenseCategories,
  incomeCategories,
  type Account,
  type Budget,
  type Transaction,
} from "../utils/type";
import { localDate, positiveAmount, validDate } from "../utils/ledger";

interface Props {
  accounts: Account[];
  budgets: Budget[];
  onSubmit: (
    transaction: Omit<Transaction, "id"> & { hasBudget: boolean },
  ) => void;
  onClose: () => void;
  transaction?: Transaction;
  initialType?: "income" | "expense";
}
export default function TransactionModal({
  accounts,
  budgets,
  onSubmit,
  onClose,
  transaction,
  initialType = "expense",
}: Props) {
  const [type, setType] = useState(transaction?.type ?? initialType);
  const [amount, setAmount] = useState(
    transaction ? String(transaction.amount) : "",
  );
  const [category, setCategory] = useState(transaction?.category ?? "");
  const [description, setDescription] = useState(
    transaction?.description ?? "",
  );
  const [date, setDate] = useState(transaction?.date ?? localDate());
  const [accountId, setAccountId] = useState(
    transaction?.accountId ?? accounts[0]?.id ?? "",
  );
  const [error, setError] = useState("");
  const legacy = !!transaction?.hasBudget && !transaction.accountId;
  const categories = [
    ...new Set([
      ...(type === "income" ? incomeCategories : expenseCategories),
      ...(category ? [category] : []),
    ]),
  ];
  const budget =
    type === "expense"
      ? budgets.find((b) => b.category === category)
      : undefined;
  const title = transaction
    ? "Edit transaction"
    : type === "income"
      ? "Add Income"
      : "Add Expense";
  const submit = (event: FormEvent) => {
    event.preventDefault();
    try {
      const parsed = positiveAmount(Number(amount));
      if (!category || !description.trim() || !validDate(date))
        throw new Error("Complete the category, description, and date.");
      if (!accountId && (!legacy || type === "income"))
        throw new Error("Choose an account for this transaction.");
      onSubmit({
        type,
        amount: parsed,
        category,
        description: description.trim(),
        date,
        accountId,
        hasBudget: !!budget || (legacy && !accountId),
      });
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to save this transaction.",
      );
    }
  };
  return (
    <Dialog title={title} onClose={onClose}>
      <section className="form-panel">
        <header className="form-heading">
          <div>
            <h2>{title}</h2>
            <p>Account balances and budgets update together.</p>
          </div>
          <button
            type="button"
            className="icon-button"
            aria-label="Close transaction form"
            onClick={onClose}
          >
            ×
          </button>
        </header>
        <form onSubmit={submit} className="form-fields">
          <label>
            Type
            <select
              value={type}
              onChange={(event) => {
                setType(event.target.value as typeof type);
                setCategory("");
              }}
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </label>
          <div className="form-grid">
            <label>
              Amount (PHP)
              <input
                type="number"
                min="0.01"
                step="0.01"
                required
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="0.00"
              />
            </label>
            <label>
              Date
              <input
                type="date"
                required
                value={date}
                onChange={(event) => setDate(event.target.value)}
              />
            </label>
          </div>
          <label>
            Category
            <select
              required
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              <option value="">Choose a category</option>
              {categories.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label>
            Description
            <input
              required
              maxLength={240}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder={
                type === "income"
                  ? "e.g. Monthly salary"
                  : "e.g. Weekly groceries"
              }
            />
          </label>
          <label>
            Account
            <select
              required={!legacy || type === "income"}
              value={accountId}
              onChange={(event) => setAccountId(event.target.value)}
            >
              {legacy && <option value="">Legacy budget-only entry</option>}
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </label>
          <p className="form-note">
            {budget
              ? `Counts toward your ${budget.category} budget. The money comes from the selected account.`
              : "This transaction updates the selected account balance."}
          </p>
          {legacy && (
            <p className="form-note">
              This older entry had no funding account. Keep it budget-only, or
              select an account to apply its full amount to that balance.
            </p>
          )}
          {error && (
            <p role="alert" className="form-error">
              {error}
            </p>
          )}
          <div className="form-actions">
            <button
              type="button"
              className="button-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button className="button-primary" type="submit">
              Save transaction
            </button>
          </div>
        </form>
      </section>
    </Dialog>
  );
}
