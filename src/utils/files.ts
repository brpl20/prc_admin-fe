export const openFileInNewTab = (url: string) => {
  window.open(url, '_blank');
};

export const downloadS3FileByUrl = (url: string) => {
  console.log('Downloading file:', url);

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', ''); // Forces download behavior
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
