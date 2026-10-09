import { useState } from "react";
import Dialog from "./Dialog";
import EditAccountModal from "./EditAccountModal";
import EditBudgetModal from "./EditBudgetModal";
import EditTransactionModal from "./EditTransactionModal";
import type {
  DashboardProps,
  Account,
  Budget,
  Transaction,
} from "../utils/type";
import { formatPHP } from "../utils/currency";
import { inMonth, money, monthKey } from "../utils/ledger";

export default function Dashboard(props: DashboardProps) {
  const {
    accounts,
    transactions,
    budgets,
    history,
    onOpenModal,
    onClearData,
    onDeleteAccount,
    onDeleteBudget,
    onDeleteTransaction,
    onUpdateAccount,
    onUpdateBudget,
    onUpdateTransaction,
  } = props;
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [accountFilter, setAccountFilter] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState(monthKey());
  const [page, setPage] = useState(1);
  const [editTransaction, setEditTransaction] = useState<Transaction>();
  const [editAccount, setEditAccount] = useState<Account>();
  const [editBudget, setEditBudget] = useState<Budget>();
  const [showHistory, setShowHistory] = useState(false);
  const [confirmation, setConfirmation] = useState<{
    title: string;
    message: string;
    action: () => void;
  }>();
  const currentTransactions = transactions.filter((t) =>
    inMonth(t.date, monthKey()),
  );
  const income = money(
    currentTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0),
  );
  const expenses = money(
    currentTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0),
  );
  const totalBalance = money(accounts.reduce((sum, a) => sum + a.balance, 0));
  const totalBudget = budgets.reduce((sum, b) => sum + b.limit, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const filtered = transactions
    .filter(
      (t) =>
        (!selectedMonth || inMonth(t.date, selectedMonth)) &&
        (typeFilter === "all" || t.type === typeFilter) &&
        (accountFilter === "all" || t.accountId === accountFilter) &&
        `${t.description} ${t.category} ${accounts.find((a) => a.id === t.accountId)?.name ?? ""}`
          .toLowerCase()
          .includes(query.trim().toLowerCase()),
    )
    .sort((a, b) => b.date.localeCompare(a.date));
  const perPage = 20;
  const pages = Math.max(1, Math.ceil(filtered.length / perPage));
  const actualPage = Math.min(page, pages);
  const shown = filtered.slice(
    (actualPage - 1) * perPage,
    actualPage * perPage,
  );
  const monthTitle = new Date(monthKey() + "-01T12:00:00").toLocaleDateString(
    "en-PH",
    { month: "long", year: "numeric" },
  );
  const remove = (title: string, message: string, action: () => void) =>
    setConfirmation({ title, message, action });
  return (
    <>
      <header className="dashboard-header">
        <div>
          <h1>Budget Tracker</h1>
          <p>Know where your money goes.</p>
        </div>
        <div className="dashboard-actions">
          <button
            className="button-primary"
            disabled={!accounts.length}
            onClick={() => onOpenModal("transaction")}
          >
            Add Expense
          </button>
          <button
            className="button-secondary"
            disabled={!accounts.length}
            onClick={() => onOpenModal("income")}
          >
            Add Income
          </button>
          <button
            className="button-secondary"
            onClick={() => onOpenModal("account")}
          >
            Add Account
          </button>
          <button
            className="button-secondary"
            onClick={() => onOpenModal("budget")}
          >
            Set Budget
          </button>
        </div>
      </header>
      <section className="summary" aria-label="Financial overview">
        <div>
          <p>Total balance</p>
          <strong>{formatPHP(totalBalance)}</strong>
          <span>
            Across {accounts.length}{" "}
            {accounts.length === 1 ? "account" : "accounts"}
          </span>
        </div>
        <div>
          <p>Monthly income</p>
          <strong className="positive">{formatPHP(income)}</strong>
          <span>{monthTitle}</span>
        </div>
        <div>
          <p>Monthly expenses</p>
          <strong>{formatPHP(expenses)}</strong>
          <span>{monthTitle}</span>
        </div>
        <div>
          <p>Budget remaining</p>
          <strong className={totalBudget - totalSpent < 0 ? "negative" : ""}>
            {formatPHP(totalBudget - totalSpent)}
          </strong>
          <span>
            {totalBudget
              ? `${Math.round((totalSpent / totalBudget) * 100)}% of monthly limits used`
              : "Set a budget to start planning"}
          </span>
        </div>
      </section>
      {!accounts.length && (
        <section className="onboarding">
          <h2>Start with an account</h2>
          <p>
            Add your current balance, then record income and expenses. There is
            no sample money mixed into your records.
          </p>
          <button
            className="button-primary"
            onClick={() => onOpenModal("account")}
          >
            Add your first account
          </button>
        </section>
      )}
      <div className="overview-grid">
        <section className="surface" aria-labelledby="accounts-heading">
          <div className="section-heading">
            <h2 id="accounts-heading">Accounts</h2>
            <span>{accounts.length} total</span>
          </div>
          {!accounts.length ? (
            <p className="empty-copy">Your accounts will appear here.</p>
          ) : (
            <ul className="account-list">
              {accounts.map((account) => (
                <li key={account.id}>
                  <div className="account-name">
                    <span className={`account-dot ${account.color}`} />
                    <div>
                      <h3>{account.name}</h3>
                      <p>
                        {account.bankName ? `${account.bankName} · ` : ""}
                        {account.type}
                      </p>
                    </div>
                  </div>
                  <strong>{formatPHP(account.balance)}</strong>
                  <div className="row-actions">
                    <button
                      aria-label={`Edit account ${account.name}`}
                      onClick={() => setEditAccount(account)}
                    >
                      Edit
                    </button>
                    <button
                      aria-label={`Delete account ${account.name}`}
                      disabled={transactions.some(
                        (t) => t.accountId === account.id,
                      )}
                      title={
                        transactions.some((t) => t.accountId === account.id)
                          ? "Move or delete its transactions first"
                          : "Delete account"
                      }
                      onClick={() =>
                        remove(
                          "Delete account?",
                          `Delete ${account.name}?`,
                          () => onDeleteAccount(account.id),
                        )
                      }
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="surface" aria-labelledby="budgets-heading">
          <div className="section-heading">
            <h2 id="budgets-heading">Monthly budgets</h2>
            <button onClick={() => onOpenModal("budget")}>Add budget</button>
          </div>
          <p className="section-note">
            Limits help plan spending. Expenses still come from your accounts.
          </p>
          {!budgets.length ? (
            <p className="empty-copy">
              Choose a category and a monthly spending limit.
            </p>
          ) : (
            <ul className="budget-list">
              {budgets.map((budget) => {
                const percentage =
                  budget.limit > 0 ? (budget.spent / budget.limit) * 100 : 0;
                return (
                  <li key={budget.id}>
                    <div className="budget-line">
                      <h3>{budget.category}</h3>
                      <span>
                        {formatPHP(budget.spent)} / {formatPHP(budget.limit)}
                      </span>
                    </div>
                    <progress
                      max={100}
                      value={Math.min(percentage, 100)}
                      aria-label={`${budget.category} budget used`}
                      className={percentage > 100 ? "over-budget" : ""}
                    />
                    <div className="budget-footer">
                      <span className={percentage > 100 ? "negative" : ""}>
                        {percentage > 100
                          ? `${formatPHP(budget.spent - budget.limit)} over limit`
                          : `${formatPHP(budget.limit - budget.spent)} remaining`}
                      </span>
                      <div className="row-actions">
                        <button
                          aria-label={`Edit budget ${budget.category}`}
                          onClick={() => setEditBudget(budget)}
                        >
                          Edit
                        </button>
                        <button
                          aria-label={`Delete budget ${budget.category}`}
                          onClick={() =>
                            remove(
                              "Delete budget?",
                              "Your transactions and account balances will be preserved.",
                              () => onDeleteBudget(budget.id),
                            )
                          }
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
      <section
        className="surface transactions"
        id="transactions"
        tabIndex={-1}
        aria-labelledby="transactions-heading"
      >
        <div className="section-heading">
          <h2 id="transactions-heading">Transactions</h2>
          <button
            disabled={!history.length}
            onClick={() => setShowHistory(true)}
          >
            Monthly history
          </button>
        </div>
        <div className="transaction-filters">
          <label>
            Search
            <input
              type="search"
              value={query}
              placeholder="Description, category, or account"
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
            />
          </label>
          <label>
            Month
            <input
              type="month"
              value={selectedMonth}
              onChange={(event) => {
                setSelectedMonth(event.target.value);
                setPage(1);
              }}
            />
          </label>
          <label>
            Type
            <select
              value={typeFilter}
              onChange={(event) => {
                setTypeFilter(event.target.value);
                setPage(1);
              }}
            >
              <option value="all">All types</option>
              <option value="expense">Expenses</option>
              <option value="income">Income</option>
            </select>
          </label>
          <label>
            Account
            <select
              value={accountFilter}
              onChange={(event) => {
                setAccountFilter(event.target.value);
                setPage(1);
              }}
            >
              <option value="all">All accounts</option>
              <option value="">Legacy budget-only</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="filter-summary">
          <span>
            {filtered.length}{" "}
            {filtered.length === 1 ? "transaction" : "transactions"}
          </span>
          <button
            onClick={() => {
              setQuery("");
              setSelectedMonth("");
              setTypeFilter("all");
              setAccountFilter("all");
              setPage(1);
            }}
          >
            Show all / reset filters
          </button>
        </div>
        {!shown.length ? (
          <div className="empty-state">
            <h3>
              {transactions.length
                ? "No matching transactions"
                : "No transactions yet"}
            </h3>
            <p>
              {transactions.length
                ? "Try another month or reset the filters."
                : "Record your first expense or income to start tracking."}
            </p>
          </div>
        ) : (
          <ul className="transaction-list">
            {shown.map((t) => (
              <li key={t.id}>
                <div className="transaction-description">
                  <h3>{t.description}</h3>
                  <p>
                    {t.category} ·{" "}
                    {accounts.find((a) => a.id === t.accountId)?.name ??
                      "Legacy budget-only"}{" "}
                    ·{" "}
                    <time dateTime={t.date}>
                      {new Date(t.date + "T12:00:00").toLocaleDateString(
                        "en-PH",
                        { day: "numeric", month: "short", year: "numeric" },
                      )}
                    </time>
                  </p>
                </div>
                <strong className={t.type === "income" ? "positive" : ""}>
                  {t.type === "income" ? "+" : "−"}
                  {formatPHP(t.amount)}
                </strong>
                <div className="row-actions">
                  <button
                    aria-label={`Edit transaction ${t.description}`}
                    onClick={() => setEditTransaction(t)}
                  >
                    Edit
                  </button>
                  <button
                    aria-label={`Delete transaction ${t.description}`}
                    onClick={() =>
                      remove(
                        "Delete transaction?",
                        "The account balance will be reversed and budget spending recalculated.",
                        () => onDeleteTransaction(t.id),
                      )
                    }
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
        {pages > 1 && (
          <nav className="pagination" aria-label="Transaction pages">
            <button
              disabled={actualPage <= 1}
              onClick={() => setPage(actualPage - 1)}
            >
              Previous
            </button>
            <span>
              Page {actualPage} of {pages}
            </span>
            <button
              disabled={actualPage >= pages}
              onClick={() => setPage(actualPage + 1)}
            >
              Next
            </button>
          </nav>
        )}
      </section>
      <footer className="dashboard-footer">
        <p>
          No automatic monthly resets. Past transactions stay available through
          the month filter and history.
        </p>
        <button className="danger-link" onClick={onClearData}>
          Clear all data
        </button>
      </footer>
      {editTransaction && (
        <EditTransactionModal
          isOpen
          transaction={editTransaction}
          accounts={accounts}
          budgets={budgets}
          onClose={() => setEditTransaction(undefined)}
          onUpdate={(t) => {
            onUpdateTransaction(t);
            setEditTransaction(undefined);
          }}
        />
      )}
      {editAccount && (
        <EditAccountModal
          isOpen
          account={editAccount}
          accounts={accounts}
          onClose={() => setEditAccount(undefined)}
          onUpdate={(a) => {
            onUpdateAccount(a);
            setEditAccount(undefined);
          }}
        />
      )}
      {editBudget && (
        <EditBudgetModal
          isOpen
          budget={editBudget}
          budgets={budgets}
          onClose={() => setEditBudget(undefined)}
          onUpdate={(b) => {
            onUpdateBudget(b);
            setEditBudget(undefined);
          }}
        />
      )}
      {confirmation && (
        <Dialog
          title={confirmation.title}
          onClose={() => setConfirmation(undefined)}
        >
          <section className="form-panel">
            <h2>{confirmation.title}</h2>
            <p>{confirmation.message}</p>
            <div className="form-actions">
              <button
                className="button-secondary"
                onClick={() => setConfirmation(undefined)}
              >
                Cancel
              </button>
              <button
                className="button-danger"
                onClick={() => {
                  confirmation.action();
                  setConfirmation(undefined);
                }}
              >
                Delete
              </button>
            </div>
          </section>
        </Dialog>
      )}
      {showHistory && (
        <Dialog title="Monthly history" onClose={() => setShowHistory(false)}>
          <section className="form-panel history-panel">
            <div className="form-heading">
              <h2>Monthly history</h2>
              <button
                aria-label="Close monthly history"
                onClick={() => setShowHistory(false)}
              >
                Close
              </button>
            </div>
            <p>
              Recorded transactions by month. Older archived snapshots are
              preserved.
            </p>
            <ul className="history-list">
              {history.map((h) => (
                <li key={`${h.month}-${h.isArchive ? "archive" : "ledger"}`}>
                  <h3>
                    {h.monthName}
                    {h.isArchive ? " · Archived snapshot" : ""}
                  </h3>
                  <p>
                    Income {formatPHP(h.totalIncome)} · Expenses{" "}
                    {formatPHP(h.totalExpenses)}
                  </p>
                  <button
                    onClick={() => {
                      setSelectedMonth(h.month);
                      setQuery("");
                      setTypeFilter("all");
                      setAccountFilter("all");
                      setPage(1);
                      setShowHistory(false);
                    }}
                  >
                    View month
                  </button>
                  {h.isArchive && (
                    <details>
                      <summary>View archived transactions</summary>
                      {h.transactions.map((t) => (
                        <p key={t.id}>
                          {t.date} · {t.description} · {formatPHP(t.amount)}
                        </p>
                      ))}
                    </details>
                  )}
                </li>
              ))}
            </ul>
          </section>
        </Dialog>
      )}
    </>
  );
}
