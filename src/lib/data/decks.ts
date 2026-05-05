import { Deck } from '@/types';

export const categories = [
  { id: 'all', label: 'All', icon: 'grid' },
  { id: 'old_testament', label: 'Old Testament', icon: 'book' },
  { id: 'life_of_jesus', label: 'Jesus', icon: 'star' },
  { id: 'parables', label: 'Parables', icon: 'message' },
  { id: 'commandments', label: 'Law', icon: 'shield' },
  { id: 'apostles', label: 'Acts', icon: 'users' },
  { id: 'psalms_wisdom', label: 'Wisdom', icon: 'heart' },
];

export const decks: Deck[] = [
  {
    id: 'deck-old-testament',
    name: 'Old Testament',
    description: 'Key stories and figures from Genesis to Malachi',
    icon: 'book',
    color: '#6C5CE7',
    category: 'old_testament',
  },
  {
    id: 'deck-jesus',
    name: 'Life of Jesus',
    description: 'The ministry, miracles, and teachings of Christ',
    icon: 'star',
    color: '#00B894',
    category: 'life_of_jesus',
  },
  {
    id: 'deck-parables',
    name: 'Parables',
    description: 'Stories Jesus told to teach spiritual truths',
    icon: 'message',
    color: '#FDCB6E',
    category: 'parables',
  },
  {
    id: 'deck-commandments',
    name: 'Commandments & Law',
    description: 'The Ten Commandments and biblical laws',
    icon: 'shield',
    color: '#FF6B6B',
    category: 'commandments',
  },
  {
    id: 'deck-apostles',
    name: 'Acts & Apostles',
    description: 'The early church and missionary journeys',
    icon: 'users',
    color: '#74B9FF',
    category: 'apostles',
  },
  {
    id: 'deck-psalms',
    name: 'Psalms & Wisdom',
    description: 'Psalms, Proverbs, and wisdom literature',
    icon: 'heart',
    color: '#A29BFE',
    category: 'psalms_wisdom',
  },
];
