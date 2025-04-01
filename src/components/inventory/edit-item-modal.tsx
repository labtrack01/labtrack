'use client';

import { Dialog, DialogPanel, Title } from '@tremor/react';
import { EditItemForm } from './edit-item-form';
import { useEffect } from 'react';

interface InventoryItem {
  id: string;
  name: string;
  cas_number: string | null;
  lot_number: string | null;
  expiry_date: string | null;
  location_description: string | null;
  quantity_original: number;
  quantity_unit: string;
  quantity_current: number;
  price: number | null;
  supplier: string | null;
  catalog_number: string | null;
  storage_conditions: string | null;
  safety_data: any | null;
  notes: string | null;
}

interface EditItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: InventoryItem | null;
}

export function EditItemModal({ isOpen, onClose, item }: EditItemModalProps) {
  useEffect(() => {
    console.log(`EditItemModal rendering, isOpen: ${isOpen}, item:`, item);
  }, [isOpen, item]);

  if (!isOpen || !item) {
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
          <Title className="mb-6">Edit Item: {item.name}</Title>
          <EditItemForm item={item} onSuccess={onClose} />
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