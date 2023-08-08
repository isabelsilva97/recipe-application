import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthResponseData } from './auth-response-data.interface';
import { catchError, tap } from 'rxjs/operators';
import { BehaviorSubject, throwError } from 'rxjs';
import { User } from './user.model';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  signUpUser = 'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyA58WebiOH9shghyeou7xbjMrASiL4hTW0';
  loginUser = 'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyA58WebiOH9shghyeou7xbjMrASiL4hTW0';
  user = new BehaviorSubject<User>(new User('', '', '', new Date()));
  private tokenExpirationTimer: any;

  constructor(private http: HttpClient, private router: Router) { }

  signup(email: string, password: string) {
    return this.http.post<AuthResponseData>(this.signUpUser, { email: email, password: password, returnSecureToken: true })
      .pipe(catchError(this.handleError), tap(resData => {
        this.handleAuthentication(resData.email, resData.localId, resData.idToken, +resData.expiresIn);
      }));
  }

  login(email: string, password: string) {
    return this.http.post<AuthResponseData>(this.loginUser, { email: email, password: password, returnSecureToken: true })
      .pipe(catchError(this.handleError), tap(resData => {
        this.handleAuthentication(resData.email, resData.localId, resData.idToken, +resData.expiresIn);
      }));
  }

  logout() {
    this.user.next(new User('', '', '', new Date()));
    this.router.navigate(['/auth']);
    localStorage.removeItem('userData');
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }
    this.tokenExpirationTimer = null;
  }

  autoLogin() {
    const userData = localStorage.getItem('userData');
    if (!userData) {
      return;
    }

    const parsedUserData = JSON.parse(userData) as User;
    const loadedUser = new User(parsedUserData.email, parsedUserData.id, parsedUserData.token, new Date());

    if (loadedUser.token) {
      this.user.next(loadedUser);
      const expirationDuration = (new Date().getTime() * 1000) - new Date().getTime();
      this.autoLogout(expirationDuration);
    }
  }

  autoLogout(expirationDuration: number) {
    this.tokenExpirationTimer = setTimeout(() => {
      this.logout();
    }, expirationDuration);
  }

  private handleError(errorRes: HttpErrorResponse) {
    let errorMessage = "An error occurred";
    if (!errorRes.error || !errorRes.error.error) {
      return throwError(errorMessage);
    }
    switch (errorRes.error.error.message) {
      case "EMAIL_EXISTS":
        errorMessage = 'This email address exists already';
        break;
      case "EMAIL_NOT_FOUND":
        errorMessage = 'This email does not exist';
        break;
      case "INVALID_PASSWORD":
        errorMessage = 'This password is incorrect';
        break;
    }
    return throwError(errorMessage);
  }

  private handleAuthentication(email: string, userId: string, token: string, expiresIn: number) {
    const expirationDate = new Date(new Date().getTime() + expiresIn * 1000);
    const user = new User(email, userId, token, expirationDate);

    this.user.next(user);
    this.autoLogout(expiresIn * 1000);
    localStorage.setItem('userData', JSON.stringify(user));
  }

}
