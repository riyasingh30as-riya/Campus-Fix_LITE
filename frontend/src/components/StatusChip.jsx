export default function StatusChip({ status }) {
  const cls = `chip chip--${status.replace(/\s+/g, '-')}`;
  return <span className={cls}>{status}</span>;
}
