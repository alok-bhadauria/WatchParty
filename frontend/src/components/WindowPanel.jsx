// Inline window area for mobile between media and bottom toolbar
export default function WindowPanel({ open, content }) {
  if (!open) return null;

  return (
    <div className="md:hidden flex-none border-t border-white/10 bg-[#050814]/95">
      <div className="h-[55vh] max-h-[60vh] overflow-y-auto custom-scroll px-3 py-2 pb-17">
        {content}
      </div>
    </div>
  );
}
