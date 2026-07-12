const STATUS_CONFIG = {
  pending: { label: "Pending", classes: "text-warning border-warning/30 bg-warning/15" },
  confirmed: { label: "Confirmed", classes: "text-success border-success/30 bg-success/15" },
  completed: { label: "Completed", classes: "text-info border-info/30 bg-info/15" },
  cancelled: { label: "Cancelled", classes: "text-destructive border-destructive/30 bg-destructive/15" },
};

export default function StatusBadge({ status }) {
  const { label, classes } = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;

  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${classes}`}>
      {label}
    </span>
  );
}
