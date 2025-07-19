export interface Task {
  id: number;
  user_id: number;
  task_name: string;
  description?: string | null;
  status: 'open' | 'inprogress' | 'done';
  projects_id: number;
  start_date: string;
  finish_date: string;
  User?: {
    name: string;
  };
}
export interface NewTask {
  user_id: number;
  task_name: string;
  description?: string | null;
  status: 'open' | 'inprogress' | 'done';
  projects_id: number;
  start_date: string;
  finish_date: string;
}