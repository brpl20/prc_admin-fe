import api from './api';

export interface SystemOverview {
  total_admins: number;
  total_teams: number;
  total_customers: number;
  total_works: number;
  active_subscriptions: number;
}

export interface RecentActivity {
  new_users_this_month: number;
  new_works_this_week: number;
  active_teams: number;
}

export interface SystemSettingsInfo {
  current_minimum_wage: number;
  current_inss_ceiling: number;
  settings_year: number;
}

export interface DashboardStats {
  system_overview: SystemOverview;
  recent_activity: RecentActivity;
  system_settings: SystemSettingsInfo;
}

export interface SystemSettingItem {
  id: number;
  key: string;
  value: number;
  year: number;
  description: string;
  active: boolean;
}

export interface SystemSettingsResponse {
  settings: SystemSettingItem[];
  current_year: number;
  available_keys: string[];
}

// Dashboard
export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await api.get('/super_admin/dashboard');
  return response.data;
};

// System Settings Management
export const getSystemSettingsAdmin = async (): Promise<SystemSettingsResponse> => {
  const response = await api.get('/super_admin/system_settings');
  return response.data;
};

export const updateSystemSetting = async (
  id: number,
  data: { value?: number; description?: string; active?: boolean }
): Promise<SystemSettingItem> => {
  const response = await api.put(`/super_admin/system_settings/${id}`, {
    system_setting: data
  });
  return response.data;
};