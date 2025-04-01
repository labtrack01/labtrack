import { utils, writeFile } from 'xlsx';
import { format } from 'date-fns';

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
  created_at: string;
  updated_at: string;
}

// Helper function to format data for export
const formatItemForExport = (item: InventoryItem) => {
  return {
    Name: item.name,
    'CAS Number': item.cas_number || 'N/A',
    'Lot Number': item.lot_number || 'N/A',
    'Expiry Date': item.expiry_date ? format(new Date(item.expiry_date), 'yyyy-MM-dd') : 'N/A',
    Location: item.location_description || 'N/A',
    'Original Quantity': `${item.quantity_original} ${item.quantity_unit}`,
    'Current Quantity': `${item.quantity_current} ${item.quantity_unit}`,
    Price: item.price ? `$${item.price.toFixed(2)}` : 'N/A',
    Supplier: item.supplier || 'N/A',
    'Catalog Number': item.catalog_number || 'N/A',
    'Storage Conditions': item.storage_conditions || 'N/A',
    Notes: item.notes || 'N/A',
    'Created At': format(new Date(item.created_at), 'yyyy-MM-dd HH:mm:ss'),
    'Updated At': format(new Date(item.updated_at), 'yyyy-MM-dd HH:mm:ss')
  };
};

// Export to CSV
export const exportToCSV = (items: InventoryItem[], filename: string) => {
  const formattedData = items.map(formatItemForExport);
  const worksheet = utils.json_to_sheet(formattedData);
  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, worksheet, 'Inventory');
  writeFile(workbook, filename);
};

// Export to XLSX
export const exportToXLSX = (items: InventoryItem[]) => {
  const timestamp = format(new Date(), 'yyyy-MM-dd-HHmm');
  const filename = `inventory-export-${timestamp}.xlsx`;
  const formattedData = items.map(formatItemForExport);
  const worksheet = utils.json_to_sheet(formattedData);
  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, worksheet, 'Inventory');
  writeFile(workbook, filename);
};

// Export to JSON
export const exportToJSON = (items: InventoryItem[]) => {
  const timestamp = format(new Date(), 'yyyy-MM-dd-HHmm');
  const filename = `inventory-export-${timestamp}.json`;
  const formattedData = items.map(formatItemForExport);
  const jsonString = JSON.stringify(formattedData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}; 