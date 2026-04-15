export interface Activity {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  time: string;
  city: string;
  location: string;
  bannerImage: string;
  hostId: string;
  hostName: string;
  hostAvatar: string;
  participantLimit: number;
  currentParticipants: number;
  difficulty: 'easy' | 'moderate' | 'intense';
  tags: string[];
  isPublic: boolean;
  safetyInstructions?: string;
  agenda?: string[];
  rules?: string[];
  requiredItems?: string[];
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  interests: string[];
  joinedDate: string;
  activitiesHosted: number;
  activitiesJoined: number;
  streak: number;
  badges: Badge[];
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  count: number;
  color: string;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  rating: number;
  comment: string;
  date: string;
}
