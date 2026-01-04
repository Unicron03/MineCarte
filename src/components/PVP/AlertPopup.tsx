import React from "react";

interface AlertPopupProps {
  message: string | null;
  isOpen: boolean;
  onClose: () => void;
}

const AlertPopup: React.FC<AlertPopupProps> = ({ message, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 backdrop-blur-sm transition-opacity duration-300">
      <div className="relative bg-gray-900 border-2 border-red-600 rounded-xl shadow-[0_0_20px_rgba(220,38,38,0.5)] p-6 max-w-md w-full mx-4 transform transition-all">
        
        {/* Bouton Fermer (Croix) */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
          aria-label="Fermer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Icône & Titre */}
        <div className="flex flex-col items-center text-center mb-4">
          <div className="w-14 h-14 rounded-full bg-red-600/20 border border-red-500 flex items-center justify-center mb-3 shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white uppercase tracking-wider">Attention</h3>
        </div>

        {/* Message */}
        <div className="text-center mb-6 px-2">
          <p className="text-gray-200 text-lg leading-relaxed font-medium">
            {message}
          </p>
        </div>

        {/* Bouton d'action */}
        <div className="flex justify-center">
          <button
            onClick={onClose}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-8 rounded-lg shadow-lg transform transition hover:scale-105 active:scale-95"
          >
            Compris
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertPopup;
