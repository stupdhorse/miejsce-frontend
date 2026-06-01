import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiEventResponse } from '../../models/event.model';

export interface BasicInfoResponse {
  username: string;
  email: string;
  city: string;
  gender: string;
  dateOfBirth: string;
}

export interface UserProfileResponse {
  id: number;
  basicInfo: BasicInfoResponse;
  friendsCount: number;
  friends: BasicInfoResponse[]; 
  eventsCount: number;
  events: ApiEventResponse[];
  interestedEvents: ApiEventResponse[];
  pastInterestedEvents: ApiEventResponse[];
  
  createdAt: string;
  lastModified: string;
}
@Injectable({
  providedIn: 'root'
})
export class UserProfileService {
  private apiUrl = 'http://localhost/api/UserProfiles';

  constructor(private http: HttpClient) {}

  getProfile(id: number): Observable<UserProfileResponse> {
    return this.http.get<UserProfileResponse>(`${this.apiUrl}/${id}`);
  }
  getAllUserProfiles(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  sendFriendRequest(receiverId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/friend-request/${receiverId}`, {});
  }

  getPendingRequests(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/friend-requests`);
  }

  handleFriendRequest(requestId: number, accept: boolean): Observable<any> {
    return this.http.post(`${this.apiUrl}/friend-request/${requestId}/handle?accept=${accept}`, {});
  }
}