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
}

const DocumentApprovalStepHandler: React.FunctionComponent<DocumentApprovalStepHandlerProps> = ({
  step,
  documents,
  setDocuments,
  handleChangeStep,
}) => {
  const steps = [
    <DocumentApprovalStepOne
      documents={documents}
      setDocuments={setDocuments}
      handleChangeStep={handleChangeStep}
    />,
    <DocumentApprovalStepTwo documents={documents} handleChangeStep={handleChangeStep} />,
    <DocumentApprovalStepThree documents={documents} />,
  ];
  return steps[step] || null;
};

export default DocumentApprovalStepHandler;
