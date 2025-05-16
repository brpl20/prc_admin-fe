interface IProfileAdminAttributes {
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

interface IProfileAdmin {
  id: string;
  type: string;
  attributes: IProfileAdminAttributes;
  deleted: boolean;
}

interface IAdminResponse {
  data: IAdminResponseData;
  included: IAdminResponseProfileAdmin[];
}

interface IAdminResponseData {
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

interface IAdminResponseProfileAdmin {
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

export type {
  IProfileAdmin,
  IProfileAdminAttributes,
  IAdminResponse,
  IAdminResponseData,
  IAdminResponseProfileAdmin,
};
