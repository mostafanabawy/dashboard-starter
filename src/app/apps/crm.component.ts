import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { HistoryService } from '../service/history.service';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { AppState } from '../types/auth.types';

@Component({
    selector: 'app-crm',
    templateUrl: './crm.component.html'
})
export class CRMComponent {
  userForm!: FormGroup;
  isSubmitForm = false;
  options = [
    'Schools',
    'Tuition Fees',
    'Registration Form',
    'Collaboration',
    'Location',
    'HR Email & Vacancies',
    'Post Graduate Programs',
    'Certificate',
    'Admissions',
    'Suppliers',
    'Others'
  ];
  store!: AppState;
  constructor(
    private fb: FormBuilder,
    private historyTabsService: HistoryService,
    private storeData: Store<AppState>,
    private translate: TranslateService
  ) {
    this.initStore();
    this.initForm();
  }
  async initStore() {
    this.storeData
      .select((d) => ({
        index: d.index,
        auth: d.auth
      }))
      .subscribe((d) => {
        this.store = d;
      });
  }
  initForm() {
    this.userForm = this.fb.group({
      Answer: ['', Validators.required],
      CallStatus: ['', Validators.required],
      CallerName: ['', Validators.required],
      CallerType: ['', Validators.required],
      CertificateType: [''],
      City: [''],
      ExtraField1: ['', Validators.required],
      ExtraField3: [[], Validators.required],
      ExtraFiled2: [''], // Note: spelling as per your list
      FollowUp: ['', Validators.required],
      Percentage: [''],
      PhoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{11}$/)]],
      SchoolName: [''],
      WhatsAppNumber: ['', Validators.pattern(/^[0-9]{11}$/)],
      notes: [''],
    });
  }
  onPhoneNumberBlur(){
    if(this.userForm.get('PhoneNumber')!.value){
      const phoneNumberValue = this.userForm.get('PhoneNumber')!.value;
      this.historyTabsService.initialHistoryFetchVal.set(phoneNumberValue);
    }else{
      this.historyTabsService.initialHistoryFetchVal.set(null);
    }
    
  }


  onSubmit() {
    this.isSubmitForm = true;
    if (this.userForm.valid) {
      //form validated success
      try {
        const formData = this.userForm.value;
        formData.ExtraField3 = formData.ExtraField3.join(';');
        formData.extrafiled2 = this.store.auth.UserName
        this.historyTabsService.sendFormMainData(formData).subscribe((res: any) => {
          console.log(res);
          this.userForm.reset();
          this.isSubmitForm = false;
          this.userForm.markAsPristine();
          this.showMessage('Form submitted successfully.');
        });
      } catch (error) {
        console.error('Error:', error);
        this.showMessage('Error occurred while submitting the form.', 'error');
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
  showMessage(msg = '', type = 'success') {
    const toast: any = Swal.mixin({
      toast: true,
      position: 'top',
      showConfirmButton: false,
      timer: 3000,
      customClass: { container: 'toast' },
    });
    toast.fire({
      icon: type,
      title: msg,
      padding: '10px 20px',
    });
  }

  getErrorMessage(controlName: string, errorKey: string) {
    const field = this.translate.instant(`fieldNames.${controlName}`);
    return this.translate.instant(`formErrors.${errorKey}`, { field });
  }
}
