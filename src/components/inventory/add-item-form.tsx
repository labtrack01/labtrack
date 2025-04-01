'use client';

import { useForm, SubmitHandler } from 'react-hook-form';
import { Button, TextInput, NumberInput, DatePicker, Textarea } from '@tremor/react';
import { addItemAction } from '@/app/actions';
import { useState } from 'react';

// Matches the interface in actions.ts
interface AddItemFormData {
  name: string;
  quantity_current: number;
  quantity_unit: string;
  location_description?: string;
  expiry_date?: string; // DatePicker value will be Date, convert before sending
  cas_number?: string;
  lot_number?: string;
}

interface AddItemFormProps {
  onSuccess?: () => void; // Optional callback on successful submission
}

export function AddItemForm({ onSuccess }: AddItemFormProps) {
  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<AddItemFormData>();
  const [serverError, setServerError] = useState<string | null>(null);

  // Handle date change for DatePicker
  const handleDateChange = (date: Date | undefined | null) => {
    // Format date as YYYY-MM-DD for the action, or set to empty string if null/undefined
    setValue('expiry_date', date ? date.toISOString().split('T')[0] : '');
  };

  const onSubmit: SubmitHandler<AddItemFormData> = async (data) => {
    setServerError(null);
    const result = await addItemAction({
      ...data,
      // Ensure quantity is a number
      quantity_current: Number(data.quantity_current),
    });

    if (result.success) {
      reset(); // Clear the form
      if (onSuccess) {
        onSuccess(); // Call the callback (e.g., close modal)
      }
    } else {
      setServerError(result.error || 'Failed to add item.');
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
            enableStepper={false} // Optional: disable stepper
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
        {/* Need to register expiry_date manually because DatePicker doesn't directly integrate */}
        <input type="hidden" {...register('expiry_date')} /> 
        <label id="expiry_date_label" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Expiry Date</label>
        <DatePicker 
          aria-labelledby="expiry_date_label"
          onValueChange={handleDateChange} 
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

      {/* Error Message */}
      {serverError && <p className="text-sm text-red-600">Error: {serverError}</p>}

      <div className="flex justify-end space-x-2 pt-4">
        {/* TODO: Add Cancel button */}
        <Button type="submit" loading={isSubmitting} disabled={isSubmitting}>
          Add Item
        </Button>
      </div>
    </form>
  );
} 