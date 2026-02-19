const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30 px-4 py-8 font-JayusiganR">
      <div className="relative w-full max-w-md 
                  max-h-[calc(100vh-4rem)] 
                  flex flex-col 
                  bg-white rounded-2xl shadow-sm">
        {children}
      </div>
    </div>

  );
};


export default Modal;