export interface ITeamMember {
  id: number;
  email: string;
  name: string;
  role: 'owner' | 'admin' | 'lawyer' | 'paralegal' | 'secretary' | 'intern';
  status: 'active' | 'invited' | 'inactive';
  joined_at?: string;
}

export interface IOffice {
  id: number;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  phone?: string;
  email?: string;
  is_main: boolean;
  created_at: string;
  updated_at: string;
}

export interface ITeam {
  id: number;
  name: string;
  slug: string;
  subdomain?: string;
  description?: string;
  logo_url?: string;
  owner_id: number;
  settings?: {
    allow_invites: boolean;
    require_approval: boolean;
    default_role: string;
  };
  created_at: string;
  updated_at: string;
  members?: ITeamMember[];
  offices?: IOffice[];
  subscription?: ISubscription;
}

export interface ISubscriptionPlan {
  id: number;
  name: string;
  description: string;
  price: number;
  billing_interval: 'monthly' | 'yearly';
  max_users: number;
  max_offices: number;
  max_cases: number;
  features: {
    [key: string]: boolean | string | number;
  };
  is_active: boolean;
}

export interface ISubscription {
  id: number;
  team_id: number;
  subscription_plan_id: number;
  status: 'trial' | 'active' | 'cancelled' | 'expired';
  start_date: string;
  end_date?: string;
  trial_ends_at?: string;
  monthly_amount: number;
  subscription_plan: ISubscriptionPlan;
  usage?: {
    users: {
      used: number;
      limit: number;
      percentage: number;
    };
    offices: {
      used: number;
      limit: number;
      percentage: number;
    };
    cases: {
      used: number;
      limit: number;
      percentage: number;
    };
  };
}

export interface ITeamInvite {
  email: string;
  role: ITeamMember['role'];
  message?: string;
}

export interface ICreateTeamData {
  name: string;
  subdomain?: string;
  description?: string;
  logo?: File;
}

export interface IUpdateTeamData {
  name?: string;
  description?: string;
  logo?: File;
  settings?: ITeam['settings'];
}