interface IAttributesProps {
  id: string;
  comment: string;
  deadline: string;
  description: string;
  priority: string;
  status: string;
  customer_id: string;
  profile_admin_id: string;
  work_id: string;
  responsible: string;
  work_number: number;
  customer?: string;
  created_by_id: number;
}

interface IRelationshipsProps {
  works: any[];
}

interface ITaskProps {
  id: string;
  type: string;
  attributes: IAttributesProps;
}

export type { ITaskProps, IAttributesProps };
