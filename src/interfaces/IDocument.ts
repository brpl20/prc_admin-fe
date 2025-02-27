interface IDocumentProps {
  id: number;
  profile_customer_id: number;
  work_id: number;

  document_type: 'honorary' | 'waiver' | 'deficiency_statement' | 'procuration';
  status: 'Pendente de revisão' | 'Aprovado' | 'Assinado';
  original_file_url: string;
  signef_file_url?: string;

  created_at: string;
  updated_at: string;
}

interface IDocumentApprovalProps extends IDocumentProps {
  pending_revision: boolean;
}

interface IDocumentRevisionProps extends IDocumentProps {
  file: File | null;
}

export default IDocumentProps;

export type { IDocumentApprovalProps, IDocumentRevisionProps };
