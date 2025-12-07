import { useEffect } from "react";

export default function BottomSheet({ isOpen, onClose, title, children }) {
  // Prevent body scroll when sheet is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => (document.body.style.overflow = "");
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="md:hidden fixed inset-0 z-40 pointer-events-none">
      {/* Backdrop */}
      <div
        className="
          absolute inset-0 bg-black/40 
          opacity-0 animate-fadeIn pointer-events-auto
        "
        onClick={onClose}
      />

      {/* Sheet Container */}
      <div
        className="
          absolute bottom-0 left-0 right-0
          pointer-events-auto
          animate-slideUp
        "
      >
        <div
          className="
            bg-[#050814]/95 
            border-t border-white/15
            rounded-t-2xl px-4 pt-3 pb-4
            max-h-[70vh] w-full
            shadow-[0_-10px_30px_rgba(0,0,0,0.6)]
            flex flex-col
          "
        >
          {/* Drag handle */}
          <div className="flex justify-center mb-2">
            <div className="w-10 h-1.5 rounded-full bg-white/25" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-cyan-300">
              {title}
            </h3>

            <button
              onClick={onClose}
              className="
                w-8 h-8 flex items-center justify-center
                rounded-full bg-white/10 border border-white/20
                text-gray-300 text-lg
                active:scale-90 transition
              "
            >
              <i className="ri-close-line" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto custom-scroll pb-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
