import React, { useState, useRef, useContext, useEffect } from 'react';
import { animateScroll as scroll } from 'react-scroll';
import Router, { useRouter } from 'next/router';

import { PageTitleContext } from '@/contexts/PageTitleContext';
import { CustomerContext } from '@/contexts/CustomerContext';
import { WorkContext } from '@/contexts/WorkContext';

import {
  createProfileCustomer,
  createCustomer as createCustomerApi,
  updateProfileCustomer,
} from '@/services/customers';
import { createDraftWork, createWork, updateWork } from '@/services/works';

import { DescriptionText, ContentContainer, PageTitle } from '@/styles/globals';
import { Container, Content } from './styles';

import { Box, Stepper, Step, StepLabel, Button } from '@mui/material';
import { Notification, ConfirmCreation } from '@/components';

import PFCustomerStepOne, { IRefPFCustomerStepOneProps } from './customer/PF/one';
import PFCustomerStepTwo, { IRefPFCustomerStepTwoProps } from './customer/PF/two';
import PFCustomerStepThree, { IRefPFCustomerStepThreeProps } from './customer/PF/three';
import PFCustomerStepFour, { IRefPFCustomerStepFourProps } from './customer/PF/four';
import PFCustomerStepFive, { IRefPFCustomerStepFiveProps } from './customer/PF/five';
import PFCustomerStepSix, { IRefPFCustomerStepSixProps } from './customer/PF/six';

import PJCustomerStepOne, { IRefPJCustomerStepOneProps } from './customer/PJ/one';
import PJCustomerStepTwo, { IRefPJCustomerStepTwoProps } from './customer/PJ/two';
import PJCustomerStepThree, { IRefPJCustomerStepThreeProps } from './customer/PJ/three';
import PJCustomerStepFour, { IRefPJCustomerStepFourProps } from './customer/PJ/four';

import WorkStepOne, { IRefWorkStepOneProps } from './work/one';
import WorkStepTwo, { IRefWorkStepTwoProps } from './work/two';
import WorkStepThree, { IRefWorkStepThreeProps } from './work/three';
import WorkStepFour, { IRefWorkStepFourProps } from './work/four';
import WorkStepFive, { IRefWorkStepFiveProps } from './work/five';
import WorkStepSix, { IRefWorkStepSixProps } from './work/six';
import ConfirmDownloadDocument from '../ConfirmDownloadDocument';

interface IRegistrationProps {
  registrationType: string;
  titleSteps: string[];
}

