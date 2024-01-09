import React, { useState, useEffect, ChangeEvent } from 'react';

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
import { getAllWorks } from '@/services/works';
import { IModalProps } from '@/interfaces/IModal';
import { getAllCustomers } from '@/services/customers';
import { createTask, getTaskById, updateTask } from '@/services/tasks';

import { Content, Title, Input, DeadlineContainer } from './styles';
import { ICustomerProps } from '@/interfaces/ICustomer';
import { colors, Flex } from '@/styles/globals';
import Notification from '../../Notification';
import { MdClose } from 'react-icons/md';
import { getAdmins } from '@/services/admins';
import { useRouter } from 'next/router';

const schema = z.object({
  description: z.string().min(1).max(255),
  status: z.string().min(1).max(255),
  priority: z.string().min(1).max(255),
  comments: z.string().min(1).max(255),
  profile_customer_id: z.string().min(1).max(255),
  profile_admin_id: z.string().min(1).max(255),
  work_id: z.string().min(1).max(255),
});

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

const TaskModal = ({ isOpen, onClose, dataToEdit }: IModalProps) => {
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

  const [loading, setLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [type, setType] = useState<'success' | 'error'>('success');

  const [workList, setWorkList] = useState<any[]>([]);
  const [customersList, setCustomersList] = useState<ICustomerProps[]>([]);
  const [responsibleList, setResponsibleList] = useState<any[]>([]);

  const handleSelectChange = (field: string, value: any) => {
    setFormData(prevData => ({
      ...prevData,
      [field as string]: value && value.id ? value.id : value,
    }));
  };

  const handleFormError = (error: any) => {
    setMessage(error.message);
    setType('error');
    setOpenSnackbar(true);
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
    setLoading(true);

    try {
      if (!formData.description) throw new Error('Descrição é obrigatório');
      if (!formData.profile_customer_id) throw new Error('Cliente é obrigatório');
      if (!formData.profile_admin_id) throw new Error('Responsável é obrigatório');
      if (!formData.work_id) throw new Error('Trabalho é obrigatório');
      if (!formData.deadline) throw new Error('Prazo de Entrega é obrigatório');
      if (!formData.status) throw new Error('Status é obrigatório');
      if (!formData.priority) throw new Error('Prioridade é obrigatório');

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

      setMessage('Tarefa criada com sucesso!');
      setType('success');
      setOpenSnackbar(true);
      resetForm();
      onClose();
    } catch (error) {
      handleFormError(error);
    } finally {
      setLoading(false);
    }
  };

  const getData = async () => {
    setDataLoaded(true);
    try {
      const works = await getAllWorks();
      const data = works.data;
      const idsArray = data.map((item: any) => item.id);
      setWorkList(idsArray);

      const customers = await getAllCustomers();
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
    } catch (error: any) {
      setMessage(error.message);
      setType('error');
      setOpenSnackbar(true);
    } finally {
      setDataLoaded(false);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    const handleEdit = async (id: any) => {
      setLoading(true);
      try {
        await getData();

        const task = await getTaskById(id);
        const taskData = task.data;
        const taskAttributes = taskData.attributes;

        const taskDeadline = taskAttributes.deadline ? dayjs(taskAttributes.deadline) : null;

        handleSelectChange('description', taskAttributes.description);
        handleSelectChange('deadline', taskDeadline);
        handleSelectChange('status', taskAttributes.status);
        handleSelectChange('priority', taskAttributes.priority);
        handleSelectChange('comments', taskAttributes.comment);
        handleSelectChange('profile_customer_id', taskAttributes.profile_customer.id.toString());
        handleSelectChange('profile_admin_id', taskAttributes.profile_admin_id.toString());
        handleSelectChange('work_id', taskAttributes.work.id.toString());
      } catch (error: any) {
        setMessage(error.message);
        setType('error');
        setOpenSnackbar(true);
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
      <Title style={{ fontSize: '28px' }}>
        {dataToEdit && Object.values(dataToEdit).length > 0 ? 'Editar Tarefa' : 'Nova Tarefa'}
      </Title>
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
        {dataLoaded ? (
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
                        option && option.attributes ? option.attributes.name : ''
                      }
                      isOptionEqualToValue={(option: any, value: any) => option.id === value.id}
                      onChange={(event, value) => handleSelectChange('profile_customer_id', value)}
                      renderInput={params => (
                        <TextField {...params} placeholder={'Informe o Cliente'} size="small" />
                      )}
                      noOptionsText={`Nenhum Cliente Encontrado`}
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
                        <TextField {...params} placeholder={'Informe o Responsável'} size="small" />
                      )}
                      noOptionsText={`Nenhum Responsável Encontrado`}
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
                      options={workList}
                      value={formData.work_id || ''}
                      getOptionLabel={(option: any) => option}
                      renderInput={params => (
                        <TextField {...params} size="small" placeholder="Selecione um Trabalho" />
                      )}
                      noOptionsText="Nenhum Trabalho Encontrado"
                      onChange={(event, value) => {
                        handleSelectChange('work_id', value);
                      }}
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
                  if (!loading) {
                    handleSubmit();
                  }
                }}
              >
                {loading ? (
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
