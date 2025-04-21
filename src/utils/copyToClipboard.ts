export const copyToClipboard = (value: string, callback?: () => void) => {
  const cleanValue = value.replace(/[^\d]/g, '');
  navigator.clipboard.writeText(cleanValue).then(() => {
    if (callback) callback();
  });
};
