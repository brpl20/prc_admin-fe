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
import { MdDelete, MdOutlineInfo } from 'react-icons/md';

import { useRouter } from 'next/router';
import CustomTooltip from '@/components/Tooltip';

import CheckBox from '@/components/CheckBox';
import { Container, DropContainer, FileList } from '../styles';

import Notification from '@/components/OfficeModals/Notification';
import { animateScroll as scroll } from 'react-scroll';
import { CustomerContext } from '@/contexts/CustomerContext';

import { Box, Typography } from '@mui/material';

export interface IRefPJCustomerStepFourProps {
  handleSubmitForm: () => void;
}

interface IStepFourProps {
  confirmation: () => void;
  editMode: boolean;
}

const PJCustomerStepFour: ForwardRefRenderFunction<IRefPJCustomerStepFourProps, IStepFourProps> = (
  { confirmation, editMode },
  ref,
) => {
  const router = useRouter();
  const isEdit = router.asPath.includes('alterar');

  const [selectedFile, setSelectedFile] = useState<File[]>([]);
  const { customerForm, setCustomerForm } = useContext<any>(CustomerContext);
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

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const droppedFiles = Array.from(event.dataTransfer.files);
    const allowedExtensions = ['jpeg', 'jpg', 'png', 'pdf'];

    for (const droppedFile of droppedFiles) {
      const fileName = droppedFile.name;
      const fileExtension = fileName.split('.').pop()?.toLowerCase();

      if (fileExtension && allowedExtensions.includes(fileExtension)) {
        setSelectedFile((prevSelected: any) => [...prevSelected, droppedFile]);
      } else {
        setOpenFileSnackbar(true);
      }
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

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;

    setCheckedItems(prevItems => ({
      ...prevItems,
      [name]: checked,
    }));
  };

  const handleSubmitForm = () => {
    const data = {
      ...customerForm,
      customer_type: 'legal_person',
    };

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

          <div className="flex">
            <CheckBox
              label={isEdit ? 'Reemitir procuração simples' : 'Emitir procuração simples'}
              name="issueDocuments"
              isDisabled={true}
              checked={checkedItems.issueDocuments}
              onChange={handleCheckboxChange}
            />

            <CustomTooltip
              title="A geração deste documento ainda não está disponível."
              placement="right"
            >
              <span
                aria-label="Pré-Definição"
                style={{
                  display: 'flex',
                }}
              >
                <MdOutlineInfo style={{ marginLeft: '-6px' }} size={20} />
              </span>
            </CustomTooltip>
          </div>

          {/* <CheckBox
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
              <Dropzone>
                {({ getRootProps, getInputProps, isDragActive }) => (
                  <DropContainer>
                    <Flex {...getRootProps()} onDrop={handleDrop} onDragOver={handleDragOver}>
                      <input
                        {...getInputProps({
                          accept: '.jpeg, .jpg, .png, .pdf',
                          multiple: true,
                        })}
                      />
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
  );
};

export default forwardRef(PJCustomerStepFour);
