interface IAdminPropsAttributes {
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

interface IAdminProps {
  id: string;
  type: string;
  attributes: IAdminPropsAttributes;
  deleted: boolean;
}

export type { IAdminProps, IAdminPropsAttributes };
