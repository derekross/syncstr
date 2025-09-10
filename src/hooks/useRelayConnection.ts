import { useState } from 'react';
import { NPool, NRelay1 } from '@nostrify/nostrify';

export interface RelayConnectionState {
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
}

export function useRelayConnection() {
  const [connectionStates, setConnectionStates] = useState<Record<string, RelayConnectionState>>({});

  const testConnection = async (relayUrl: string): Promise<boolean> => {
    if (!relayUrl || (!relayUrl.startsWith('wss://') && !relayUrl.startsWith('ws://'))) {
      setConnectionStates(prev => ({
        ...prev,
        [relayUrl]: { isConnected: false, isLoading: false, error: 'Invalid relay URL' }
      }));
      return false;
    }

    // Set loading state
    setConnectionStates(prev => ({
      ...prev,
      [relayUrl]: { isConnected: false, isLoading: true, error: null }
    }));

    try {
      console.log('🔍 Testing connection to:', relayUrl);
      
      // Use NPool to test the connection (same approach as working queries)
      const testPool = new NPool({
        open(url: string) {
          console.log('🔌 Opening test connection to:', url);
          return new NRelay1(url);
        },
        reqRouter() {
          return new Map([[relayUrl, []]]);
        },
        eventRouter() {
          return [relayUrl];
        },
      });

      // Try a simple query with timeout to test if relay is responsive
      const testQuery = testPool.query([{ kinds: [1], limit: 1 }], { 
        signal: AbortSignal.timeout(5000) 
      });

      const events = await testQuery;
      
      console.log('🧪 Test query completed for:', relayUrl, 'events:', events.length);
      
      // Consider it successful if we got a response (even 0 events)
      setConnectionStates(prev => ({
        ...prev,
        [relayUrl]: { isConnected: true, isLoading: false, error: null }
      }));
      
      return true;

    } catch (error) {
      console.error('❌ Relay connection test failed:', relayUrl, error);
      
      let errorMessage = 'Connection failed';
      if (error instanceof Error) {
        if (error.message.includes('timeout')) {
          errorMessage = 'Connection timeout';
        } else if (error.message.includes('network')) {
          errorMessage = 'Network error';
        } else {
          errorMessage = error.message;
        }
      }
      
      setConnectionStates(prev => ({
        ...prev,
        [relayUrl]: { 
          isConnected: false, 
          isLoading: false, 
          error: errorMessage
        }
      }));
      return false;
    }
  };

  const getConnectionState = (relayUrl: string): RelayConnectionState => {
    return connectionStates[relayUrl] || { isConnected: false, isLoading: false, error: null };
  };

  const clearConnectionState = (relayUrl: string) => {
    setConnectionStates(prev => {
      const newStates = { ...prev };
      delete newStates[relayUrl];
      return newStates;
    });
  };

  return {
    testConnection,
    getConnectionState,
    clearConnectionState,
  };
}