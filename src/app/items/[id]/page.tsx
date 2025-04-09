'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { notFound } from 'next/navigation';
import { Card, Title, Text, Grid, Col } from '@tremor/react';
import ExpiryPrediction from '@/components/ExpiryPrediction';
import { format } from 'date-fns';

interface PageProps {
  params: {
    id: string;
  };
}

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
  notes: string | null;
}

export default function ItemDetailsPage({ params }: PageProps) {
  const [item, setItem] = useState<InventoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const supabase = createClient();

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('inventory_items')
          .select('*')
          .eq('id', params.id)
          .single();

        if (fetchError) throw new Error(fetchError.message);
        if (!data) throw new Error('Item not found');

        setItem(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch item');
        notFound();
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [params.id]);

  const formatDate = (date: string | null) => {
    if (!date) return 'Not specified';
    return format(new Date(date), 'PPP');
  };

  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <Text>Loading...</Text>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <Text>Error: {error || 'Item not found'}</Text>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Title className="mb-6">{item.name}</Title>

      <Grid numItems={1} numItemsSm={2} className="gap-6">
        <Col numColSpan={1}>
          <Card>
            <Title>Basic Information</Title>
            <div className="mt-4 space-y-4">
              <div>
                <Text className="text-gray-500">CAS Number</Text>
                <Text className="font-medium">{item.cas_number || 'Not specified'}</Text>
              </div>
              <div>
                <Text className="text-gray-500">Lot Number</Text>
                <Text className="font-medium">{item.lot_number || 'Not specified'}</Text>
              </div>
              <div>
                <Text className="text-gray-500">Expiry Date</Text>
                <Text className="font-medium">{formatDate(item.expiry_date)}</Text>
              </div>
              <div>
                <Text className="text-gray-500">Location</Text>
                <Text className="font-medium">{item.location_description || 'Not specified'}</Text>
              </div>
            </div>
          </Card>

          <Card className="mt-6">
            <Title>Quantity & Storage</Title>
            <div className="mt-4 space-y-4">
              <div>
                <Text className="text-gray-500">Original Quantity</Text>
                <Text className="font-medium">{item.quantity_original} {item.quantity_unit}</Text>
              </div>
              <div>
                <Text className="text-gray-500">Current Quantity</Text>
                <Text className="font-medium">{item.quantity_current} {item.quantity_unit}</Text>
              </div>
              <div>
                <Text className="text-gray-500">Storage Conditions</Text>
                <Text className="font-medium">{item.storage_conditions || 'Not specified'}</Text>
              </div>
            </div>
          </Card>
        </Col>

        <Col numColSpan={1}>
          <ExpiryPrediction
            itemName={item.name}
            casNumber={item.cas_number}
            expiryDate={item.expiry_date}
            storageConditions={item.storage_conditions}
            quantityOriginal={item.quantity_original}
            quantityCurrent={item.quantity_current}
          />

          <Card className="mt-6">
            <Title>Additional Information</Title>
            <div className="mt-4 space-y-4">
              <div>
                <Text className="text-gray-500">Supplier</Text>
                <Text className="font-medium">{item.supplier || 'Not specified'}</Text>
              </div>
              <div>
                <Text className="text-gray-500">Catalog Number</Text>
                <Text className="font-medium">{item.catalog_number || 'Not specified'}</Text>
              </div>
              <div>
                <Text className="text-gray-500">Price</Text>
                <Text className="font-medium">
                  {item.price ? `$${item.price.toFixed(2)}` : 'Not specified'}
                </Text>
              </div>
              <div>
                <Text className="text-gray-500">Notes</Text>
                <Text className="font-medium">{item.notes || 'No notes'}</Text>
              </div>
            </div>
          </Card>
        </Col>
      </Grid>
    </div>
  );
} 