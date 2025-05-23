// types/api.ts
export interface QuestionItem {
  ID: number;
  Question: string;
  AnswerEN: string;
  AnswerAR: string;
}

export interface PagingInfo {
  TotalPages: number;
  CurrentPage: number;
  PageSize: number;
  TotalRows: number;
}

export interface QuestionsAPIResponse {
  result: {
    result: string;
    details: string;
    items: QuestionItem[];
    PagingInfo: PagingInfo[];
  };
}
