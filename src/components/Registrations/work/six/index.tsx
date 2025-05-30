import React, {
  useState,
  useContext,
  ChangeEvent,
  forwardRef,
  ForwardRefRenderFunction,
  useImperativeHandle,
  useEffect,
  useCallback,
} from 'react';
import { useRouter } from 'next/router';
import { MdOutlineInfo } from 'react-icons/md';
import {
  Box,
  FormControlLabel,
  Typography,
  Checkbox,
  TextField,
  TextareaAutosize,
  CircularProgress,
} from '@mui/material';

import { Flex } from '@/styles/globals';
import { WorkContext } from '@/contexts/WorkContext';
import { Notification } from '@/components';
import { Container, InputContainer } from './styles';
import CustomTooltip from '@/components/Tooltip';
import { LoadingOverlay } from '../one/styles';

export interface IRefWorkStepSixProps {
  handleSubmitForm: () => void;
}

interface IStepSixProps {
  confirmation: () => void;
}

type DocumentType = 'procuration' | 'waiver' | 'deficiency_statement' | 'honorary';

interface Document {
  id?: number;
  document_type: string;
  profile_customer_id?: number;
  url?: string;
}

const DOCUMENT_TYPES: Record<DocumentType, string> = {
  procuration: 'procuração',
  waiver: 'Termo de renúncia',
  deficiency_statement: 'declaração de carência',
  honorary: 'contrato',
};

