import React from "react";

function ErrorModal({ isOpen, onClose, title, message }) {
  // Don't render anything if the modal is not open
  if (!isOpen) {
    return null;
  }

  return (
    // Main overlay
    <div
      onClick={onClose} // Close modal when overlay is clicked
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm"
    >
      {/* Modal content container */}
      <div
        onClick={(e) => e.stopPropagation()} // Prevent clicks inside the modal from closing it
        className="relative w-full max-w-md p-6 mx-4 bg-slate-800 rounded-2xl shadow-2xl border border-red-500/50"
      >
        {/* Header with Title and Icon */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-red-500/20 rounded-full">
            <svg
              className="w-7 h-7 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              ></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white">
            {title || "An Error Occurred"}
          </h2>
        </div>

        {/* Error Message */}
        <p className="text-slate-300 mb-6">
          {message || "Something went wrong. Please try again."}
        </p>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full px-4 py-2 font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-500/50 transition-colors duration-200"
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default ErrorModal;
