
import { NewsItem } from '../types/news';

export const mockNewsData: NewsItem[] = [
  {
    id: '1',
    title: 'Federal Budget Introduces New Climate Initiatives',
    summary: 'The government announces $2.3 billion in new funding for renewable energy projects across Canada.',
    source: 'CBC News',
    publishedAt: new Date('2024-01-15T10:30:00Z'),
    category: 'National',
    url: 'https://cbc.ca/news/politics/budget-climate-initiatives',
  },
  {
    id: '2',
    title: 'Ontario Announces Healthcare Funding Boost',
    summary: 'Province commits additional $1.2 billion to reduce wait times and expand rural healthcare access.',
    source: 'Toronto Star',
    publishedAt: new Date('2024-01-15T09:15:00Z'),
    category: 'Provincial',
    url: 'https://thestar.com/news/ontario-healthcare-funding',
  },
  {
    id: '3',
    title: 'The Case for Canadian Energy Independence',
    summary: 'Why Canada must prioritize domestic energy production while transitioning to renewable sources.',
    source: 'The Line',
    publishedAt: new Date('2024-01-15T08:45:00Z'),
    category: 'Opinion',
    url: 'https://theline.substack.com/energy-independence',
  },
  {
    id: '4',
    title: 'Prairie Farmers Face Unprecedented Drought Conditions',
    summary: 'Agricultural communities in Saskatchewan and Alberta adapt to severe water shortages affecting crop yields.',
    source: 'The Western Producer',
    publishedAt: new Date('2024-01-15T07:20:00Z'),
    category: 'Rural',
    url: 'https://producer.com/news/drought-conditions-prairie',
  },
  {
    id: '5',
    title: 'Bank of Canada Holds Interest Rates Steady',
    summary: 'Central bank maintains current policy rate amid mixed economic signals and inflation concerns.',
    source: 'Financial Post',
    publishedAt: new Date('2024-01-15T11:00:00Z'),
    category: 'National',
    url: 'https://financialpost.com/news/bank-canada-rates',
  },
  {
    id: '6',
    title: 'Quebec Expands French Language Requirements',
    summary: 'New regulations require additional businesses to operate primarily in French, sparking debate.',
    source: 'La Presse',
    publishedAt: new Date('2024-01-15T06:30:00Z'),
    category: 'Provincial',
    url: 'https://lapresse.ca/actualites/politique/langue-francaise',
  },
];
