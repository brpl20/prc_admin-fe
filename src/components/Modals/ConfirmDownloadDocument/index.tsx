import { Box, Modal, Typography, Button } from '@mui/material';
import { BsDownload } from 'react-icons/bs';
import { colors } from '@/styles/globals';
import { MdClose } from 'react-icons/md';
import { Content } from './styles';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { getCustomerById } from '@/services/customers';
import { downloadS3FileByUrl } from '@/utils/files';
import { Notification } from '@/components';

interface IConfirmDownloadDocumentProps {
  isOpen: boolean;
  onClose: () => void;
  documents: any[];
}

const ConfirmDownloadDocument = ({ isOpen, onClose, documents }: IConfirmDownloadDocumentProps) => {
  const route = useRouter();

  const [documentsPerCustomer, setDocumentsPerCustomer] = useState<any>({});
  const [customerNames, setCustomerNames] = useState<Array<string>>([]);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const documentsPerCustomer = documents.reduce((acc, document) => {
      if (!acc[document.profile_customer_id]) {
        acc[document.profile_customer_id] = [];
      }

      acc[document.profile_customer_id].push(document);

      return acc;
    }, {});

    setDocumentsPerCustomer(documentsPerCustomer);
  }, [documents]);

  const getCustomerName = async (customerId: string) => {
    const customer = await getCustomerById(customerId);
    return customer?.data?.attributes?.name;
  };

  useEffect(() => {
    const fetchCustomerNames = async () => {
      const names = await Promise.all(
        Object.keys(documentsPerCustomer).map(async customerId => {
          const name = await getCustomerName(customerId);
          return `${name}`;
        }),
      );
      setCustomerNames(names);
    };

    fetchCustomerNames();
  }, [documentsPerCustomer]);

  const handleClose = () => {
    onClose();

    if (route.asPath.includes('trabalho')) {
      route.push('/trabalhos');
    }

    if (route.asPath.includes('cliente')) {
      route.push('/clientes');
    }
  };

  const handleDownload = (url: string) => {
    try {
      downloadS3FileByUrl(url);
    } catch (error: any) {
      setErrorMessage(error.message);
    }
  };

  return (
    <>
      <Modal open={isOpen} onClose={onClose} style={{ overflowY: 'auto' }}>
        <Content>
          <Box display={'flex'} alignItems={'center'} justifyContent={'space-between'}>
            <label style={{ fontSize: '28px', color: '#01013D', fontWeight: '500' }}>
              {'Arquivos para Download'}
            </label>
            <Box sx={{ cursor: 'pointer' }} onClick={onClose}>
              <MdClose size={26} onClick={handleClose} />
            </Box>
          </Box>
          <Box width={'100%'} height={'1px'} bgcolor={colors.quartiary} />

          <div className="scroll">
            {customerNames.map((customerName, customerIndex) => (
              <Box mt={'20px'} key={customerIndex}>
                <Typography
                  variant="subtitle1"
                  style={{
                    fontWeight: '500',
                    fontSize: '20px',
                    color: '#26B99A',
                  }}
                >
                  {customerName}
                </Typography>
                {documentsPerCustomer[Object.keys(documentsPerCustomer)[customerIndex]].map(
                  (document: any, documentIndex: number) => (
                    <div
                      key={document.url}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                      }}
                    >
                      <Typography
                        id="download-document"
                        variant="subtitle1"
                        style={{
                          fontWeight: '400',
                          fontSize: '18px',
                          color: colors.black,
                          display: 'flex',
                          alignItems: 'center',
                          cursor: 'pointer',
                          gap: '8px',
                        }}
                        onClick={() => handleDownload(document.original_file_url)}
                      >
                        <BsDownload size={20} color={colors.primary} />
                        {document.document_type
                          ? document.document_type === 'procuration'
                            ? 'Procuração'
                            : document.document_type === 'waiver'
                            ? 'Termo de Renúncia'
                            : document.document_type === 'deficiency_statement'
                            ? 'Declaração de Carência'
                            : 'Contrato'
                          : 'Procuração Simples'}
                      </Typography>
                    </div>
                  ),
                )}
              </Box>
            ))}
          </div>

          <Box width={'100%'} display={'flex'} justifyContent={'end'} mt={'20px'}>
            <Button
              color="primary"
              variant="outlined"
              sx={{
                width: '100px',
                height: '36px',
              }}
              onClick={handleClose}
            >
              {'Fechar'}
            </Button>
          </Box>
        </Content>
      </Modal>
      <Notification
        open={!!errorMessage}
        message={errorMessage}
        severity={'error'}
        onClose={() => setErrorMessage('')}
      />
    </>
  );
};

export default ConfirmDownloadDocument;
