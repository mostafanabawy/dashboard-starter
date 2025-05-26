import { createReducer, on } from '@ngrx/store';
import { loginSuccess, loginFailure, logout } from './auth.actions';

export interface AuthState {
  token: string | null;
  UserName: string | null;
  error: string | null;
}
export const authFeatureKey = 'auth';

export const initialState: AuthState = {
  token: sessionStorage.getItem('token'),
  UserName: sessionStorage.getItem('UserName'),
  error: null
};

export const authReducer = createReducer(
  initialState,
  on(loginSuccess, (state, { Token, UserName }) => ({
    ...state,
    token: Token,
    UserName: UserName,
    error: null
  })),
  on(loginFailure, (state, { error }) => ({ ...state, error })),
  on(logout, () => {
    sessionStorage.removeItem('token');
    return initialState;
  })
);

