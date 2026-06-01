import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiEventResponse } from '../../models/event.model';

@Injectable({
  providedIn: 'root'
})
export class EventService {

  private apiUrl = 'http://localhost/api/Events'; 

  constructor(private http: HttpClient) { }

  getAllEvents(): Observable<ApiEventResponse[]> {
    return this.http.get<ApiEventResponse[]>(this.apiUrl);
  }

  getTrendingEvents(): Observable<ApiEventResponse[]> {
    // Zakładam, że backend ma endpoint /trending
    return this.http.get<ApiEventResponse[]>(`${this.apiUrl}/trending`);
  }

  getRecommendedEvents(): Observable<ApiEventResponse[]> {
    // Zakładam, że backend ma endpoint /recommended
    return this.http.get<ApiEventResponse[]>(`${this.apiUrl}/recommended`);
  }

  addEvent(eventData: any): Observable<number> {
    return this.http.post<number>(this.apiUrl, eventData);
  }

  updateEvent(id: number, formData: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, formData);
  }

  deleteEvent(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  setInterest(eventId: number, isInterested: boolean): Observable<void> {
    // Wysyłamy status zainteresowania do backendu
    return this.http.post<void>(`${this.apiUrl}/${eventId}/interest`, { isInterested });
  }
}