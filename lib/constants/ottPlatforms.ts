export interface OttPlatform {
  id: string;
  name: string;
  logo: string;
  color: string;
}

export const OTT_PLATFORMS: OttPlatform[] = [
  {
    id: 'netflix',
    name: 'Netflix',
    logo: '🎬',
    color: '#E50914'
  },
  {
    id: 'watcha',
    name: 'Watcha',
    logo: '📺',
    color: '#FF0558'
  },
  {
    id: 'wavve',
    name: 'Wavve',
    logo: '🌊',
    color: '#1E90FF'
  },
  {
    id: 'tving',
    name: 'Tving',
    logo: '📱',
    color: '#FF6600'
  },
  {
    id: 'disneyplus',
    name: 'Disney+',
    logo: '🏰',
    color: '#113CCF'
  },
  {
    id: 'amazon-prime',
    name: 'Amazon Prime Video',
    logo: '📹',
    color: '#00A8E1'
  },
  {
    id: 'apple-tv',
    name: 'Apple TV+',
    logo: '🍎',
    color: '#000000'
  },
  {
    id: 'paramount',
    name: 'Paramount+',
    logo: '⭐',
    color: '#0066CC'
  }
];

export const getOttPlatformById = (id: string): OttPlatform | undefined => {
  return OTT_PLATFORMS.find(platform => platform.id === id);
};

export const getOttPlatformsByIds = (ids: string[]): OttPlatform[] => {
  return ids.map(id => getOttPlatformById(id)).filter(Boolean) as OttPlatform[];
};