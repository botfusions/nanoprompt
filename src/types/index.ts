export interface UserProfile {
  email: string;
  credits: number;
  joinDate: number;
  isAdmin: boolean;
}

export interface AdminDashboardUser {
  id?: number | string;
  email: string;
  credits: number;
  is_admin: boolean;
  created_at: string;
}
