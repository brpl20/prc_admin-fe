import React, {
  useState,
  useContext,
  forwardRef,
  ForwardRefRenderFunction,
  useImperativeHandle,
  ChangeEvent,
  DragEvent,
} from 'react';

import Dropzone from 'react-dropzone';
import { MdDelete } from 'react-icons/md';

import { Flex, colors } from '@/styles/globals';
import CheckBox from '@/components/CheckBox';
import { Container, DropContainer, FileList } from '../styles';

import Notification from '@/components/Notification';
import { animateScroll as scroll } from 'react-scroll';
import { CustomerContext } from '@/contexts/CustomerContext';

import { Box, Typography } from '@mui/material';
import RepresentativeModal from '../../representative/representativeModal';

export interface IRefPFCustomerStepSixProps {
  handleSubmitForm: () => void;
}

interface IStepSixProps {
  confirmation: () => void;
  editMode: boolean;
}

const PFCustomerStepSix: ForwardRefRenderFunction<IRefPFCustomerStepSixProps, IStepSixProps> = (
  { confirmation, editMode },
  ref,
) => {
  const [selectedFile, setSelectedFile] = useState<File[]>([]);
  const { customerForm, setCustomerForm } = useContext(CustomerContext);
  const [openFileSnackbar, setOpenFileSnackbar] = useState(false);
  const [checkedItems, setCheckedItems] = useState({
    sendAccessData: false,
    issueDocuments: false,
    sendForSignature: false,
  });

  const renderDragMessage = (isDragActive: boolean) => {
    if (!isDragActive) {
      return <p>Arraste arquivos aqui...</p>;
    }
    return <p>Solte os arquivos aqui</p>;
  };

  const handleDrop = (files: File[]) => {
    const acceptedFileTypes = 'image/x-png, image/png, image/jpg, image/jpeg, application/pdf';

    const acceptedFiles = files.filter(file => acceptedFileTypes.includes(file.type));

    if (acceptedFiles.length > 0) {
      setSelectedFile(prevSelected => [...prevSelected, ...acceptedFiles]);
    } else {
      setOpenFileSnackbar(true);
    }
  };

  const handleDeleteFile = (fileToDelete: File) => {
    setSelectedFile((prevSelected: any) =>
      prevSelected.filter((file: any) => file !== fileToDelete),
    );
  };

  const handleDragOver = (event: ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
  };

  const handleCheckboxChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;

    setCheckedItems(prevItems => ({
      ...prevItems,
      [name]: checked,
    }));
  };

  const handleSubmitForm = () => {
    let data = {};

    if (checkedItems.issueDocuments) {
      data = {
        ...customerForm,
        customer_type: 'physical_person',
        selectedFile: selectedFile,
        checked_items: checkedItems,
        customer_files_attributes: [
          {
            file_description: 'simple_procuration',
          },
        ],
      };
    }

    if (!checkedItems.issueDocuments) {
      data = {
        ...customerForm,
        customer_type: 'physical_person',
        selectedFile: selectedFile,
        checked_items: checkedItems,
      };
    }

    setCustomerForm(data);
    confirmation();

    scroll.scrollToTop({
      duration: 500,
      smooth: 'easeInOutQuart',
    });
  };

  useImperativeHandle(ref, () => ({
    handleSubmitForm,
  }));

  return (
    <>
      <Container style={{ display: 'flex', gap: '24px' }}>
        <Box>
          <Typography
            display={'flex'}
            alignItems={'center'}
            variant="h6"
            sx={{ marginBottom: '16px' }}
          >
            {'Gerar Procuração Simples'}
          </Typography>

          <Box display={'flex'} flexDirection={'column'} gap={'16px'}>
            <CheckBox
              label="Enviar os dados de acesso"
              name="sendAccessData"
              checked={checkedItems.sendAccessData}
              onChange={handleCheckboxChange}
            />

            <CheckBox
              label="Emitir procuração simples"
              name="issueDocuments"
              checked={checkedItems.issueDocuments}
              onChange={handleCheckboxChange}
            />
            {/* 
            <CheckBox
              label="Enviar para assinatura"
              name="sendForSignature"
              checked={checkedItems.sendForSignature}
              onChange={handleCheckboxChange}
            /> */}
          </Box>
        </Box>

        {/* <Box flex={1}>
          <Flex style={{ flexDirection: 'column' }}>
            <Typography variant="h6" sx={{ marginBottom: '16px' }}>
              {'Upload de arquivos'}
            </Typography>

            <Box sx={{ width: '100%', height: '100%' }}>
              <Flex style={{ flexDirection: 'row' }}>
                <Dropzone onDrop={handleDrop} multiple={true}>
                  {({ getRootProps, getInputProps, isDragActive }) => (
                    <DropContainer>
                      <Flex {...getRootProps()} onDragOver={handleDragOver}>
                        <input {...getInputProps()} />
                        {renderDragMessage(isDragActive)}
                      </Flex>
                    </DropContainer>
                  )}
                </Dropzone>
                <FileList>
                  {selectedFile && selectedFile.length > 0 ? (
                    selectedFile.map((file, index) => (
                      <div className="fileName" key={index}>
                        <span className="name">{file.name}</span>
                        <MdDelete
                          size={20}
                          color={colors.icons}
                          style={{
                            cursor: 'pointer',
                            marginLeft: '5px',
                          }}
                          onClick={() => handleDeleteFile(file)}
                        />
                      </div>
                    ))
                  ) : (
                    <Typography variant="caption" sx={{ margin: 'auto' }}>
                      {'Nenhum arquivo selecionado'}
                    </Typography>
                  )}
                </FileList>
              </Flex>
              <Typography variant="caption" sx={{ marginTop: '8px' }}>
                {'Formatos aceitos: JPEG, PNG, e PDF.'}
              </Typography>
              {openFileSnackbar && (
                <Notification
                  open={openFileSnackbar}
                  message="Formato de arquivo inválido. Por favor, escolha um arquivo .jpeg, .jpg, .png ou .pdf."
                  severity="error"
                  onClose={() => setOpenFileSnackbar(false)}
                />
              )}
            </Box>
          </Flex>
        </Box> */}
      </Container>
    </>
  );
};

export default forwardRef(PFCustomerStepSix);
