interface IOfficePropsAttributes {
  id: string;
  name: string;
  cnpj: string;
  city: string;
  site: string;
  office_type_description: string;
  responsible_lawyer_id: string;
  responsible_lawyer: string;
  profile_admins: string[];
  deleted: boolean;
}

interface IOfficeProps {
  id: string;
  type: string;
  attributes: IOfficePropsAttributes;
  deleted: boolean;
}

export type { IOfficeProps, IOfficePropsAttributes };
