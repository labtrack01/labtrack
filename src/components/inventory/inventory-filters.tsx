'use client';

import { TextInput, Select, SelectItem } from '@tremor/react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/solid';
import { useState, useEffect } from 'react';

export interface FilterOptions {
  search: string;
  expiryFilter: string;
  locationFilter: string | null;
}

interface InventoryFiltersProps {
  onFilterChange: (filters: FilterOptions) => void;
  locations: string[];
}

export function InventoryFilters({ onFilterChange, locations }: InventoryFiltersProps) {
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    expiryFilter: 'all',
    locationFilter: null,
  });

  // Debounce the search input
  useEffect(() => {
    const timer = setTimeout(() => {
      onFilterChange(filters);
    }, 300);

    return () => clearTimeout(timer);
  }, [filters, onFilterChange]);

  const handleSearchChange = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }));
  };

  const handleExpiryFilterChange = (value: string) => {
    setFilters(prev => ({ ...prev, expiryFilter: value }));
  };

  const handleLocationFilterChange = (value: string) => {
    setFilters(prev => ({ ...prev, locationFilter: value === 'all' ? null : value }));
  };

  return (
    <div className="space-y-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search Input */}
        <TextInput
          icon={MagnifyingGlassIcon}
          placeholder="Search by name, CAS number, or lot number..."
          value={filters.search}
          onChange={(e) => handleSearchChange(e.target.value)}
        />

        {/* Expiry Filter */}
        <Select
          value={filters.expiryFilter}
          onValueChange={handleExpiryFilterChange}
          placeholder="Filter by expiry status"
        >
          <SelectItem value="all">All Items</SelectItem>
          <SelectItem value="expired">Expired</SelectItem>
          <SelectItem value="expiring-soon">Expiring Soon (30 days)</SelectItem>
          <SelectItem value="valid">Valid</SelectItem>
        </Select>

        {/* Location Filter */}
        <Select
          value={filters.locationFilter || 'all'}
          onValueChange={handleLocationFilterChange}
          placeholder="Filter by location"
        >
          <SelectItem value="all">All Locations</SelectItem>
          {locations.map((location) => (
            <SelectItem key={location} value={location}>
              {location}
            </SelectItem>
          ))}
        </Select>
      </div>
    </div>
  );
} 