export interface Activity {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  time: string;
  city: string;
  location: string;
  host_id: string;
  users?: { id: string; name: string; avatar: string };
  participant_limit: number;
  current_participants: number;
  difficulty: 'easy' | 'moderate' | 'intense';
  tags: string[];
  is_public: boolean;
  safety_instructions?: string;
  agenda?: string[];
  rules?: string[];
  required_items?: string[];
  created_at: string;
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  interests: string[];
  joined_date: string;
  activities_hosted: number;
  activities_joined: number;
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
  activity_id: string;
  user_id: string;
  users?: { id: string; name: string; avatar: string };
  rating: number;
  comment: string;
  created_at: string;
}

export interface Message {
  id: string;
  activity_id: string;
  user_id: string;
  users?: { id: string; name: string; avatar: string };
  content: string;
  created_at: string;
}
