import { Resource } from '../types';

export const MOCK_RESOURCES: Resource[] = [
  {
    id: 'res-988',
    name: '988 Suicide & Crisis Lifeline',
    type: 'Crisis support',
    description: 'Free, confidential support for people in distress, prevention and crisis resources for you or your loved ones.',
    contactInfo: 'Call or text 988 (Available 24/7)',
    urgencyLevel: 'crisis',
  },
  {
    id: 'res-911',
    name: 'Emergency Services',
    type: 'Emergency response',
    description: 'Call for immediate physical safety emergencies or medical response.',
    contactInfo: 'Call 911',
    urgencyLevel: 'crisis',
  },
  {
    id: 'res-crisis-text',
    name: 'Crisis Text Line',
    type: 'Crisis support',
    description: 'Text HOME to 741741 to connect with a crisis counselor 24/7.',
    contactInfo: 'Text HOME to 741741',
    urgencyLevel: 'crisis',
  },
  {
    id: 'res-trevor',
    name: 'The Trevor Project',
    type: 'Specialized support',
    description: 'Crisis intervention and suicide prevention services for LGBTQ+ young people.',
    contactInfo: 'Call 866-488-7386 or text START to 678-678',
    urgencyLevel: 'crisis',
  },
  {
    id: 'res-warmline',
    name: 'National Warmline Directory',
    type: 'Non-crisis support',
    description: 'Peer-run hotlines for individuals who need a friendly conversation but are not in immediate crisis.',
    contactInfo: 'warmline.org',
    urgencyLevel: 'standard',
  },
];
