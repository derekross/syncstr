import { useQuery } from '@tanstack/react-query';
import { useNostr } from '@nostrify/react';
import { NPool, NRelay1 } from '@nostrify/nostrify';
import type { NostrEvent } from '@nostrify/nostrify';

export interface ProfileData {
  metadata?: NostrEvent;
  contacts?: NostrEvent;
  muteList?: NostrEvent;
  pinnedNotes?: NostrEvent;
  relayList?: NostrEvent;
  bookmarks?: NostrEvent;
  communities?: NostrEvent;
  interests?: NostrEvent;
  emojiList?: NostrEvent;
  searchRelays?: NostrEvent;
  dmRelays?: NostrEvent;
}

export function useProfileData(pubkey: string | undefined, relayUrl: string) {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['profile-data', pubkey, relayUrl],
    queryFn: async (c) => {
      if (!pubkey || !relayUrl) {
        console.log('❌ Missing required params:', { pubkey: !!pubkey, relayUrl: !!relayUrl });
        return null;
      }

      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(15000)]);

      try {
        // Use the global nostr instance (proven to work in other hooks)
        const testEvents = await nostr.query(
          [{ kinds: [0], authors: [pubkey], limit: 1 }],
          { signal }
        );
        if (testEvents.length > 0) {
          // If the global instance works, use it for all queries
          const allEvents = await nostr.query(
            [{ 
              kinds: [0, 3, 10000, 10001, 10002, 10003, 10004, 10007, 10015, 10030, 10050], 
              authors: [pubkey], 
              limit: 50 
            }],
            { signal }
          );
          
          // Process the events directly here
          const profileData: ProfileData = {};
          for (const event of allEvents) {
            switch (event.kind) {
              case 0:
                profileData.metadata = event;
                break;
              case 3:
                profileData.contacts = event;
                break;
              case 10000:
                profileData.muteList = event;
                break;
              case 10001:
                profileData.pinnedNotes = event;
                break;
              case 10002:
                profileData.relayList = event;
                break;
              case 10003:
                profileData.bookmarks = event;
                break;
              case 10004:
                profileData.communities = event;
                break;
              case 10007:
                profileData.searchRelays = event;
                break;
              case 10015:
                profileData.interests = event;
                break;
              case 10030:
                profileData.emojiList = event;
                break;
              case 10050:
                profileData.dmRelays = event;
                break;
            }
          }
          
          return profileData;
        }

        // Fallback: try with custom pool for specific relay
        const customPool = new NPool({
          open(url: string) {
            console.log('🔌 Opening custom connection to:', url);
            return new NRelay1(url);
          },
          reqRouter() {
            return new Map([[relayUrl, []]]);
          },
          eventRouter() {
            return [relayUrl];
          },
        });

        const events = await customPool.query(
          [{ kinds: [0, 3, 10000, 10001, 10002, 10003, 10004, 10007, 10015, 10030, 10050], authors: [pubkey], limit: 50 }],
          { signal }
        );

        // Organize events by kind
        const profileData: ProfileData = {};

        for (const event of events) {
          switch (event.kind) {
            case 0:
              profileData.metadata = event;
              break;
            case 3:
              profileData.contacts = event;
              break;
            case 10000:
              profileData.muteList = event;
              break;
            case 10001:
              profileData.pinnedNotes = event;
              break;
            case 10002:
              profileData.relayList = event;
              break;
            case 10003:
              profileData.bookmarks = event;
              break;
            case 10004:
              profileData.communities = event;
              break;
            case 10007:
              profileData.searchRelays = event;
              break;
            case 10015:
              profileData.interests = event;
              break;
            case 10030:
              profileData.emojiList = event;
              break;
            case 10050:
              profileData.dmRelays = event;
              break;
          }
        }

        return profileData;
      } catch (error) {
        console.error('Error fetching profile data:', error);
        throw error;
      }
    },
    enabled: !!pubkey && !!relayUrl && relayUrl.startsWith('wss://'),
    staleTime: 30000, // Consider data stale after 30 seconds
  });
}