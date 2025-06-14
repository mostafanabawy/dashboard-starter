import { Component, computed, effect, signal, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { HistoryService } from '../service/history.service';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { AppState } from '../types/auth.types';
import * as AuthActions from "../store/auth/auth.actions"
import { NgxCustomModalComponent } from 'ngx-custom-modal';
import { filter, Subscription, tap } from 'rxjs';
import { ZiwoClient } from 'ziwo-core-front';
import { HistoryAPIResponse, HistoryRecord } from '../types/history.types';
import { io, Socket } from 'socket.io-client';

@Component({
  selector: 'app-crm',
  templateUrl: './crm.component.html'
})
export class CRMComponent {
  userForm!: FormGroup;
  formZIWO!: FormGroup;
  tokenZIWO = signal<string>('');
  isSubmitForm = false;
  isEditData = false;

  private storeSubscription!: Subscription;
  callId = computed<string>(() => {
    return this.historyTabsService.callId();
  });
  status = computed<string>(() => {
    return this.historyTabsService.status();
  });
  callerNumber = computed<string>(() => {
    return this.historyTabsService.callerNumber();
  });
  followUpEditRow = computed<HistoryRecord | null>(() => {
    return this.historyTabsService.followUpEditRow();
  })
  ziwoClient: any;
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
    effect(() => {
      if (this.store.auth.GroupID === 1006) {
        if (this.tokenZIWO()) {
          this.modal22.close();
        } else {
          this.modal22.open();
        }
      }
    }, { allowSignalWrites: true })
    effect(() => {
      let phoneNumber = this.callerNumber();
      this.userForm.patchValue({
        phoneNumber
      })
      if (phoneNumber) {
        this.onPhoneNumberBlur();
      }
    })
    effect(() => {
      let token = this.tokenZIWO();
      if (token) {
        this.initZIWO(token);
      }
    })
    effect(() => {
      let followUpEditRow = this.followUpEditRow();
      console.log(followUpEditRow);
      if (followUpEditRow) {
        this.isEditData = true;
        this.userForm.patchValue({
          Answer: followUpEditRow.Answer || '',
          CallStatus: followUpEditRow.CallStatus || '',
          CallerName: followUpEditRow.CallerName || '',
          CallerType: followUpEditRow.CallerType || '',
          CertificateType: followUpEditRow.CertificateType || '',
          City: followUpEditRow.City || '',
          ExtraField1: followUpEditRow.ExtraField1 || '',
          ExtraField3: followUpEditRow.ExtraField3.split(';').filter(((item: any) => item)) || [],
          ExtraFiled2: followUpEditRow.ExtraFiled2 || '',
          FollowUp: followUpEditRow.FollowUp || '',
          Percentage: followUpEditRow.Percentage || '',
          PhoneNumber: followUpEditRow.PhoneNumber || '',
          SchoolName: followUpEditRow.SchoolName || '',
          WhatsAppNumber: followUpEditRow.WhatsAppNumber || '',
          notes: followUpEditRow.Notes || '',
        })
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    })
  }
  ngOnInit() {
    /* this.historyTabsService.getCallLive().subscribe((event: any) => {
      console.log(event);
    });
    window.addEventListener('ziwo-call-active', (e: any) => console.log('Triggered by an active call event', e.detail));
   */}
  async initStore() {
    this.storeData
      .select((d) => ({
        index: d.index,
        auth: d.auth
      }))
      .subscribe((d) => {
        this.store = d;
        this.tokenZIWO.set(this.store.auth.tokenZIWO!);
      });
  }

  @ViewChild('modal22') modal22!: NgxCustomModalComponent;

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
      PhoneNumber: ['', [Validators.required, Validators.pattern(/.*/)]],
      SchoolName: [''],
      WhatsAppNumber: ['', Validators.pattern(/^[0-9]{11}$/)],
      notes: [''],
      callID: [{ value: this.callId(), disabled: true }]
    });
    this.formZIWO = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    })
  }
  getNumber() {
    console.log('btn clicked');
    console.log(this.ziwoClient);
    if (this.store.auth.GroupID === 1006) {
      if (this.ziwoClient.calls.length > 0) {

        this.historyTabsService.setAgentCalls({ number: this.ziwoClient.calls[this.ziwoClient.calls.length - 1].phoneNumber, callId: this.ziwoClient.calls[this.ziwoClient.calls.length - 1].primaryCallId });
        console.log(this.ziwoClient.calls[this.ziwoClient.calls.length - 1].phoneNumber);
        this.userForm.patchValue({
          PhoneNumber: this.ziwoClient.calls[this.ziwoClient.calls.length - 1].phoneNumber
        });
        this.onPhoneNumberBlur();
      }
    }
    this.ziwoClient.calls.pop()
  }

  onPhoneNumberBlur() {
    if (this.userForm.get('PhoneNumber')!.value && !this.isEditData) {
      const phoneNumberValue = this.userForm.get('PhoneNumber')!.value;
      this.historyTabsService.fetchHistory(1, { PhoneNumber: phoneNumberValue }, 2, 'CreationDate', 100).subscribe((res: HistoryAPIResponse) => {
        this.historyTabsService.initialHistoryVal.set(res.result.items);
        this.historyTabsService.initialHistoryFetchVal.set(phoneNumberValue);

        // Find the item with the newest CreationDate
        let newestItem = null;
        if (res.result.items && res.result.items.length > 0) {
          newestItem = res.result.items.reduce((latest: any, item: any) => {
            return new Date(item.CreationDate) > new Date(latest.CreationDate) ? item : latest;
          }, res.result.items[0]);
        }
        if (this.store.auth.GroupID === 1006) {
          this.userForm.patchValue({
            CallerName: newestItem ? newestItem.CallerName : '',
            CallerType: newestItem ? newestItem.CallerType : '',
            ExtraField1: newestItem ? newestItem.ExtraField1 : '',
            ExtraField3: newestItem ? newestItem.ExtraField3.split(';').filter(((item: any) => item)) : [],
            FollowUp: newestItem ? newestItem.FollowUp : '',
            Percentage: newestItem ? newestItem.Percentage : '',
            SchoolName: newestItem ? newestItem.SchoolName : '',
            WhatsAppNumber: newestItem ? newestItem.WhatsAppNumber : '',
            CertificateType: newestItem ? newestItem.CertificateType : '',
            City: newestItem ? newestItem.City : '',
            Answer: newestItem ? newestItem.Answer : '',
            CallStatus: newestItem ? newestItem.CallStatus : '',
            notes: newestItem ? newestItem.Notes : '',
          });
        }
      });
    } else if (this.userForm.get('PhoneNumber')!.value && this.isEditData) {
      const phoneNumberValue = this.userForm.get('PhoneNumber')!.value;
      this.historyTabsService.fetchHistory(1, { PhoneNumber: phoneNumberValue }, 2, 'CreationDate', 100).subscribe((res: HistoryAPIResponse) => {
        this.historyTabsService.initialHistoryVal.set(res.result.items);
        this.historyTabsService.initialHistoryFetchVal.set(phoneNumberValue);
      });
    } else {
      this.historyTabsService.initialHistoryFetchVal.set(null);
    }

  }


  onLogin(modal22: any) {
    if (this.formZIWO.valid) {
      this.storeData.dispatch(AuthActions.loginWithZIWO({
        username: this.formZIWO.get('username')!.value,
        password: this.formZIWO.get('password')!.value
      }))
    }
  }
  initZIWO(token: any) {
    if (!this.ziwoClient) {
      this.ziwoClient = new ZiwoClient({
        autoConnect: true,
        contactCenterName: 'BadyaUniversity',
        credentials: {
          authenticationToken: `${this.tokenZIWO()}`,
        },
        tags: {
          peerTag: document.getElementById('peer-video')
        },
        debug: false,
      });
    }
    // Active events
    window.addEventListener('ziwo-call-active', (e: any) => console.log('Triggered by an active call event', e.detail));
  }


  onSubmit() {
    this.isSubmitForm = true;
    if (this.userForm.valid) {
      //form validated success
      try {
        const formData = this.userForm.getRawValue();
        formData.ExtraField3 = formData.ExtraField3.join(';');
        formData.extrafiled2 = this.store.auth.UserName
        formData.callID = this.callId();
        if (this.followUpEditRow()) {
          this.historyTabsService.updateFollowUp(formData.CallStatus).subscribe((res: any) => {
            if (res.result.result === "OK") {
              this.historyTabsService.sendFormMainData(formData).subscribe((res: any) => {
                this.userForm.reset();
                this.historyTabsService.resetAgentCalls();
                this.isSubmitForm = false;
                this.userForm.markAsPristine();
                this.showMessage('Form submitted successfully.');
                this.historyTabsService.unsetFollowUpEditRow();
              })
            }
          })
        } else {

          this.historyTabsService.sendFormMainData(formData).subscribe((res: any) => {
            this.userForm.reset();
            this.historyTabsService.resetAgentCalls();
            this.isSubmitForm = false;
            this.userForm.markAsPristine();
            this.showMessage('Form submitted successfully.');
          });
        }
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
  ngOnDestroy() {
    this.historyTabsService.resetAgentCalls();
  }
}
