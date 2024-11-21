export const defaultTableValueFormatter = (params: any) => {
  const value = params.value;
  if (Array.isArray(value)) {
    return value.length === 0 ? '-' : value;
  }
  return value ?? '-';
};
