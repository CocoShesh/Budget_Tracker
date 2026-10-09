# Contributing

Use Node.js 24+ and the pinned pnpm version. Install with `pnpm install --frozen-lockfile`.

For every change, run `pnpm test`, `pnpm lint`, and `pnpm build`. Keep calculation/storage logic in the pure utilities and add a behavior-focused regression test for financial or persistence changes. Use synthetic records; never attach personal backups, balances, or storage dumps to a public issue or pull request.

For UI changes, check mobile, tablet, and desktop layouts, keyboard-only form access, invalid input, empty lists, long descriptions, and failed saves. Dialogs should close with Escape, contain keyboard focus while open, and return focus to their trigger on close.

Preserve legacy records and never silently overwrite malformed storage. A migration should validate its input, preserve the original data, and describe recovery/rollback behavior. Avoid changing the interpretation of account balances without explaining its impact on existing records.

Describe the concrete problem, resulting behavior, checks actually run, and remaining limitations in the pull request.
