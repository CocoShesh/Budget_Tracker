# Tipid Track · Budget Tracker

A browser-local Philippine peso budget tracker built with React, TypeScript, Vite, and Tailwind CSS. Manage accounts, record income and expenses, set monthly category limits, and review past months without signing in.

## Run locally

Requirements: **Node.js 24+** and **pnpm 11.9.0**. The repository pins pnpm in `package.json` and keeps dependency versions in `pnpm-lock.yaml`.

```sh
git clone https://github.com/CocoShesh/Budget_Tracker.git
cd Budget_Tracker
pnpm install --frozen-lockfile
pnpm dev
```

Open the localhost URL printed by Vite. Native scripts are explicitly allowed only for the existing Vite/Tailwind tooling (`esbuild` and `@tailwindcss/oxide`). There is no API key, backend, database server, or AI subscription to configure.

## How to use it

1. **Add an account** with its current balance. Zero balances and negative balances are supported; account names must be unique.
2. **Record income or an expense** with a date, category, description, and funding account.
3. **Set monthly budgets** for categories you want to monitor. Matching expenses count toward that month's limit; budgets do not hold money or replace the funding account.
4. **Search or filter transactions** by calendar month/year, type, or account. Lists show 20 entries per page.
5. **Export a backup** regularly, and use Import backup to restore a validated version 1 JSON backup (up to 5 MB).

Balances are current account balances. Editing or deleting a transaction reverses its old account effect before applying the new one. Editing an account balance is a direct correction, not an income transaction. Transaction amounts are rounded to centavos, must be finite, and must be at least ₱0.01.

Monthly totals use both the month and year. Budget limits apply to the current month's matching categories. Historical budget utilization is calculated using the currently configured limits for retained transactions; it is not a historical record of past limit changes. Imported archived snapshots retain their original totals.

## Storage and privacy

Your records live in this browser profile's local storage. There is no automatic server synchronization, bank connection, or cloud backup. Clearing browser data, using a different browser/profile, or changing the deployment origin can make these records unavailable. Export before switching devices or clearing data.

- A versioned, validated snapshot (`tipid-track:ledger:v1`) saves accounts, transactions, budgets, and archived history together.
- Existing legacy keys are read without writing over them. The first successful edit writes the new snapshot; existing account balances are preserved rather than recalculated from incomplete history.
- Older budget-only transactions with no funding account remain editable. Choosing an account for one applies its full amount to that balance; the form explains this before saving.
- Malformed data opens a recovery message and is left intact. **Export original data** creates a diagnostic JSON containing the raw storage strings; it is not a normal importable backup. Repair the original records or reset explicitly after exporting.
- Failed saves do not update the in-memory ledger. A stale tab is prevented from overwriting a newer snapshot; reload the stale tab before editing.
- Month boundaries do not automatically delete transactions. Monthly history includes retained transactions and older archived snapshots.
- **Clear all data** requires confirmation and removes the tracker snapshot and legacy tracker keys. It cannot be undone without a backup.

Backups contain financial records in plain JSON. Keep them private. This is a local tracking tool, not bank-connected accounting software.

## Verification

```sh
pnpm test
pnpm lint
pnpm build
pnpm preview
```

The Node test suite covers account/budget effects, edit/delete reversals, legacy budget-only behavior, centavo arithmetic, year-specific summaries, zero balances, invalid input, schema validation, and storage corruption/quota failures. CI runs tests, ESLint, and the TypeScript/Vite production build using the frozen lockfile.

Browser verification covers account/budget creation, expenses, income, edits/deletes, backup export/import, keyboard focus, corrupted storage, stale snapshots, and emulated viewports at 390 × 844, 768 × 1024, and 1440 × 900. These checks use synthetic data; they are not physical-device or all-browser coverage.

## Project structure

```text
src/App.tsx                  Storage boundary, backup/import and mutations
src/components/Dashboard.tsx Accounts, budgets, transaction filters and history
src/components/Dialog.tsx    Keyboard focus, Escape and accessible form labels
src/utils/ledger.ts          Pure transaction and summary calculations
src/utils/storage.ts         Runtime validation and legacy migration
src/utils/currency.ts        Philippine peso formatting
tests/ledger.test.mjs        Regression tests without extra test dependencies
.github/workflows/ci.yml     Frozen-lockfile verification
```
