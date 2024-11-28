import { Box, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup } from '@mui/material';
import { IDocumentApprovalProps } from '../../../../interfaces/IDocument';
import { colors, ContentContainer } from '../../../../styles/globals';
import { Dispatch, SetStateAction, useState } from 'react';
import { ContainerDetails, DetailsWrapper } from '../../../Details/styles';
import { GrDocumentText } from 'react-icons/gr';
import DocumentApprovalStepper from '../../DocumentApprovalStepper';
import DigitalSignature from './DigitalSignature';
import TraditionalSignature from './TraditionalSignature';
import { SignatureType } from '../../../../types/signature';

interface DocumentApprovalStepTwoProps {
  documents: IDocumentApprovalProps[];
  handleChangeStep: (action: 'previous' | 'next' | 'set', step?: number) => void;
}

const DocumentApprovalStepTwo: React.FC<DocumentApprovalStepTwoProps> = ({
  documents,
  handleChangeStep,
}) => {
  const [signatureType, setSignatureType] = useState<SignatureType>('');
  const [showRadioButtons, setShowRadioButtons] = useState(false);

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

          {showRadioButtons && (
            <FormControl className="mt-3">
              <FormLabel
                className="font-bold"
                sx={{ color: colors.black }}
                id="signature-radio-buttons-group-label"
              >
                Selecione o tipo de assinatura:
              </FormLabel>
              <RadioGroup
                aria-labelledby="signature-radio-buttons-group-label"
                className="flex flex-row"
                onChange={e => setSignatureType(e.target.value as SignatureType)}
                value={signatureType}
              >
                <FormControlLabel value="digital" control={<Radio />} label="Assinatura digital" />
                <FormControlLabel
                  value="traditional"
                  control={<Radio />}
                  label="Assinatura tradicional"
                />
              </RadioGroup>
            </FormControl>
          )}

          {signatureType && (
            <SignatureContentHandler
              documents={documents}
              signatureType={signatureType}
              handleChangeStep={handleChangeStep}
              setSignatureType={setSignatureType}
              setShowRadioButtons={setShowRadioButtons}
            />
          )}
        </ContentContainer>
      </DetailsWrapper>
    </>
  );
};

interface SignatureContentHandlerProps {
  signatureType: SignatureType;
  documents: IDocumentApprovalProps[];
  handleChangeStep: (action: 'previous' | 'next' | 'set', step?: number) => void;
  setSignatureType: Dispatch<SetStateAction<SignatureType>>;
  setShowRadioButtons: Dispatch<SetStateAction<boolean>>;
}

const SignatureContentHandler: React.FunctionComponent<SignatureContentHandlerProps> = ({
  signatureType,
  documents,
  handleChangeStep,
  setSignatureType,
  setShowRadioButtons,
}) => {
  return (
    <Box className="mt-5">
      {signatureType === 'digital' ? (
        <DigitalSignature
          documents={documents}
          handleChangeStep={handleChangeStep}
          setSignatureType={setSignatureType}
          setShowRadioButtons={setShowRadioButtons}
        />
      ) : (
        <TraditionalSignature documents={documents} />
      )}
    </Box>
  );
};

export default DocumentApprovalStepTwo;
