interface IAttributesProps {
  id?: string;
  profile_customer_ids: string[];
  procedure: string;
  procedures: string[];
  number: number;
  subject: string;
  civel_area: string;
  social_security_areas: string;
  retirement_by_time: string;
  retirement_by_age: string;
  retirement_by_rural: string;
  disablement: string;
  benefit_review: string;
  administrative_services: string;
  responsible_lawyer: number;
  partner_lawyer: number;
  created_by_id: number;

  laborite_areas: string;
  labor_claim: string;
  tributary_areas: string;
  asphalt: string;
  license: string;
  others_tributary: string;

  compensations_five_years: boolean;
  compensations_service: boolean;
  lawsuit: boolean;
  gain_projection: string;
  other_description: string;
  honorary_attributes: any;
  power_ids: number[];
  office_ids: number[];
  profile_admin_ids: number[];
  initial_atendee: string;
  folder: string;
  recommendations_attributes: any;
  documents_attributes: any;
  pending_documents_attributes: any;
  note: string;
  extra_pending_document: string;
  tributary_files: any;

  // #Honorary
  fixed_honorary_value: string;
  parcelling_value: string;
  honorary_type: string;
  percent_honorary_value: string;
  parcelling: boolean;

  // #Recommendations
  percentage: number;
  commission: number;
  profile_customer_id: number;
  profile_customers: IProfile_customersDataProps[];

  // #Documents
  document_type: string;
  document_docx: string[];

  description: string;
  data: any;

  draftWork: any;
}

interface IProfile_customersDataProps {
  id: string;
  name: string;
  type: string;
  email: string;
}

interface IWorksListProps {
  id: number;
  type: string;
  attributes: IAttributesProps;
}

export type { IWorksListProps, IAttributesProps };
