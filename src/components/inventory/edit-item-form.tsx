'use client';

import { useForm, SubmitHandler } from 'react-hook-form';
import { Button, TextInput, NumberInput, DatePicker, Textarea } from '@tremor/react';
import { updateItemAction } from '@/app/actions';
import { useState, useEffect } from 'react';

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

// Matches the interface in actions.ts
interface EditItemFormData {
  name: string;
  quantity_current: number;
  quantity_unit: string;
  location_description?: string;
  expiry_date?: string;
  cas_number?: string;
  lot_number?: string;
  supplier?: string;
  catalog_number?: string;
  storage_conditions?: string;
  notes?: string;
}

interface EditItemFormProps {
  item: InventoryItem;
  onSuccess?: () => void;
}

export function EditItemForm({ item, onSuccess }: EditItemFormProps) {
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<EditItemFormData>({
    defaultValues: {
      name: item.name,
      quantity_current: item.quantity_current,
      quantity_unit: item.quantity_unit,
      location_description: item.location_description || '',
      expiry_date: item.expiry_date || '',
      cas_number: item.cas_number || '',
      lot_number: item.lot_number || '',
      supplier: item.supplier || '',
      catalog_number: item.catalog_number || '',
      storage_conditions: item.storage_conditions || '',
      notes: item.notes || '',
    }
  });
  
  const [serverError, setServerError] = useState<string | null>(null);

  // Handle date change for DatePicker
  const handleDateChange = (date: Date | undefined | null) => {
    setValue('expiry_date', date ? date.toISOString().split('T')[0] : '');
  };

  const onSubmit: SubmitHandler<EditItemFormData> = async (data) => {
    setServerError(null);
    const result = await updateItemAction(item.id, {
      ...data,
      quantity_current: Number(data.quantity_current),
    });

    if (result.success) {
      if (onSuccess) {
        onSuccess(); // Call the callback (e.g., close modal)
      }
    } else {
      setServerError(result.error || 'Failed to update item.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Required Fields */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Item Name *</label>
        <TextInput
          id="name"
          placeholder="e.g., Ethanol 95%"
          {...register('name', { required: 'Item name is required' })}
          error={!!errors.name}
          errorMessage={errors.name?.message}
          disabled={isSubmitting}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="quantity_current" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Quantity *</label>
          <NumberInput
            id="quantity_current"
            placeholder="e.g., 500"
            {...register('quantity_current', { 
              required: 'Quantity is required', 
              valueAsNumber: true, 
              min: { value: 0, message: 'Quantity cannot be negative'} 
            })}
            error={!!errors.quantity_current}
            errorMessage={errors.quantity_current?.message}
            enableStepper={false}
            disabled={isSubmitting}
          />
        </div>
        <div>
          <label htmlFor="quantity_unit" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Unit *</label>
          <TextInput
            id="quantity_unit"
            placeholder="e.g., mL, mg, units"
            {...register('quantity_unit', { required: 'Unit is required' })}
            error={!!errors.quantity_unit}
            errorMessage={errors.quantity_unit?.message}
            disabled={isSubmitting}
          />
        </div>
      </div>

      {/* Optional Fields */}
      <div>
        <label htmlFor="location_description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Location</label>
        <TextInput
          id="location_description"
          placeholder="e.g., Fridge A, Shelf 3"
          {...register('location_description')}
          disabled={isSubmitting}
        />
      </div>

      <div>
        <input type="hidden" {...register('expiry_date')} />
        <label id="expiry_date_label" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Expiry Date</label>
        <DatePicker 
          aria-labelledby="expiry_date_label"
          onValueChange={handleDateChange}
          defaultValue={item.expiry_date ? new Date(item.expiry_date) : undefined}
          placeholder="Select date"
          disabled={isSubmitting}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="cas_number" className="block text-sm font-medium text-gray-700 dark:text-gray-300">CAS Number</label>
          <TextInput
            id="cas_number"
            placeholder="e.g., 64-17-5"
            {...register('cas_number')}
            disabled={isSubmitting}
          />
        </div>
        <div>
          <label htmlFor="lot_number" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Lot Number</label>
          <TextInput
            id="lot_number"
            placeholder="e.g., LOTE12345"
            {...register('lot_number')}
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="supplier" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Supplier</label>
          <TextInput
            id="supplier"
            placeholder="e.g., Sigma-Aldrich"
            {...register('supplier')}
            disabled={isSubmitting}
          />
        </div>
        <div>
          <label htmlFor="catalog_number" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Catalog Number</label>
          <TextInput
            id="catalog_number"
            placeholder="e.g., E7023"
            {...register('catalog_number')}
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div>
        <label htmlFor="storage_conditions" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Storage Conditions</label>
        <TextInput
          id="storage_conditions"
          placeholder="e.g., 2-8°C"
          {...register('storage_conditions')}
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Notes</label>
        <Textarea
          id="notes"
          placeholder="Additional notes..."
          {...register('notes')}
          disabled={isSubmitting}
        />
      </div>

      {/* Error Message */}
      {serverError && <p className="text-sm text-red-600">Error: {serverError}</p>}

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="submit" loading={isSubmitting} disabled={isSubmitting}>
          Update Item
        </Button>
      </div>
    </form>
  );
} 