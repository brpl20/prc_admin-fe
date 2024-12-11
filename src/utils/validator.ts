export const isValidCPF = (cpf: string): boolean => {
    if (!cpf) return false;

    // Getting rid of special characters
    cpf = cpf.replace(/\D/g, '');
    if (cpf.length != 11) return false;

    // Checking for a series of identical characters. Ex: 11111111111
    if (/^(\d)\1{10}$/.test(cpf)) return false;

    const cpfNumbers = cpf.split('').map(Number);
    const firstNineDigits = cpfNumbers.slice(0, 9);
    const verificationDigits = cpfNumbers.slice(9);

    const firstCheckSum = firstNineDigits
        .map((digit, index) => digit * (10 - index))
        .reduce((acc, curr) => acc + curr, 0)

    const firstVerificationDigit = (firstCheckSum * 10) % 11;
    const firstDigit = firstVerificationDigit === 10 ? 0 : firstVerificationDigit;

    if (firstDigit !== verificationDigits[0]) return false;

    const secondCheckSum = cpfNumbers
        .slice(0, 10)
        .map((digit, index) => digit * (11 - index))
        .reduce((acc, curr) => acc + curr, 0);

    const secondVerificationDigit = (secondCheckSum * 10) % 11;
    const secondDigit = secondVerificationDigit === 10 ? 0 : secondVerificationDigit;

    if (secondDigit !== verificationDigits[1]) return false;

    return true;
}