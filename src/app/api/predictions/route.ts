import { NextResponse } from 'next/server';
import type { ItemPrediction, PredictionInput } from '@/utils/predictions';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro-exp-03-25:generateContent';
const API_KEY = process.env.GEMINI_API_KEY;

export async function POST(request: Request) {
  // --- DIAGNOSTIC LOG --- 
  console.log('API Route POST function started.');
  console.log('Value of process.env.GEMINI_API_KEY inside API route:', process.env.GEMINI_API_KEY);
  // --- END DIAGNOSTIC LOG ---

  if (!API_KEY) {
    console.error('Gemini API key is missing.');
    return NextResponse.json(
      { error: 'API key configuration error' },
      { status: 500 }
    );
  }

  try {
    const body: PredictionInput = await request.json();
    const {
      name,
      cas_number,
      original_expiry_date,
      storage_conditions,
      quantity_original,
      quantity_current,
    } = body;

    // Validate required fields
    if (!name || !original_expiry_date) {
      return NextResponse.json(
        { error: 'Missing required fields for prediction' },
        { status: 400 }
      );
    }

    // Construct the prompt for Gemini
    // Note: This is a simplified prompt. You might need a more detailed one
    //       including historical data, specific chemical properties etc. for better accuracy.
    const prompt = `
      Analyze the following chemical inventory item and predict its realistic expiry risk.
      Consider the provided data points and general chemical stability knowledge.
      
      Item Name: ${name}
      CAS Number: ${cas_number || 'N/A'}
      Original Expiry Date: ${original_expiry_date}
      Storage Conditions: ${storage_conditions || 'N/A'}
      Original Quantity: ${quantity_original}
      Current Quantity: ${quantity_current}
      
      Based on this, provide:
      1. A predicted_expiry date (can be the same as original if no factors suggest otherwise).
      2. A risk_level ('low', 'medium', 'high') based on proximity to expiry and potential degradation.
      3. A confidence_score (0.0 to 1.0) reflecting the certainty of the prediction.
      4. A list of contributing factors (strings) that influenced the prediction (e.g., 'approaching expiry', 'sensitive storage').
    `;

    // Define the expected response schema for Gemini
    const responseSchema = {
      type: "object",
      properties: {
        predicted_expiry: { type: "string", description: "Predicted expiry date in YYYY-MM-DD format." },
        risk_level: { type: "string", enum: ["low", "medium", "high"], description: "Risk level of expiry." },
        confidence_score: { type: "number", description: "Confidence score from 0.0 to 1.0." },
        factors: { type: "array", items: { type: "string" }, description: "List of factors influencing the prediction." }
      },
      required: ["predicted_expiry", "risk_level", "confidence_score", "factors"]
    };

    // Prepare the request payload for Gemini API
    const geminiPayload = {
      contents: [{
        role: "user",
        parts: [{ "text": prompt }]
      }],
      generationConfig: {
        temperature: 0.2, // Lower temperature for more deterministic results
        response_mime_type: "application/json", // Request JSON output
      },
      // The 'responseSchema' field is removed from here as it caused an error.
      // We rely on the prompt and 'response_mime_type' for structured output.
    };

    // Make the API call to Gemini
    const apiResponse = await fetch(`${GEMINI_API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(geminiPayload),
    });

    if (!apiResponse.ok) {
      const errorBody = await apiResponse.text();
      console.error('Gemini API error:', apiResponse.status, errorBody);
      throw new Error(`Gemini API request failed: ${apiResponse.statusText}`);
    }

    const responseData = await apiResponse.json();
    
    // Extract the prediction from the Gemini response
    // The actual structure might vary slightly based on Gemini's output
    const predictionContent = responseData.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!predictionContent) {
       console.error("Invalid response structure from Gemini:", responseData);
       throw new Error('Could not parse prediction from Gemini response');
    }

    let prediction: ItemPrediction;
    let predictionObject: any; // Use 'any' temporarily before validation
    try {
      // Attempt to parse the JSON string within the text part
      const parsedResponse = JSON.parse(predictionContent);
      
      // Check if the response is an array and take the first element
      if (Array.isArray(parsedResponse) && parsedResponse.length > 0) {
        predictionObject = parsedResponse[0];
      } else if (typeof parsedResponse === 'object' && parsedResponse !== null) {
        // Handle case where it might return a single object directly
        predictionObject = parsedResponse;
      } else {
        throw new Error('Parsed response is not a valid object or array.');
      }

      // Map 'contributing_factors' to 'factors' if present
      if (predictionObject.contributing_factors && !predictionObject.factors) {
          predictionObject.factors = predictionObject.contributing_factors;
          // delete predictionObject.contributing_factors; // Optional: remove the old key
      }

      // Validate required fields on the extracted object
      if (!predictionObject.predicted_expiry || 
          !predictionObject.risk_level || 
          predictionObject.confidence_score === undefined || 
          !predictionObject.factors || 
          !Array.isArray(predictionObject.factors)) { // Also check if factors is an array
          console.error('Validation failed for prediction object:', predictionObject);
          throw new Error('Parsed prediction missing required fields or factors is not an array.');
      }

      // Assign to the correctly typed variable after validation
      prediction = predictionObject as ItemPrediction;

    } catch(parseError) {
        console.error("Failed to parse or validate prediction JSON:", predictionContent, parseError);
        throw new Error('Failed to parse or validate valid prediction JSON from Gemini response');
    }

    return NextResponse.json(prediction);

  } catch (error) {
    console.error('Prediction process error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate prediction';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

// --- Helper functions (determineRiskLevel, etc.) are removed as Gemini will provide this --- 