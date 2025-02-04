import { IBank } from '@/interfaces/IBank';
import axios from 'axios';
const URL = 'https://brasilapi.com.br/api/';

const getCEPDetails = async (cep: string) => {
  try {
    const response = await axios.get(`${URL}cep/v1/${cep}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const getAllBanks = async (reduce: boolean = true) => {
  try {
    const response = await axios.get(`${URL}banks/v1`);
    const banks: IBank[] = response.data;

    if (!reduce) {
      return banks;
    }

    const uniqueBanks: IBank[] = [];
    banks.forEach(bank => {
      const nameToNormalize = bank.name || bank.fullName;
      if (!nameToNormalize) {
        return;
      }

      if (nameToNormalize.toLowerCase() === 'selic' || nameToNormalize.toLowerCase() === 'Bacen') {
        return;
      }

      const normalizedName = nameToNormalize
        .replace(/S\.A\.?/gi, '') // Remove "S.A." and "S.A"
        .replace(/FINANCIAMENTOS|BBI|BERJ/gi, '') // Remove unintelligible acronyms
        .replace(/\bBCO\b/gi, 'BANCO') // Replace "BCO" with "BANCO"
        .trim();

      if (!uniqueBanks.some(b => b.name === normalizedName)) {
        uniqueBanks.push({ ...bank, name: normalizedName });
      }
    });

    return uniqueBanks;
  } catch (error) {
    throw error;
  }
};

export { getCEPDetails, getAllBanks };
