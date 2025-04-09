'use client';

import { useState } from 'react';
import { Card, Title, Text, Badge, Button } from '@tremor/react';
import { ItemPrediction } from '@/utils/predictions';
import { ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface ExpiryPredictionProps {
  itemName: string;
  casNumber: string | null;
  expiryDate: string | null;
  storageConditions: string | null;
  quantityOriginal: number;
  quantityCurrent: number;
}

export default function ExpiryPrediction({
  itemName,
  casNumber,
  expiryDate,
  storageConditions,
  quantityOriginal,
  quantityCurrent
}: ExpiryPredictionProps) {
  const [prediction, setPrediction] = useState<ItemPrediction | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getPrediction = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/predictions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: itemName,
          cas_number: casNumber,
          original_expiry_date: expiryDate,
          storage_conditions: storageConditions,
          quantity_original: quantityOriginal,
          quantity_current: quantityCurrent,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get prediction');
      }

      const data = await response.json();
      setPrediction(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getRiskBadgeColor = (risk: 'low' | 'medium' | 'high') => {
    switch (risk) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="mt-4">
      <Title>Expiry Prediction</Title>
      
      {!prediction && !loading && !error && (
        <div className="mt-4">
          <Text>Get an AI-powered prediction for this item's expiry date based on storage conditions and usage patterns.</Text>
          <Button
            onClick={getPrediction}
            loading={loading}
            className="mt-4"
          >
            Generate Prediction
          </Button>
        </div>
      )}

      {loading && (
        <div className="mt-4">
          <Text>Analyzing item data...</Text>
        </div>
      )}

      {error && (
        <div className="mt-4 text-red-600 flex items-center gap-2">
          <ExclamationTriangleIcon className="h-5 w-5" />
          <Text>Error: {error}</Text>
        </div>
      )}

      {prediction && (
        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Text className="text-gray-500">Predicted Expiry</Text>
              <Text className="text-lg font-medium">{prediction.predicted_expiry}</Text>
            </div>
            <Badge
              size="lg"
              className={getRiskBadgeColor(prediction.risk_level)}
            >
              {prediction.risk_level.charAt(0).toUpperCase() + prediction.risk_level.slice(1)} Risk
            </Badge>
          </div>

          <div>
            <Text className="text-gray-500">Confidence Score</Text>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-gray-200 rounded-full">
                <div
                  className="h-2 bg-blue-600 rounded-full"
                  style={{ width: `${prediction.confidence_score * 100}%` }}
                />
              </div>
              <Text className="text-sm">{Math.round(prediction.confidence_score * 100)}%</Text>
            </div>
          </div>

          {prediction.factors.length > 0 && (
            <div>
              <Text className="text-gray-500">Contributing Factors</Text>
              <ul className="mt-2 space-y-2">
                {prediction.factors.map((factor, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
                    <Text>{factor}</Text>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex items-center gap-2 text-green-600">
            <CheckCircleIcon className="h-5 w-5" />
            <Text>Prediction generated successfully</Text>
          </div>
        </div>
      )}
    </Card>
  );
} 