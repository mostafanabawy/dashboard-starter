export interface HistoryRecord {
  RecordId: number;
  CallerName: string;
  PhoneNumber: string;
  WhatsAppNumber: string;
  CallerType: string;
  CallStatus: string;
  CallID: string | null;
  City: string;
  SchoolName: string;
  Percentage: string;
  CertificateType: string;
  Notes: string;
  ExtraField1: string;
  ExtraFiled2: string; // Note: There's a typo in the field name, double-check the backend if this should be ExtraField2
  ExtraField3: string;
  CreationDate: string; // ISO timestamp
  DateFrom: string;
  DateTo: string;
  IsSearch: boolean;
  FollowUp: string;
  Answer: string;
}

export interface PagingInfo {
  TotalPages: number;
  CurrentPage: number;
  PageSize: number;
  TotalRows: number;
}

export interface HistoryAPIResponse {
  result: {
    result: string;
    details: string;
    items: HistoryRecord[];
    PagingInfo: PagingInfo[];
  };
}
