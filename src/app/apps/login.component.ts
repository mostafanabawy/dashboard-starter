import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { AppService } from 'src/app/service/app.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as AuthActions from "../store/auth/auth.actions"
import Swal from 'sweetalert2';
import { AppState } from '../types/auth.types';
import { AuthState } from '../store/auth/auth.reducer';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent {
  store!: AuthState;
  loginForm!: FormGroup;
  isSubmitForm = false;
  constructor(
    public translate: TranslateService,
    public storeData: Store<AppState>,
    public router: Router,
    private appSetting: AppService,
    private fb: FormBuilder
  ) {
    this.initStore();
    this.initForm();
  }
  initForm() {
    this.loginForm = this.fb.group({
      UserName: ['', Validators.required],
      PassWord: ['', Validators.required]
    })
  }
  async initStore() {
     this.storeData
         .select((d) => d.auth)
         .subscribe((d) => {
             this.store = d;
         });
  }


  onSubmit() {
    if (this.loginForm.valid) {
      this.storeData.dispatch(AuthActions.login(this.loginForm.value));      
    }
    this.isSubmitForm = true;
  }
}
