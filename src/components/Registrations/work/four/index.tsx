import React, {
  useState,
  useContext,
  useEffect,
  forwardRef,
  ForwardRefRenderFunction,
  useImperativeHandle,
} from 'react';

import { parseCookies } from 'nookies';
import { getAllAdmins } from '@/services/admins';
import { getOfficeById } from '@/services/offices';
import { getOfficesWithLaws } from '@/services/offices';

import { WorkContext } from '@/contexts/WorkContext';
import { IOfficeProps } from '@/interfaces/IOffice';
import { IAdminProps, IAdminPropsAttributes } from '@/interfaces/IAdmin';

import { Container } from './styles';
import { Flex } from '@/styles/globals';
import Checkbox from '@mui/material/Checkbox';
import { Box, Typography, Autocomplete, TextField } from '@mui/material';

import {
  Collapse,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';

import { MdOutlineInfo, MdOutlineArrowDropUp, MdOutlineArrowDropDown } from 'react-icons/md';

import CustomTooltip from '@/components/Tooltip';
import { Notification } from '@/components';

export interface IRefWorkStepFourProps {
  handleSubmitForm: () => void;
}
interface IStepFourProps {
  nextStep: () => void;
}

interface FormData {
  lawyers: any;
  initial_atendee: string;
  intern: string;
  bachelor: string;
  partner_lawyer: string;
  responsible_lawyer: string;
  physical_lawyer: string;
}

const WorkStepFour: ForwardRefRenderFunction<IRefWorkStepFourProps, IStepFourProps> = (
  { nextStep },
  ref,
) => {
  const { ['admin_id']: admin_id } = parseCookies();
  const [openSubTable, setOpenSubTable] = useState(true);

  const { workForm, setWorkForm } = useContext(WorkContext);
  const [allLawyers, SetAllLawyers] = useState<any>([]);
  const [offices, setOffices] = useState<IOfficeProps[]>([]);
  const [officesSelected, setOfficesSelected] = useState<any>([]);
  const [selectedLawyers, setSelectedLawyers] = useState<any[]>([]);
  const [trainee, SetTrainee] = useState<IAdminPropsAttributes[]>([]);
  const [paralegal, SetParalegal] = useState<IAdminPropsAttributes[]>([]);
  const [initialService, SetInitialService] = useState<IAdminPropsAttributes[]>([]);
  const [responsibleLawyer, SetResponsibleLawyer] = useState<IAdminPropsAttributes[]>([]);

  const [message, setMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [type, setType] = useState<'success' | 'error'>('success');

  const [formData, setFormData] = useState<FormData>({
    lawyers: [],
    initial_atendee: '',
    intern: '',
    bachelor: '',
    partner_lawyer: '',
    responsible_lawyer: '',
    physical_lawyer: '',
  });

  const handleSelectedOffice = (offices: any) => {
    setOfficesSelected(offices);
  };

  const handleSubmitForm = () => {
    try {
      if (officesSelected.length === 0) {
        throw new Error('Selecione pelo menos um escritório');
      }

      if (selectedLawyers.length === 0) {
        throw new Error('Selecione pelo menos um advogado');
      }

      const updatedFormData = { ...formData };
      updatedFormData.lawyers = selectedLawyers;
      const officesIDs = officesSelected.map((office: any) => office.id);

      const data = {
        ...workForm,
        profile_admin_ids: selectedLawyers.map((lawyer: any) => Number(lawyer)),
        office_ids: officesIDs,

        physical_lawyer: updatedFormData.physical_lawyer,
        initial_atendee: updatedFormData.initial_atendee,
        intern: updatedFormData.intern,
        bachelor: updatedFormData.bachelor,
        partner_lawyer: updatedFormData.partner_lawyer,
        responsible_lawyer: updatedFormData.responsible_lawyer,
      };

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

  const saveDataLocalStorage = (data: any) => {
    localStorage.setItem('WORK/Four', JSON.stringify(data));
  };

  const verifyDataLocalStorage = async () => {
    const data = localStorage.getItem('WORK/Four');

    if (data) {
      const parsedData = JSON.parse(data);

      if (parsedData.office_ids) {
        const offices = await getOfficesWithLaws();

        const officesSelected = offices.data.filter((office: any) =>
          parsedData.office_ids.includes(office.id),
        );

        setOfficesSelected(officesSelected);
      }

      if (parsedData.office_lawyers) {
        setSelectedLawyers(parsedData.office_lawyers);
      }

      if (parsedData.physical_lawyer) {
        setFormData(prevData => ({
          ...prevData,
          physical_lawyer: parsedData.physical_lawyer,
        }));
      }

      if (parsedData.initial_atendee) {
        setFormData(prevData => ({
          ...prevData,
          initial_atendee: parsedData.initial_atendee,
        }));
      }

      if (parsedData.intern) {
        setFormData(prevData => ({
          ...prevData,
          intern: parsedData.intern,
        }));
      }

      if (parsedData.bachelor) {
        setFormData(prevData => ({
          ...prevData,
          bachelor: parsedData.bachelor,
        }));
      }

      if (parsedData.partner_lawyer) {
        setFormData(prevData => ({
          ...prevData,
          partner_lawyer: parsedData.partner_lawyer,
        }));
      }

      if (parsedData.responsible_lawyer) {
        setFormData(prevData => ({
          ...prevData,
          responsible_lawyer: parsedData.responsible_lawyer,
        }));
      }
    }
  };

  useImperativeHandle(ref, () => ({
    handleSubmitForm,
  }));

  const getOffices = async () => {
    const response = await getOfficesWithLaws();
    setOffices(response.data);
  };

  const getAdmins = async () => {
    const response: {
      data: IAdminProps[];
    } = await getAllAdmins();
    SetAllLawyers(response.data);
  };

  const getOfficeDetails = async () => {
    if (admin_id) {
      const response = await getOfficeById(admin_id);
      const admins = response.data.attributes.profile_admins;

      let traineeAUX: IAdminPropsAttributes[] = [];
      let paralegalAUX: IAdminPropsAttributes[] = [];
      let responsibleLawyerAUX: IAdminPropsAttributes[] = [];

      admins.forEach((admin: IAdminPropsAttributes) => {
        switch (admin.role) {
          case 'lawyer':
            responsibleLawyerAUX.push(admin);
            break;
          case 'paralegal':
            paralegalAUX.push(admin);
            break;
          case 'trainee':
            traineeAUX.push(admin);
            break;
          default:
            break;
        }
      });

      SetTrainee(traineeAUX);
      SetInitialService(admins);
      SetParalegal(paralegalAUX);
      SetResponsibleLawyer(responsibleLawyerAUX);
    }
  };

  useEffect(() => {
    getOffices();
    getAdmins();
    getOfficeDetails();
  }, []);

  const handleSelectChange = (field: string, value: any) => {
    setFormData(prevData => ({
      ...prevData,
      [field as string]: value ? value.id : '',
    }));
  };

  useEffect(() => {
    const handleDataForm = () => {
      const attributes = workForm.data.attributes;

      if (attributes) {
        const office_ids = attributes.offices.map((item: any) => item.id);

        const officesSelected = offices.filter((office: any) => office_ids == office.id.toString());

        setOfficesSelected(officesSelected);

        const lawyers = attributes.profile_admins.map((item: any) => item.id);

        setSelectedLawyers(lawyers);

        const physical_lawyer = attributes.physical_lawyer;
        const initial_atendee = attributes.initial_atendee;
        const intern = attributes.intern;
        const bachelor = attributes.bachelor;
        const partner_lawyer = attributes.partner_lawyer;
        const responsible_lawyer = attributes.responsible_lawyer;

        setFormData(prevData => ({
          ...prevData,
          physical_lawyer: physical_lawyer ? physical_lawyer : '',
          initial_atendee: initial_atendee ? initial_atendee : '',
          intern: intern ? intern : '',
          bachelor: bachelor ? bachelor : '',
          partner_lawyer: partner_lawyer ? partner_lawyer : '',
          responsible_lawyer: responsible_lawyer ? responsible_lawyer : '',
        }));
      }
    };

    if (workForm.data) {
      handleDataForm();
    }
  }, [workForm, offices]);

  useEffect(() => {
    verifyDataLocalStorage();
  }, [allLawyers]);

  const customTitleWithInfo = (title: string, tooltipText: string) => (
    <Flex style={{ alignItems: 'center' }}>
      <Typography display={'flex'} alignItems={'center'} variant="h6" style={{ height: '40px' }}>
        {title}
      </Typography>
      <CustomTooltip title={tooltipText} placement="right">
        <span style={{ display: 'flex' }}>
          <MdOutlineInfo style={{ marginLeft: '8px' }} size={20} />
        </span>
      </CustomTooltip>
    </Flex>
  );

  const SubTable = (data: any) => {
    const { row } = data;
    const lawyers = row.attributes.lawyers;

    const handleSelectedLawyers = (lawyer: any) => {
      const lawyerId = lawyer.id;
      let updatedSelectedLawyers = [...selectedLawyers];

      if (updatedSelectedLawyers.includes(lawyerId)) {
        updatedSelectedLawyers = updatedSelectedLawyers.filter(id => id !== lawyerId);
      } else {
        updatedSelectedLawyers.push(lawyerId);
      }

      setSelectedLawyers(updatedSelectedLawyers);
    };

    return (
      <>
        <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
          <TableCell>
            <IconButton
              aria-label="expand row"
              size="small"
              onClick={() => setOpenSubTable(!openSubTable)}
            >
              {openSubTable ? <MdOutlineArrowDropUp /> : <MdOutlineArrowDropDown />}
            </IconButton>
          </TableCell>
          <TableCell component="th" scope="row">
            {row.attributes.name}
          </TableCell>
          <TableCell />
          <TableCell />
          <TableCell />
        </TableRow>

        <TableRow>
          <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
            <Collapse in={openSubTable} timeout="auto" unmountOnExit>
              <Box sx={{ margin: 1 }}>
                <Table size="small" aria-label="purchases">
                  <TableBody>
                    {lawyers && lawyers.length > 0
                      ? lawyers.map((lawyer: any) => (
                          <TableRow key={lawyer.name}>
                            <TableCell padding="checkbox">
                              <Box display={'flex'}>
                                <Checkbox
                                  color="primary"
                                  checked={selectedLawyers.includes(lawyer.id)}
                                  onChange={() => handleSelectedLawyers(lawyer)}
                                  inputProps={{
                                    'aria-label': 'select all desserts',
                                  }}
                                />
                              </Box>
                            </TableCell>
                            <TableCell component="th" scope="row">
                              {lawyer.name}
                            </TableCell>
                          </TableRow>
                        ))
                      : []}
                  </TableBody>
                </Table>
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      </>
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

      <Container>
        <Box mr={'16px'}>
          <Flex className="inputContainer">
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
                {'Escritório'}
              </Typography>
              <CustomTooltip
                title="Advogado ou Advogados atuando dentro de uma pessoa jurídica."
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

            <Autocomplete
              multiple
              limitTags={1}
              id="multiple-limit-tags"
              options={offices}
              getOptionLabel={option => option.attributes.name}
              renderInput={params => (
                <TextField placeholder="Selecione um Escritório" {...params} size="small" />
              )}
              sx={{ width: '398px', backgroundColor: 'white', zIndex: 1 }}
              noOptionsText="Nenhum Escritório Encontrado"
              onChange={(event, value) => {
                handleSelectedOffice(value);
              }}
              value={officesSelected}
            />
            <Typography variant="caption" sx={{ marginTop: '4px' }} gutterBottom>
              {'* Indique ao menos um advogado para cada escritório selecionado.'}
            </Typography>
          </Flex>

          <Flex className="inputContainer">
            {customTitleWithInfo(
              'Advogado Pessoa Física',
              'Selecione quando a atuação for pela pessoa física.',
            )}

            <Autocomplete
              limitTags={1}
              id="multiple-limit-tags"
              value={
                formData.physical_lawyer
                  ? allLawyers.find(
                      (lawyer: IAdminPropsAttributes) =>
                        lawyer.id.toString() == formData.physical_lawyer,
                    )
                  : ''
              }
              options={allLawyers}
              getOptionLabel={(option: any) =>
                option && option.attributes ? option.attributes.name : ''
              }
              onChange={(event, value) => handleSelectChange('physical_lawyer', value)}
              renderInput={params => (
                <TextField {...params} placeholder={'Informe o Advogado'} size="small" />
              )}
              noOptionsText={`Nenhuma Advogado Encontrado`}
            />
          </Flex>

          <Flex className="inputContainer">
            {customTitleWithInfo(
              'Advogado Responsável',
              'Advogado responsável internamente pelas movimentações, monitoramento e andamento do caso e também para assumir a responsabilidade civil do processo caso for o caso, assinando por toda a sociedade ou individualmente.',
            )}

            <Autocomplete
              limitTags={1}
              id="multiple-limit-tags"
              value={
                formData.responsible_lawyer
                  ? responsibleLawyer.find(
                      (lawyer: IAdminPropsAttributes) =>
                        lawyer.id.toString() == formData.responsible_lawyer,
                    )
                  : ''
              }
              options={responsibleLawyer}
              getOptionLabel={(option: any) => (option && option.name ? option.name : '')}
              onChange={(event, value) => handleSelectChange('responsible_lawyer', value)}
              renderInput={params => (
                <TextField {...params} placeholder={'Informe o Responsável'} size="small" />
              )}
              noOptionsText={`Nenhuma Responsável Encontrado`}
            />
          </Flex>

          <Flex className="inputContainer">
            {customTitleWithInfo(
              'Atendimento Inicial',
              'Responsável pelo primeiro atendimento do cliente.',
            )}

            <Autocomplete
              limitTags={1}
              id="multiple-limit-tags"
              value={
                formData.initial_atendee
                  ? initialService.find(
                      (lawyer: IAdminPropsAttributes) =>
                        lawyer.id.toString() == formData.initial_atendee,
                    )
                  : ''
              }
              options={initialService}
              getOptionLabel={(option: any) => (option && option.name ? option.name : '')}
              onChange={(event, value) => handleSelectChange('initial_atendee', value)}
              renderInput={params => (
                <TextField {...params} placeholder={'Informe o Responsavel'} size="small" />
              )}
              noOptionsText={`Nenhuma Advogado Encontrado`}
            />
          </Flex>

          <Flex className="inputContainer">
            {customTitleWithInfo(
              'Outorgado por Advogado Parceiro?',
              'O termo "Outorgado por Advogado Parceiro" indica que a autorização vem de um advogado que é parceiro do escritório, fortalecendo a colaboração e a sinergia entre eles.',
            )}

            <Autocomplete
              limitTags={1}
              id="multiple-limit-tags"
              value={
                formData.partner_lawyer
                  ? allLawyers.find(
                      (lawyer: IAdminPropsAttributes) =>
                        lawyer.id.toString() == formData.partner_lawyer,
                    )
                  : ''
              }
              options={allLawyers}
              getOptionLabel={(option: any) =>
                option && option.attributes ? option.attributes.name : ''
              }
              onChange={(event, value) => handleSelectChange('partner_lawyer', value)}
              renderInput={params => (
                <TextField {...params} placeholder={'Selecione um Advogado Externo'} size="small" />
              )}
              noOptionsText={`Nenhuma Advogado Encontrado`}
            />
          </Flex>

          <Flex className="inputContainer">
            {customTitleWithInfo(
              'Estagiários da Procuração',
              'Em alguns serviços administrativos, é possível adicionar os estagiários para executar trabalhos mais simples.',
            )}

            <Autocomplete
              limitTags={1}
              id="multiple-limit-tags"
              value={
                formData.intern ? trainee.find((lawyer: any) => lawyer.id == formData.intern) : ''
              }
              options={trainee}
              getOptionLabel={(option: any) => (option && option.name ? option.name : '')}
              onChange={(event, value) => handleSelectChange('intern', value)}
              renderInput={params => (
                <TextField {...params} placeholder={'Selecione um Estagiário'} size="small" />
              )}
              noOptionsText={`Nenhuma Advogado Encontrado`}
            />
          </Flex>

          <Flex className="inputContainer">
            {customTitleWithInfo(
              'Bacharéis/Paralegais da Procuração',
              'Em alguns serviços administrativos, é possível adicionar os bacharéis/paralegais para executar trabalhos mais simples.',
            )}

            <Autocomplete
              limitTags={1}
              id="multiple-limit-tags"
              value={
                formData.bachelor
                  ? paralegal.find((lawyer: any) => lawyer.id == formData.bachelor)
                  : ''
              }
              options={paralegal}
              getOptionLabel={(option: any) => (option && option.name ? option.name : '')}
              onChange={(event, value) => handleSelectChange('bachelor', value)}
              renderInput={params => (
                <TextField {...params} placeholder={'Selecione um Paralegal'} size="small" />
              )}
              noOptionsText={`Nenhuma Advogado Encontrado`}
            />
          </Flex>
        </Box>

        <Box mt={'16px'}>
          <Typography
            display={'flex'}
            alignItems={'center'}
            variant="h6"
            style={{ height: '40px' }}
          >
            {'Advogados'}
          </Typography>
          <Box width={'398px'} className="tableContainer">
            <TableContainer component={Paper}>
              <Table aria-label="collapsible table">
                <TableHead>
                  <TableRow>
                    <TableCell />
                    <TableCell>
                      <Typography
                        display={'flex'}
                        alignItems={'center'}
                        variant="subtitle1"
                        style={{ height: '30px', position: 'relative' }}
                      >
                        {officesSelected.length > 0
                          ? 'Informe os Advogados'
                          : 'Nenhum Escritório selecionado'}
                      </Typography>
                    </TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {officesSelected.length > 0 &&
                    officesSelected.map((data: any) => <SubTable key={data.id} row={data} />)}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Box>
      </Container>
    </>
  );
};

export default forwardRef(WorkStepFour);
