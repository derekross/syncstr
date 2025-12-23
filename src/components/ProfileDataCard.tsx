import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CalendarIcon, UserIcon, TagIcon, BookmarkIcon, RadioIcon, PinIcon, Users2Icon, HashIcon, SmileIcon, SearchIcon, MessageCircleIcon, BanIcon, DatabaseIcon, Share2Icon, ShieldCheckIcon } from 'lucide-react';
import type { NostrEvent, NostrMetadata } from '@nostrify/nostrify';
import type { ProfileData } from '@/hooks/useProfileData';

interface ProfileDataCardProps {
  profileData: ProfileData;
  relayUrl: string;
  onSelectEvents: (events: NostrEvent[]) => void;
  selectedEvents: Set<string>;
}

export function ProfileDataCard({ profileData, relayUrl, onSelectEvents, selectedEvents }: ProfileDataCardProps) {
  const availableEvents = Object.values(profileData).filter(Boolean) as NostrEvent[];
  const allSelected = availableEvents.length > 0 && availableEvents.every(event => selectedEvents.has(event.id));

  const handleSelectAll = () => {
    if (allSelected) {
      onSelectEvents([]);
    } else {
      onSelectEvents(availableEvents);
    }
  };

  const handleSelectEvent = (event: NostrEvent) => {
    if (selectedEvents.has(event.id)) {
      onSelectEvents(availableEvents.filter(e => e.id !== event.id && selectedEvents.has(e.id)));
    } else {
      onSelectEvents([...availableEvents.filter(e => selectedEvents.has(e.id)), event]);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const getEventTypeInfo = (kind: number) => {
    switch (kind) {
      case 0:
        return { name: 'Profile Metadata', icon: UserIcon, color: 'bg-purple-500/20 border-purple-500/30 text-purple-400' };
      case 3:
        return { name: 'Contact List', icon: UserIcon, color: 'bg-blue-500/20 border-blue-500/30 text-blue-400' };
      case 10000:
        return { name: 'Mute List', icon: TagIcon, color: 'bg-red-500/20 border-red-500/30 text-red-400' };
      case 10001:
        return { name: 'Pinned Notes', icon: PinIcon, color: 'bg-green-500/20 border-green-500/30 text-green-400' };
      case 10002:
        return { name: 'Relay List', icon: RadioIcon, color: 'bg-orange-500/20 border-orange-500/30 text-orange-400' };
      case 10003:
        return { name: 'Bookmarks', icon: BookmarkIcon, color: 'bg-indigo-500/20 border-indigo-500/30 text-indigo-400' };
      case 10004:
        return { name: 'Communities', icon: Users2Icon, color: 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400' };
      case 10006:
        return { name: 'Blocked Relays', icon: BanIcon, color: 'bg-red-500/20 border-red-500/30 text-red-400' };
      case 10007:
        return { name: 'Search Relays', icon: SearchIcon, color: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400' };
      case 10015:
        return { name: 'Interests', icon: HashIcon, color: 'bg-teal-500/20 border-teal-500/30 text-teal-400' };
      case 10030:
        return { name: 'Emoji List', icon: SmileIcon, color: 'bg-pink-500/20 border-pink-500/30 text-pink-400' };
      case 10050:
        return { name: 'DM Relays', icon: MessageCircleIcon, color: 'bg-violet-500/20 border-violet-500/30 text-violet-400' };
      case 10086:
        return { name: 'Indexer Relays', icon: DatabaseIcon, color: 'bg-blue-500/20 border-blue-500/30 text-blue-400' };
      case 10087:
        return { name: 'Proxy Relays', icon: Share2Icon, color: 'bg-orange-500/20 border-orange-500/30 text-orange-400' };
      case 10088:
        return { name: 'Broadcast Relays', icon: RadioIcon, color: 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400' };
      case 10089:
        return { name: 'Trusted Relays', icon: ShieldCheckIcon, color: 'bg-amber-500/20 border-amber-500/30 text-amber-400' };
      default:
        return { name: `Kind ${kind}`, icon: TagIcon, color: 'bg-gray-500/20 border-gray-500/30 text-gray-400' };
    }
  };

  const renderEventDetails = (event: NostrEvent) => {
    const { name, icon: Icon, color } = getEventTypeInfo(event.kind);
    
    let details = '';
    if (event.kind === 0 && event.content) {
      try {
        const metadata: NostrMetadata = JSON.parse(event.content);
        details = metadata.name || metadata.display_name || 'No name';
      } catch {
        details = 'Invalid metadata';
      }
    } else if (event.kind === 3) {
      const pTags = event.tags.filter(tag => tag[0] === 'p');
      details = `${pTags.length} contacts`;
    } else if (event.kind === 10000) {
      const muteTags = event.tags.filter(tag => ['p', 't', 'word', 'e'].includes(tag[0]));
      details = `${muteTags.length} muted items`;
    } else if (event.kind === 10001) {
      const eTags = event.tags.filter(tag => tag[0] === 'e');
      details = `${eTags.length} pinned notes`;
    } else if (event.kind === 10002) {
      const rTags = event.tags.filter(tag => tag[0] === 'r');
      details = `${rTags.length} relays`;
    } else if (event.kind === 10003) {
      const bookmarkTags = event.tags.filter(tag => ['e', 'a', 't', 'r'].includes(tag[0]));
      details = `${bookmarkTags.length} bookmarks`;
    } else if (event.kind === 10004) {
      const communityTags = event.tags.filter(tag => tag[0] === 'a');
      details = `${communityTags.length} communities`;
    } else if (event.kind === 10007) {
      const searchRelayTags = event.tags.filter(tag => tag[0] === 'relay');
      details = `${searchRelayTags.length} search relays`;
    } else if (event.kind === 10015) {
      const interestTags = event.tags.filter(tag => ['t', 'a'].includes(tag[0]));
      details = `${interestTags.length} interests`;
    } else if (event.kind === 10030) {
      const emojiTags = event.tags.filter(tag => ['emoji', 'a'].includes(tag[0]));
      details = `${emojiTags.length} emojis/sets`;
    } else if (event.kind === 10050) {
      const dmRelayTags = event.tags.filter(tag => tag[0] === 'relay');
      details = `${dmRelayTags.length} DM relays`;
    } else if (event.kind === 10006) {
      const blockedRelayTags = event.tags.filter(tag => tag[0] === 'relay');
      details = `${blockedRelayTags.length} blocked relays`;
    } else if (event.kind === 10086) {
      const indexerRelayTags = event.tags.filter(tag => tag[0] === 'relay');
      details = `${indexerRelayTags.length} indexer relays`;
    } else if (event.kind === 10087) {
      const proxyRelayTags = event.tags.filter(tag => tag[0] === 'relay');
      details = `${proxyRelayTags.length} proxy relays`;
    } else if (event.kind === 10088) {
      const broadcastRelayTags = event.tags.filter(tag => tag[0] === 'relay');
      details = `${broadcastRelayTags.length} broadcast relays`;
    } else if (event.kind === 10089) {
      const trustedRelayTags = event.tags.filter(tag => tag[0] === 'relay');
      details = `${trustedRelayTags.length} trusted relays`;
    }

    return (
      <div
        key={event.id}
        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
          selectedEvents.has(event.id)
            ? 'border-violet-500 bg-violet-500/10'
            : 'border-white/10 hover:border-violet-500/50 bg-white/5'
        }`}
        onClick={() => handleSelectEvent(event)}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-white/70" />
            <span className="font-medium text-white">{name}</span>
            <Badge variant="outline" className={color}>
              Kind {event.kind}
            </Badge>
          </div>
          <div className="flex items-center gap-1 text-sm text-white/50">
            <CalendarIcon className="h-3 w-3" />
            {formatDate(event.created_at)}
          </div>
        </div>
        {details && (
          <p className="text-sm text-white/60">{details}</p>
        )}
      </div>
    );
  };

  return (
    <Card className="border-white/10 bg-white/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg text-white">Profile Data</CardTitle>
            <CardDescription className="text-white/60">
              Found on: <span className="font-mono text-sm text-white/80">{relayUrl}</span>
            </CardDescription>
          </div>
          {availableEvents.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              className="border-white/20 text-white hover:bg-white/10"
            >
              {allSelected ? 'Deselect All' : 'Select All'}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {availableEvents.length === 0 ? (
          <div className="text-center py-8 text-white/40">
            <UserIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No profile data found on this relay</p>
          </div>
        ) : (
          <div className="space-y-3">
            {availableEvents.map(renderEventDetails)}
            <Separator className="bg-white/10" />
            <div className="flex items-center justify-between text-sm text-white/50">
              <span>{availableEvents.length} events available</span>
              <span>{selectedEvents.size} selected</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}