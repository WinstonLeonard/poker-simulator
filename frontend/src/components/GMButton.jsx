const GMButton = ({ onClick, children, className = "" }) => (
  <button
    onClick={onClick}
    className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${className}`}
  >
    {children}
  </button>
);
export default GMButton;
