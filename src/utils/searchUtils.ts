import { IProfileCustomer } from '@/interfaces/ICustomer';
import { ITaskProps } from '@/interfaces/ITask';
import { IWorksListProps } from '@/interfaces/IWork';

type SearchField = 'profile_customers' | 'procedure' | 'requestProcess';
type OptimizedCustomer = {
  id: number;
  name: string;
  last_name: string;
  email: string;
};
type CustomerMatch = OptimizedCustomer | { name: string; last_name: string; email: string };

export const createSearchRegex = (searchTerm: string): RegExp => {
  if (!searchTerm.trim()) {
    return /.*/;
  }

  const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  const normalizedTerm = escapedTerm
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

  const charVariations: Record<string, string> = {
    a: 'aáàâãä',
    e: 'eéèêë',
    i: 'iíìîï',
    o: 'oóòôõö',
    u: 'uúùûü',
    c: 'cç',
  };

  const pattern = Array.from(normalizedTerm)
    .map(char => {
      const variations = charVariations[char.toLowerCase()] || char;
      return `[${variations}]`;
    })
    .join('');

  return new RegExp(pattern, 'i');
};

export const isCustomerMatch = (
  customer: { name: string; last_name: string },
  searchRegex: RegExp,
): boolean => {
  if (!customer) return false;
  return searchRegex.test(customer.name) || searchRegex.test(customer.last_name);
};

export const optimizeCustomersList = (customers: IProfileCustomer[]): OptimizedCustomer[] => {
  return customers.map(customer => ({
    id: Number(customer.id),
    name: customer.attributes.name || '',
    last_name: customer.attributes.last_name || '',
    email: customer.attributes.access_email || '',
  }));
};

const getWorkCustomers = (
  work: IWorksListProps,
  allCustomers: OptimizedCustomer[],
  profileCustomersList: IProfileCustomer[],
): CustomerMatch[] => {
  return work.attributes.profile_customers.map(client => {
    const fullProfile = profileCustomersList.find(p => Number(p.id) === Number(client.id));
    if (fullProfile) {
      return {
        id: Number(fullProfile.id),
        name: fullProfile.attributes.name,
        last_name: fullProfile.attributes.last_name || '',
        email: fullProfile.attributes.access_email,
      };
    }
    return (
      allCustomers.find(c => c.id === Number(client.id)) || { name: '', last_name: '', email: '' }
    );
  });
};

export const filterByCustomerSearch = (
  works: IWorksListProps[],
  profileCustomersList: IProfileCustomer[],
  search: string,
): IWorksListProps[] => {
  if (!search.trim()) return [...works];

  const allCustomers = optimizeCustomersList(profileCustomersList);
  const searchRegex = createSearchRegex(search);

  return works.filter(work => {
    const clients = getWorkCustomers(work, allCustomers, profileCustomersList);
    return clients.some(customer => isCustomerMatch(customer, searchRegex));
  });
};

const filterByProcedureSearch = (
  works: IWorksListProps[],
  searchRegex: RegExp,
  mapProcedureName: (procedure: any) => string,
): IWorksListProps[] => {
  return works.filter(work => {
    const procedures = work.attributes.procedure
      ? [mapProcedureName(work.attributes.procedure)]
      : work.attributes.procedures?.map(mapProcedureName) || [];
    return procedures.some(procedure => searchRegex.test(procedure));
  });
};

const filterByProcessNumberSearch = (
  works: IWorksListProps[],
  searchRegex: RegExp,
): IWorksListProps[] => {
  return works.filter(
    work =>
      work.attributes.number !== null &&
      work.attributes.number !== undefined &&
      searchRegex.test(work.attributes.number.toString()),
  );
};

export const searchWorks = (
  works: IWorksListProps[],
  profileCustomersList: IProfileCustomer[],
  search: string,
  searchField: SearchField,
  mapProcedureName?: (procedure: any) => string,
): IWorksListProps[] => {
  if (!search.trim()) return [...works];

  const searchRegex = createSearchRegex(search);

  switch (searchField) {
    case 'profile_customers':
      return filterByCustomerSearch(works, profileCustomersList, search);

    case 'procedure':
      if (!mapProcedureName) return works;
      return filterByProcedureSearch(works, searchRegex, mapProcedureName);

    case 'requestProcess':
      return filterByProcessNumberSearch(works, searchRegex);

    default:
      return works;
  }
};

type TaskSearchField = 'description' | 'customer' | 'work';

export const filterTasksBySearch = (
  tasks: ITaskProps[],
  search: string,
  searchField: TaskSearchField,
): ITaskProps[] => {
  if (!search.trim()) {
    return [...tasks];
  }

  const searchRegex = createSearchRegex(search);

  switch (searchField) {
    case 'description':
      return tasks.filter(task => searchRegex.test(task.attributes.description));

    case 'customer':
      return tasks.filter(
        task => task.attributes.customer && searchRegex.test(task.attributes.customer),
      );

    case 'work':
      return tasks.filter(
        task =>
          task.attributes.work_number !== null &&
          task.attributes.work_number !== undefined &&
          searchRegex.test(task.attributes.work_number.toString()),
      );

    default:
      return tasks;
  }
};
