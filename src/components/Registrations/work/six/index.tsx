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
} from '@mui/material';
import CustomTooltip from '@/components/Tooltip';
import { useRouter } from 'next/router';

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

  const [documentsProduced, setDocumentsProduced] = useState<string[]>([]);
  const [pendingDocuments, setPendingDocuments] = useState<string[]>([]);
  const [gradesInGeneral, setGradesInGeneral] = useState<string>('');
  const [otherDocuments, setOtherDocuments] = useState<string>('');
  const [folder, setFolder] = useState('');
  const router = useRouter();

  const handleDocumentsProducedSelection = (event: ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = event.target;

    if (checked) {
      setDocumentsProduced(prevSelected => [...prevSelected, value]);
    } else {
      setDocumentsProduced(prevSelected => prevSelected.filter(document => document !== value));
    }
  };

  const handleDocumentsPendingSelection = (event: ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = event.target;

    if (checked) {
      setPendingDocuments(prevSelected => [...prevSelected, value]);
    } else {
      setPendingDocuments(prevSelected => prevSelected.filter(document => document !== value));
    }
  };

  const handleSubmitForm = () => {
    try {
      if (documentsProduced.length <= 0) {
        throw new Error('Selecione pelo menos um documento a ser produzido');
      }

      const transformObjects = documentsProduced.map(document => ({
        document_type: document,
      }));

      let data = {};

      if (router.pathname.includes('alterar')) {
        const transformObjects = documentsProduced.map(document => ({
          document_type: document,
        }));

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
          documents_attributes: transformObjects,
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

  useEffect(() => {
    const handleDataForm = () => {
      const attributes = workForm.data.attributes;

      if (attributes) {
        if (attributes.documents) {
          const documents_types = attributes.documents.map((document: any) => document);

          const uniqueDocuments = documents_types.filter(
            (document: any, index: number, self: any) =>
              index === self.findIndex((t: any) => t.document_type === document.document_type),
          );

          setDocumentsProduced(uniqueDocuments.map((document: any) => document.document_type));
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
      }
    };

    if (workForm.data) {
      handleDataForm();
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
          <Flex>
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
                {/* 
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
                /> */}

                <FormControlLabel
                  control={
                    <Checkbox
                      value="termOfResidence"
                      checked={
                        documentsProduced.includes('termOfResidence') ||
                        documentsProduced
                          .map((document: any) => document.document_type)
                          .includes('termOfResidence')
                      }
                      onChange={handleDocumentsProducedSelection}
                    />
                  }
                  label="Termo de Residência"
                  style={{
                    marginRight: '0px',
                  }}
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      value="ruralDeclaration"
                      checked={
                        documentsProduced.includes('ruralDeclaration') ||
                        documentsProduced
                          .map((document: any) => document.document_type)
                          .includes('ruralDeclaration')
                      }
                      onChange={handleDocumentsProducedSelection}
                    />
                  }
                  label="Declaração Rural"
                  style={{
                    marginRight: '0px',
                  }}
                />
              </Flex>
            </Box>

            {/* Pending Documents */}
            <Box>
              <Flex
                style={{
                  marginBottom: '8px',
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
                    {'Documentos Pendentes'}
                  </Typography>
                  <CustomTooltip
                    title="Lista de documentos que o cliente deve fornecer ao escritório. Fique atento e notifique o cliente caso estes documentos não sejam entregues ao escritório."
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

                  {errors.pending_documents_attributes && pendingDocuments.length <= 0 && (
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
                      value="identityDocument"
                      checked={pendingDocuments.includes('identityDocument')}
                      onChange={handleDocumentsPendingSelection}
                    />
                  }
                  label="Documento de Identidade"
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      value="proofOfAddress"
                      checked={pendingDocuments.includes('proofOfAddress')}
                      onChange={handleDocumentsPendingSelection}
                    />
                  }
                  label="Comprovante de Residência"
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      value="myINSSPassword"
                      checked={pendingDocuments.includes('myINSSPassword')}
                      onChange={handleDocumentsPendingSelection}
                    />
                  }
                  label="Senha do Meu INSS"
                  style={{
                    marginRight: '0px',
                  }}
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      value="medicalDocuments"
                      checked={pendingDocuments.includes('medicalDocuments')}
                      onChange={handleDocumentsPendingSelection}
                    />
                  }
                  label="Documentos Médicos"
                  style={{
                    marginRight: '0px',
                  }}
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      value="ruralDocuments"
                      checked={pendingDocuments.includes('ruralDocuments')}
                      onChange={handleDocumentsPendingSelection}
                    />
                  }
                  label="Documentos Rurais"
                  style={{
                    marginRight: '0px',
                  }}
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      value="copyOfApplication"
                      checked={pendingDocuments.includes('copyOfApplication')}
                      onChange={handleDocumentsPendingSelection}
                    />
                  }
                  label="Cópia de Requerimento(s)"
                  style={{
                    marginRight: '0px',
                  }}
                />
              </Flex>
            </Box>
          </Flex>
        </Flex>
      </>
      {/* Other Documents */}
      <Box mt={'16px'} display={'flex'} justifyContent={'space-between'} gap={'16px'}>
        <Box flexDirection={'column'} flex={1}>
          <Box flexDirection={'column'}>
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

          <Flex style={{ marginTop: '16px', flexDirection: 'column' }}>
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
            <Typography
              display={'flex'}
              alignItems={'center'}
              variant="h6"
              style={{ height: '40px' }}
            >
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
              height: '136px',
              resize: 'none',
              padding: '4px',
              font: 'inherit',
            }}
            value={gradesInGeneral}
            onChange={e => setGradesInGeneral(e.target.value)}
            className="comment-input"
          />
        </Box>
      </Box>
    </Container>
  );
};

export default forwardRef(WorkStepSix);
