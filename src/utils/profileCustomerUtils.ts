import { IProfileCustomer } from '@/interfaces/ICustomer';
import { cnpjMask, cpfMask } from '@/utils/masks';
import { isValidCPF, isValidCNPJ } from './validator';

export function getProfileCustomerCpfOrCpnj(profileCustomer: IProfileCustomer) {
  const { cpf, cnpj } = profileCustomer.attributes;

  const cpfValid = cpf && isValidCPF(cpf);
  const cnpjValid = cnpj && isValidCNPJ(cnpj);

  if (cpfValid) {
    return cpfMask(cpf);
  } else if (cnpjValid) {
    return cnpjMask(cnpj);
  } else {
    return 'Não possui';
  }
}

export function getProfileCustomerFullName(profileCustomer: IProfileCustomer): string {
  const { name, last_name } = profileCustomer.attributes;

  const fullName = `${name} ${last_name}`.trim();

  return fullName;
}
