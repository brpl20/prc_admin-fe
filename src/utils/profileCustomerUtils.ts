import { IProfileCustomer } from '@/interfaces/ICustomer';
import { cpfMask } from '@/utils/masks';

export function getProfileCustomerCpfOrCpnj(profileCustomer: IProfileCustomer): string {
  const { cpf, cnpj, customer_type } = profileCustomer.attributes;

  if (cnpj && customer_type === 'Pessoa Jurídica') {
    return cnpj;
  }

  return cpf ? cpfMask(cpf) : '';
}

export function getProfileCustomerFullName(profileCustomer: IProfileCustomer): string {
  const { name, last_name } = profileCustomer.attributes;

  let fullName = name;
  if (last_name) {
    fullName += ` ${last_name}`;
  }

  return fullName;
}
