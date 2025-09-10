import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CalendarIcon, UserIcon, TagIcon, BookmarkIcon, RadioIcon, PinIcon, Users2Icon, HashIcon, SmileIcon, SearchIcon, MessageCircleIcon } from 'lucide-react';
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
        return { name: 'Profile Metadata', icon: UserIcon, color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' };
      case 3:
        return { name: 'Contact List', icon: UserIcon, color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' };
      case 10000:
        return { name: 'Mute List', icon: TagIcon, color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' };
      case 10001:
        return { name: 'Pinned Notes', icon: PinIcon, color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' };
      case 10002:
        return { name: 'Relay List', icon: RadioIcon, color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' };
      case 10003:
        return { name: 'Bookmarks', icon: BookmarkIcon, color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200' };
      case 10004:
        return { name: 'Communities', icon: Users2Icon, color: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200' };
      case 10007:
        return { name: 'Search Relays', icon: SearchIcon, color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' };
      case 10015:
        return { name: 'Interests', icon: HashIcon, color: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200' };
      case 10030:
        return { name: 'Emoji List', icon: SmileIcon, color: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200' };
      case 10050:
        return { name: 'DM Relays', icon: MessageCircleIcon, color: 'bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200' };
      default:
        return { name: `Kind ${kind}`, icon: TagIcon, color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' };
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
    }

    return (
      <div 
        key={event.id}
        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
          selectedEvents.has(event.id) 
            ? 'border-primary bg-primary/5' 
            : 'border-border hover:border-primary/50'
        }`}
        onClick={() => handleSelectEvent(event)}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4" />
            <span className="font-medium">{name}</span>
            <Badge variant="outline" className={color}>
              Kind {event.kind}
            </Badge>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <CalendarIcon className="h-3 w-3" />
            {formatDate(event.created_at)}
          </div>
        </div>
        {details && (
          <p className="text-sm text-muted-foreground">{details}</p>
        )}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Profile Data</CardTitle>
            <CardDescription>
              Found on: <span className="font-mono text-sm">{relayUrl}</span>
            </CardDescription>
          </div>
          {availableEvents.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
            >
              {allSelected ? 'Deselect All' : 'Select All'}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {availableEvents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <UserIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No profile data found on this relay</p>
          </div>
        ) : (
          <div className="space-y-3">
            {availableEvents.map(renderEventDetails)}
            <Separator />
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{availableEvents.length} events available</span>
              <span>{selectedEvents.size} selected</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}