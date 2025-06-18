export interface Project {
  id: number;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
  envs?: ProjectEnv[{id: number, name: string, url: string}];
}
