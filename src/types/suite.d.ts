export interface SuiteHistory {
  id: number;
  suite: string;
  status: string;
  pass_rate: number;
  started_at: string;
  ended_at: string;
  duration: number;
  executed_by: string;
} 

