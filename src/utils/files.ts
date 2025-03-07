import { isValidHttpUrl } from './validator';

export const openFileInNewTab = (url: string) => {
  window.open(url, '_blank');
};

export const downloadS3FileByUrl = (url: string, filename?: string) => {
  if (!url || !isValidHttpUrl(url)) {
    throw Error('Ocorreu um erro ao tentar baixar o arquivo. Por favor, tente novamente.');
  }

  const lowerCaseUrl = url.toLowerCase();

  if (lowerCaseUrl.includes('.pdf')) {
    return openFileInNewTab(url);
  }

  const link = document.createElement('a');
  link.href = url;
  link.download = filename || '';
  link.click();
};
