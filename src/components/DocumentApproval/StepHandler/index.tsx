import { Dispatch, SetStateAction } from 'react';
import { IDocumentApprovalProps } from '../../../interfaces/IDocument';
import DocumentApprovalStepTwo from '../Steps/Two';
import DocumentApprovalStepOne from '../Steps/One';
import DocumentApprovalStepThree from '../Steps/Three';

interface DocumentApprovalStepHandlerProps {
  step: number;
  handleChangeStep: (action: 'previous' | 'next' | 'set', step?: number) => void;
  documents: IDocumentApprovalProps[];
  setDocuments: Dispatch<SetStateAction<IDocumentApprovalProps[]>>;
  refetch: () => void;
}

const DocumentApprovalStepHandler: React.FunctionComponent<DocumentApprovalStepHandlerProps> = ({
  step,
  documents,
  setDocuments,
  handleChangeStep,
  refetch,
}) => {
  const steps = [
    <DocumentApprovalStepOne
      key={1}
      documents={documents}
      setDocuments={setDocuments}
      handleChangeStep={handleChangeStep}
      refetch={refetch}
    />,
    <DocumentApprovalStepTwo
      key={2}
      documents={documents}
      handleChangeStep={handleChangeStep}
      refetch={refetch}
    />,
    <DocumentApprovalStepThree key={3} documents={documents} />,
  ];

  return steps[step] || null;
};

export default DocumentApprovalStepHandler;
