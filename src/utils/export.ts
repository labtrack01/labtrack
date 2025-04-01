import { Workbook, Column } from 'exceljs';
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
export const exportToCSV = async (items: InventoryItem[], filename: string) => {
  const formattedData = items.map(formatItemForExport);
  const headers = Object.keys(formattedData[0]);
  
  const csvContent = [
    headers.join(','),
    ...formattedData.map(item => 
      Object.values(item).map(value => 
        typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))
          ? `"${value.replace(/"/g, '""')}"`
          : value
      ).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
};

// Export to XLSX
export const exportToXLSX = async (items: InventoryItem[]) => {
  const timestamp = format(new Date(), 'yyyy-MM-dd-HHmm');
  const filename = `inventory-export-${timestamp}.xlsx`;
  const formattedData = items.map(formatItemForExport);
  
  const workbook = new Workbook();
  const worksheet = workbook.addWorksheet('Inventory');
  
  // Add headers
  const headers = Object.keys(formattedData[0]);
  worksheet.addRow(headers);
  
  // Add data
  formattedData.forEach(item => {
    worksheet.addRow(Object.values(item));
  });
  
  // Style the worksheet
  worksheet.getRow(1).font = { bold: true };
  // Set column widths
  const columnCount = worksheet.columnCount;
  for (let i = 1; i <= columnCount; i++) {
    worksheet.getColumn(i).width = 15;
  }
  
  // Generate and download file
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
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