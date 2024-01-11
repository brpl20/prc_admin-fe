import React, {
  useState,
  useEffect,
  useContext,
  ChangeEvent,
  DragEvent,
  forwardRef,
  ForwardRefRenderFunction,
  useImperativeHandle,
} from 'react';

import Dropzone from 'react-dropzone';
import { animateScroll as scroll } from 'react-scroll';

import { z } from 'zod';
import CustomTooltip from '@/components/Tooltip';
import { colors, Flex } from '@/styles/globals';
import { MdOutlineInfo, MdDelete } from 'react-icons/md';

import { WorkContext } from '@/contexts/WorkContext';
import Notification from '@/components/Notification';

import { ICustomerProps } from '@/interfaces/ICustomer';
import { getAllCustomers } from '@/services/customers';

import {
  Container,
  InputContainer,
  SubjectOptionsArea,
  Input,
  DropContainer,
  FileList,
} from './styles';

import {
  Box,
  FormControl,
  FormControlLabel,
  Typography,
  Checkbox,
  Radio,
  TextField,
  TextareaAutosize,
  Autocomplete,
} from '@mui/material';
import { useRouter } from 'next/router';
import { getAllDraftWorks } from '@/services/works';

interface Option {
  value: string;
  label: string;
}

interface RadioOptionsProps {
  options: Option[];
  selectedValue: string;
  onChange: (value: string) => void;
}

export interface IRefWorkStepOneProps {
  handleSubmitForm: () => void;
}

interface IStepOneProps {
  nextStep: () => void;
}

const schema = z.object({
  subject: z.string().nonempty('Campo obrigatório'),
});

