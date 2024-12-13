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

export const isValidRG = (rg: string): boolean => {
  if (!rg) return false;

  const cleanedRG = rg.replace(/\D/g, '');

  // RG must be at least 9 digits long
  if (cleanedRG.length < 9) return false;

  // Check for a sequence of identical digits (e.g., 111111111)
  if (/^(\d)\1{8}$/.test(cleanedRG)) return false;

  return true;
};

export const isValidCEP = (cep: string): boolean => {
  if (!cep) return false;

  const cleanedCEP = cep.replace(/\D/g, '');

  // CEP must be 8 digits long
  return /^\d{8}$/.test(cleanedCEP);
};
