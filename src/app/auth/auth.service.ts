import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';

import { AuthData } from './auth-data.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  isAuthenticated = false;
  token: string;
  tokenTimer: NodeJS.Timer;
  userId: string;
  authStatusListener = new Subject<boolean>();

  constructor(private http: HttpClient, private router: Router) { }

  getToken() {
    return this.token;
  }

  getIsAuth () {
    return this.isAuthenticated;
  }

  getUserId() {
    return this.userId;
  }

  getAuthStatusListener() {
    return this.authStatusListener.asObservable();
  }

  createUser(name: string, email: string, password: string) {
    const authData: AuthData = {
      name: name,
      email: email,
      password: password
    };
    this.http.post("https://crowdfundingstarter.herokuapp.com/signup", authData).subscribe(() => {
      this.router.navigate["/"];
    }, error => {
      this.authStatusListener.next(false);
    });
  }

  login(data) {
    this.http.post<{ token: string, expiresIn: number, userId: string }>("https://crowdfundingstarter.herokuapp.com/login", data)
      .subscribe(Response => {
        const token = Response.token;
        this.token = token;
        if (token) {
          const expiresInDuration = Response.expiresIn;
          this.setAuthTImer(expiresInDuration);
          this.isAuthenticated = true;
          this.userId = Response.userId;
          this.authStatusListener.next(true);
          const now = new Date();
          const expirationDate = new Date(now.getTime() + expiresInDuration * 1000);
          console.log(expirationDate);
          this.saveAuthData(token, expirationDate, this.userId);
          this.router.navigate(['/']);
        }
      }, error => {
        this.authStatusListener.next(false);
      });
  }

  autoAuthUser() {
    const authInformation = this.getAuthData();
    if(!authInformation) {
      return;
    }
    const now = new Date();
    const expiresIn = authInformation.expirationDate.getTime() - now.getTime();
    if (expiresIn > 0) {
      this.token = authInformation.token;
      this.isAuthenticated = true;
      this.userId = authInformation.userId;
      this.setAuthTImer(expiresIn / 1000);
      this.authStatusListener.next(true);
    }
  }

  logout() {
    this.token = null;
    this.isAuthenticated = false;
    this.authStatusListener.next(false);
    this.userId = null;
    clearTimeout(this.tokenTimer);
    this.clearAuthData();
    this.router.navigate(['/']);
  }

  private setAuthTImer(duration: number) {
    console.log("setting timer: " + duration);
    this.tokenTimer = setTimeout(()=>{
      this.logout();
    }, duration * 1000);
  }

  private saveAuthData (token: string, expirationDate: Date, userId: string) {
    localStorage.setItem('token', token);
    localStorage.setItem('expiration', expirationDate.toISOString());
    localStorage.setItem('userId', userId);
  }

  private clearAuthData() {
    localStorage.removeItem("token");
    localStorage.removeItem("expiration");
    localStorage.removeItem("userId");
  }

  private getAuthData() {
    const token = localStorage.getItem("token");
    const expirationDate = localStorage.getItem("expiration");
    const userId = localStorage.getItem("userId");
    if (!token || !expirationDate) {
      return;
    } 
    return {
      token: token,
      expirationDate: new Date(expirationDate),
      userId: userId
    }
  }
}
