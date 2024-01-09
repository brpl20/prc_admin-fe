interface IOfficePropsAttributes {
  name: string;
  cnpj: string;
  city: string;
  site: string;
  office_type_description: string;
}

interface IOfficeProps {
  id: string;
  type: string;
  attributes: IOfficePropsAttributes;
}

export type { IOfficeProps };
