export interface EventItem {
  id: number;
  authorId: number;
  title: string;
  category: string;
  city: string; 
  price: number;
  latitude: number;
  longitude: number;
  
  startTime: Date;
  endTime: Date;
  
  popularity: number;
  imageUrl: string;
  isTrending?: boolean;
  
  description: string;
  interestCount: number;

  isInterested: boolean;
}

export interface ApiEventResponse {
  id: number;
  authorId:number;
  title: string;
  description: string;
  imageUrl: string;
  startTime: string;
  endTime: string;
  createdAt: string;
  updatedAt: string;
  interestCount: number;
  trendingScore: number;
  categoryId: number;
  city: string;
  price: number;
  latitude: number;
  longitude: number;
  isInterested: boolean;
  
}