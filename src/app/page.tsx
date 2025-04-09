'use client'; // Convert to Client Component

import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import {
  Card,
  Table,
  TableHead,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  Title,
  Text,
  Badge,
  Button, // Import Button
  Icon, // Import Icon for button
} from '@tremor/react';
import { format, parseISO, isAfter, isBefore, addDays } from 'date-fns';
import { AddItemModal } from '@/components/inventory/add-item-modal'; // Import the modal
import { EditItemModal } from '@/components/inventory/edit-item-modal';
import { InventoryFilters, FilterOptions } from '@/components/inventory/inventory-filters';
import { PlusIcon, TrashIcon, PencilIcon, ArrowDownTrayIcon } from '@heroicons/react/24/solid'; // Icon for button
import { deleteItemAction } from '@/app/actions'; // Import necessary icons and action
import { exportToCSV, exportToXLSX, exportToJSON } from '@/utils/export';
import { Menu } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';

// Define the type for our inventory items based on the SQL schema
interface InventoryItem {
  id: string;
  name: string;
  cas_number: string | null;
  lot_number: string | null;
  expiry_date: string | null; // Dates come as strings initially
  location_description: string | null;
  quantity_original: number;
  quantity_unit: string;
  quantity_current: number;
  price: number | null;
  supplier: string | null;
  catalog_number: string | null;
  storage_conditions: string | null;
  safety_data: any | null; // Use 'any' or a more specific type if JSON structure is known
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// Function to determine badge color based on expiry date
const getExpiryBadgeColor = (expiryDate: string | null): string => {
  if (!expiryDate) return 'gray';
  const today = new Date();
  const expiry = parseISO(expiryDate);
  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'red'; // Expired
  if (diffDays <= 30) return 'orange'; // Expires within 30 days
  if (diffDays <= 90) return 'yellow'; // Expires within 90 days
  return 'emerald'; // Expires later than 90 days
};

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null); // Track which item is being deleted
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    expiryFilter: 'all',
    locationFilter: null,
  });
  
  const supabase = createClient();

  // Extract unique locations from items
  const locations = useMemo(() => {
    const uniqueLocations = new Set<string>();
    items.forEach(item => {
      if (item.location_description) {
        uniqueLocations.add(item.location_description);
      }
    });
    return Array.from(uniqueLocations).sort();
  }, [items]);

  // Filter items based on search and filters
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const matchesSearch = 
          item.name.toLowerCase().includes(searchTerm) ||
          (item.cas_number?.toLowerCase() || '').includes(searchTerm) ||
          (item.lot_number?.toLowerCase() || '').includes(searchTerm);
        
        if (!matchesSearch) return false;
      }

      // Location filter
      if (filters.locationFilter && item.location_description !== filters.locationFilter) {
        return false;
      }

      // Expiry filter
      if (filters.expiryFilter !== 'all') {
        const today = new Date();
        const expiryDate = item.expiry_date ? parseISO(item.expiry_date) : null;

        switch (filters.expiryFilter) {
          case 'expired':
            if (!expiryDate || !isBefore(expiryDate, today)) return false;
            break;
          case 'expiring-soon':
            if (!expiryDate) return false;
            const thirtyDaysFromNow = addDays(today, 30);
            if (!isBefore(expiryDate, thirtyDaysFromNow) || isBefore(expiryDate, today)) return false;
            break;
          case 'valid':
            if (!expiryDate || isBefore(expiryDate, today)) return false;
            break;
        }
      }

      return true;
    });
  }, [items, filters]);

  // Separate function to fetch items
  const fetchItems = async () => {
    try {
      console.log('Fetching items...');
      const { data, error: fetchError } = await supabase
        .from('inventory_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Error fetching inventory:', fetchError);
        setError(fetchError.message);
        setItems([]);
        return;
      }

      console.log('Fetched items:', data?.length || 0, 'items');
      setItems(data || []);
    } catch (err) {
      console.error('Error in fetchItems:', err);
      setError('Failed to fetch items');
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchItems();

    // Set up real-time subscription
    const channel = supabase
      .channel('inventory_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'inventory_items'
        },
        async (payload: RealtimePostgresChangesPayload<InventoryItem>) => {
          console.log('Real-time update received:', payload);
          
          // Handle delete events immediately
          if (payload.eventType === 'DELETE') {
            console.log('Delete event received, removing item:', payload.old?.id);
            setItems(currentItems => 
              currentItems.filter(item => item.id !== payload.old?.id)
            );
            return;
          }
          
          // For other events (INSERT, UPDATE), fetch the full list
          await fetchItems();
        }
      )
      .subscribe((status: 'SUBSCRIBED' | 'CLOSED' | 'TIMED_OUT' | 'CHANNEL_ERROR') => {
        console.log('Subscription status:', status);
        if (status === 'SUBSCRIBED') {
          setIsLoading(false);
        }
      });

    // Cleanup subscription
    return () => {
      console.log('Cleaning up subscription');
      supabase.removeChannel(channel);
    };
  }, []); // Dependencies empty since supabase client is stable

  // --- Handle Delete --- 
  const handleDelete = async (itemId: string) => {
    // Basic confirmation
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }

    setIsDeleting(itemId);
    setDeleteError(null);

    try {
      const result = await deleteItemAction(itemId);

      if (!result.success) {
        setDeleteError(result.error || 'Failed to delete item.');
        console.error("Delete error:", result.error);
      } else {
        // Optimistically remove the item from the local state
        setItems(currentItems => 
          currentItems.filter(item => item.id !== itemId)
        );
      }
    } catch (error) {
      console.error('Error during deletion:', error);
      setDeleteError('An unexpected error occurred while deleting the item.');
    } finally {
      setIsDeleting(null);
    }
  };

  // Function to handle opening the modal
  const handleOpenModal = () => {
    console.log('Opening modal...');
    setIsModalOpen(true);
  };

  // Function to handle closing the modal
  const handleCloseModal = () => {
    console.log('Closing modal...');
    setIsModalOpen(false);
    // Fetch items after modal closes to ensure we have the latest data
    fetchItems();
  };

  // Function to handle opening the edit modal
  const handleEdit = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsEditModalOpen(true);
  };

  // Function to handle closing the edit modal
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedItem(null);
    // Fetch items after modal closes to ensure we have the latest data
    fetchItems();
  };

  // Handle export functions
  const handleExportCSV = () => {
    const timestamp = format(new Date(), 'yyyy-MM-dd-HHmm');
    const filename = `inventory-export-${timestamp}.csv`;
    exportToCSV(filteredItems, filename);
  };

  const handleExportXLSX = () => {
    exportToXLSX(filteredItems);
  };

  const handleExportJSON = () => {
    exportToJSON(filteredItems);
  };

  // Loading state
  if (isLoading) {
    return (
      <Card>
        <Title>Inventory</Title>
        <Text>Loading inventory items...</Text> 
        {/* TODO: Add a spinner/skeleton loader */}
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card>
        <Title>Error</Title>
        <Text>Could not load inventory data.</Text>
        <Text color="red">{error}</Text>
      </Card>
    );
  }

  return (
    <Card>
      <div className="sm:flex sm:items-center sm:justify-between">
        <Title>Inventory Items ({filteredItems.length})</Title>
        <div className="flex gap-2 mt-4 sm:mt-0">
          <Menu as="div" className="relative">
            <Menu.Button 
              disabled={filteredItems.length === 0}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
              Export
              <ChevronDownIcon className="w-5 h-5 ml-2" aria-hidden="true" />
            </Menu.Button>
            <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10 dark:bg-gray-800 dark:divide-gray-700">
              <div className="px-1 py-1">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={handleExportCSV}
                      className={`${
                        active ? 'bg-blue-500 text-white' : 'text-gray-900 dark:text-gray-100'
                      } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                    >
                      Export as CSV
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={handleExportXLSX}
                      className={`${
                        active ? 'bg-blue-500 text-white' : 'text-gray-900 dark:text-gray-100'
                      } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                    >
                      Export as Excel
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={handleExportJSON}
                      className={`${
                        active ? 'bg-blue-500 text-white' : 'text-gray-900 dark:text-gray-100'
                      } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                    >
                      Export as JSON
                    </button>
                  )}
                </Menu.Item>
              </div>
            </Menu.Items>
          </Menu>
          <Button 
            icon={PlusIcon} 
            onClick={handleOpenModal}
            className="bg-blue-500 hover:bg-blue-600 text-white cursor-pointer z-10"
            size="lg"
          >
            Add Item
          </Button>
        </div>
      </div>

      {/* Add Filters */}
      <InventoryFilters
        onFilterChange={setFilters}
        locations={locations}
      />

      {/* Display delete error */}
      {deleteError && (
        <Text color="red" className="mt-2">Error deleting item: {deleteError}</Text>
      )}

      {/* Show message if table is empty */}
      {filteredItems.length === 0 && !isLoading && (
        <Text className="mt-4">
          {items.length === 0 
            ? "No inventory items found. Click 'Add Item' to get started."
            : "No items match the current filters."}
        </Text>
      )}

      {/* Only show table if there are items */}
      {filteredItems.length > 0 && (
        <Table className="mt-5">
          <TableHead>
            <TableRow>
              <TableHeaderCell>Name</TableHeaderCell>
              <TableHeaderCell>Quantity</TableHeaderCell>
              <TableHeaderCell>Location</TableHeaderCell>
              <TableHeaderCell>Expiry Date</TableHeaderCell>
              <TableHeaderCell>CAS Number</TableHeaderCell>
              <TableHeaderCell>Lot Number</TableHeaderCell>
              <TableHeaderCell className="text-right">Actions</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <Link
                    href={`/items/${item.id}`}
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {item.name}
                  </Link>
                </TableCell>
                <TableCell>{`${item.quantity_current} ${item.quantity_unit}`}</TableCell>
                <TableCell>{item.location_description ?? 'N/A'}</TableCell>
                <TableCell>
                  {item.expiry_date ? (
                    <Badge color={getExpiryBadgeColor(item.expiry_date)}>
                      {format(parseISO(item.expiry_date), 'yyyy-MM-dd')}
                    </Badge>
                  ) : (
                    'N/A'
                  )}
                </TableCell>
                <TableCell>{item.cas_number ?? 'N/A'}</TableCell>
                <TableCell>{item.lot_number ?? 'N/A'}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button 
                      size="xs" 
                      variant="secondary" 
                      color="blue"
                      icon={PencilIcon}
                      onClick={() => handleEdit(item)}
                      disabled={!!isDeleting}
                      className="hover:bg-blue-100 dark:hover:bg-blue-900"
                    >
                      Edit
                    </Button>
                    <Button 
                      size="xs" 
                      variant="secondary" 
                      color="red"
                      icon={TrashIcon}
                      onClick={() => handleDelete(item.id)}
                      loading={isDeleting === item.id}
                      disabled={!!isDeleting}
                      className="hover:bg-red-100 dark:hover:bg-red-900"
                    >
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Render the modals */}
      <AddItemModal isOpen={isModalOpen} onClose={handleCloseModal} />
      <EditItemModal 
        isOpen={isEditModalOpen} 
        onClose={handleCloseEditModal} 
        item={selectedItem} 
      />
    </Card>
  );
}
