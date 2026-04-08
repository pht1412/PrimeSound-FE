import { createContext, useContext, useState, type ReactNode } from 'react';
import { X } from 'lucide-react';

interface ComingSoonContextType {
  showComingSoon: () => void;
  hideComingSoon: () => void;
}

const ComingSoonContext = createContext<ComingSoonContextType | undefined>(undefined);

export const ComingSoonProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);

  const showComingSoon = () => setIsOpen(true);
  const hideComingSoon = () => setIsOpen(false);

  return (
    <ComingSoonContext.Provider value={{ showComingSoon, hideComingSoon }}>
      {children}
      {/* GLOBAL COMING SOON MODAL */}
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm transition-opacity">
          <div className="bg-[#282828] w-full max-w-sm rounded-2xl p-8 shadow-2xl flex flex-col items-center relative border border-[#3e3e3e]">
            {/* Close Button */}
            <button 
              onClick={hideComingSoon}
              className="absolute top-4 right-4 text-[#a7a7a7] hover:text-white transition bg-transparent border-none"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Icon Wrench/Tool */}
            <div className="w-20 h-20 bg-[#1ed760]/10 rounded-full flex items-center justify-center mb-6">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#1ed760" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
              </svg>
            </div>

            {/* Content */}
            <h2 className="text-2xl font-extrabold text-white mb-3 text-center tracking-tight">Tính năng sắp ra mắt!</h2>
            <p className="text-[#a7a7a7] text-center mb-8 text-[15px] leading-relaxed">
              Chức năng này hiện đang được đội ngũ phát triển. Vui lòng quay lại sau nhé!
            </p>

            <button 
              onClick={hideComingSoon}
              className="px-8 py-3 rounded-full font-bold bg-[#1ed760] text-black hover:scale-105 transition w-full shadow-lg"
            >
              OK, Tôi đã hiểu
            </button>
          </div>
        </div>
      )}
    </ComingSoonContext.Provider>
  );
};

export const useComingSoon = () => {
  const context = useContext(ComingSoonContext);
  if (context === undefined) {
    throw new Error('useComingSoon must be used within a ComingSoonProvider');
  }
  return context;
};
