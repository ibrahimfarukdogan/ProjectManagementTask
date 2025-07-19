export interface User {
  id: number;
  username: string;
  name?: string;
  mail?: string;
  isAdmin?: boolean;
}
export interface NewUser {
  username: string;
  name: string;
  mail: string;
  password: string;
  isAdmin: boolean;
}