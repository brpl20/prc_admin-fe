import { Box, Button, IconButton, Typography } from '@mui/material';
import { IDocumentApprovalProps, IDocumentRevisionProps } from '../../../../interfaces/IDocument';
import { DataGrid } from '@mui/x-data-grid';
import { documentTypeToReadable } from '../../../../utils/constants';
import { TbDownload, TbUpload } from 'react-icons/tb';
import { colors, ContentContainer } from '../../../../styles/globals';
import downloadFileByUrl from '../../../../utils/downloadFileByUrl';
import { useModal } from '../../../../utils/useModal';
import GenericModal from '../../../Modals/GenericModal';
import { Dispatch, SetStateAction, useState } from 'react';
import { ContainerDetails, DetailsWrapper } from '../../../Details/styles';
import { GrDocumentText } from 'react-icons/gr';
import DocumentApprovalStepper from '../../DocumentApprovalStepper';

interface DocumentApprovalStepTwoProps {
  documents: IDocumentApprovalProps[];
  setDocuments: Dispatch<SetStateAction<IDocumentApprovalProps[]>>;
  handleNextStep: () => void;
}

const DocumentApprovalStepTwo: React.FC<DocumentApprovalStepTwoProps> = ({
  documents,
  setDocuments,
  handleNextStep,
}) => {
  return (
    <>
      <DetailsWrapper
        style={{
          marginTop: 32,
          borderBottom: '1px solid #C0C0C0',
          backgroundColor: '#fff',
          boxShadow: '0px 2px 2px rgba(0, 0, 0, 0.25)',
        }}
      >
        <ContainerDetails
          style={{
            gap: '18px',
          }}
        >
          <>
            <div
              className="flex bg-white"
              style={{
                padding: '20px 32px 20px 32px',
                borderBottom: '1px solid #C0C0C0',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div className="flex items-center gap-2">
                <GrDocumentText size={22} color="#344054" />

                <div className="w-[2px] bg-gray-300 h-8" />

                <span
                  style={{
                    fontSize: '22px',
                    fontWeight: '500',
                    color: '#344054',
                  }}
                >
                  Documentação
                </span>
              </div>
            </div>
          </>
        </ContainerDetails>
        <ContentContainer>
          <DocumentApprovalStepper currentStep={1} />
          {'teste'}
        </ContentContainer>
      </DetailsWrapper>
    </>
  );
};

export default DocumentApprovalStepTwo;
