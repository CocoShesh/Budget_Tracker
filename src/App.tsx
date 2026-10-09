import { useRef, useState, type ChangeEvent } from "react";
import Dashboard from "./components/Dashboard";
import TransactionModal from "./components/TransactionModal";
import AccountModal from "./components/AccountModal";
import BudgetModal from "./components/BudgetModal";
import {
  budgetsForMonth,
  deleteAccount,
  deleteTransaction,
  emptyLedger,
  monthKey,
  saveAccount,
  saveBudget,
  saveTransaction,
  monthlyHistory,
  type Ledger,
} from "./utils/ledger";
import {
  legacyKeys,
  loadLedger,
  parseLedger,
  persistLedger,
  rawBackup,
  STORAGE_KEY,
} from "./utils/storage";

function initialData() {
  try {
    return {
      ...loadLedger(localStorage),
      raw: localStorage.getItem(STORAGE_KEY),
    };
  } catch {
    return {
      ledger: emptyLedger(),
      error:
        "Browser storage is unavailable. Enable storage to save your budget.",
      raw: null,
    };
  }
}
function download(name: string, value: unknown) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(value, null, 2)], { type: "application/json" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export default function App() {
  const [initial] = useState(initialData);
  const [ledger, setLedger] = useState(initial.ledger);
  const [storageError, setStorageError] = useState(initial.error);
  const [message, setMessage] = useState("");
  const [modal, setModal] = useState<string | null>(null);
  const latest = useRef(ledger);
  const lastSaved = useRef(initial.raw);
  const importInput = useRef<HTMLInputElement>(null);
  function commit(change: (current: Ledger) => Ledger) {
    try {
      if (storageError)
        throw new Error(
          "Resolve the storage warning before making changes. Your original data has been preserved.",
        );
      if (localStorage.getItem(STORAGE_KEY) !== lastSaved.current)
        throw new Error(
          "Your data changed in another tab. Reload this page before editing.",
        );
      const next = change(latest.current);
      persistLedger(localStorage, next);
      lastSaved.current = localStorage.getItem(STORAGE_KEY);
      latest.current = next;
      setLedger(next);
      setMessage("Changes saved on this device.");
    } catch (error) {
      const text =
        error instanceof Error
          ? error.message
          : "Unable to save. Export a backup and check browser storage.";
      setMessage(text);
      throw new Error(text);
    }
  }
  const run = (change: (current: Ledger) => Ledger) => {
    try {
      commit(change);
    } catch {
      /* An announced message preserves the existing state. */
    }
  };
  const backup = () => {
    try {
      download(
        "tipid-track-backup.json",
        storageError
          ? { originalStorage: rawBackup(localStorage) }
          : latest.current,
      );
      setMessage(
        "Backup downloaded. Keep it private; it contains your financial records.",
      );
    } catch {
      setMessage("Unable to read browser storage for a backup.");
    }
  };
  const restore = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      if (file.size > 5 * 1024 * 1024)
        throw new Error("Choose a backup smaller than 5 MB.");
      const next = parseLedger(JSON.parse(await file.text()));
      if (
        !window.confirm(
          "Replace your current data with this backup? Export your current records first if you need to keep them.",
        )
      )
        return;
      commit(() => next);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to import this backup.",
      );
    }
  };
  const clear = () => {
    if (
      !window.confirm(
        "Clear all accounts, transactions, budgets, and monthly history on this device? Export a backup first. This cannot be undone.",
      )
    )
      return;
    try {
      if (localStorage.getItem(STORAGE_KEY) !== lastSaved.current)
        throw new Error(
          "Your data changed in another tab. Reload before clearing.",
        );
      const next = emptyLedger();
      persistLedger(localStorage, next);
      lastSaved.current = localStorage.getItem(STORAGE_KEY);
      legacyKeys.forEach((key) => localStorage.removeItem(key));
      latest.current = next;
      setLedger(next);
      setStorageError(null);
      setMessage("All tracker data cleared from this device.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to clear browser storage.",
      );
    }
  };
  const budgets = budgetsForMonth(ledger, monthKey());
  return (
    <>
      <a className="skip-link" href="#transactions">
        Skip to transactions
      </a>
      <main className="app-shell">
        <div className="storage-toolbar">
          <span>Tipid Track · saved on this device</span>
          <div>
            <button onClick={backup}>Export backup</button>
            <button
              disabled={!!storageError}
              onClick={() => importInput.current?.click()}
            >
              Import backup
            </button>
          </div>
        </div>
        <input
          type="file"
          accept="application/json,.json"
          ref={importInput}
          onChange={restore}
          hidden
          aria-label="Import budget backup"
        />
        {storageError && (
          <section role="alert" className="storage-warning">
            <h2>Your saved data needs attention</h2>
            <p>{storageError}</p>
            <p>
              Nothing has been overwritten. Export the original data before
              resetting, or reload after repairing browser storage.
            </p>
            <div>
              <button onClick={backup}>Export original data</button>
              <button onClick={() => window.location.reload()}>Reload</button>
              <button onClick={clear}>Reset tracker</button>
            </div>
          </section>
        )}
        <p className="save-status" role="status" aria-live="polite">
          {message ||
            "Your records stay in this browser. Export a backup before switching devices."}
        </p>
        <Dashboard
          accounts={ledger.accounts}
          budgets={budgets}
          transactions={ledger.transactions}
          history={monthlyHistory(ledger)}
          onOpenModal={(name) => {
            if (!storageError) setModal(name);
          }}
          onClearData={clear}
          onDeleteTransaction={(id) =>
            run((current) => deleteTransaction(current, id))
          }
          onDeleteAccount={(id) => run((current) => deleteAccount(current, id))}
          onDeleteBudget={(id) =>
            run((current) => ({
              ...current,
              budgets: current.budgets.filter((b) => b.id !== id),
            }))
          }
          onUpdateTransaction={(t) =>
            commit((current) => saveTransaction(current, t, t.id))
          }
          onUpdateAccount={(a) => commit((current) => saveAccount(current, a))}
          onUpdateBudget={(b) => commit((current) => saveBudget(current, b))}
        />
        {(modal === "transaction" || modal === "income") && (
          <TransactionModal
            initialType={modal === "income" ? "income" : "expense"}
            accounts={ledger.accounts}
            budgets={budgets}
            onClose={() => setModal(null)}
            onSubmit={(input) => {
              commit((current) => saveTransaction(current, input));
              setModal(null);
            }}
          />
        )}
        {modal === "account" && (
          <AccountModal
            accounts={ledger.accounts}
            onClose={() => setModal(null)}
            onSubmit={(input) => {
              commit((current) =>
                saveAccount(current, { ...input, id: crypto.randomUUID() }),
              );
              setModal(null);
            }}
          />
        )}
        {modal === "budget" && (
          <BudgetModal
            budgets={budgets}
            onClose={() => setModal(null)}
            onSubmit={(category, limit) => {
              commit((current) =>
                saveBudget(current, {
                  id: crypto.randomUUID(),
                  category,
                  limit,
                  spent: 0,
                }),
              );
              setModal(null);
            }}
          />
        )}
      </main>
    </>
  );
}
