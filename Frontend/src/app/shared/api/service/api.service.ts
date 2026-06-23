import {environment} from '../../../../environment/environment.dev';
import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly baseURL: string = environment.apiURL;
  private readonly http: HttpClient = inject(HttpClient);

  get<T = any>(partURL: string): Observable<T> {
    return this.http.get<T>(`${this.baseURL}${partURL}`);
  }
  post<T = any>(partURL: string, payload: any): Observable<T> {
    return this.http.post<T>(`${this.baseURL}${partURL}`, payload);
  }
  put<T = any>(partURL: string, payload: any): Observable<T> {
    return this.http.put<T>(`${this.baseURL}${partURL}`, payload);
  }
  delete<T = any>(partURL: string): Observable<T> {
    return this.http.delete<T>(`${this.baseURL}${partURL}`);
  }
}
