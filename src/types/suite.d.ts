export interface SuiteHistory {
  id: string
  type: string
  name: string
  status: string
  started_at: string
  duration: string
  executed_by_username: string | null
  suite_id: string | null
  suite_name: string | null
  case_id: string | null
  case_name: string | null
}

