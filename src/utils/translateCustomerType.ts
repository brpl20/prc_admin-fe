export const translateCustomerType = (profileCustomerType: string) => {
  switch (profileCustomerType) {
    case 'physical_person':
      return 'Pessoa Física';
    case 'legal_person':
      return 'Pessoa Jurídica';
    case 'counter':
      return 'Contador';
    case 'representative':
      return 'Representante Legal';
    default:
      return profileCustomerType;
  }
};
