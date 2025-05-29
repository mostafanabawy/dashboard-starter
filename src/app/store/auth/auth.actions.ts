import { createAction, props } from "@ngrx/store";

export const login = createAction(
  '[Auth] Login',
  props<{ UserName: string; PassWord: string }>()
);

export const loginSuccess = createAction(
  '[Auth] Login Success',
  props<{ Token: string, UserName: string, DisplayName: string, GroupID: number }>()
);

export const loginFailure = createAction(
  '[Auth] Login Failure',
  props<{ error: string }>()
);

export const loginWithZIWO = createAction(
  '[Auth] Login With ZIWO',
  props<{ username: string; password: string }>()
);

export const loginWithZIWOSuccess = createAction(
  '[Auth] Login With ZIWO Success',
  props<{ tokenZIWO: string }>()
);

export const loginWithZIWOFailure = createAction(
  '[Auth] Login With ZIWO Failure',
  props<{ error: string }>()
);

export const logout = createAction('[Auth] Logout');

export const initAuth = createAction('[Auth] Init');

export const initAuthSuccess = createAction(
  '[Auth] Init Success',
  props<{ Token: string }>()
);
