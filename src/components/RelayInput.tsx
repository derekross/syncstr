import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { RadioIcon, CheckIcon, XIcon } from 'lucide-react';

interface RelayInputProps {
  title: string;
  description: string;
  placeholder: string;
  onRelayChange: (relay: string) => void;
  value: string;
  isConnected?: boolean;
  isLoading?: boolean;
  onDisconnect?: () => void;
}

export function RelayInput({ 
  title, 
  description, 
  placeholder, 
  onRelayChange, 
  value,
  isConnected,
  isLoading,
  onDisconnect 
}: RelayInputProps) {
  const [inputValue, setInputValue] = useState(value);

  // Sync local state with external value prop
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onRelayChange(inputValue.trim());
    }
  };

  const getStatusBadge = () => {
    if (isLoading) {
      return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Connecting...</Badge>;
    }
    if (isConnected) {
      return (
        <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          <CheckIcon className="h-3 w-3 mr-1" />
          Connected
        </Badge>
      );
    }
    if (value && !isConnected) {
      return (
        <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
          <XIcon className="h-3 w-3 mr-1" />
          Failed
        </Badge>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RadioIcon className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
          {getStatusBadge()}
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="relay-input">Relay URL</Label>
            <div className="flex gap-2">
              <Input
                id="relay-input"
                type="text"
                placeholder={placeholder}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="flex-1"
              />
              {isConnected && onDisconnect ? (
                <Button 
                  type="button" 
                  onClick={onDisconnect}
                  variant="outline"
                  disabled={isLoading}
                >
                  Disconnect
                </Button>
              ) : (
                <Button type="submit" disabled={!inputValue.trim() || isLoading}>
                  {isLoading ? 'Connecting...' : 'Connect'}
                </Button>
              )}
            </div>
          </div>
          {value && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-mono break-all">{value}</p>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}