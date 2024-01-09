const workSteps = [
  'Procedimento/Assunto',
  'Honorários',
  'Poderes',
  'Informações Internas',
  'Indicação',
  'Informações Adicionais',
];

const PFCustomerSteps = [
  'Dados Pessoais',
  'Endereço',
  'Contato',
  'Dados Bancários',
  'Informações Adicionais',
  'Arquivos',
];

const userTypeOptions = [
  { label: 'Pessoa Física', value: 'physical' },
  { label: 'Pessoa Jurídica', value: 'legal' },
];

const UserRegisterTypesOptions = [
  { label: 'Advogado', value: 'lawyer' },
  { label: 'Paralegal', value: 'paralegal' },
  { label: 'Trainee', value: 'trainee' },
  { label: 'Secretário(a)', value: 'secretary' },
  { label: 'Contador(a)', value: 'excounter' },
];

const gendersOptions = [
  { label: 'Masculino', value: 'male' },
  { label: 'Feminino', value: 'female' },
];

const civilStatusOptions = [
  { label: 'Solteiro', value: 'single' },
  { label: 'Casado', value: 'married' },
  { label: 'Divorciado', value: 'divorced' },
  { label: 'Viúvo', value: 'widower' },
  { label: 'União Estável', value: 'union' },
];

const nationalityOptions = [
  { label: 'Brasileiro', value: 'brazilian' },
  { label: 'Estrangeiro', value: 'foreigner' },
];

const capacityOptions = [
  { label: 'Capaz', value: 'able' },
  { label: 'Relativamente Incapaz', value: 'relatively' },
  { label: 'Absolutamente Incapaz', value: 'unable' },
];

const userFormData = {
  customerId: '',
  name: '',
  last_name: '',
  CPF: '',
  RG: '',
  gender: '',
  mother_name: '',
  civil_status: '',
  nationality: '',
  professional_record: '',

  CEP: '',
  address: '',
  state: '',
  city: '',
  number: '',
  description: '',
  neighborhood: '',

  bank: '',
  agency: '',
  op: '',
  account: '',
  pix: '',
};

const officeType = [
  { label: 'Advocacia', value: '1' },
  { label: 'Outro', value: '2' },
];

const societyType = [
  { label: 'Company', value: 'company' },
  { label: 'Sociedade Simples', value: 'sole_proprietorship' },
  { label: 'Sociedade Empresária', value: 'individual' },
];

const PJCustomerSteps = ['Dados da Empresa', 'Contato', 'Dados Bancários', 'Arquivos'];

export {
  workSteps,
  PFCustomerSteps,
  PJCustomerSteps,
  userTypeOptions,
  gendersOptions,
  civilStatusOptions,
  nationalityOptions,
  capacityOptions,
  userFormData,
  officeType,
  societyType,
  UserRegisterTypesOptions,
};
