import React, {
  useState,
  useContext,
  ChangeEvent,
  forwardRef,
  ForwardRefRenderFunction,
  useImperativeHandle,
  useEffect,
} from 'react';

import { z } from 'zod';
import { Flex } from '@/styles/globals';
import { MdOutlineInfo } from 'react-icons/md';
import { WorkContext } from '@/contexts/WorkContext';

import { Container, InputContainer } from './styles';
import Notification from '@/components/Notification';
import { animateScroll as scroll } from 'react-scroll';

import {
  Box,
  FormControlLabel,
  Typography,
  Checkbox,
  TextField,
  TextareaAutosize,
  List,
  ListItem,
  Autocomplete,
  Select,
  FormControl,
  InputLabel,
  MenuItem,
} from '@mui/material';
import CustomTooltip from '@/components/Tooltip';
import { useRouter } from 'next/router';
import { getAllAdmins } from '@/services/admins';
import { getAllCustomers } from '@/services/customers';

export interface IRefWorkStepSixProps {
  handleSubmitForm: () => void;
}

interface IStepSixProps {
  confirmation: () => void;
}

const WorkStepSix: ForwardRefRenderFunction<IRefWorkStepSixProps, IStepSixProps> = (
  { confirmation },
  ref,
) => {
  const { workForm, setWorkForm } = useContext(WorkContext);

  const [errors, setErrors] = useState({} as any);

  const [message, setMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [type, setType] = useState<'success' | 'error'>('success');

  const arrayPendingDocuments = [
    {
      value: 'rg',
      label: 'Documento de Identidade',
    },
    {
      value: 'proof_of_address',
      label: 'Comprovante de Residência',
    },
    {
      value: 'inss_password',
      label: 'Senha do Meu INSS',
    },
    {
      value: 'medical_documents',
      label: 'Documentos Médicos',
    },
    {
      value: 'rural_documents',
      label: 'Documentos Rurais',
    },
    {
      value: 'copy_of_requirements',
      label: 'Cópia de Requerimento(s)',
    },
  ];
  const [documentsProduced, setDocumentsProduced] = useState<string[]>([]);
  const [pendingDocuments, setPendingDocuments] = useState([] as any);
  const [gradesInGeneral, setGradesInGeneral] = useState<string>('');
  const [otherDocuments, setOtherDocuments] = useState<string>('');
  const [folder, setFolder] = useState('');
  const router = useRouter();
  const [allCustomers, setAllCustomers] = useState([] as any);
  const [filteredProfileCustomers, setFilteredProfileCustomers] = useState([] as any);

  const handleDocumentsProducedSelection = (event: ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = event.target;

    if (checked) {
      setDocumentsProduced(prevSelected => [...prevSelected, value]);
    } else {
      setDocumentsProduced(prevSelected => prevSelected.filter(document => document !== value));
    }
  };

  const handleDocumentsPendingSelection = (customerId: string, document: any) => {
    document.map((doc: any) => {
      const pendingDocument = {
        description: doc.value,
        profile_customer_id: customerId,
      };

      const documentExists = pendingDocuments.some(
        (doc: any) =>
          doc.description === pendingDocument.description && doc.profile_customer_id === customerId,
      );

      if (documentExists) {
        const filteredDocuments = pendingDocuments.filter(
          (doc: any) =>
            doc.description !== pendingDocument.description ||
            doc.profile_customer_id !== customerId,
        );
        setPendingDocuments(filteredDocuments);
      } else {
        setPendingDocuments([...pendingDocuments, pendingDocument] as any);
      }
    });
  };

  const handleSubmitForm = () => {
    try {
      if (documentsProduced.length <= 0) {
        throw new Error('Selecione pelo menos um documento a ser produzido');
      }

      let documentsProducedArray = [] as any;

      workForm.profile_customer_ids.map((profile: any) => {
        documentsProducedArray = documentsProducedArray.concat(
          documentsProduced.map((document: any) => {
            return {
              document_type: document,
              profile_customer_id: profile,
            };
          }),
        );
      });

      let data = {};

      if (router.pathname.includes('alterar')) {
        const transformObjects = documentsProduced.map((document: any) => {
          if (document.id) {
            return {
              id: document.id,
              document_type: document.document_type,
              url: document.url,
            };
          } else {
            if (typeof document === 'string') {
              return {
                document_type: document,
              };
            }
          }
        });

        data = {
          ...workForm,
          documents_attributes: transformObjects,
          pending_documents_attributes: pendingDocuments,
          extra_pending_document: otherDocuments,
          folder: folder,
          note: gradesInGeneral,
        };
      } else {
        data = {
          ...workForm,
          documents_attributes: documentsProducedArray,
          pending_documents_attributes: pendingDocuments,
          extra_pending_document: otherDocuments,
          folder: folder,
          note: gradesInGeneral,
        };
      }

      setWorkForm(data);

      saveDataLocalStorage(data);
      confirmation();
    } catch (err) {
      handleFormError(err);
    }
  };

  const handleFormError = (error: any) => {
    setMessage(error.message);
    setType('error');
    setOpenSnackbar(true);
  };

  const saveDataLocalStorage = (data: any) => {
    localStorage.setItem('WORK/Six', JSON.stringify(data));
  };

  useImperativeHandle(ref, () => ({
    handleSubmitForm,
  }));

  const getCustomers = async () => {
    const response: {
      data: any;
    } = await getAllCustomers();
    setAllCustomers(response.data);
  };

  useEffect(() => {
    getCustomers();
  }, []);

  useEffect(() => {
    const handleDraftWork = () => {
      const draftWork = workForm.draftWork;

      if (draftWork.id) {
        if (draftWork.attributes) {
          const attributes = draftWork.attributes;

          if (attributes.documents) {
            const documents_types = attributes.documents.map(
              (document: any) => document.document_type,
            );

            setDocumentsProduced(documents_types);
          }

          if (attributes.pending_documents) {
            setPendingDocuments(attributes.pending_documents);
          }
        }
      }
    };

    const handleDataForm = () => {
      const attributes = workForm.data.attributes;

      if (attributes) {
        if (attributes.documents) {
          const documents_types = attributes.documents.map((document: any) => document);

          setDocumentsProduced(documents_types);
        }

        if (attributes.extra_pending_document) {
          setOtherDocuments(attributes.extra_pending_document);
        }

        if (attributes.folder) {
          setFolder(attributes.folder);
        }

        if (attributes.note) {
          setGradesInGeneral(attributes.note);
        }

        if (attributes.pending_documents) {
          setPendingDocuments(attributes.pending_documents);
        }
      }
    };

    if (workForm.data) {
      handleDataForm();
    }

    if (workForm.draftWork && workForm.draftWork.id) {
      handleDraftWork();
    }
  }, [workForm]);

  useEffect(() => {
    const verifyDataLocalStorage = async () => {
      const data = localStorage.getItem('WORK/Six');

      if (data) {
        const parsedData = JSON.parse(data);

        if (parsedData.documents_attributes) {
          setDocumentsProduced(parsedData.documents_attributes);
        }

        if (parsedData.extra_pending_document) {
          setOtherDocuments(parsedData.extra_pending_document);
        }

        if (parsedData.folder) {
          setFolder(parsedData.folder);
        }

        if (parsedData.note) {
          setGradesInGeneral(parsedData.note);
        }

        if (parsedData.extra_pending_document) {
          setOtherDocuments(parsedData.extra_pending_document);
        }
      }
    };

    verifyDataLocalStorage();
  }, []);

  useEffect(() => {
    const filteredCustomersArray = workForm.profile_customer_ids.map((profile: any) => {
      return allCustomers.filter((admin: any) => admin.id == profile);
    });

    const filteredCustomers = [].concat(...filteredCustomersArray);

    setFilteredProfileCustomers(filteredCustomers);
  }, [allCustomers, workForm]);

  return (
    <Container>
      {openSnackbar && (
        <Notification
          open={openSnackbar}
          message={message}
          severity={type}
          onClose={() => setOpenSnackbar(false)}
        />
      )}
      <>
        <Flex
          style={{
            marginTop: '16px',
            flexDirection: 'column',
          }}
        >
          <Flex
            style={{
              flexDirection: 'column',
            }}
          >
            {/* Documents Produced */}
            <Box mr={'32px'}>
              <Flex
                style={{
                  marginBottom: '8px',
                  alignItems: 'center',
                }}
              >
                <Flex
                  style={{
                    alignItems: 'center',
                  }}
                >
                  <Typography
                    display={'flex'}
                    alignItems={'center'}
                    variant="h6"
                    style={{ height: '40px' }}
                  >
                    {'Documentos a Serem Produzidos'}
                  </Typography>
                  <CustomTooltip
                    title="Documentos que o ProcStudio irá gerar para você."
                    placement="right"
                  >
                    <span
                      style={{
                        display: 'flex',
                      }}
                    >
                      <MdOutlineInfo style={{ marginLeft: '8px' }} size={20} />
                    </span>
                  </CustomTooltip>
                  {errors.documents_attributes && documentsProduced.length <= 0 && (
                    <label className="flagError">{'*'}</label>
                  )}
                </Flex>
              </Flex>

              <Flex
                style={{
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      value="procuration"
                      checked={
                        documentsProduced.includes('procuration') ||
                        documentsProduced
                          .map((document: any) => document.document_type)
                          .includes('procuration')
                      }
                      onChange={handleDocumentsProducedSelection}
                    />
                  }
                  label="Procuração"
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      value="waiver"
                      checked={
                        documentsProduced.includes('waiver') ||
                        documentsProduced
                          .map((document: any) => document.document_type)
                          .includes('waiver')
                      }
                      onChange={handleDocumentsProducedSelection}
                    />
                  }
                  label="Termo de Renúncia"
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      value="deficiency_statement"
                      checked={
                        documentsProduced.includes('deficiency_statement') ||
                        documentsProduced
                          .map((document: any) => document.document_type)
                          .includes('deficiency_statement')
                      }
                      onChange={handleDocumentsProducedSelection}
                    />
                  }
                  label="Declaração  de Carência"
                  style={{
                    marginRight: '0px',
                  }}
                />
              </Flex>
            </Box>

            <Flex
              style={{
                flexDirection: 'column',
                gap: '40px',
              }}
            >
              {filteredProfileCustomers.map((customer: any) => {
                return (
                  <Flex
                    key={customer.id}
                    style={{
                      flexDirection: 'column',
                    }}
                  >
                    <Flex
                      style={{
                        marginTop: '16px',
                        flexDirection: 'column',
                        marginBottom: '20px',
                      }}
                    >
                      <Typography variant="h6" sx={{ marginBottom: '8px' }}>
                        {`Cliente`}
                      </Typography>

                      <span>{customer.attributes.name}</span>
                    </Flex>

                    <Flex
                      style={{
                        gap: '20px',
                      }}
                    >
                      <Box flexDirection={'column'} width={'50%'}>
                        <Typography variant="h6" sx={{ marginBottom: '8px' }}>
                          {'Documentos Pendentes'}
                        </Typography>

                        <Autocomplete
                          multiple
                          id="multiple-limit-tags"
                          options={arrayPendingDocuments}
                          getOptionLabel={option => option.label}
                          filterSelectedOptions
                          value={pendingDocuments
                            .filter((doc: any) => doc.profile_customer_id == customer.id)
                            .map((doc: any) => {
                              return arrayPendingDocuments.find(
                                (document: any) => document.value === doc.description,
                              );
                            })}
                          onChange={(event: any, newValue: any) => {
                            handleDocumentsPendingSelection(customer.id, newValue);
                          }}
                          renderInput={params => (
                            <TextField
                              placeholder="Selecione um ou mais documentos pendentes"
                              {...params}
                              size="small"
                              variant="outlined"
                            />
                          )}
                          noOptionsText="Nenhum documento pendente"
                          sx={{
                            '& .MuiAutocomplete-tag': {
                              height: '22px',
                              fontSize: '12px',
                            },
                          }}
                        />
                      </Box>

                      <Box flexDirection={'column'} width={'50%'}>
                        <Typography variant="h6" sx={{ marginBottom: '8px' }}>
                          {'Outros Documentos Pendentes ou Pendências'}
                        </Typography>
                        <InputContainer>
                          <TextField
                            label="Documento ou Pendência"
                            id="outlined-basic"
                            autoComplete="off"
                            variant="outlined"
                            size="small"
                            style={{ width: '100%' }}
                            onChange={e => setOtherDocuments(e.target.value)}
                            value={otherDocuments}
                          />
                        </InputContainer>
                      </Box>
                    </Flex>

                    {/* Other Documents */}
                    <Box mt={'16px'} display={'flex'} gap={'20px'}>
                      <Box flexDirection={'column'} flex={1}>
                        <Flex style={{ flexDirection: 'column' }}>
                          <Flex
                            style={{
                              alignItems: 'center',
                            }}
                          >
                            <Typography display={'flex'} alignItems={'center'} variant="h6">
                              {'Pasta'}
                            </Typography>
                            <CustomTooltip title="Pasta do Cliente." placement="right">
                              <span
                                style={{
                                  display: 'flex',
                                }}
                              >
                                <MdOutlineInfo style={{ marginLeft: '8px' }} size={20} />
                              </span>
                            </CustomTooltip>
                          </Flex>

                          <InputContainer>
                            <TextField
                              label="Nome da Pasta"
                              id="outlined-basic"
                              autoComplete="off"
                              variant="outlined"
                              size="small"
                              style={{ width: '100%' }}
                              onChange={e => setFolder(e.target.value)}
                              value={folder}
                            />
                          </InputContainer>
                        </Flex>
                      </Box>

                      <Box flex={1}>
                        <Flex
                          style={{
                            alignItems: 'center',
                          }}
                        >
                          <Typography display={'flex'} alignItems={'center'} variant="h6">
                            {'Notas em Geral Sobre o Caso'}
                          </Typography>
                          <CustomTooltip
                            title="Notas, entrevista com o cliente e informações úteis para o desenvolvimento do caso para a equipe."
                            placement="right"
                          >
                            <span
                              style={{
                                display: 'flex',
                              }}
                            >
                              <MdOutlineInfo style={{ marginLeft: '8px' }} size={20} />
                            </span>
                          </CustomTooltip>
                        </Flex>

                        <TextareaAutosize
                          style={{
                            width: '100%',
                            height: '40px',
                            resize: 'none',
                            padding: '4px',
                            font: 'inherit',
                            borderRadius: '4px',
                            border: '1px solid #c5c5c5',
                          }}
                          value={gradesInGeneral}
                          onChange={e => setGradesInGeneral(e.target.value)}
                          className="comment-input"
                        />
                      </Box>
                    </Box>
                  </Flex>
                );
              })}
            </Flex>
          </Flex>
        </Flex>
      </>
    </Container>
  );
};

export default forwardRef(WorkStepSix);
