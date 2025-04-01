'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

// Define the expected shape of the form data (subset of InventoryItem)
// Matches the fields in our upcoming form
interface AddItemFormData {
  name: string;
  quantity_current: number;
  quantity_unit: string;
  location_description?: string;
  expiry_date?: string; // Dates will be string YYYY-MM-DD
  cas_number?: string;
  lot_number?: string;
  // Add other relevant fields from your form here
}

interface UpdateItemFormData {
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

export async function addItemAction(formData: AddItemFormData) {
  const cookieStore = cookies();
  const supabase = createClient();

  // Basic validation (can be expanded with Zod later)
  if (!formData.name || !formData.quantity_current || !formData.quantity_unit) {
    return { success: false, error: 'Missing required fields (Name, Quantity, Unit).' };
  }

  try {
    const { data, error } = await supabase
      .from('inventory_items')
      .insert([
        {
          name: formData.name,
          quantity_current: formData.quantity_current,
          quantity_unit: formData.quantity_unit,
          // Set original quantity same as current for new items
          quantity_original: formData.quantity_current,
          location_description: formData.location_description || null,
          expiry_date: formData.expiry_date || null,
          cas_number: formData.cas_number || null,
          lot_number: formData.lot_number || null,
          // Set other fields to null or default values as needed
          price: null,
          supplier: null,
          catalog_number: null,
          storage_conditions: null,
          safety_data: null,
          notes: null,
        },
      ])
      .select(); // Use .select() to get the inserted data back if needed

    if (error) {
      console.error('Supabase insert error:', error);
      return { success: false, error: error.message };
    }

    // Revalidate the inventory page path to refresh the list
    revalidatePath('/');
    return { success: true, data };

  } catch (e: any) {
    console.error('Server action error:', e);
    return { success: false, error: 'An unexpected error occurred.' };
  }
}

export async function updateItemAction(itemId: string, formData: UpdateItemFormData) {
  const cookieStore = cookies();
  const supabase = createClient();

  if (!itemId) {
    return { success: false, error: 'Item ID is required.' };
  }

  // Basic validation
  if (!formData.name || !formData.quantity_current || !formData.quantity_unit) {
    return { success: false, error: 'Missing required fields (Name, Quantity, Unit).' };
  }

  try {
    console.log('Attempting to update item:', itemId, formData);
    
    const { data, error } = await supabase
      .from('inventory_items')
      .update({
        name: formData.name,
        quantity_current: formData.quantity_current,
        quantity_unit: formData.quantity_unit,
        location_description: formData.location_description || null,
        expiry_date: formData.expiry_date || null,
        cas_number: formData.cas_number || null,
        lot_number: formData.lot_number || null,
        supplier: formData.supplier || null,
        catalog_number: formData.catalog_number || null,
        storage_conditions: formData.storage_conditions || null,
        notes: formData.notes || null,
      })
      .eq('id', itemId)
      .select();

    if (error) {
      console.error('Supabase update error:', error);
      return { success: false, error: error.message };
    }

    console.log('Item updated successfully:', itemId);
    
    // Revalidate the inventory page path to refresh the list
    revalidatePath('/');
    return { success: true, data };

  } catch (e: any) {
    console.error('Server action error (update):', e);
    return { success: false, error: 'An unexpected error occurred during update.' };
  }
}

// --- Add Delete Action --- 
export async function deleteItemAction(itemId: string) {
  const cookieStore = cookies();
  const supabase = createClient();

  if (!itemId) {
    return { success: false, error: 'Item ID is required.' };
  }

  try {
    console.log('Attempting to delete item:', itemId);
    
    const { error } = await supabase
      .from('inventory_items')
      .delete()
      .eq('id', itemId); // Use .eq instead of .match for better type safety

    if (error) {
      console.error('Supabase delete error:', error);
      return { success: false, error: error.message };
    }

    console.log('Item deleted successfully:', itemId);
    
    // Revalidate the inventory page path to refresh the list
    revalidatePath('/');
    return { success: true };

  } catch (e: any) {
    console.error('Server action error (delete):', e);
    return { success: false, error: 'An unexpected error occurred during deletion.' };
  }
} 