const WorkStepSixComponent: ForwardRefRenderFunction<IRefWorkStepSixProps, IStepSixProps> = (
  { confirmation },
  ref,
) => {
  const router = useRouter();
  const isEdit = router.asPath.includes('alterar');
  const { workForm, setWorkForm, updateWorkForm, setUdateWorkForm } = useContext(WorkContext);

  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    type: 'success' as 'success' | 'error',
  });

  const [formData, setFormData] = useState({
    documentsProduced: [] as Document[],
    documentsToRegenerate: [] as Document[],
    pendingDocuments: [] as Document[],
    otherDocuments: '',
    folder: '',
    gradesInGeneral: '',
  });

  useEffect(() => {
    const loadAllData = async () => {
      try {
        setLoading(true);

        if (workForm.data?.attributes) {
          const { attributes } = workForm.data;
          const newFormData = {
            documentsProduced: attributes.documents || [],
            documentsToRegenerate: attributes.documents || [],
            pendingDocuments: attributes.pending_documents || [],
            otherDocuments: attributes.extra_pending_document || '',
            folder: attributes.folder || '',
            gradesInGeneral: attributes.note || '',
          };
          setFormData(newFormData);
        }

        const localStorageData = localStorage.getItem('WORK/Six');
        if (localStorageData) {
          const parsedData = JSON.parse(localStorageData);
          setFormData(prev => ({
            ...prev,
            documentsProduced: parsedData.documents_attributes || prev.documentsProduced,
            documentsToRegenerate: parsedData.documents_attributes || prev.documentsToRegenerate,
            otherDocuments: parsedData.extra_pending_document || prev.otherDocuments,
            folder: parsedData.folder || prev.folder,
            gradesInGeneral: parsedData.note || prev.gradesInGeneral,
          }));
        }
      } finally {
        setLoading(false);
      }
    };

    loadAllData();
  }, [workForm]);

  const handleDocumentsProducedSelection = (event: ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = event.target as { value: DocumentType; checked: boolean };

    setFormData(prev => {
      const newDocuments = checked
        ? [...prev.documentsProduced, { document_type: value }]
        : prev.documentsProduced.filter(doc => doc.document_type !== value);

      return { ...prev, documentsProduced: newDocuments };
    });
  };

  const handleNotificationClose = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  const handleFormError = useCallback((error: Error) => {
    setNotification({
      open: true,
      message: error.message,
      type: 'error',
    });
  }, []);

  const createDocumentsProducedArray = useCallback((): Document[] => {
    return (workForm.profile_customer_ids as (number | string)[])
      .map(Number)
      .flatMap((profile: number) =>
        formData.documentsProduced.map(document => ({
          document_type: document.document_type,
          profile_customer_id: profile,
        })),
      );
  }, [workForm.profile_customer_ids, formData.documentsProduced]);

  const createNewProducedDocumentsArray = useCallback((): Document[] => {
    const newDocuments: Document[] = [];
    const documentTypes = new Set(formData.documentsProduced.map(doc => doc.document_type));

    formData.documentsProduced.forEach(document => {
      if (document.id) {
        newDocuments.push(document);
      }
    });

    workForm.data.attributes.profile_customers.forEach((profile: any) => {
      documentTypes.forEach(type => {
        if (
          !formData.documentsProduced.some(
            doc => doc.document_type === type && doc.profile_customer_id === Number(profile.id),
          )
        ) {
          newDocuments.push({
            document_type: type,
            profile_customer_id: Number(profile.id),
          });
        }
      });
    });

    return newDocuments;
  }, [formData.documentsProduced, workForm.profile_customer_ids]);

  const createWorkData = useCallback(
    () => ({
      documents_attributes: isEdit
        ? createNewProducedDocumentsArray()
        : createDocumentsProducedArray(),
      pending_documents_attributes: formData.pendingDocuments,
      extra_pending_document: formData.otherDocuments,
      folder: formData.folder,
      note: formData.gradesInGeneral,
    }),
    [
      isEdit,
      createNewProducedDocumentsArray,
      createDocumentsProducedArray,
      formData.pendingDocuments,
      formData.otherDocuments,
      formData.folder,
      formData.gradesInGeneral,
    ],
  );

  const saveDataLocalStorage = useCallback((data: any) => {
    localStorage.setItem('WORK/Six', JSON.stringify(data));
  }, []);

  const handleSubmitForm = useCallback(() => {
    try {
      if (formData.documentsProduced.length <= 0) {
        setErrors({ ...errors, documents_attributes: true });
        throw new Error('Selecione pelo menos um documento a ser produzido');
      }

      const workData = createWorkData();

      if (isEdit) {
        const updatedWorkForm = { ...updateWorkForm, ...workData };
        setUdateWorkForm(updatedWorkForm);
        saveDataLocalStorage(updatedWorkForm);
      } else {
        const newWorkForm = { ...workForm, ...workData };
        saveDataLocalStorage(newWorkForm);
        setWorkForm(newWorkForm);
      }

      confirmation();
    } catch (err) {
      handleFormError(err as Error);
    }
  }, [
    formData.documentsProduced,
    errors,
    createWorkData,
    isEdit,
    updateWorkForm,
    setUdateWorkForm,
    saveDataLocalStorage,
    workForm,
    setWorkForm,
    confirmation,
    handleFormError,
  ]);

  useImperativeHandle(ref, () => ({
    handleSubmitForm,
  }));

  const renderDocumentCheckbox = (type: DocumentType) => {
    const isSelected = formData.documentsProduced.some(doc => doc.document_type === type);
    const isRegenerating = formData.documentsToRegenerate.some(doc => doc.document_type === type);
    const labelPrefix = isEdit && isRegenerating ? 'Reemitir' : 'Emitir';

    return (
      <FormControlLabel
        control={
          <Checkbox value={type} checked={isSelected} onChange={handleDocumentsProducedSelection} />
        }
        label={`${labelPrefix} ${DOCUMENT_TYPES[type]}`}
      />
    );
  };

  return (
    <Container loading={loading}>
      {loading && (
        <LoadingOverlay>
          <CircularProgress size={30} style={{ color: '#01013D' }} />
        </LoadingOverlay>
      )}

      <Notification
        open={notification.open}
        message={notification.message}
        severity={notification.type}
        onClose={handleNotificationClose}
      />

      <Box>
        <Box display="flex" alignItems="center" gap="19px" mt="16px">
          <Typography variant="h6" display="flex" alignItems="center" height="40px">
            Documentos a Serem Produzidos
          </Typography>
          <CustomTooltip title="Documentos que o ProcStudio irá gerar para você." placement="right">
            <span
              style={{
                display: 'flex',
              }}
            >
              <MdOutlineInfo size={20} />
            </span>
          </CustomTooltip>
          {errors.documents_attributes && formData.documentsProduced.length <= 0 && (
            <Typography color="error">*</Typography>
          )}
        </Box>

        <Box display="flex" flexDirection="column">
          {Object.keys(DOCUMENT_TYPES).map(type => renderDocumentCheckbox(type as DocumentType))}
        </Box>

        <Box display="flex" gap="32px" width="100%" mt="16px">
          <Box width="100%" display="flex" flexDirection="column" gap="16px">
            <Box display="flex" flexDirection="column" gap="8px">
              <Typography variant="h6">Outros Documentos Pendentes ou Pendências</Typography>
              <InputContainer>
                <TextField
                  label="Documento ou Pendência"
                  variant="outlined"
                  size="small"
                  fullWidth
                  value={formData.otherDocuments}
                  onChange={e => setFormData(prev => ({ ...prev, otherDocuments: e.target.value }))}
                />
              </InputContainer>
            </Box>

            <Box>
              <Box display="flex" alignItems="center" gap="8px">
                <Typography variant="h6" display="flex" alignItems="center" height="40px">
                  Pasta
                </Typography>
                <CustomTooltip title="Pasta do Cliente." placement="right">
                  <MdOutlineInfo size={20} />
                </CustomTooltip>
              </Box>

              <InputContainer>
                <TextField
                  label="Nome da Pasta"
                  variant="outlined"
                  size="small"
                  fullWidth
                  value={formData.folder}
                  onChange={e => setFormData(prev => ({ ...prev, folder: e.target.value }))}
                />
              </InputContainer>
            </Box>
          </Box>

          <Box width="100%">
            <Flex alignItems="center">
              <Typography variant="h6" display="flex" alignItems="center" height="40px">
                Notas em Geral Sobre o Caso
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
                width: '100%',
                resize: 'none',
                padding: '8px',
              }}
              value={formData.gradesInGeneral}
              onChange={e => setFormData(prev => ({ ...prev, gradesInGeneral: e.target.value }))}
            />
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default forwardRef(WorkStepSixComponent);
