import api from './api';

export interface EnhanceListingPayload {
  title: string;
  description: string;
  category?: string;
  condition?: string;
  city?: string;
}

export interface EnhanceListingResult {
  improvedTitle: string;
  improvedDescription: string;
  tips?: string[];
  flagged?: boolean;
  reasons?: string[];
}

export interface SuggestPricePayload {
  title?: string;
  category?: string;
  condition?: string;
  city?: string;
}

export interface SuggestPriceResult {
  suggestedPrice: number | null;
  rationale: string;
}

export interface ModeratePayload {
  title?: string;
  description?: string;
  [key: string]: unknown;
}

const aiService = {
  getStatus: (): Promise<{ data: { available: boolean } }> => api.get('/ai/status').then((res) => res.data),
  enhanceListing: (payload: EnhanceListingPayload): Promise<{ data: EnhanceListingResult }> =>
    api.post('/ai/enhance-listing', payload).then((res) => res.data),
  suggestPrice: (payload: SuggestPricePayload): Promise<{ data: SuggestPriceResult }> =>
    api.post('/ai/suggest-price', payload).then((res) => res.data),
  moderate: (payload: ModeratePayload): Promise<{ data: unknown }> =>
    api.post('/ai/moderate', payload).then((res) => res.data),
};

export default aiService;
