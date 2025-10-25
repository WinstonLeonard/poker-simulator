const GMButton = ({ onClick, children, className = "" }) => (
  <button
    onClick={onClick}
    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${className}`}
  >
    {children}
  </button>
);
export default GMButton;
