type Power = {
  id: number;
  description: string;
  category: string;
};

export default function useFilteredPowers(allPowers: Power[], workForm: any) {
  const { data } = workForm;
  const attributes = data?.attributes || {};
  const { subject, procedures } = attributes;
  const powersToAdd: any[] = [];

  if (procedures?.includes('administrative')) {
    if (subject === 'administrative_subject')
      powersToAdd.push(...allPowers.filter(p => p?.category === 'admgeneral'));
    if (subject === 'social_security')
      powersToAdd.push(...allPowers.filter(p => p?.category === 'admspecificprev'));
    if (subject === 'tributary')
      powersToAdd.push(...allPowers.filter(p => p?.category === 'admspecifictributary'));
  }

  if (procedures?.includes('judicial')) {
    powersToAdd.push(...allPowers.filter(p => p?.category === 'lawgeneral'));
    if (subject === 'social_security')
      powersToAdd.push(...allPowers.filter(p => p?.category === 'lawsprev'));
    if (subject === 'criminal')
      powersToAdd.push(...allPowers.filter(p => p?.category === 'lawspecificcrime'));
  }

  if (procedures?.includes('extrajudicial')) {
    powersToAdd.push(...allPowers.filter(p => p?.category === 'extrajudicial'));
  }

  return allPowers;
}
