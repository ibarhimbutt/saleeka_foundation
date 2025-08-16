import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, X, Plus } from 'lucide-react';
import { apiService } from '@/lib/api';

interface Interest {
  name: string;
  category: string;
  description: string;
  popularity: number;
}

interface InterestsManagerProps {
  userInterests: Interest[];
  onInterestsChange: (interests: Interest[]) => void;
  disabled?: boolean;
  maxInterests?: number;
}

export default function InterestsManager({
  userInterests,
  onInterestsChange,
  disabled = false,
  maxInterests = 10
}: InterestsManagerProps) {
  const [availableInterests, setAvailableInterests] = useState<Interest[]>([]);
  const [selectedInterest, setSelectedInterest] = useState<string>('');
  const [loadingInterests, setLoadingInterests] = useState(false);

  useEffect(() => {
    const loadAvailableInterests = async () => {
      setLoadingInterests(true);
      try {
        const response = await apiService.getAvailableInterests();
        setAvailableInterests(response.interests || []);
      } catch (error) {
        console.error('Error loading interests:', error);
      } finally {
        setLoadingInterests(false);
      }
    };

    loadAvailableInterests();
  }, []);

  const addInterest = (interestName: string) => {
    if (!interestName || userInterests.length >= maxInterests) return;

    // Check if interest is already added
    if (userInterests.some(i => i.name === interestName)) {
      return;
    }

    const interest = availableInterests.find(i => i.name === interestName);
    if (!interest) return;

    // Add to user interests, ensuring no duplicates
    const newInterests = [...userInterests, interest];
    const uniqueInterests = newInterests.filter((item, index, self) => 
      index === self.findIndex(i => i.name === item.name)
    );
    
    onInterestsChange(uniqueInterests);
    setSelectedInterest('');
  };

  const removeInterest = (interestName: string) => {
    if (!interestName) return;

    const newInterests = userInterests.filter(i => i.name !== interestName);
    onInterestsChange(newInterests);
  };

  const filteredAvailableInterests = availableInterests.filter(
    interest => !userInterests.some(ui => ui.name === interest.name)
  );

  return (
    <div className="space-y-3">
      {/* Interest Selection */}
      <div className="flex gap-2">
        <Select
          value={selectedInterest}
          onValueChange={setSelectedInterest}
          disabled={loadingInterests || disabled || userInterests.length >= maxInterests}
        >
          <SelectTrigger className="flex-1">
            <SelectValue placeholder={
              userInterests.length >= maxInterests 
                ? `Maximum ${maxInterests} interests reached` 
                : "Select an interest..."
            } />
          </SelectTrigger>
          <SelectContent position="popper" side="bottom" align="start">
            {filteredAvailableInterests.map((interest) => (
              <SelectItem key={interest.name} value={interest.name}>
                <div className="flex flex-col">
                  <span className="font-medium">{interest.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {interest.category} • {interest.description}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          type="button"
          size="sm"
          onClick={() => selectedInterest && addInterest(selectedInterest)}
          disabled={!selectedInterest || loadingInterests || disabled || userInterests.length >= maxInterests}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Selected Interests Display */}
      {userInterests.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Your Interests:</span>
            <span className="text-xs text-muted-foreground">
              {userInterests.length}/{maxInterests}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {userInterests.map((interest) => (
              <Badge
                key={interest.name}
                variant="secondary"
                className="flex items-center gap-1"
              >
                {interest.name}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => removeInterest(interest.name)}
                  disabled={disabled}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Loading State */}
      {loadingInterests && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading interests...
        </div>
      )}

      {/* Max Interests Warning */}
      {userInterests.length >= maxInterests && (
        <p className="text-xs text-amber-600">
          You've reached the maximum number of interests. Remove some to add new ones.
        </p>
      )}
    </div>
  );
}