const RegistrationScreen = ({ registrationType, titleSteps }: IRegistrationProps) => {
  const PFcustomerStepOneRef = useRef<IRefPFCustomerStepOneProps>(null);
  const PFcustomerStepTwoRef = useRef<IRefPFCustomerStepTwoProps>(null);
  const PFcustomerStepThreeRef = useRef<IRefPFCustomerStepThreeProps>(null);
  const PFcustomerStepFourRef = useRef<IRefPFCustomerStepFourProps>(null);
  const PFcustomerStepFiveRef = useRef<IRefPFCustomerStepFiveProps>(null);
  const PFcustomerStepSixRef = useRef<IRefPFCustomerStepSixProps>(null);

  const PJcustomerStepOneRef = useRef<IRefPJCustomerStepOneProps>(null);
  const PJcustomerStepTwoRef = useRef<IRefPJCustomerStepTwoProps>(null);
  const PJcustomerStepThreeRef = useRef<IRefPJCustomerStepThreeProps>(null);
  const PJcustomerStepFourRef = useRef<IRefPJCustomerStepFourProps>(null);

  const workStepOneRef = useRef<IRefWorkStepOneProps>(null);
  const workStepTwoRef = useRef<IRefWorkStepTwoProps>(null);
  const workStepThreeRef = useRef<IRefWorkStepThreeProps>(null);
  const workStepFourRef = useRef<IRefWorkStepFourProps>(null);
  const workStepFiveRef = useRef<IRefWorkStepFiveProps>(null);
  const workStepSixRef = useRef<IRefWorkStepSixProps>(null);

  const { workForm, setWorkForm } = useContext(WorkContext);
  const { customerForm, setCustomerForm } = useContext(CustomerContext);
  const { showTitle, setShowTitle, pageTitle } = useContext(PageTitleContext);

  const route = useRouter();

  const [activeStep, setActiveStep] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [finished, setFinished] = useState(false);
  const pageRef = useRef<HTMLDivElement | null>(null);
  const [skipped, setSkipped] = useState(new Set<number>());

  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [openDownloadModal, setOpenDownloadModal] = useState(false);
  const [urlsDocuments, setUrlsDocuments] = useState([]);
  const [loading, setLoading] = useState(false);

  const [isEditing, setIsEditing] = useState(false);

  const [message, setMessage] = useState('');
  const [typeMessage, setTypeMessage] = useState<'success' | 'error'>('success');
  const router = useRouter();

  const handleCloseModal = () => {
    setOpenModal(false);
    setFinished(false);
  };

  const handleSubmit = async () => {
    switch (registrationType) {
      case 'cliente/pessoa_fisica':
        try {
          if (PFcustomerStepSixRef.current) {
            PFcustomerStepSixRef.current.handleSubmitForm();
          }
        } catch (error: any) {
          setMessage(error.message);
          setTypeMessage('error');
          setOpenSnackbar(true);
        }
        break;
      case 'cliente/pessoa_juridica':
        try {
          if (PJcustomerStepFourRef.current) {
            PJcustomerStepFourRef.current.handleSubmitForm();
          }
        } catch (error: any) {
          setMessage(error.message);
          setTypeMessage('error');
          setOpenSnackbar(true);
        }
        break;
      case 'trabalho':
        try {
          if (workStepSixRef.current) {
            workStepSixRef.current.handleSubmitForm();
          }
        } catch (error: any) {
          setMessage(error.message);
          setTypeMessage('error');
          setOpenSnackbar(true);
        }
        break;
    }
  };

  const createCustomer = async (data: any) => {
    const response = await createCustomerApi(data);

    return response;
  };

  const completeRegistration = async (title: string) => {
    if (registrationType.search('liente') !== -1) {
      try {
        if (route.asPath.includes('alterar')) {
          const id = router.query.id as string;
          if (id) {
            const res = await updateProfileCustomer(id, customerForm.data.attributes);

            const url = res.data.attributes.customer_files;

            if (url && url.length > 0) {
              setUrlsDocuments(url);

              setOpenModal(false);

              setOpenDownloadModal(true);
            } else {
              setOpenModal(false);

              router.push('/clientes');
            }

            setCustomerForm({});
            return;
          }
        }

        const userEmail = customerForm.emails_attributes[0].email;
        const customerData = {
          customer: {
            email: userEmail,
          },
        };

        const customer = await createCustomer(customerData);

        if (!customer.data.attributes.email) {
          throw new Error('E-mail já está em uso !');
        }

        customerForm.customer_id = customer.data.id;

        const res = await createProfileCustomer(customerForm);

        const url = res.data.attributes.customer_files;

        if (url && url.length > 0) {
          setUrlsDocuments(url);

          setOpenModal(false);

          setOpenDownloadModal(true);
        } else {
          setOpenModal(false);

          router.push('/clientes');
        }

        return;
      } catch (error: any) {
        const message = error.request.response ? JSON.parse(error.request.response).errors[0] : '';
        setMessage(message.code);
        setTypeMessage('error');
        setOpenSnackbar(true);
      }
    } else if (registrationType.search('trabalho') !== -1) {
      try {
        if (route.asPath.includes('alterar')) {
          const id: any = router.query.id;
          const res = await updateWork(id, workForm);

          if (title != '') {
            const draftWork = {
              draft_work: {
                name: title,
                work_id: res.data.id,
              },
            };

            const responseDraft = await createDraftWork(draftWork);
          }

          const url = res.data.attributes.documents;

          if (url) {
            setUrlsDocuments(url);

            setOpenModal(false);

            setOpenDownloadModal(true);
          }

          return;
        }

        const work = await createWork(workForm);

        if (title != '') {
          const draftWork = {
            draft_work: {
              name: title,
              work_id: work.data.id,
            },
          };

          const responseDraft = await createDraftWork(draftWork);
        }

        const url = work.data.attributes.documents;

        if (url) {
          setUrlsDocuments(url);

          setOpenModal(false);

          setOpenDownloadModal(true);
        }

        return;
      } catch (error: any) {
        const errorMessages = error?.response.data.errors || [];
        errorMessages.forEach((message: { code: string }) => {
          if (message.code) {
            setMessage(message.code);
            setTypeMessage('error');
            setOpenSnackbar(true);
          } else {
            setMessage('Erro ao criar trabalho');
            setTypeMessage('error');
            setOpenSnackbar(true);
          }
        });
      }
    }
  };

  const handleSave = async (title: string) => {
    try {
      setLoading(true);
      await completeRegistration(title);
      setFinished(true);
    } catch (error: any) {
      setMessage(error.message);
      setTypeMessage('error');
      setOpenSnackbar(true);
    }
    setLoading(false);
  };

  const isStepSkipped = (step: number): boolean => {
    return skipped.has(step);
  };

  const scrollToTop = () => {
    scroll.scrollToTop({
      duration: 500,
      smooth: 'easeInOutQuart',
    });
  };

  const handleNext = () => {
    let newSkipped = skipped;

    setActiveStep(activeStep + 1);

    if (isStepSkipped(currentStep)) {
      newSkipped = new Set<number>(newSkipped.values());
      newSkipped.delete(currentStep);
    }

    setCurrentStep(prevActiveStep => prevActiveStep + 1);
    setSkipped(newSkipped);
    scrollToTop();
  };

  const handleBack = () => {
    setCurrentStep(prevActiveStep => prevActiveStep - 1);
    scrollToTop();
  };

  const getStepWidth = (): string => {
    const width = titleSteps.length > 4 ? 500 : 350;
    const maxWidth = width / titleSteps.length;
    const currentWidth = (activeStep / (titleSteps.length - 1)) * maxWidth;
    return `${currentWidth}%`;
  };

  const handlePreviousStep = () => {
    setActiveStep(activeStep - 1);
    handleBack();
  };

  const handleNextStep = () => {
    const PFcustomerStepRefs = [
      PFcustomerStepOneRef,
      PFcustomerStepTwoRef,
      PFcustomerStepThreeRef,
      PFcustomerStepFourRef,
      PFcustomerStepFiveRef,
    ];

    const PJcustomerStepRefs = [
      PJcustomerStepOneRef,
      PJcustomerStepTwoRef,
      PJcustomerStepThreeRef,
      PJcustomerStepFourRef,
    ];

    const workStepRefs = [
      workStepOneRef,
      workStepTwoRef,
      workStepThreeRef,
      workStepFourRef,
      workStepFiveRef,
    ];

    const currentPFCustomerStepRef = PFcustomerStepRefs[activeStep];
    const currentPJCustomerStepRef = PJcustomerStepRefs[activeStep];
    const currentWorkStepRef = workStepRefs[activeStep];

    switch (registrationType) {
      case 'cliente/pessoa_fisica':
        if (currentPFCustomerStepRef && currentPFCustomerStepRef.current) {
          currentPFCustomerStepRef.current.handleSubmitForm();
        }
        break;
      case 'cliente/pessoa_juridica':
        if (currentPJCustomerStepRef && currentPJCustomerStepRef.current) {
          currentPJCustomerStepRef.current.handleSubmitForm();
        }
        break;
      case 'trabalho':
        if (currentWorkStepRef && currentWorkStepRef.current) {
          currentWorkStepRef.current.handleSubmitForm();
        }
        break;
    }
  };

  const handleStepClick = (index: number) => {
    if (index < activeStep) {
      if (finished) {
        setCurrentStep(index);
        return;
      }
      setActiveStep(index);
      setCurrentStep(index);
      scrollToTop();
    }
  };

  useEffect(() => {
    const updateScrollPosition = () => {
      if (window.scrollY >= 49) {
        setShowTitle(true);
      } else if (window.scrollY <= 32) {
        setShowTitle(false);
      }
    };

    window.addEventListener('scroll', updateScrollPosition);

    return () => {
      window.removeEventListener('scroll', updateScrollPosition);
    };
  }, []);

  useEffect(() => {
    if (router.asPath.includes('alterar')) {
      setIsEditing(true);
    } else {
      setIsEditing(false);
    }
  }, [router.asPath]);

  return (
    <>
      {openModal && (
        <ConfirmCreation
          isLoading={loading}
          isOpen={openModal}
          editMode={isEditing}
          onClose={handleCloseModal}
          handleSave={handleSave}
        />
      )}

      {openDownloadModal && (
        <ConfirmDownloadDocument
          isOpen={openDownloadModal}
          onClose={() => setOpenDownloadModal(false)}
          documents={urlsDocuments}
        />
      )}

      {openSnackbar && (
        <Notification
          open={openSnackbar}
          message={message}
          severity={typeMessage}
          onClose={() => setOpenSnackbar(false)}
        />
      )}

      <Container ref={pageRef}>
        <Box
          display={'flex'}
          alignItems={'center'}
          justifyContent={'space-between'}
          sx={{
            maxWidth: '1600px',
          }}
        >
          <PageTitle showTitle={showTitle}>{`${pageTitle}`}</PageTitle>
        </Box>

        <ContentContainer>
          <Box sx={{ width: '100%' }}>
            <Stepper activeStep={activeStep}>
              {titleSteps.map((label, index) => {
                const stepProps: any = {};
                const labelProps: any = {};

                if (isStepSkipped(index)) {
                  stepProps.completed = false;
                }

                return (
                  <Step
                    key={label}
                    {...stepProps}
                    onClick={() => {
                      handleStepClick(index);
                    }}
                  >
                    <StepLabel
                      {...labelProps}
                      StepIconProps={{
                        style: {
                          color:
                            activeStep > index
                              ? '#26B99A'
                              : activeStep === index
                              ? '#2A3F54'
                              : '#A8A8B3',
                          cursor: 'pointer',
                        },
                      }}
                    >
                      <DescriptionText
                        style={{
                          color:
                            activeStep > index
                              ? '#26B99A'
                              : activeStep === index
                              ? '#2A3F54'
                              : '#A8A8B3',
                          cursor: 'pointer',
                        }}
                      >
                        {label}
                      </DescriptionText>
                    </StepLabel>
                  </Step>
                );
              })}
            </Stepper>

            <Box
              sx={{
                width: '100% !important',
                height: '2px',
                backgroundColor: '#2A3F54',
                marginTop: '24px',
              }}
            >
              <Box
                sx={{
                  width: getStepWidth(),
                  height: '100%',
                  maxWidth: '100%',
                  backgroundColor: '#26B99A',
                  transition: 'width 0.3s ease-in-out',
                }}
              />
            </Box>

            <Content>
              {registrationType === 'cliente/pessoa_fisica' && (
                <>
                  {currentStep === 0 && (
                    <PFCustomerStepOne
                      editMode={isEditing}
                      ref={PFcustomerStepOneRef}
                      nextStep={handleNext}
                    />
                  )}

                  {currentStep === 1 && (
                    <PFCustomerStepTwo
                      editMode={isEditing}
                      ref={PFcustomerStepTwoRef}
                      nextStep={handleNext}
                    />
                  )}

                  {currentStep === 2 && (
                    <PFCustomerStepThree
                      editMode={isEditing}
                      ref={PFcustomerStepThreeRef}
                      nextStep={handleNext}
                    />
                  )}

                  {currentStep === 3 && (
                    <PFCustomerStepFour
                      editMode={isEditing}
                      ref={PFcustomerStepFourRef}
                      nextStep={handleNext}
                    />
                  )}

                  {currentStep === 4 && (
                    <PFCustomerStepFive
                      editMode={isEditing}
                      ref={PFcustomerStepFiveRef}
                      nextStep={handleNext}
                    />
                  )}

                  {currentStep === 5 && (
                    <PFCustomerStepSix
                      editMode={isEditing}
                      ref={PFcustomerStepSixRef}
                      confirmation={() => {
                        if (activeStep === 5) {
                          setFinished(true);
                          setOpenModal(true);
                          scrollToTop();
                          return;
                        }
                      }}
                    />
                  )}
                </>
              )}

              {registrationType === 'cliente/pessoa_juridica' && (
                <>
                  {currentStep === 0 && (
                    <PJCustomerStepOne
                      editMode={isEditing}
                      ref={PJcustomerStepOneRef}
                      nextStep={handleNext}
                    />
                  )}

                  {currentStep === 1 && (
                    <PJCustomerStepTwo
                      editMode={isEditing}
                      ref={PJcustomerStepTwoRef}
                      nextStep={handleNext}
                    />
                  )}

                  {currentStep === 2 && (
                    <PJCustomerStepThree
                      editMode={isEditing}
                      ref={PJcustomerStepThreeRef}
                      nextStep={handleNext}
                    />
                  )}

                  {currentStep === 3 && (
                    <PJCustomerStepFour
                      editMode={isEditing}
                      ref={PJcustomerStepFourRef}
                      confirmation={() => {
                        if (activeStep === 3) {
                          setFinished(true);
                          setOpenModal(true);
                          scrollToTop();
                          return;
                        }
                      }}
                    />
                  )}
                </>
              )}

              {registrationType === 'trabalho' && (
                <>
                  {currentStep === 0 && <WorkStepOne ref={workStepOneRef} nextStep={handleNext} />}

                  {currentStep === 1 && <WorkStepTwo ref={workStepTwoRef} nextStep={handleNext} />}

                  {currentStep === 2 && (
                    <WorkStepThree ref={workStepThreeRef} nextStep={handleNext} />
                  )}

                  {currentStep === 3 && (
                    <WorkStepFour ref={workStepFourRef} nextStep={handleNext} />
                  )}

                  {currentStep === 4 && (
                    <WorkStepFive ref={workStepFiveRef} nextStep={handleNext} />
                  )}

                  {/* {session?.role != 'counter' && currentStep === 2 && (
                    <WorkStepThree ref={workStepThreeRef} nextStep={handleNext} />
                  )}

                  {session?.role != 'counter' && currentStep === 3 && (
                    <WorkStepFour ref={workStepFourRef} nextStep={handleNext} />
                  )}

                  {session?.role != 'counter' && currentStep === 4 && (
                    <WorkStepFive ref={workStepFiveRef} nextStep={handleNext} />
                  )} */}

                  {currentStep === 5 && (
                    <WorkStepSix
                      ref={workStepSixRef}
                      confirmation={() => {
                        if (activeStep === 5) {
                          setFinished(true);
                          setOpenModal(true);
                          scrollToTop();
                          return;
                        }
                      }}
                    />
                  )}
                </>
              )}

              <Box className="buttonContainer">
                <Button
                  disabled={finished}
                  variant="outlined"
                  onClick={() => {
                    router.asPath.includes('cliente')
                      ? Router.push('/clientes')
                      : Router.push('/trabalhos');
                  }}
                  sx={{
                    width: '100px',
                    height: '36px',
                    textTransform: 'none',
                  }}
                  color="primary"
                  tabIndex={-1}
                >
                  {'Cancelar'}
                </Button>
                {currentStep !== 0 && (
                  <Button
                    disabled={finished}
                    variant="contained"
                    sx={{
                      width: '100px',
                      height: '36px',
                      marginLeft: '16px',
                      textTransform: 'none',
                    }}
                    color="primary"
                    tabIndex={-1}
                    onClick={handlePreviousStep}
                  >
                    {'Voltar'}
                  </Button>
                )}
                {currentStep < titleSteps.length - 1 && (
                  <Button
                    variant="contained"
                    sx={{
                      width: '100px',
                      height: '36px',
                      marginLeft: '32px',
                      color: '#FFFFFF',
                      textTransform: 'none',
                    }}
                    color="secondary"
                    onClick={handleNextStep}
                  >
                    {'Próximo'}
                  </Button>
                )}
                {currentStep >= titleSteps.length - 1 && (
                  <Button
                    variant="contained"
                    sx={{
                      width: '100px',
                      height: '36px',
                      marginLeft: '32px',
                      textTransform: 'none',
                      color: '#FFFFFF',
                    }}
                    color="secondary"
                    onClick={handleSubmit}
                  >
                    {'Finalizar'}
                  </Button>
                )}
              </Box>
            </Content>
          </Box>
        </ContentContainer>
      </Container>
    </>
  );
};

export default RegistrationScreen;
