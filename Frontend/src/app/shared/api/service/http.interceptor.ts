import {environment} from '../../../../environment/environment.dev';
import {HttpErrorResponse, HttpHandlerFn, HttpInterceptorFn, HttpRequest} from '@angular/common/http';
import {inject} from '@angular/core';
import {TokenService} from './token.service';
import {Router} from '@angular/router';
import {ApiService} from './api.service';
import {catchError, EMPTY, Observable, switchMap, tap} from 'rxjs';
import {ApiURI} from '../api-uri.enum';
import {ApiResponse} from '../data/api.response';
import {Token} from '../type/token';
import {AddTokenHeaderFn, HttpInterceptorCommonErrorHandlerFn, HttpInterceptorHandlerFn} from '../type/types';
import {AppNode} from '../../route/node.enum';

const baseURL:string = environment.apiURL;
const publicRoute: string[] = [
  `${baseURL}account/signin`,
  `${baseURL}account/signup`,
  `${baseURL}account/refresh`
];

// Main function of httpInterceptor
export const HttpInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn) => {
  //if route is public
  if (!req.url.startsWith(baseURL) || publicRoute.includes(req.url)) {
    return next(req);
  }
  //if route is not public
  const tokenService = inject(TokenService);
  const router: Router = inject(Router);

  if (!tokenService.token().isEmpty) {
    const api: ApiService = inject(ApiService);
    return next(setTokenInHeader(req, tokenService.token().token))
      .pipe(catchError((err: HttpErrorResponse) => handleError(err, req, next,
        tokenService, router, api)));
  }
  // We need to redirect because don't have access (no token)
  return redirectToPublic(router);
}

// function for navigate to public part ... this is called many times in the flow
const redirectToPublic: (router: Router) => Observable<any> = (router: Router) => {
  router.navigate([AppNode.SIGN_IN]).then();
  return EMPTY;
}

// function for set Token in header... we call it twice in the http interceptor flow
const setTokenInHeader: AddTokenHeaderFn = (req: HttpRequest<any>, token: string):
  HttpRequest<any> => {
  return req.clone({
    headers: req.headers.set('Authorization', `Bearer ${token}`)
  });
}

// Function handle the 401 error
const handleError: HttpInterceptorHandlerFn = (err: HttpErrorResponse, req: HttpRequest<any>,
                                               next: HttpHandlerFn,
                                               tokenService: TokenService, router: Router, api:
                                               ApiService): Observable<any> => {
  //ok at this stage, we send a request to api with token, but it seems expired... so we try to refresh it!
  if (err.status === 401 || err.status === 403) {
    //but before refresh it , we must try to see if refresh token exit... in theory yes because we cany be here if token.isEmpty
    if (!tokenService.token().isEmpty) {
      return api.post(ApiURI.REFRESH_TOKEN, {refresh: tokenService.token().refreshToken})
        .pipe(
          switchMap((result: ApiResponse) => {
            if (result.result) {
              //Finally if we get new token, we retry
              return next(setTokenInHeader(req, result.data.token)).pipe(
                catchError((err: HttpErrorResponse) => handleCommonError(err)),
                // if we pass here, that's mean we don't have error otherwise we go to catchError
                tap(() => tokenService.setToken({...result.data as Token, isEmpty: false}))
              );
            }
            // Redirect because the refresh token is expired too
            return redirectToPublic(router);
          }))
    }
    // Redirect because the refresh token is not exist
    return redirectToPublic(router);
  }
  // Here we can show something to client? Maybe a toaster or ....
  return handleCommonError(err);
}
const handleCommonError: HttpInterceptorCommonErrorHandlerFn = (err: HttpErrorResponse):
  Observable<any> => {
  throw (err);
}
