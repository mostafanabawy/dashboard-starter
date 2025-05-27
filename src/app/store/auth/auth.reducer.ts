import { createReducer, on } from '@ngrx/store';
import { loginSuccess, loginFailure, logout } from './auth.actions';

export interface AuthState {
  token: string | null;
  UserName: string | null;
  DisplayName: string | null;
  GroupID: number | null;
  error: string | null;
}
export const authFeatureKey = 'auth';

export const initialState: AuthState = {
  token: sessionStorage.getItem('token'),
  UserName: sessionStorage.getItem('UserName'),
  DisplayName: sessionStorage.getItem('DisplayName'),
  GroupID: JSON.parse(sessionStorage.getItem('GroupID') || 'null'),
  error: null
};

export const authReducer = createReducer(
  initialState,
  on(loginSuccess, (state, { Token, UserName, DisplayName, GroupID }) => ({
    ...state,
    token: Token,
    UserName: UserName,
    DisplayName: DisplayName,
    GroupID: GroupID,
    error: null
  })),
  on(loginFailure, (state, { error }) => ({ ...state, error })),
  on(logout, () => {
    return {
      token: null,
      UserName: null,
      DisplayName: null,
      GroupID: null,
      error: null
    };
  })
);

