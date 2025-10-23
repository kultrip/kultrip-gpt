export interface TravelParams {
  destination?: string;
  story?: string;
  duration?: string;
  travelStyle?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  type?: 'text' | 'itinerary' | 'suggestions';
}

export interface StoryDestination {
  story: string;
  destinations: string[];
  description: string;
}

export interface Itinerary {
  destination: string;
  story: string;
  duration: string;
  days: DayPlan[];
  activities: Activity[];
}

export interface DayPlan {
  day: number;
  title: string;
  locations: string[];
  description: string;
}

export interface Activity {
  name: string;
  location: string;
  description: string;
  type: string;
}
