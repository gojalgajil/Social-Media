interface PostModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function PostModal({ open, onClose, children }: PostModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center pt-24 z-50">
      <div className="bg-blue-300 rounded-xl p-4 w-full max-w-lg relative">

        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 w-8 h-8 flex items-center justify-center
             border rounded-full text-blue-950 hover:text-black
             transition cursor-pointer"
        >
          ✕
        </button>

        {children}

      </div>
    </div>
  );
}