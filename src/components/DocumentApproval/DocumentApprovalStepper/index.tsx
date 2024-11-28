import { Box, Step, StepLabel, Stepper } from '@mui/material';
import { documentApprovalSteps } from '../../../utils/constants';
import { DescriptionText } from '../../../styles/globals';

interface DocumentApprovalStepperProps {
  currentStep: number;
}

const DocumentApprovalStepper: React.FunctionComponent<DocumentApprovalStepperProps> = ({
  currentStep,
}) => {
  return (
    <Box>
      <Stepper activeStep={currentStep} sx={{ maxWidth: '50%' }}>
        {documentApprovalSteps.map((label: string, index: number) => (
          <Step key={label}>
            <StepLabel
              StepIconProps={{
                style: {
                  color:
                    currentStep > index ? '#26B99A' : currentStep === index ? '#01013D' : '#A8A8B3',
                  cursor: 'pointer',
                },
              }}
            >
              <DescriptionText
                style={{
                  color:
                    currentStep > index ? '#26B99A' : currentStep === index ? '#01013D' : '#A8A8B3',
                  cursor: 'pointer',
                }}
              >
                {label}
              </DescriptionText>
            </StepLabel>
          </Step>
        ))}
      </Stepper>
      <Box
        sx={{
          width: '100% !important',
          height: '2px',
          backgroundColor: '#01013D',
          marginTop: '24px',
        }}
      ></Box>
    </Box>
  );
};

export default DocumentApprovalStepper;
