import { IProfileCustomer } from '@/interfaces/ICustomer';
import { cnpjMask, cpfMask } from '@/utils/masks';

export function getProfileCustomerCpfOrCpnj(profileCustomer: IProfileCustomer): string {
  const { cpf, cnpj } = profileCustomer.attributes;

  if (cnpj) {
    return cpfMask(cnpj);
  }

  if (cpf) {
    return cnpjMask(cpf);
  }

  return '';
}

export function getProfileCustomerFullName(profileCustomer: IProfileCustomer): string {
  const { name, last_name } = profileCustomer.attributes;

  let fullName = name;
  if (last_name) {
    fullName += ` ${last_name}`;
  }

  return fullName;
}
