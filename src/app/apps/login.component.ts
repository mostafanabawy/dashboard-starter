import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { AppService } from 'src/app/service/app.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import * as AuthActions from "../store/auth/auth.actions"
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent {
  store: any;
  loginForm!: FormGroup;
  isSubmitForm = false;
  constructor(
    public translate: TranslateService,
    public storeData: Store<any>,
    public router: Router,
    private appSetting: AppService,
    private fb: FormBuilder
  ) {
    this.initStore();
    this.initForm();
  }
  initForm() {
    this.loginForm = this.fb.group({
      UserName: [''],
      PassWord: ['']
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
    console.log('store Values:', this.store);
    // Dispatch login action
    this.storeData.dispatch(AuthActions.login(this.loginForm.value));
    this.isSubmitForm = true;
  }
}
