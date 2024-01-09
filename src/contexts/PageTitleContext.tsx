import { createContext, useState } from 'react';

interface IContextValue {
  showTitle: boolean;
  setShowTitle: (data: any) => void;
  pageTitle: string;
  setPageTitle: (data: any) => void;
}

interface IProps {
  children: React.ReactNode;
}

export const PageTitleContext = createContext<IContextValue>({} as IContextValue);

const PageTitleProvider = ({ children }: IProps) => {
  const [showTitle, setShowTitle] = useState(false);
  const [pageTitle, setPageTitle] = useState('');

  return (
    <PageTitleContext.Provider
      value={{
        showTitle,
        setShowTitle,
        pageTitle,
        setPageTitle,
      }}
    >
      {children}
    </PageTitleContext.Provider>
  );
};

export default PageTitleProvider;
