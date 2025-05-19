export interface IAddress {
  id: number;
  description: string;
  zip_code: string;
  street: string;
  number: number;
  neighborhood: string;
  city: string;
  state: string;
  created_at: string;
  updated_at: string;
}

export interface IPhone {
  id: number;
  phone_number: string;
  created_at: string;
  updated_at: string;
}

export interface IEmail {
  id: number;
  email: string;
  created_at: string;
  updated_at: string;
}

// TODO: This should be typed asap.
export type IBankAccount = any;

export interface IProfileAdminAttributes {
  role: string;
  name: string;
  last_name: string;
  email: string;
  status: string;
  admin_id: number;
  office_id: number | null;
  gender: string;
  oab: string;
  rg: string;
  cpf: string;
  nationality: string;
  origin: string | null;
  civil_status: string;
  birth: string;
  mother_name: string;
  addresses: IAddress[];
  phones: IPhone[];
  emails: IEmail[];
  bank_accounts: IBankAccount[];
  deleted: boolean;

  // These are optional if they might exist at root level
  created_at?: string;
  updated_at?: string;
  id: string;
}

export interface IProfileAdmin {
  id: string;
  type: string;
  attributes: IProfileAdminAttributes;
}

export interface IAdminResponse {
  data: IAdmin;
  included: IAdminResponseProfileAdmin[];
}

export interface IAdmin {
  id: string;
  type: string;
  attributes: {
    email: string;
    deleted: boolean;
  };
  relationships: {
    profile_admin: {
      data: {
        id: string;
        type: string;
      };
    };
  };
}

export interface IAdminResponseProfileAdmin {
  id: string;
  type: string;
  attributes: {
    role: string;
    name: string;
    last_name: string;
    email: string;
    deleted: boolean;
  };
}
