export interface IProfileAdminAttributes {
  id: string;
  admin_id: number;
  office_id: number;
  birth: string;
  civil_status: string;
  cpf: string;
  created_at: string;
  gender: string;
  last_name: string;
  mother_name: string;
  name: string;
  nationality: string;
  oab: string;
  rg: string;
  role: string;
  status: string;
  email: string;
  updated_at: string;
  deleted: boolean;
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