const WorkStepOne: ForwardRefRenderFunction<IRefWorkStepOneProps, IStepOneProps> = (
  { nextStep },
  ref,
) => {
  const route = useRouter();
  const [isVisibleOptionsArea, setIsVisibleOptionsArea] = useState(false);
  const { workForm, setWorkForm } = useContext(WorkContext);
  const [errors, setErrors] = useState({} as any);

  const [message, setMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [type, setType] = useState<'success' | 'error'>('success');
  const [openFileSnackbar, setOpenFileSnackbar] = useState(false);

  const [customersList, setCustomersList] = useState<ICustomerProps[]>([]);
  const [draftWorksList, setDraftWorksList] = useState<any[]>([]);

  const [processNumber, setProcessNumber] = useState<string>('');
  const [selectedProcedures, setSelectedProcedures] = useState<string[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedArea, setSelectedArea] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File[] | null>(null);
  const [tributaryArea, setTributaryArea] = useState<string>('');
  const [compensationsLastYears, setCompensationsLastYears] = useState('');
  const [officialCompensation, setOfficialCompensation] = useState('');
  const [hasALawsuit, setHasALawsuit] = useState('');
  const [gainProjection, setGainProjection] = useState<number>();
  const [otherDescription, setOtherDescription] = useState<string>('');
  const [customerSelectedList, setCustomerSelectedList] = useState<ICustomerProps[]>([]);
  const [selectedDraftWork, setSelectedDraftWork] = useState<any>(null);

  const renderDragMessage = (isDragActive: boolean) => {
    if (!isDragActive) {
      return <p>Arraste arquivos aqui...</p>;
    }
    return <p>Solte os arquivos aqui</p>;
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const droppedFiles = event.dataTransfer.files;

    for (let i = 0; i < droppedFiles.length; i++) {
      const droppedFile = droppedFiles[i];
      if (droppedFiles[i]) {
        const fileName = droppedFile.name;
        const fileExtension = fileName.split('.').pop()?.toLowerCase();
        const allowedExtensions = ['jpeg', 'jpg', 'png', 'pdf'];

        if (fileExtension && allowedExtensions.includes(fileExtension)) {
          setSelectedFile(prevSelected => [...(prevSelected || []), droppedFile]);
        } else {
          setOpenFileSnackbar(true);
        }
      }
    }
  };

  const handleDeleteFile = (fileToDelete: File) => {
    setSelectedFile((prevSelected: any) =>
      prevSelected.filter((file: any) => file !== fileToDelete),
    );
  };

  const handleDragOver = (event: ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
  };

  const handleCustomersSelected = (customers: any) => {
    const customerIds = customers.map((customer: any) => customer.id.toString());

    const customersData = customersList.filter((customer: any) =>
      customerIds.includes(customer.id),
    );

    setCustomerSelectedList(customersData);
  };

  const handleProcedureSelection = (event: ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = event.target;

    const procedure = value;

    if (checked) {
      setSelectedProcedures([...selectedProcedures, procedure]);
    } else {
      setSelectedProcedures(selectedProcedures.filter(item => item !== procedure));
    }
  };

  const handleSubject = (value: string) => {
    if (value === 'civil') {
      value = 'civel';
    }

    setSelectedSubject(value);

    value.search('min') < 0 ? setIsVisibleOptionsArea(true) : setIsVisibleOptionsArea(false);
  };

  const handleSelectArea = (value: string) => {
    setSelectedArea(value);
  };

  useEffect(() => {
    if (route.pathname == '/cadastrar') {
      setWorkForm({});
    }
  }, [route]);

  const handleSubmitForm = () => {
    try {
      if (selectedSubject === '') {
        throw new Error('Preencha o Assunto.');
      }

      if (processNumber === '') {
        throw new Error('Preencha o Número do Processo.');
      }

      if (selectedProcedures.length <= 0) {
        throw new Error('Preencha o Procedimento.');
      }

      if (
        selectedArea === '' &&
        selectedSubject !== 'others' &&
        selectedSubject !== 'administrative_subject' &&
        selectedSubject !== 'criminal' &&
        selectedSubject !== 'tributary_pis'
      ) {
        setMessage('Preencha a Área.');
        setType('error');
        setOpenSnackbar(true);
        return;
      }

      let data: any = {
        ...workForm,
        profile_customer_ids: customerSelectedList.map(customer => customer.id),
        number: processNumber,
        procedures: selectedProcedures,
        subject: selectedSubject,
        draftWork: selectedDraftWork,
      };

      switch (selectedSubject) {
        case 'civel': {
          data = {
            ...data,
            civel_area: selectedArea,
          };
          break;
        }
        case 'social_security': {
          data = {
            ...data,
            social_security_areas: selectedArea,
          };
          break;
        }

        case 'laborite': {
          data = {
            ...data,
            laborite_areas: selectedArea,
          };
          break;
        }

        case 'tributary': {
          data = {
            ...data,
            tributary_areas: tributaryArea,
          };
          break;
        }

        case 'tributary_pis': {
          data = {
            ...data,
            compensations_five_years: compensationsLastYears,
            compensations_service: officialCompensation,
            lawsuit: hasALawsuit,
            gain_projection: gainProjection,
            tributary_files: selectedFile,
          };
          break;
        }

        case 'others': {
          data = {
            ...data,
            other_description: otherDescription,
          };
          break;
        }

        default:
          break;
      }

      saveDataLocalStorage(data);
      setWorkForm(data);
      nextStep();
    } catch (err) {
      handleFormError(err);
    }
  };

  const handleFormError = (error: any) => {
    setMessage(error.message);
    setType('error');
    setOpenSnackbar(true);
  };

  const verifyDataLocalStorage = async () => {
    const data = localStorage.getItem('WORK/One');

    if (data) {
      const parsedData = JSON.parse(data);

      if (parsedData.draftWork) {
        setSelectedDraftWork(parsedData.draftWork);
      }

      if (parsedData.profile_customer_ids) {
        handleCustomersSelected([
          ...customersList.filter((customer: any) =>
            parsedData.profile_customer_ids.includes(customer.id),
          ),
        ]);
      }

      if (parsedData.number) {
        setProcessNumber(parsedData.number);
      }

      if (parsedData.procedure) {
        setSelectedProcedures(parsedData.procedure);
      }

      if (parsedData.procedures) {
        setSelectedProcedures(parsedData.procedures);
      }

      if (parsedData.subject) {
        handleSubject(parsedData.subject);
      }

      switch (parsedData.subject) {
        case 'civel': {
          if (parsedData.civel_area) {
            setSelectedArea(parsedData.civel_area);
          }
          break;
        }
        case 'social_security': {
          if (parsedData.social_security_areas) {
            setSelectedArea(parsedData.social_security_areas);
          }
          break;
        }

        case 'laborite': {
          if (parsedData.laborite_areas) {
            setSelectedArea(parsedData.laborite_areas);
          }
          break;
        }

        case 'tributary': {
          if (parsedData.tributary_areas) {
            setSelectedArea(parsedData.tributary_areas);
          }
          break;
        }

        case 'tributary_pis': {
          if (parsedData.compensations_five_years) {
            setCompensationsLastYears(parsedData.compensations_five_years);
          }

          if (parsedData.compensations_service) {
            setOfficialCompensation(parsedData.compensations_service);
          }

          if (parsedData.lawsuit) {
            setHasALawsuit(parsedData.lawsuit);
          }

          if (parsedData.gain_projection) {
            setGainProjection(parsedData.gain_projection);
          }

          if (parsedData.tributary_files) {
            setSelectedFile(parsedData.tributary_files);
          }
          break;
        }

        case 'others': {
          if (parsedData.other_description) {
            setOtherDescription(parsedData.other_description);
          }
          break;
        }

        default:
          break;
      }

      if (parsedData.profile_customer_ids) {
        handleCustomersSelected([
          ...customersList.filter((customer: any) =>
            parsedData.profile_customer_ids.includes(customer.id),
          ),
        ]);
      }
    }
  };

  const saveDataLocalStorage = (data: any) => {
    localStorage.setItem('WORK/One', JSON.stringify(data));
  };

  const handleGainProjection = (value: number) => {
    const input = document.getElementById('gainProjection') as HTMLInputElement;

    if (value && input) {
      input.value = `R$ ${value}`;
      setGainProjection(value);
    }
  };

  useImperativeHandle(ref, () => ({
    handleSubmitForm,
  }));

  function RadioOptions({ options, selectedValue, onChange }: RadioOptionsProps) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {options.map(option => (
          <div key={option.value}>
            <FormControlLabel
              control={
                <Radio
                  size="small"
                  value={option.value}
                  checked={selectedValue === option.value}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
                />
              }
              label={option.label}
            />
          </div>
        ))}
      </div>
    );
  }

  useEffect(() => {
    const getCustomers = async () => {
      const response = await getAllCustomers();
      setCustomersList(response.data);
    };

    const getDraftWorks = async () => {
      const response = await getAllDraftWorks();
      setDraftWorksList(response.data);
    };

    getCustomers();
    getDraftWorks();
  }, []);

  useEffect(() => {
    if (selectedSubject !== workForm.subject) {
      setSelectedArea('');
    }
  }, [selectedSubject, workForm.subject]);

  useEffect(() => {
    const handleDataForm = async () => {
      const attributes = workForm.data.attributes;

      if (attributes) {
        if (attributes.procedure) {
          const procedure = attributes.procedure;

          const procedure_array = procedure.split(',');

          setSelectedProcedures(procedure_array);
        }

        if (attributes.procedures) {
          setSelectedProcedures(attributes.procedures);
        }

        if (attributes.profile_customers.length > 0) {
          handleCustomersSelected(attributes.profile_customers);
        }

        if (attributes.number) {
          setProcessNumber(attributes.number);
        }

        if (attributes.subject) {
          handleSubject(attributes.subject);
        }

        if (attributes.compensations_five_years) {
          setCompensationsLastYears(attributes.compensations_five_years);
        }

        if (attributes.compensations_service) {
          setOfficialCompensation(attributes.compensations_service);
        }

        if (attributes.lawsuit) {
          setHasALawsuit(attributes.lawsuit);
        }

        if (attributes.gain_projection) {
          handleGainProjection(attributes.gain_projection);
        }

        switch (attributes.subject) {
          case 'civel': {
            if (attributes.civel_area) {
              setSelectedArea(attributes.civel_area);
            }
            break;
          }
          case 'civil': {
            if (attributes.civel_area) {
              setSelectedArea(attributes.civel_area);
            }
            break;
          }
          case 'social_security': {
            if (attributes.social_security_areas) {
              setSelectedArea(attributes.social_security_areas);
            }
            break;
          }

          case 'laborite': {
            if (attributes.laborite_areas) {
              setSelectedArea(attributes.laborite_areas);
            }
            break;
          }

          case 'tributary': {
            if (attributes.tributary_areas) {
              setSelectedArea(attributes.tributary_areas);
            }
            break;
          }

          case 'tributary_pis': {
            if (
              attributes.compensations_five_years &&
              attributes.compensations_five_years === true
            ) {
              setCompensationsLastYears('yes');
            } else {
              setCompensationsLastYears('no');
            }

            if (attributes.compensations_service) {
              attributes.compensations_service === true
                ? setOfficialCompensation('yes')
                : setOfficialCompensation('no');
            }

            if (attributes.lawsuit) {
              attributes.lawsuit === true ? setHasALawsuit('yes') : setHasALawsuit('no');
            }

            if (attributes.gain_projection) {
              setGainProjection(attributes.gain_projection);
            }

            if (attributes.tributary_files) {
              setSelectedFile(attributes.tributary_files);
            }
            break;
          }

          case 'others': {
            if (attributes.other_description) {
              setOtherDescription(attributes.other_description);
            }
            break;
          }

          default:
            break;
        }
      }
    };

    if (workForm.data) {
      handleDataForm();
    }
  }, [workForm, customersList]);

  useEffect(() => {
    verifyDataLocalStorage();
  }, [customersList]);

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
      <Container>
        <Box sx={{ width: '100%' }}>
          {/* customers, Application or Process Number and Pre-Sets */}
          <span>
            <Flex style={{ flexDirection: 'column' }}>
              <Typography variant="h6" sx={{ marginBottom: '8px' }}>
                {'Cliente'}
              </Typography>

              <Autocomplete
                multiple
                limitTags={1}
                id="multiple-limit-tags"
                options={customersList}
                getOptionLabel={option => option && option.attributes && option.attributes.name}
                renderInput={params => (
                  <TextField placeholder="Selecione um Cliente" {...params} size="small" />
                )}
                sx={{ width: '398px', backgroundColor: 'white', zIndex: 1 }}
                noOptionsText="Nenhum Cliente Encontrado"
                onChange={(event, customers) => handleCustomersSelected(customers)}
                value={customerSelectedList}
              />
            </Flex>

            <Flex style={{ marginTop: '16px', flexDirection: 'column' }}>
              <Typography variant="h6" sx={{ marginBottom: '8px' }}>
                {'Número do Requerimento ou Processo'}
              </Typography>
              <InputContainer>
                <TextField
                  id="outlined-basic"
                  variant="outlined"
                  size="small"
                  value={processNumber}
                  autoComplete="off"
                  placeholder="Informe o Número"
                  onChange={(event: ChangeEvent<HTMLInputElement>) =>
                    setProcessNumber(event.target.value)
                  }
                />
              </InputContainer>
              <Typography variant="caption" sx={{ marginTop: '4px' }} gutterBottom>
                {'* Apenas para casos em que já existe o processo.'}
              </Typography>
            </Flex>

            <Flex style={{ flexDirection: 'column' }}>
              <Typography variant="h6" sx={{ marginBottom: '8px' }}>
                {'Pré-Definições'}
              </Typography>

              <Autocomplete
                limitTags={1}
                id="multiple-limit-tags"
                options={draftWorksList}
                getOptionLabel={option => option && option.attributes && option.attributes.name}
                renderInput={params => (
                  <TextField placeholder="Selecione uma Pré-definição" {...params} size="small" />
                )}
                sx={{ width: '398px', backgroundColor: 'white', zIndex: 1 }}
                noOptionsText="Nenhuma Pré-definição Encontrada"
                onChange={(event, draftWork) => {
                  setSelectedDraftWork(draftWork);
                }}
                value={selectedDraftWork}
                disabled={route.pathname == '/cadastrar' ? false : true}
              />
            </Flex>
          </span>

          {/* Procedure - title */}
          <Flex
            style={{
              flexDirection: 'row',
              marginBottom: '8px',
              alignItems: 'center',
              marginTop: '16px',
            }}
          >
            <Typography variant="h6">{'Procedimento'}</Typography>
            <CustomTooltip title="Selecione um tipo de pré-definição." placement="right">
              <span
                aria-label="Procedimento"
                style={{
                  display: 'flex',
                }}
              >
                <MdOutlineInfo style={{ marginLeft: '8px' }} size={20} />
              </span>
            </CustomTooltip>
            {errors.procedure && selectedProcedures.length <= 0 && (
              <label className="flagError">{'*'}</label>
            )}
          </Flex>
          <Flex
            style={{
              width: '398px',
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
          >
            <FormControlLabel
              control={
                <Checkbox
                  value="administrative"
                  checked={selectedProcedures.some(
                    (procedure: any) => procedure === 'administrative',
                  )}
                  onChange={handleProcedureSelection}
                />
              }
              label="Administrativo"
            />

            <FormControlLabel
              control={
                <Checkbox
                  value="judicial"
                  checked={selectedProcedures.some((procedure: any) => procedure === 'judicial')}
                  onChange={handleProcedureSelection}
                />
              }
              label="Judicial"
            />

            <FormControlLabel
              control={
                <Checkbox
                  value="extrajudicial"
                  checked={selectedProcedures.some(
                    (procedure: any) => procedure === 'extrajudicial',
                  )}
                  onChange={handleProcedureSelection}
                />
              }
              label="Extrajudicial"
              style={{
                marginRight: '0px',
              }}
            />
          </Flex>

          {/* Subject */}
          <Flex style={{ flexDirection: 'row', marginTop: '16px', flex: 1 }}>
            <Box width={'400px'}>
              <Flex>
                <Typography variant="h6" sx={{ marginBottom: '8px' }}>
                  {'Assunto'}
                </Typography>
                {errors.subject && selectedSubject === '' && (
                  <label className="flagError">{'*'}</label>
                )}
              </Flex>

              {/* administrative_subject */}
              <Box>
                <RadioOptions
                  options={[
                    {
                      value: 'administrative_subject',
                      label: 'Administrativo',
                    },
                  ]}
                  selectedValue={selectedSubject}
                  onChange={handleSubject}
                />
              </Box>

              {/* civel */}
              <Box>
                <RadioOptions
                  options={[
                    {
                      value: 'civel',
                      label: 'Cível',
                    },
                  ]}
                  selectedValue={selectedSubject}
                  onChange={handleSubject}
                />
              </Box>

              {/* criminal */}
              <Box>
                <RadioOptions
                  options={[
                    {
                      value: 'criminal',
                      label: 'Criminal',
                    },
                  ]}
                  selectedValue={selectedSubject}
                  onChange={handleSubject}
                />
              </Box>

              {/* social_security */}
              <Box>
                <RadioOptions
                  options={[
                    {
                      value: 'social_security',
                      label: 'Previdenciário',
                    },
                  ]}
                  selectedValue={selectedSubject}
                  onChange={handleSubject}
                />
              </Box>

              {/* laborite */}
              <Box>
                <RadioOptions
                  options={[
                    {
                      value: 'laborite',
                      label: 'Trabalhista',
                    },
                  ]}
                  selectedValue={selectedSubject}
                  onChange={handleSubject}
                />
              </Box>

              {/* tributary */}
              <Box>
                <RadioOptions
                  options={[
                    {
                      value: 'tributary',
                      label: 'Tributário',
                    },
                  ]}
                  selectedValue={selectedSubject}
                  onChange={handleSubject}
                />
              </Box>

              {/* tributary_pis */}
              <Box>
                <RadioOptions
                  options={[
                    {
                      value: 'tributary_pis',
                      label: 'Tributário Pis/Cofins insumos',
                    },
                  ]}
                  selectedValue={selectedSubject}
                  onChange={handleSubject}
                />
              </Box>

              {/* others */}
              <Box
                style={{
                  marginTop: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <RadioOptions
                  options={[
                    {
                      value: 'others',
                      label: 'Outros',
                    },
                  ]}
                  selectedValue={selectedSubject}
                  onChange={handleSubject}
                />

                <Typography variant="caption" sx={{ marginTop: '4px' }} gutterBottom>
                  {'* Escolha a área e depois a subárea de atuação.'}
                </Typography>
              </Box>
            </Box>

            {isVisibleOptionsArea && (
              <SubjectOptionsArea>
                {selectedSubject === 'civel' && (
                  <FormControl>
                    <Typography variant="h6" sx={{ marginBottom: '8px' }}>
                      {'Cível-Área'}
                    </Typography>
                    <RadioOptions
                      options={[
                        { value: 'family', label: 'Família' },
                        { value: 'consumer', label: 'Consumidor' },
                        {
                          value: 'moral_damages',
                          label: 'Reparação Cível - Danos Materiais - Danos Morais',
                        },
                      ]}
                      selectedValue={selectedArea}
                      onChange={value => handleSelectArea(value)}
                    />
                  </FormControl>
                )}

                {selectedSubject === 'social_security' && (
                  <FormControl>
                    <Typography variant="h6" sx={{ marginBottom: '8px' }}>
                      {'Previdenciário-Áreas'}
                    </Typography>
                    <RadioOptions
                      options={[
                        {
                          value: 'retirement_by_age',
                          label: 'Aposentadoria Por Tempo de Contribuição',
                        },
                        { value: 'retirement_by_time', label: 'Aposentadoria Por Idade' },
                        { value: 'retirement_by_rural', label: 'Aposentadoria Rural' },
                        {
                          value: 'disablement',
                          label:
                            'Benefícios Por Incapacidade - Auxílio Doença ou Acidente - Inválidez - LOAS',
                        },
                        {
                          value: 'benefit_review',
                          label: 'Revisão de Benefício Previdednciário',
                        },
                        {
                          value: 'administrative_services',
                          label: 'Reconhecimento de Tempo, Averbação, Serviços Administrativos',
                        },
                      ]}
                      selectedValue={selectedArea}
                      onChange={value => handleSelectArea(value)}
                    />
                  </FormControl>
                )}

                {selectedSubject === 'laborite' && (
                  <FormControl>
                    <Typography variant="h6" sx={{ marginBottom: '8px' }}>
                      {'Trabalhista-Áreas'}
                    </Typography>
                    <RadioOptions
                      options={[
                        {
                          value: 'labor_claim',
                          label: 'Reclamatória Trabalhista',
                        },
                      ]}
                      selectedValue={selectedArea}
                      onChange={value => handleSelectArea(value)}
                    />
                  </FormControl>
                )}

                {selectedSubject === 'tributary' && (
                  <FormControl>
                    <Typography variant="h6" sx={{ marginBottom: '8px' }}>
                      {'Tributário-Áreas'}
                    </Typography>
                    <RadioOptions
                      options={[
                        {
                          value: 'asphalt',
                          label: 'Asfalto',
                        },
                      ]}
                      selectedValue={selectedArea}
                      onChange={value => handleSelectArea(value)}
                    />
                  </FormControl>
                )}

                {selectedSubject === 'tributary_pis' && (
                  <Box style={{ width: '100%' }}>
                    <Flex style={{ alignItems: 'center', width: '100%' }}>
                      <Typography variant="h6" sx={{ marginRight: '16px' }}>
                        {'Compensações realizadas nos últimos 5 anos:'}
                      </Typography>
                      <Box>
                        <RadioOptions
                          options={[
                            {
                              value: 'yes',
                              label: 'Sim',
                            },
                          ]}
                          selectedValue={compensationsLastYears}
                          onChange={setCompensationsLastYears}
                        />
                      </Box>
                      <Box>
                        <RadioOptions
                          options={[
                            {
                              value: 'no',
                              label: 'Não',
                            },
                          ]}
                          selectedValue={compensationsLastYears}
                          onChange={setCompensationsLastYears}
                        />
                      </Box>
                    </Flex>

                    <Flex style={{ alignItems: 'center' }}>
                      <Typography variant="h6" sx={{ marginRight: '16px' }}>
                        {'Compensações de ofício:'}
                      </Typography>
                      <Box>
                        <RadioOptions
                          options={[
                            {
                              value: 'yes',
                              label: 'Sim',
                            },
                          ]}
                          selectedValue={officialCompensation}
                          onChange={setOfficialCompensation}
                        />
                      </Box>
                      <Box>
                        <RadioOptions
                          options={[
                            {
                              value: 'no',
                              label: 'Não',
                            },
                          ]}
                          selectedValue={officialCompensation}
                          onChange={setOfficialCompensation}
                        />
                      </Box>
                    </Flex>

                    <Flex style={{ alignItems: 'center' }}>
                      <Typography variant="h6" sx={{ marginRight: '16px' }}>
                        {'Possui ação judicial:'}
                      </Typography>
                      <Box>
                        <RadioOptions
                          options={[
                            {
                              value: 'yes',
                              label: 'Sim',
                            },
                          ]}
                          selectedValue={hasALawsuit}
                          onChange={setHasALawsuit}
                        />
                      </Box>
                      <Box>
                        <RadioOptions
                          options={[
                            {
                              value: 'no',
                              label: 'Não',
                            },
                          ]}
                          selectedValue={hasALawsuit}
                          onChange={setHasALawsuit}
                        />
                      </Box>
                    </Flex>

                    <Flex style={{ flexDirection: 'column', width: '100%' }}>
                      <Typography variant="h6">{'Projeção de ganho'}</Typography>

                      <Box sx={{ width: '174px' }}>
                        <Input
                          placeholder="00"
                          min="0"
                          id="gainProjection"
                          onInput={(e: any) => {
                            e.target.value = e.target.value.replace(/[^0-9.,]/g, '');
                          }}
                          onBlur={e => {
                            const inputValue = e.target.value;
                            const numericValue = parseFloat(inputValue.replace(',', '.'));

                            if (!isNaN(numericValue)) {
                              handleGainProjection(numericValue);
                            } else {
                              setGainProjection(undefined);
                            }
                          }}
                        />
                      </Box>

                      <Flex style={{ flexDirection: 'column', marginTop: '16px' }}>
                        <Typography variant="h6" sx={{ marginBottom: '8px' }}>
                          {'Upload de arquivos'}
                        </Typography>

                        <Box sx={{ width: '100%', height: '100%' }}>
                          <Flex style={{ flexDirection: 'row' }}>
                            <Dropzone>
                              {({ getRootProps, getInputProps, isDragActive }) => (
                                <DropContainer>
                                  <Flex
                                    {...getRootProps()}
                                    onDrop={handleDrop}
                                    onDragOver={handleDragOver}
                                  >
                                    <input
                                      {...getInputProps({
                                        accept: '.jpeg, .jpg, .png, .pdf',
                                        multiple: true,
                                      })}
                                    />
                                    {renderDragMessage(isDragActive)}
                                  </Flex>
                                </DropContainer>
                              )}
                            </Dropzone>
                            <FileList>
                              {selectedFile && selectedFile.length > 0 ? (
                                selectedFile.map((file, index) => (
                                  <div className="fileName" key={index}>
                                    <span className="name">{file.name}</span>
                                    <MdDelete
                                      size={20}
                                      color={colors.icons}
                                      style={{
                                        cursor: 'pointer',
                                        marginLeft: '5px',
                                      }}
                                      onClick={() => handleDeleteFile(file)}
                                    />
                                  </div>
                                ))
                              ) : (
                                <Typography variant="caption" sx={{ margin: 'auto' }}>
                                  {'Nenhum arquivo selecionado'}
                                </Typography>
                              )}
                            </FileList>
                          </Flex>
                          <Typography variant="caption" sx={{ marginTop: '8px' }}>
                            {'Formatos aceitos: JPEG, PNG, e PDF.'}
                          </Typography>
                          {openFileSnackbar && (
                            <Notification
                              open={openFileSnackbar}
                              message="Formato de arquivo inválido. Por favor, escolha um arquivo .jpeg, .jpg, .png ou .pdf."
                              severity="error"
                              onClose={() => setOpenFileSnackbar(false)}
                            />
                          )}
                        </Box>
                      </Flex>
                    </Flex>
                  </Box>
                )}

                {selectedSubject == 'others' && (
                  <FormControl sx={{ width: '100%', height: '100%' }}>
                    <Typography variant="h6">{'Descreva a área:'}</Typography>
                    <TextareaAutosize
                      value={otherDescription}
                      onChange={e => setOtherDescription(e.target.value)}
                      className="comment-input"
                    />
                  </FormControl>
                )}
              </SubjectOptionsArea>
            )}
          </Flex>
        </Box>
      </Container>
    </>
  );
};

export default forwardRef(WorkStepOne);
