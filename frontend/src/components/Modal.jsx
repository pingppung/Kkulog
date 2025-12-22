const Modal = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex justify-center items-center pointer-events-none" >
            <div className="bg-white p-6 rounded-xl shadow-2xl max-w-lg w-full relative pointer-events-auto border border-gray-300">
                <button 
                    onClick={onClose}
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-2xl font-bold"
                >
                    &times;
                </button>
                
                {children}
            </div>
        </div>
    );
};

export default Modal;