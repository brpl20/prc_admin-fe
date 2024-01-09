interface IAdminPropsAttributes {
  id: number;
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
  updated_at: string;
}

interface IAdminProps {
  id: string;
  type: string;
  attributes: IAdminPropsAttributes;
}

export type { IAdminProps, IAdminPropsAttributes };
