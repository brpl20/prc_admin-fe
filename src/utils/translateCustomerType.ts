export const translateCustomerType = (profileCustomerType: string) => {
  switch (profileCustomerType) {
    case 'physical_person':
      return 'Pessoa Fisica';
    case 'legal_person':
      return 'Pessoa Juridica';
    case 'counter':
      return 'Contador';
    case 'representative':
      return 'Representante Legal';
    default:
      return profileCustomerType;
  }
};