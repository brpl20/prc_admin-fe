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

const getAllBanks = async () => {
  try {
    const response = await axios.get(`${URL}banks/v1`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export { getCEPDetails, getAllBanks };
