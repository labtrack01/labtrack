'use client';

import { Dialog, DialogPanel, Title } from '@tremor/react';
import { AddItemForm } from './add-item-form';
import { useEffect } from 'react';

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddItemModal({ isOpen, onClose }: AddItemModalProps) {
  
  useEffect(() => {
    console.log(`AddItemModal rendering, isOpen: ${isOpen}`);
  }, [isOpen]);
  
  const handleSuccess = () => {
    console.log('Form submission successful, closing modal');
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <Dialog 
      open={isOpen} 
      onClose={onClose} 
      static={true}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="mx-auto max-w-xl rounded bg-white p-6 shadow-lg dark:bg-gray-800">
          <Title className="mb-6">Add New Inventory Item</Title>
          <AddItemForm onSuccess={handleSuccess} />
          <button
            type="button"
            onClick={() => {
              console.log('Cancel button clicked');
              onClose();
            }}
            className="mt-4 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
          >
            Cancel
          </button>
        </DialogPanel>
      </div>
    </Dialog>
  );
} 