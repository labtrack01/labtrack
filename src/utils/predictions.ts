import { format, addDays, differenceInDays } from 'date-fns';

export interface ItemPrediction {
  id: string;
  name: string;
  predicted_expiry: string;
  confidence_score: number;
  risk_level: 'low' | 'medium' | 'high';
  factors: string[];
}

export interface PredictionFactors {
  storage_conditions: string | null;
  temperature_exposure: number | null;
  humidity_exposure: number | null;
  light_exposure: number | null;
  container_type: string | null;
  initial_quality: number | null;
}

export interface PredictionInput {
  name: string;
  cas_number: string | null;
  manufacture_date: string | null;
  original_expiry_date: string;
  storage_conditions: string | null;
  quantity_original: number;
  quantity_current: number;
  factors: PredictionFactors;
}

// Helper function to calculate base risk score
const calculateBaseRisk = (input: PredictionInput): number => {
  let riskScore = 0;
  
  // Check storage conditions
  if (input.storage_conditions) {
    if (input.storage_conditions.toLowerCase().includes('refrigerate')) {
      riskScore += 0.3;
    }
    if (input.storage_conditions.toLowerCase().includes('sensitive')) {
      riskScore += 0.2;
    }
  }
  
  // Check quantity used
  const usageRatio = (input.quantity_original - input.quantity_current) / input.quantity_original;
  riskScore += usageRatio * 0.2;
  
  // Check environmental factors
  const factors = input.factors;
  if (factors.temperature_exposure && factors.temperature_exposure > 25) {
    riskScore += 0.15;
  }
  if (factors.humidity_exposure && factors.humidity_exposure > 60) {
    riskScore += 0.15;
  }
  if (factors.light_exposure && factors.light_exposure > 70) {
    riskScore += 0.1;
  }
  
  return Math.min(riskScore, 1);
};

// Helper function to determine risk level
const getRiskLevel = (riskScore: number): 'low' | 'medium' | 'high' => {
  if (riskScore < 0.3) return 'low';
  if (riskScore < 0.7) return 'medium';
  return 'high';
};

// Main prediction function
export const predictExpiry = (input: PredictionInput): ItemPrediction => {
  const baseRisk = calculateBaseRisk(input);
  const originalExpiry = input.original_expiry_date ? new Date(input.original_expiry_date) : null;
  
  // Calculate predicted expiry date
  let predictedExpiry = originalExpiry;
  if (originalExpiry) {
    const riskAdjustment = Math.floor(baseRisk * 30); // Up to 30 days earlier
    predictedExpiry = addDays(originalExpiry, -riskAdjustment);
  }
  
  // Generate contributing factors
  const factors: string[] = [];
  if (input.storage_conditions?.toLowerCase().includes('refrigerate')) {
    factors.push('Temperature-sensitive storage required');
  }
  if (input.factors.humidity_exposure && input.factors.humidity_exposure > 60) {
    factors.push('High humidity exposure');
  }
  if (input.factors.light_exposure && input.factors.light_exposure > 70) {
    factors.push('High light exposure');
  }
  
  const confidenceScore = Math.max(0.5, 1 - baseRisk);
  
  return {
    id: crypto.randomUUID(),
    name: input.name,
    predicted_expiry: predictedExpiry ? format(predictedExpiry, 'yyyy-MM-dd') : 'Unknown',
    confidence_score: confidenceScore,
    risk_level: getRiskLevel(baseRisk),
    factors
  };
};

// Function to get days until expiry
export const getDaysUntilExpiry = (expiryDate: string): number => {
  const today = new Date();
  const expiry = new Date(expiryDate);
  return differenceInDays(expiry, today);
};

// Function to get expiry status class
export const getExpiryStatusClass = (daysUntilExpiry: number): string => {
  if (daysUntilExpiry < 0) return 'text-red-600 bg-red-100';
  if (daysUntilExpiry < 30) return 'text-orange-600 bg-orange-100';
  if (daysUntilExpiry < 90) return 'text-yellow-600 bg-yellow-100';
  return 'text-green-600 bg-green-100';
}; 