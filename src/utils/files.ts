export const openFileInNewTab = (url: string) => {
  window.open(url, '_blank');
};

export const downloadFileByUrl = (url: string, filename?: string) => {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || '';
  link.click();
};
