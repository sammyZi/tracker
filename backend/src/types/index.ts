/**
 * Shared TypeScript type definitions for the backend
 */

export interface UserProfile {
  age: number;
  weight: number;
  weightUnit: 'kg' | 'lbs';
  height?: number;
  heightUnit?: 'cm' | 'ft';
  gender?: 'male' | 'female' | 'other';
}

export interface PrivacySettings {
  showAge: boolean;
  showWeight: boolean;
  showHeight: boolean;
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  profile?: UserProfile;
  privacySettings: PrivacySettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface RoutePoint {
  lat: number;
  lng: number;
  timestamp: number;
}

export interface RouteData {
  coordinates: RoutePoint[];
}

export interface Activity {
  id: string;
  userId: string;
  type: 'walking' | 'running';
  startTime: Date;
  endTime: Date;
  duration: number;
  distance: number;
  pace: number;
  calories: number;
  route: RouteData;
  isPrivate: boolean;
  createdAt: Date;
}

export interface Friend {
  id: string;
  user1Id: string;
  user2Id: string;
  status: 'pending' | 'accepted';
  requesterId: string;
  createdAt: Date;
  acceptedAt?: Date;
}

export interface Reaction {
  id: string;
  activityId: string;
  userId: string;
  type: 'thumbs_up' | 'fire' | 'muscle';
  createdAt: Date;
}

export type ChallengeType = 
  | 'MOST_DISTANCE' 
  | 'MOST_ACTIVITIES' 
  | 'LONGEST_ACTIVITY' 
  | 'FASTEST_PACE';

export interface Participant {
  userId: string;
  status: 'invited' | 'joined' | 'declined';
  joinedAt?: Date;
}

export interface LeaderboardEntry {
  userId: string;
  displayName: string;
  photoURL?: string;
  value: number;
  rank: number;
}

export interface Competition {
  id: string;
  name: string;
  creatorId: string;
  challengeType: ChallengeType;
  startDate: Date;
  endDate: Date;
  status: 'pending' | 'active' | 'completed';
  participants: Participant[];
  leaderboard: LeaderboardEntry[];
  winnerId?: string;
  createdAt: Date;
  completedAt?: Date;
}

export type NotificationType = 
  | 'friend_request' 
  | 'friend_accepted' 
  | 'activity_reaction' 
  | 'competition_invite' 
  | 'competition_ended' 
  | 'rank_change';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data: Record<string, any>;
  read: boolean;
  createdAt: Date;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
