import { Dispatch, SetStateAction } from 'react';
import { IDocumentApprovalProps } from '../../../interfaces/IDocument';
import DocumentApprovalStepTwo from '../Steps/Two';
import DocumentApprovalStepOne from '../Steps/One';

interface DocumentApprovalStepHandlerProps {
  step: number;
  handleNextStep: () => void;
  documents: IDocumentApprovalProps[];
  setDocuments: Dispatch<SetStateAction<IDocumentApprovalProps[]>>;
}

const DocumentApprovalStepHandler: React.FunctionComponent<DocumentApprovalStepHandlerProps> = ({
  step,
  documents,
  setDocuments,
  handleNextStep,
}) => {
  const steps = [
    <DocumentApprovalStepOne
      documents={documents}
      setDocuments={setDocuments}
      handleNextStep={handleNextStep}
    />,
    <DocumentApprovalStepTwo
      documents={documents}
      setDocuments={setDocuments}
      handleNextStep={handleNextStep}
    />,
  ];
  return steps[step] || null;
};

export default DocumentApprovalStepHandler;
