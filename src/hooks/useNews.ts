
import { useQuery } from '@tanstack/react-query';

export interface Link {
  id: string;
  canonical_url: string;
  title: string;
  summary: string | null;
  published_at: string;
  image_url: string | null;
  first_seen_at: string;
  last_seen_at: string;
  source_name: string;
  category: string;
  target_column: string;
}

// Mock data for frontend development
const mockLinksData: Link[] = [
  {
    id: '1',
    canonical_url: 'https://cbc.ca/news/politics/budget-climate-initiatives',
    title: 'Federal Budget Introduces New Climate Initiatives',
    summary: 'The government announces $2.3 billion in new funding for renewable energy projects across Canada.',
    published_at: new Date('2024-01-15T10:30:00Z').toISOString(),
    image_url: null,
    first_seen_at: new Date().toISOString(),
    last_seen_at: new Date().toISOString(),
    source_name: 'CBC News',
    category: 'National',
    target_column: 'news'
  },
  {
    id: '2',
    canonical_url: 'https://thestar.com/news/ontario-healthcare-funding',
    title: 'Ontario Announces Healthcare Funding Boost',
    summary: 'Province commits additional $1.2 billion to reduce wait times and expand rural healthcare access.',
    published_at: new Date('2024-01-15T09:15:00Z').toISOString(),
    image_url: null,
    first_seen_at: new Date().toISOString(),
    last_seen_at: new Date().toISOString(),
    source_name: 'Toronto Star',
    category: 'Provincial',
    target_column: 'news'
  },
  {
    id: '3',
    canonical_url: 'https://theline.substack.com/energy-independence',
    title: 'The Case for Canadian Energy Independence',
    summary: 'Why Canada must prioritize domestic energy production while transitioning to renewable sources.',
    published_at: new Date('2024-01-15T08:45:00Z').toISOString(),
    image_url: null,
    first_seen_at: new Date().toISOString(),
    last_seen_at: new Date().toISOString(),
    source_name: 'The Line',
    category: 'Opinion',
    target_column: 'opinion'
  },
  {
    id: '4',
    canonical_url: 'https://producer.com/news/drought-conditions-prairie',
    title: 'Prairie Farmers Face Unprecedented Drought Conditions',
    summary: 'Agricultural communities in Saskatchewan and Alberta adapt to severe water shortages affecting crop yields.',
    published_at: new Date('2024-01-15T07:20:00Z').toISOString(),
    image_url: null,
    first_seen_at: new Date().toISOString(),
    last_seen_at: new Date().toISOString(),
    source_name: 'The Western Producer',
    category: 'Rural',
    target_column: 'news'
  },
  {
    id: '5',
    canonical_url: 'https://financialpost.com/news/bank-canada-rates',
    title: 'Bank of Canada Holds Interest Rates Steady',
    summary: 'Central bank maintains current policy rate amid mixed economic signals and inflation concerns.',
    published_at: new Date('2024-01-15T11:00:00Z').toISOString(),
    image_url: null,
    first_seen_at: new Date().toISOString(),
    last_seen_at: new Date().toISOString(),
    source_name: 'Financial Post',
    category: 'National',
    target_column: 'news'
  },
  {
    id: '6',
    canonical_url: 'https://lapresse.ca/actualites/politique/langue-francaise',
    title: 'Quebec Expands French Language Requirements',
    summary: 'New regulations require additional businesses to operate primarily in French, sparking debate.',
    published_at: new Date('2024-01-15T06:30:00Z').toISOString(),
    image_url: null,
    first_seen_at: new Date().toISOString(),
    last_seen_at: new Date().toISOString(),
    source_name: 'La Presse',
    category: 'Provincial',
    target_column: 'news'
  }
];

export const useLinks = (targetColumn?: string) => {
  return useQuery({
    queryKey: ['links', targetColumn],
    queryFn: async (): Promise<Link[]> => {
      console.log('Debug - useLinks called with targetColumn:', targetColumn);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      let filteredData = mockLinksData;
      
      if (targetColumn && targetColumn !== 'all') {
        filteredData = mockLinksData.filter(item => item.target_column === targetColumn);
      }

      console.log('Debug - Mock data returned:', filteredData.length, 'items');
      return filteredData;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // 10 minutes
  });
};

export const useNewsSources = () => {
  return useQuery({
    queryKey: ['news-sources'],
    queryFn: async () => {
      // Mock news sources data
      return [
        { id: '1', name: 'CBC News', is_active: true },
        { id: '2', name: 'Globe and Mail', is_active: true },
        { id: '3', name: 'CTV News', is_active: true },
        { id: '4', name: 'National Post', is_active: true },
        { id: '5', name: 'Toronto Star', is_active: true },
        { id: '6', name: 'The Line', is_active: true },
        { id: '7', name: 'Financial Post', is_active: true },
        { id: '8', name: 'La Presse', is_active: true },
      ];
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};
