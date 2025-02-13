import React, { useState, useEffect } from 'react';

import {
  Box,
  Modal,
  Radio,
  Button,
  TextField,
  Typography,
  RadioGroup,
  Autocomplete,
  FormControlLabel,
  TextareaAutosize,
} from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';

import dayjs, { Dayjs } from 'dayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { z } from 'zod';
import { getAllWorks, getWorkByCustomerId, getWorkById } from '@/services/works';
import { ITaskModalProps } from '@/interfaces/ITaskModal';
import { getAllProfileCustomer } from '@/services/customers';
import { createTask, getTaskById, updateTask } from '@/services/tasks';

import { Content, Input, DeadlineContainer } from './styles';
import { ICustomerProps } from '@/interfaces/ICustomer';
import { colors, Flex } from '@/styles/globals';
import Notification from '../../OfficeModals/Notification';
import { MdClose } from 'react-icons/md';
import { getAdmins } from '@/services/admins';
import { useRouter } from 'next/router';

interface FormData {
  description: string;
  deadline: Dayjs;
  status: string;
  priority: string;
  comments: string;
  profile_customer_id: string;
  profile_admin_id: string;
  work_id: string;
}

const taskSchema = z.object({
  description: z.string().min(2, { message: 'Descrição é um campo obrigatório.' }),
  status: z.string().min(2, { message: 'Status é um campo obrigatório.' }),
  priority: z.string().min(1, { message: 'Prioridade é um campo obrigatório.' }),
  profile_admin_id: z.string().min(1, { message: 'Responsável é um campo obrigatório.' }),
});

