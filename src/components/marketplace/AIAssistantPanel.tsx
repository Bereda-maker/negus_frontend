'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { AlertTriangle, Check, Sparkles, TrendingUp, Wand2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import aiService, { EnhanceListingResult, SuggestPriceResult } from '@/services/aiService';

interface ListingSnapshot {
  title?: string;
  description?: string;
  category?: string;
  condition?: string;
  city?: string;
}

interface AIAssistantPanelProps {
  listing: ListingSnapshot;
  onApplyEnhancement: (enhancement: EnhanceListingResult) => void;
  onApplyPrice: (price: number) => void;
}

/**
 * Controlled by the parent form — receives the current title/description/
 * category/condition/city and, on request, calls the AI endpoints and
 * hands the result back via onApplyEnhancement / onApplyPrice so the
 * parent (react-hook-form) stays the single source of truth for form state.
 */
export default function AIAssistantPanel({ listing, onApplyEnhancement, onApplyPrice }: AIAssistantPanelProps) {
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isSuggestingPrice, setIsSuggestingPrice] = useState(false);
  const [enhancement, setEnhancement] = useState<EnhanceListingResult | null>(null);
  const [priceSuggestion, setPriceSuggestion] = useState<SuggestPriceResult | null>(null);

  const canEnhance = (listing.title?.trim().length ?? 0) >= 3 && (listing.description?.trim().length ?? 0) >= 5;
  const canSuggestPrice = Boolean(listing.category);

  const handleEnhance = async () => {
    if (!canEnhance) {
      toast.error('Add a title and description first.');
      return;
    }
    setIsEnhancing(true);
    setEnhancement(null);
    try {
      const { data } = await aiService.enhanceListing({
        title: listing.title || '',
        description: listing.description || '',
        category: listing.category,
        condition: listing.condition,
        city: listing.city,
      });
      setEnhancement(data);
      if (data.flagged) {
        toast.error("This listing may not comply with Negus Gebeya's policies.");
      }
    } catch {
      // api.js interceptor already toasts the error
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleSuggestPrice = async () => {
    if (!canSuggestPrice) {
      toast.error('Choose a category first.');
      return;
    }
    setIsSuggestingPrice(true);
    setPriceSuggestion(null);
    try {
      const { data } = await aiService.suggestPrice({
        title: listing.title,
        category: listing.category,
        condition: listing.condition,
        city: listing.city,
      });
      setPriceSuggestion(data);
    } catch {
      // api.js interceptor already toasts the error
    } finally {
      setIsSuggestingPrice(false);
    }
  };

  return (
    <div className="rounded-card border border-primary/20 bg-primary/5 p-4">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white">
          <Sparkles className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-textPrimary">AI Listing Assistant</h3>
          <p className="text-xs text-textSecondary">Polish your listing and price it right — in seconds.</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="button" variant="secondary" size="sm" isLoading={isEnhancing} onClick={handleEnhance}>
          <Wand2 className="h-4 w-4" />
          Improve title & description
        </Button>
        <Button type="button" variant="outline" size="sm" isLoading={isSuggestingPrice} onClick={handleSuggestPrice}>
          <TrendingUp className="h-4 w-4" />
          Suggest a fair price
        </Button>
      </div>

      {enhancement && !enhancement.flagged && (
        <div className="mt-4 space-y-3 rounded-button border border-border bg-surface p-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-textSecondary">Suggested title</p>
            <p className="mt-0.5 text-sm text-textPrimary">{enhancement.improvedTitle}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-textSecondary">Suggested description</p>
            <p className="mt-0.5 text-sm text-textPrimary">{enhancement.improvedDescription}</p>
          </div>
          {enhancement.tips && enhancement.tips.length > 0 && (
            <ul className="space-y-1 text-xs text-textSecondary">
              {enhancement.tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="mt-0.5 text-primary">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          )}
          <Button
            type="button"
            size="sm"
            onClick={() => {
              onApplyEnhancement(enhancement);
              toast.success('Applied — feel free to tweak it further.');
            }}
          >
            <Check className="h-4 w-4" />
            Use this version
          </Button>
        </div>
      )}

      {enhancement?.flagged && (
        <div className="mt-4 flex items-start gap-2 rounded-button border border-danger/30 bg-danger/5 p-3 text-sm text-danger">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="font-medium">This listing needs review before it can be enhanced.</p>
            {enhancement.reasons && enhancement.reasons.length > 0 && (
              <ul className="mt-1 list-disc space-y-0.5 pl-4">
                {enhancement.reasons.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {priceSuggestion && (
        <div className="mt-4 rounded-button border border-border bg-surface p-3">
          {priceSuggestion.suggestedPrice ? (
            <>
              <p className="text-xs font-medium uppercase tracking-wide text-textSecondary">Suggested price</p>
              <p className="mt-0.5 text-xl font-bold text-primary">
                ETB {priceSuggestion.suggestedPrice.toLocaleString('en-US')}
              </p>
              <p className="mt-1 text-xs text-textSecondary">{priceSuggestion.rationale}</p>
              <Button
                type="button"
                size="sm"
                className="mt-3"
                onClick={() => {
                  onApplyPrice(priceSuggestion.suggestedPrice as number);
                  toast.success('Price applied.');
                }}
              >
                <Check className="h-4 w-4" />
                Use this price
              </Button>
            </>
          ) : (
            <p className="text-sm text-textSecondary">{priceSuggestion.rationale}</p>
          )}
        </div>
      )}
    </div>
  );
}
