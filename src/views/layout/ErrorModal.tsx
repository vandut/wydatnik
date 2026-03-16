import React from 'react';
import Modal from '../../components/Modal';

interface ErrorModalProps {
  message: string | null;
  onClose: () => void;
}

const ErrorModal: React.FC<ErrorModalProps> = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <Modal 
      title="Error" 
      onClose={onClose}
      footer={
        <button
          onClick={onClose}
          data-testid="error-modal-ok-btn"
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors cursor-pointer"
        >
          OK
        </button>
      }
    >
      <p className="text-slate-600">{message}</p>
    </Modal>
  );
};

export default ErrorModal;