const TaskModal = ({ isOpen, onClose, dataToEdit, showMessage }: ITaskModalProps) => {
  const currentDate = dayjs();
  const router = useRouter();

  const [formData, setFormData] = useState<FormData>({
    description: '',
    deadline: currentDate,
    status: 'pending',
    priority: '1',
    comments: '',
    profile_customer_id: '',
    profile_admin_id: '',
    work_id: '',
  });

  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);

  const [errors, setErrors] = useState({} as any);
  const [message, setMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [type, setType] = useState<'success' | 'error'>('success');

  const [worksByCustomer, setworksByCustomer] = useState<any[]>([]);
  const [customersList, setCustomersList] = useState<ICustomerProps[]>([]);
  const [responsibleList, setResponsibleList] = useState<any[]>([]);

  const handleSelectChange = (field: string, value: any) => {
    setFormData(prevData => ({
      ...prevData,
      [field as string]: value && value.id ? value.id : value,
    }));
  };

  const handleFormError = (error: any) => {
    const apiError =
      error?.response?.data?.errors[0]?.code[0] !== ''
        ? error?.response?.data?.errors[0]?.code[0]
        : '';

    const newErrors = error?.formErrors?.fieldErrors ?? {};
    const errorObject: { [key: string]: string } = {};
    setMessage(
      apiError !== '' && apiError !== undefined
        ? `${apiError}`
        : 'Preencha todos os campos obrigatórios.',
    );
    setType('error');
    setOpenSnackbar(true);

    for (const field in newErrors) {
      if (Object.prototype.hasOwnProperty.call(newErrors, field)) {
        errorObject[field] = newErrors[field][0] as string;
      }
    }
    setErrors(errorObject);
  };

  const resetForm = () => {
    setFormData({
      description: '',
      deadline: currentDate,
      status: 'pending',
      priority: '1',
      comments: '',
      profile_customer_id: '',
      profile_admin_id: '',
      work_id: '',
    });
  };

  const handleSubmit = async () => {
    setSubmitLoading(true);

    try {
      taskSchema.parse({
        description: formData.description,
        status: formData.status,
        priority: formData.priority,
        profile_admin_id: formData.profile_admin_id,
        work_id: formData.work_id,
      });

      const date = formData.deadline ? formData.deadline.format('DD/MM/YYYY') : null;

      const data = {
        description: formData.description,
        deadline: date,
        status: formData.status,
        priority: formData.priority,
        comment: formData.comments,
        profile_customer_id: formData.profile_customer_id,
        profile_admin_id: formData.profile_admin_id,
        work_id: formData.work_id,
      };

      if (dataToEdit?.id) {
        await updateTask(dataToEdit.id, data);
      } else {
        await createTask(data);
      }

      resetForm();
      showMessage('Tarefa criada com sucesso!', 'success');
      onClose();
    } catch (error) {
      handleFormError(error);
    } finally {
      setSubmitLoading(false);
    }
  };

  const getData = async () => {
    try {
      const works = await getAllWorks('');
      const data = works.data;

      const customers = await getAllProfileCustomer('');
      const dataCustomers = customers.data;

      if (dataCustomers) {
        setCustomersList(dataCustomers);
      }

      const tasksResponsible = await getAdmins();
      const responsibleData = tasksResponsible.data;
      const responsibleIncluded = responsibleData.included;

      if (responsibleIncluded) {
        setResponsibleList(responsibleIncluded);
      }

      setLoading(false);
    } catch (error: any) {
      console.error('error', error);
      setMessage(error.message);
      setType('error');
      setOpenSnackbar(true);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    console.log('loading:', loading);
  }, [loading]);

  useEffect(() => {
    const getworksByCustomer = async () => {
      if (formData.profile_customer_id) {
        const works = await getWorkByCustomerId(formData.profile_customer_id);
        const data = works.data;
        const idsArray = data.map(
          (item: any) =>
            `${item.id} - ${item.attributes.number ? item.attributes.number : 'Sem Número'} - ${
              item.attributes.subject === 'administrative_subject'
                ? 'Administrativo'
                : item.attributes.subject === 'civel'
                ? 'Cível'
                : item.attributes.subject === 'criminal'
                ? 'Criminal'
                : item.attributes.subject === 'laborite'
                ? 'Trabalhista'
                : item.attributes.subject === 'social_security'
                ? 'Previdenciário'
                : item.attributes.subject === 'tributary'
                ? 'Tributário'
                : item.attributes.subject === 'tributary_pis'
                ? 'Tributário Pis/Cofins insumos'
                : 'Outros'
            }`,
        );
        setworksByCustomer(idsArray);
      }
    };

    getworksByCustomer();
  }, [formData.profile_customer_id]);

  useEffect(() => {
    const handleEdit = async (id: any) => {
      setLoading(true);
      try {
        const task = await getTaskById(id);
        const taskAttributes = task.data.attributes;

        const work = await getWorkById(taskAttributes.work.id);
        const workAttributes = work.data.attributes;

        handleSelectChange('description', taskAttributes.description);
        handleSelectChange(
          'deadline',
          taskAttributes.deadline ? dayjs(taskAttributes.deadline) : null,
        );
        handleSelectChange('status', taskAttributes.status);
        handleSelectChange('priority', taskAttributes.priority);
        handleSelectChange('comments', taskAttributes.comment);
        handleSelectChange('profile_customer_id', taskAttributes.profile_customer.id.toString());
        handleSelectChange('profile_admin_id', taskAttributes.profile_admin_id.toString());
        handleSelectChange(
          'work_id',
          `${taskAttributes.work.id} - ${
            workAttributes.number ? workAttributes.number : 'Sem Número'
          } - ${
            workAttributes.subject === 'administrative_subject'
              ? 'Administrativo'
              : workAttributes.subject === 'civel'
              ? 'Cível'
              : workAttributes.subject === 'criminal'
              ? 'Criminal'
              : workAttributes.subject === 'laborite'
              ? 'Trabalhista'
              : workAttributes.subject === 'social_security'
              ? 'Previdenciário'
              : workAttributes.subject === 'tributary'
              ? 'Tributário'
              : workAttributes.subject === 'tributary_pis'
              ? 'Tributário Pis/Cofins insumos'
              : 'Outros'
          }`,
        );
      } catch (error: any) {
        console.error('Error on handleEdit:', error.message);
        showMessage(
          'Ocorreu um erro ao carregar os dados da tarefa. Tente novamente mais tarde.',
          'error',
        );
        onClose();
      } finally {
        setLoading(false);
      }
    };

    if (dataToEdit?.id) {
      handleEdit(dataToEdit.id);
    }
  }, [dataToEdit]);

  const renderTitle = () => {
    return (
      <label style={{ fontSize: '28px', color: '#01013D', fontWeight: '500' }}>
        {dataToEdit && Object.values(dataToEdit).length > 0 ? 'Editar Tarefa' : 'Nova Tarefa'}
      </label>
    );
  };

  return (
    <>
      {openSnackbar && (
        <Notification
          open={openSnackbar}
          message={message}
          severity={type}
          onClose={() => setOpenSnackbar(false)}
        />
      )}

      <Modal open={isOpen} style={{ overflowY: 'auto' }}>
        {loading ? (
          <Content
            style={{
              backgroundColor: 'transparent',
            }}
          >
            <CircularProgress style={{ color: 'white' }} />
          </Content>
        ) : (
          <Content>
            <Box display={'flex'} alignItems={'center'} justifyContent={'space-between'}>
              {renderTitle()}
              <Box sx={{ cursor: 'pointer' }} onClick={onClose}>
                <MdClose size={26} />
              </Box>
            </Box>

            <Flex style={{ justifyContent: 'space-between' }}>
              <Box width={'464px'}>
                <Box mr={'16px'}>
                  <Flex className="inputContainer">
                    <Typography variant="h6" sx={{ marginBottom: '8px' }}>
                      {'Descrição'}
                    </Typography>
                    <Input>
                      <TextField
                        id="outlined-basic"
                        variant="outlined"
                        autoComplete="off"
                        size="small"
                        value={formData.description || ''}
                        onChange={e => handleSelectChange('description', e.target.value)}
                        placeholder="Informe a Descrição da Tarefa"
                        error={!!errors.description}
                        helperText={errors.description}
                        FormHelperTextProps={{ className: 'ml-2' }}
                      />
                    </Input>
                  </Flex>

                  <Flex className="inputContainer">
                    <Flex>
                      <Typography mb={'8px'} variant="h6">
                        {'Cliente'}
                      </Typography>
                    </Flex>

                    <Autocomplete
                      limitTags={1}
                      id="multiple-limit-tags"
                      value={
                        formData.profile_customer_id
                          ? customersList.find(
                              (lawyer: any) => lawyer.id.toString() == formData.profile_customer_id,
                            )
                          : ''
                      }
                      options={customersList}
                      getOptionLabel={(option: any) =>
                        option && option.attributes
                          ? `${option.id} - ${option.attributes.name}`
                          : ''
                      }
                      isOptionEqualToValue={(option: any, value: any) => option.id === value.id}
                      onChange={(event, value) => handleSelectChange('profile_customer_id', value)}
                      renderInput={params => (
                        <TextField
                          {...params}
                          placeholder={'Informe o Cliente'}
                          size="small"
                          error={!!errors.profile_customer_id}
                        />
                      )}
                      noOptionsText={`Nenhum Cliente Encontrado`}
                    />
                  </Flex>

                  <Flex className="inputContainer">
                    <Flex>
                      <Typography mb={'8px'} variant="h6">
                        {'Trabalho'}
                      </Typography>
                    </Flex>

                    <Autocomplete
                      disablePortal={true}
                      autoComplete
                      options={worksByCustomer}
                      value={formData.work_id || ''}
                      getOptionLabel={(option: any) => option}
                      renderInput={params => (
                        <TextField {...params} size="small" placeholder="Selecione um Trabalho" />
                      )}
                      noOptionsText="Nenhum Trabalho Encontrado"
                      onChange={(event, value) => {
                        handleSelectChange('work_id', value);
                      }}
                      disabled={formData.profile_customer_id ? false : true}
                    />
                  </Flex>

                  <Flex className="inputContainer">
                    <Flex>
                      <Typography mb={'8px'} variant="h6">
                        {'Responsável'}
                      </Typography>
                    </Flex>

                    <Autocomplete
                      limitTags={1}
                      id="multiple-limit-tags"
                      value={
                        formData.profile_admin_id
                          ? responsibleList.find(
                              (lawyer: any) => lawyer.id.toString() == formData.profile_admin_id,
                            )
                          : ''
                      }
                      options={responsibleList}
                      getOptionLabel={(option: any) =>
                        option && option.attributes ? option.attributes.name : ''
                      }
                      isOptionEqualToValue={(option: any, value: any) => option.id === value.id}
                      onChange={(event, value) => handleSelectChange('profile_admin_id', value)}
                      renderInput={params => (
                        <TextField
                          {...params}
                          placeholder={'Informe o Responsável'}
                          size="small"
                          error={!!errors.profile_admin_id}
                          helperText={errors.profile_admin_id}
                          FormHelperTextProps={{ className: 'ml-2' }}
                        />
                      )}
                      noOptionsText={`Nenhum Responsável Encontrado`}
                    />
                  </Flex>

                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DeadlineContainer>
                      <Box>
                        <Flex>
                          <Typography mb={'8px'} variant="h6">
                            {'Prazo de Entrega'}
                          </Typography>
                        </Flex>
                        <DatePicker
                          format="DD/MM/YYYY"
                          value={formData.deadline}
                          minDate={currentDate}
                          onChange={(newValue: any) => {
                            if (newValue < currentDate) {
                              handleSelectChange('deadline', currentDate);
                            } else {
                              handleSelectChange('deadline', newValue);
                            }
                          }}
                        />
                      </Box>
                      <Box>
                        <Flex>
                          <Typography mb={'8px'} variant="h6">
                            {'Prioridade'}
                          </Typography>
                        </Flex>
                        <RadioGroup
                          value={formData.priority}
                          sx={{ flexDirection: 'row' }}
                          onChange={e => handleSelectChange('priority', e.target.value)}
                        >
                          <FormControlLabel
                            value="1"
                            control={<Radio size="small" />}
                            label="Normal"
                          />

                          <FormControlLabel
                            value="2"
                            control={<Radio size="small" />}
                            label="Alta"
                          />
                        </RadioGroup>
                      </Box>
                    </DeadlineContainer>
                  </LocalizationProvider>
                </Box>
              </Box>

              <Box width={'464px'} mt={'16px'}>
                <Box>
                  <Flex>
                    <Typography mb={'8px'} variant="h6">
                      {'Status'}
                    </Typography>
                  </Flex>
                  <RadioGroup
                    value={formData.status}
                    sx={{ flexDirection: 'row' }}
                    onChange={e => handleSelectChange('status', e.target.value)}
                  >
                    <FormControlLabel
                      value="pending"
                      control={<Radio size="small" />}
                      label="Pendente"
                    />
                    <FormControlLabel
                      value="late"
                      control={<Radio size="small" />}
                      label="Atrasado"
                    />
                    <FormControlLabel
                      value="finished"
                      control={<Radio size="small" />}
                      label="Finalizado"
                    />
                  </RadioGroup>
                </Box>
                <Box mt={'16px'}>
                  <Flex>
                    <Typography mb={'8px'} variant="h6">
                      {'Comentários'}
                    </Typography>
                  </Flex>
                  <TextareaAutosize
                    value={formData.comments}
                    onChange={e => handleSelectChange('comments', e.target.value)}
                    className="comment-input"
                  />
                </Box>
              </Box>
            </Flex>

            <Box width={'100%'} display={'flex'} justifyContent={'end'} mt={'16px'}>
              <Button
                color="primary"
                variant="outlined"
                sx={{
                  width: '100px',
                  height: '36px',
                }}
                onClick={() => {
                  onClose();
                  resetForm();
                  router.push('/tarefas');
                }}
              >
                {'Cancelar'}
              </Button>
              <Button
                variant="contained"
                sx={{
                  width: '100px',
                  height: '36px',
                  color: colors.white,
                  marginLeft: '16px',
                }}
                color="secondary"
                onClick={() => {
                  if (!submitLoading) {
                    handleSubmit();
                  }
                }}
              >
                {submitLoading ? (
                  <CircularProgress
                    size={20}
                    style={{
                      color: 'white',
                    }}
                  />
                ) : (
                  'Salvar'
                )}
              </Button>
            </Box>
          </Content>
        )}
      </Modal>
    </>
  );
};

export default TaskModal;
