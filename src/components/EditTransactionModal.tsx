import TransactionModal from "./TransactionModal";
import type { EditTransactionModalProps, Budget } from "../utils/type";
export default function EditTransactionModal({
  isOpen,
  onClose,
  onUpdate,
  transaction,
  accounts,
  budgets = [],
}: EditTransactionModalProps & { budgets?: Budget[] }) {
  if (!isOpen || !transaction) return null;
  return (
    <TransactionModal
      accounts={accounts}
      budgets={budgets}
      transaction={transaction}
      onClose={onClose}
      onSubmit={(input) => onUpdate({ ...input, id: transaction.id })}
    />
  );
}
