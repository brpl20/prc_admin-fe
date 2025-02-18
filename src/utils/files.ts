export const openFileInNewTab = (url: string) => {
  window.open(url, '_blank');
};

export const downloadS3FileByUrl = async (url: string, filename?: string) => {
  if (!url) {
    return console.error('File URL is null.');
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
