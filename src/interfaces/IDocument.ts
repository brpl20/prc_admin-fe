interface IDocumentProps {
  id: number;
  profile_customer_id: number;
  work_id: number;

  document_type: 'honorary' | 'waiver' | 'deficiency_statement' | 'procuration';
  url: string;

  created_at: string;
  updated_at: string;
}

interface IDocumentApprovalProps extends IDocumentProps {
  pending_revision: boolean;
}

interface IDocumentRevisionProps extends IDocumentProps {
  pending_upload: boolean;
}

export default IDocumentProps;

export type { IDocumentApprovalProps, IDocumentRevisionProps };
