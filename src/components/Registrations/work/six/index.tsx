import React, {
  useState,
  useContext,
  ChangeEvent,
  forwardRef,
  ForwardRefRenderFunction,
  useImperativeHandle,
  useEffect,
} from 'react';

import { Flex } from '@/styles/globals';
import { MdOutlineInfo } from 'react-icons/md';
import { WorkContext } from '@/contexts/WorkContext';

import { Container, InputContainer } from './styles';
import { Notification } from '@/components';

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
import { getOfficeById } from '@/services/offices';

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
  const router = useRouter();

  const isEdit = router.asPath.includes('alterar');

  const { workForm, setWorkForm, updateWorkForm, setUdateWorkForm } = useContext(WorkContext);

  const [errors, setErrors] = useState({} as any);

  const [message, setMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [type, setType] = useState<'success' | 'error'>('success');

  const [documentsProduced, setDocumentsProduced] = useState<string[]>([]);
  const [documentsToRegenerate, setDocumentsToRegenerate] = useState<string[]>([]);
  const [pendingDocuments, setPendingDocuments] = useState([] as any);
  const [gradesInGeneral, setGradesInGeneral] = useState<string>('');
  const [otherDocuments, setOtherDocuments] = useState<string>('');
  const [folder, setFolder] = useState('');

  const handleDocumentsProducedSelection = (event: ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = event.target;

    if (checked) {
      setDocumentsProduced(prevSelected => [...prevSelected, value]);
    } else {
      setDocumentsProduced(prevSelected => prevSelected.filter(document => document !== value));
    }
  };

  const createDocumentsProducedArray = () => {
    let documentsProducedArray: any[] = [];

    workForm.profile_customer_ids.forEach((profile: any) => {
      documentsProducedArray = documentsProducedArray.concat(
        documentsProduced.map((document: any) => ({
          document_type: document.document_type ? document.document_type : document,
          profile_customer_id: Number(profile),
        })),
      );
    });

    return documentsProducedArray;
  };

  const createNewProducedDocumentsArray = () => {
    let newProducedDocumentsArray: any[] = [];
    let documentTypesSet = new Set();

    documentsProduced.forEach((document: any) => {
      if (document.document_type) {
        documentTypesSet.add(document.document_type);
      }
    });

    const customersWithoutDocument = workForm.profile_customer_ids.filter((profile: any) => {
      return !documentsProduced.some((document: any) => document.profile_customer_id == profile);
    });

    documentsProduced.forEach((document: any) => {
      if (!document.id) {
        workForm.profile_customer_ids.forEach((profile: any) => {
          newProducedDocumentsArray.push({
            document_type: document.document_type ? document.document_type : document,
            profile_customer_id: Number(profile),
          });
        });
      }

      if (document.id) {
        newProducedDocumentsArray.push({
          id: document.id,
          document_type: document.document_type ? document.document_type : document,
          profile_customer_id: Number(document.profile_customer_id),
          url: document.url,
        });
      }
    });

    customersWithoutDocument.forEach((profile: any) => {
      documentTypesSet.forEach((document: any) => {
        newProducedDocumentsArray.push({
          document_type: document.document_type ? document.document_type : document,
          profile_customer_id: Number(profile),
        });
      });
    });

    return newProducedDocumentsArray;
  };

  const createWorkData = () => {
    const documentsAttributes = isEdit
      ? createNewProducedDocumentsArray()
      : createDocumentsProducedArray();

    return {
      documents_attributes: documentsAttributes,
      pending_documents_attributes: pendingDocuments,
      extra_pending_document: otherDocuments,
      folder: folder,
      note: gradesInGeneral,
    };
  };

  const handleSubmitForm = () => {
    try {
      if (documentsProduced.length <= 0) {
        setErrors({ ...errors, documents_attributes: true });
        throw new Error('Selecione pelo menos um documento a ser produzido');
      }

      const workData = createWorkData();

      if (isEdit) {
        const updatedWorkForm = {
          ...updateWorkForm,
          ...workData,
        };

        setUdateWorkForm(updatedWorkForm);
        saveDataLocalStorage(updatedWorkForm);
      } else {
        const newWorkForm = {
          ...workForm,
          ...workData,
        };

        saveDataLocalStorage(newWorkForm);
        setWorkForm(newWorkForm);
      }

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

          setDocumentsProduced(documents_types);
          setDocumentsToRegenerate(documents_types);
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
          const pending_documents = attributes.pending_documents.map((document: any) => document);

          setPendingDocuments(pending_documents);
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
          setDocumentsToRegenerate(parsedData.documents_attributes);
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
                  label={
                    (isEdit && documentsToRegenerate.includes('procuration')) ||
                    documentsToRegenerate
                      .map((document: any) => document.document_type)
                      .includes('procuration')
                      ? 'Reemitir procuração'
                      : 'Emitir procuração'
                  }
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
                  label={
                    (isEdit && documentsToRegenerate.includes('waiver')) ||
                    documentsToRegenerate
                      .map((document: any) => document.document_type)
                      .includes('waiver')
                      ? 'Reemitir Termo de renúncia'
                      : 'Emitir Termo de renúncia'
                  }
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
                  label={
                    (isEdit && documentsToRegenerate.includes('deficiency_statement')) ||
                    documentsToRegenerate
                      .map((document: any) => document.document_type)
                      .includes('deficiency_statement')
                      ? 'Reemitir declaração  de carência'
                      : 'Emitir declaração  de carência'
                  }
                  style={{
                    marginRight: '0px',
                  }}
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      value="honorary"
                      checked={
                        documentsProduced.includes('honorary') ||
                        documentsProduced
                          .map((document: any) => document.document_type)
                          .includes('honorary')
                      }
                      onChange={handleDocumentsProducedSelection}
                    />
                  }
                  label={
                    (isEdit && documentsToRegenerate.includes('honorary')) ||
                    documentsToRegenerate
                      .map((document: any) => document.document_type)
                      .includes('honorary')
                      ? 'Reemitir contrato'
                      : 'Emitir contrato'
                  }
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
            <Typography display={'flex'} alignItems={'center'} variant="h6" className="h-[40px]">
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
              height: '130px',
              border: '1px solid #D1D5DB',
              borderRadius: '4px',
            }}
            name="gradesInGeneral"
            value={gradesInGeneral}
            onChange={e => setGradesInGeneral(e.target.value)}
            className="comment-input w-full resize-none p-1"
          />
        </Box>
      </Box>
    </Container>
  );
};

export default forwardRef(WorkStepSix);
