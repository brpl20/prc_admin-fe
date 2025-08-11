import api from './api';

export interface SystemSettings {
  minimum_wage: number;
  inss_ceiling: number;
  settings: {
    key: string;
    value: number;
    year: number;
    description: string;
  }[];
}

export const getSystemSettings = async (): Promise<SystemSettings> => {
  const response = await api.get('/system_settings');
  return response.data;
};

export const getMinimumWage = async (): Promise<number> => {
  const settings = await getSystemSettings();
  return settings.minimum_wage;
};

export const getINSSCeiling = async (): Promise<number> => {
  const settings = await getSystemSettings();
  return settings.inss_ceiling;
};

export const validateProLaboreAmount = (amount: number, minimumWage: number, inssCeiling: number): string | null => {
  if (amount === 0) {
    return null; // Valor zero é permitido (sócio não receberá pro-labore)
  }
  
  if (amount < minimumWage) {
    return `Valor abaixo do salário mínimo (R$ ${minimumWage.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})`;
  }
  
  if (amount > inssCeiling) {
    return `Valor acima do teto do INSS (R$ ${inssCeiling.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})`;
  }
  
  return null; // Valor válido
};