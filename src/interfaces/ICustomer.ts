interface IAddressData {
  id: string;
  type: string;
  description: string;
  zip_code: string;
  street: string;
  number: number;
  neighborhood: string;
  city: string;
  state: string;
}

interface IAddress {
  data: IAddressData[];
}

interface IBankData {
  id: string;
  type: string;
  bank: string;
  state: string;
  agency: string;
  account: string;
  operation?: any;
}

interface IBankAccount {
  data: IBankData[];
}

interface IEmailData {
  id: string;
  type: string;
  email: string;
}

interface IEmail {
  data: IEmailData[];
}

interface IPhoneData {
  id: string;
  type: string;
  phone: string;
}

interface IPhone {
  data: IPhoneData[];
}

export interface IProfileCustomerAttributes {
  id?: any;
  name: string;
  customer_type: string;
  status: number;
  customer_id: number;
  last_name: string | null;
  cpf?: string;
  rg: string;
  birth: string;
  gender: string;
  cnpj?: string;
  civil_status: string;
  nationality?: any;
  capacity: string;
  profession?: string;
  company?: string;
  number_benefit: string;
  nit?: string;
  mother_name: string;
  default_phone: string;
  default_email: string;
  data: any;
  representor?: any;
  issue_documents?: boolean;
  access_email: string;

  cep?: any;
  street?: any;
  state?: any;
  city?: any;
  number?: any;
  description?: any;
  neighborhood?: any;
  represent_attributes?: any;
  profile_customer_id?: number;
  represent?: any;
  deleted: boolean;
}

interface IProfileCustomerRelationships {
  addresses: IAddress[];
  bank_accounts: IBankAccount[];
  emails: IEmail[];
  phones: IPhone[];
}

export interface IProfileCustomer {
  id: string;
  type: string;
  name: string;
  deleted: boolean;
  attributes: IProfileCustomerAttributes;
  relationships: IProfileCustomerRelationships;
}

export interface ICustomerAttributes {
  access_email: string;
  created_by_id: string | null;
  confirmed_at: string | null;
  profile_customer_id: string | null;
  confirmed: boolean;
  deleted: boolean;
}

export interface ICustomer {
  id: string;
  type: string;
  attributes: ICustomerAttributes;
}
