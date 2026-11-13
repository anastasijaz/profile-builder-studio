/** Marks features that are still mock data, so testers don't rely on them. */
export function PreviewBanner({ className = "" }: { className?: string }) {
  return (
    <div
      role="note"
      className={`rounded-2xl border border-melt-orange/30 bg-melt-peach/30 px-4 py-2.5 text-xs text-ink ${className}`}
    >
      <strong className="font-semibold">Preview — coming soon.</strong> Activities are sample data;
      bookings and new activities aren't saved for real yet.
    </div>
  );
}
