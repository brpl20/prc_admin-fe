import dayjs, { Dayjs } from 'dayjs';

export const isValidCPF = (cpf: string): boolean => {
  if (!cpf) return false;

  // Remove non-digit characters
  const cleanedCPF = cpf.replace(/\D/g, '');

  // CPF must be exactly 11 digits long
  if (cleanedCPF.length !== 11) return false;

  // Reject CPFs with all identical digits (e.g., 111.111.111-11)
  if (/^(\d)\1{10}$/.test(cleanedCPF)) return false;

  // Convert the CPF into an array of digits
  const cpfDigits = cleanedCPF.split('').map(Number);

  // Calculate the first verification digit
  const calculateVerificationDigit = (cpfSlice: number[], factor: number) => {
    const sum = cpfSlice
      .map((digit, index) => digit * (factor - index))
      .reduce((acc, curr) => acc + curr, 0);
    const result = (sum * 10) % 11;
    return result >= 10 ? 0 : result;
  };

  const firstVerificationDigit = calculateVerificationDigit(cpfDigits.slice(0, 9), 10);
  if (firstVerificationDigit !== cpfDigits[9]) return false;

  const secondVerificationDigit = calculateVerificationDigit(cpfDigits.slice(0, 10), 11);
  if (secondVerificationDigit !== cpfDigits[10]) return false;

  return true;
};

export const isValidCNPJ = (cnpj: string): boolean => {
  if (!cnpj) return false;

  // Remove non-digit characters
  const cleanedCNPJ = cnpj.replace(/\D/g, '');

  // CNPJ must be exactly 11 digits long
  if (cleanedCNPJ.length !== 14) return false;

  // Reject CNPJs with all identical digits (e.g., 11111111111111)
  if (/^(\d)\1{13}$/.test(cleanedCNPJ)) return false;

  // Calculate the verification digit
  const calculateVerificationDigit = (cnpjSlice: number[], factors: number[]): number => {
    const sum = cnpjSlice
      .map((digit, index) => digit * factors[index])
      .reduce((acc, curr) => acc + curr, 0);
    const result = sum % 11;
    return result < 2 ? 0 : 11 - result;
  };

  // Convert the CNPJ into an array of digits
  const cnpjDigits = cleanedCNPJ.split('').map(Number);

  const firstFactors = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const firstVerificationDigit = calculateVerificationDigit(cnpjDigits.slice(0, 12), firstFactors);
  if (firstVerificationDigit !== cnpjDigits[12]) return false;

  const secondFactors = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const secondVerificationDigit = calculateVerificationDigit(
    cnpjDigits.slice(0, 13),
    secondFactors,
  );
  if (secondVerificationDigit !== cnpjDigits[13]) return false;

  return true;
};

export const isValidRG = (rg: string): boolean => {
  if (!rg) return false;

  return true;

  // Currently this function only checks if the rg is not empty.
  // This is not ideal, however, because RGs can have different formats
  // depending on the issuing state. A more robust implementation would
  // require a list of valid RG formats for each state, which is not
  // feasible at this moment.
};

export const isValidCEP = (cep: string): boolean => {
  if (!cep) return false;

  const cleanedCEP = cep.replace(/\D/g, '');

  // CEP must be 8 digits long
  return /^\d{8}$/.test(cleanedCEP);
};

export const isValidPhoneNumber = (phoneNumber: string): boolean => {
  if (!phoneNumber) return false;

  // Regular expression for Brazilian phone numbers (with or without +55 country code)
  const brazilianPhoneRegex = /^(?:\+55\s?)?(?:\(?\d{2}\)?\s?)?(?:9\d{4}|\d{4})-?\d{4}$/;

  // Regular expression for international phone numbers (must start with "+" followed by country code)
  const internationalPhoneRegex = /^\+(\d{1,4})\s?\d{1,15}(?:\s|-)?\d{1,15}$/;

  // Check if the phone number matches either Brazilian or international pattern
  return brazilianPhoneRegex.test(phoneNumber) || internationalPhoneRegex.test(phoneNumber);
};

export function isValidEmail(email: string): boolean {
  if (!email) return false;

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

export function isValidDate(date: string): boolean {
  if (!date) return false;

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  return dateRegex.test(date);
}

export function isDateBeforeToday(date: string | Dayjs): boolean {
  let inputDate: Dayjs;

  if (typeof date === 'string') {
    if (!isValidDate(date)) return false;
    inputDate = dayjs(date);
  } else {
    inputDate = date;
  }

  if (!inputDate.isValid()) return false;

  const today = dayjs().startOf('day');

  console.log('inputDate:', inputDate.format());
  console.log('today:', today.format());

  return inputDate.isBefore(today);
}

export function isDateTodayOrAfter(date: string | Dayjs): boolean {
  let inputDate: Dayjs;

  if (typeof date === 'string') {
    if (!isValidDate(date)) return false;
    inputDate = dayjs(date);
  } else {
    inputDate = date;
  }

  if (!inputDate.isValid()) return false;

  const today = dayjs().startOf('day');

  return inputDate.isSame(today) || inputDate.isAfter(today);
}

export function isDateTodayOrBefore(date: string | Dayjs): boolean {
  let inputDate: Dayjs;

  if (typeof date === 'string') {
    if (!isValidDate(date)) return false;
    inputDate = dayjs(date);
  } else {
    inputDate = date;
  }

  if (!inputDate.isValid()) return false;

  const today = dayjs().startOf('day');

  return inputDate.isSame(today) || inputDate.isBefore(today);
}
