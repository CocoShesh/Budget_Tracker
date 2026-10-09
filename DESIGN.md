# Budget Tracker interface

The existing light blue/gray application identity is retained. This is an operational interface: quick scanning, accurate amounts, clear forms, and recovery paths take priority over decoration.

- Surface: `#f5f7fa` canvas; white sections with `#dce2ea` borders, 12px corners, and no decorative shadows on dashboard sections.
- Text: `#182333` foreground; `#526174` secondary text. Platform sans typography with tabular money figures.
- Action: `#2458c6` primary blue; `#147448` positive values; `#b42332` destructive actions and exceeded limits. Labels communicate meaning alongside color.
- Layout: a 1360px maximum canvas, 24px section gaps, two overview columns on wide screens, and one column below 720px. Summary columns collapse from four to two below 1050px. Filters collapse to two columns.
- Interaction: visible 3px focus outlines, 44px primary/form controls, a skip link, protected dialog focus, Escape dismissal, focus restoration, and polite save-status announcements.
- Data: account balances are current, summary income/expenses are current month/year, budgets are planning limits, and saved records are browser-local. Recovery messages never claim corrupt data was restored.

The existing account/budget form styling remains available inside the common accessible dialog boundary. New transaction forms use the same blue/gray system. Reduced-motion preference disables the short dialog entrance.
