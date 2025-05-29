import { ChangeEvent, DragEvent } from 'react';
import Dropzone from 'react-dropzone';
import { MdDelete } from 'react-icons/md';
import { Box, FormControl, Typography, TextareaAutosize } from '@mui/material';

import { Notification } from '@/components';

import { colors, Flex } from '@/styles/globals';

import { SubjectOptionsArea, Input, DropContainer, FileList } from './styles';
import { RadioOptions } from './RadioOptions';

interface SubjectAreaProps {
  selectedSubject: string;
  selectedArea: string;
  handleSelectArea: (value: string) => void;
  compensationsLastYears: string;
  setCompensationsLastYears: (value: string) => void;
  officialCompensation: string;
  setOfficialCompensation: (value: string) => void;
  hasALawsuit: string;
  setHasALawsuit: (value: string) => void;
  gainProjection: string | undefined;
  handleGainProjection: (value: string) => void;
  selectedFile: File[] | null;
  setSelectedFile: (files: File[] | null | ((prev: File[] | null) => File[] | null)) => void;
  openFileSnackbar: boolean;
  setOpenFileSnackbar: (value: boolean) => void;
  otherDescription: string;
  setOtherDescription: (value: string) => void;
}

const CIVEL_AREA = [
  { value: 'family', label: 'Família' },
  { value: 'consumer', label: 'Consumidor' },
  { value: 'moral_damages', label: 'Reparação Cível - Danos Materiais - Danos Morais' },
];

const SOCIAL_SECURITY_AREA = [
  { value: 'retirement_by_age', label: 'Aposentadoria Por Tempo de Contribuição' },
  { value: 'retirement_by_time', label: 'Aposentadoria Por Idade' },
  { value: 'retirement_by_rural', label: 'Aposentadoria Rural' },
  {
    value: 'disablement',
    label: 'Benefícios Por Incapacidade - Auxílio Doença ou Acidente - Inválidez - LOAS',
  },
  { value: 'benefit_review', label: 'Revisão de Benefício Previdednciário' },
  {
    value: 'administrative_services',
    label: 'Reconhecimento de Tempo, Averbação, Serviços Administrativos',
  },
];

const LABORITE_AREA = [{ value: 'labor_claim', label: 'Reclamatória Trabalhista' }];

const TRIBUTARY_AREA = [{ value: 'asphalt', label: 'Asfalto' }];

export const SubjectArea: React.FC<SubjectAreaProps> = ({
  selectedSubject,
  selectedArea,
  handleSelectArea,
  compensationsLastYears,
  setCompensationsLastYears,
  officialCompensation,
  setOfficialCompensation,
  hasALawsuit,
  setHasALawsuit,
  gainProjection,
  handleGainProjection,
  selectedFile,
  setSelectedFile,
  openFileSnackbar,
  setOpenFileSnackbar,
  otherDescription,
  setOtherDescription,
}) => {
  const renderDragMessage = (isDragActive: boolean) =>
    isDragActive ? <p>Solte os arquivos aqui</p> : <p>Arraste arquivos aqui...</p>;

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const droppedFiles = Array.from(event.dataTransfer.files).filter(file => {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      const allowedExtensions = ['jpeg', 'jpg', 'png', 'pdf'];
      return fileExtension && allowedExtensions.includes(fileExtension);
    });

    if (droppedFiles.length < event.dataTransfer.files.length) {
      setOpenFileSnackbar(true);
    }

    setSelectedFile([...(selectedFile || []), ...droppedFiles]);
  };

  const handleDeleteFile = (fileToDelete: File) => {
    setSelectedFile((prev: File[] | null) =>
      prev ? prev.filter((file: File) => file !== fileToDelete) : null,
    );
  };

  const handleDragOver = (event: ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
  };

  return (
    <SubjectOptionsArea>
      {selectedSubject === 'civel' && (
        <FormControl>
          <Typography variant="h6" sx={{ marginBottom: '8px' }}>
            {'Cível-Área'}
          </Typography>
          <RadioOptions
            className="flex-col"
            options={CIVEL_AREA}
            selectedValue={selectedArea}
            onChange={handleSelectArea}
          />
        </FormControl>
      )}

      {selectedSubject === 'social_security' && (
        <FormControl>
          <Typography variant="h6" sx={{ marginBottom: '8px' }}>
            {'Previdenciário-Áreas'}
          </Typography>
          <RadioOptions
            className="flex-col"
            options={SOCIAL_SECURITY_AREA}
            selectedValue={selectedArea}
            onChange={handleSelectArea}
          />
        </FormControl>
      )}

      {selectedSubject === 'laborite' && (
        <FormControl>
          <Typography variant="h6" sx={{ marginBottom: '8px' }}>
            {'Trabalhista-Áreas'}
          </Typography>
          <RadioOptions
            className="flex-col"
            options={LABORITE_AREA}
            selectedValue={selectedArea}
            onChange={handleSelectArea}
          />
        </FormControl>
      )}

      {selectedSubject === 'tributary' && (
        <FormControl>
          <Typography variant="h6" sx={{ marginBottom: '8px' }}>
            {'Tributário-Áreas'}
          </Typography>
          <RadioOptions
            options={TRIBUTARY_AREA}
            selectedValue={selectedArea}
            onChange={handleSelectArea}
          />
        </FormControl>
      )}

      {selectedSubject === 'tributary_pis' && (
        <Box style={{ width: '100%' }}>
          <Flex style={{ alignItems: 'center', width: '100%' }}>
            <Typography variant="h6" sx={{ marginRight: '16px' }}>
              {'Compensações realizadas nos últimos 5 anos:'}
            </Typography>
            <RadioOptions
              options={[
                { value: 'yes', label: 'Sim' },
                { value: 'no', label: 'Não' },
              ]}
              selectedValue={compensationsLastYears}
              onChange={setCompensationsLastYears}
            />
          </Flex>

          <Flex style={{ alignItems: 'center' }}>
            <Typography variant="h6" sx={{ marginRight: '16px' }}>
              {'Compensações de ofício:'}
            </Typography>
            <RadioOptions
              options={[
                { value: 'yes', label: 'Sim' },
                { value: 'no', label: 'Não' },
              ]}
              selectedValue={officialCompensation}
              onChange={setOfficialCompensation}
            />
          </Flex>

          <Flex style={{ alignItems: 'center' }}>
            <Typography variant="h6" sx={{ marginRight: '16px' }}>
              {'Possui ação judicial:'}
            </Typography>
            <RadioOptions
              options={[
                { value: 'yes', label: 'Sim' },
                { value: 'no', label: 'Não' },
              ]}
              selectedValue={hasALawsuit}
              onChange={setHasALawsuit}
            />
          </Flex>

          <Flex style={{ flexDirection: 'column', width: '100%' }}>
            <Typography variant="h6">{'Projeção de ganho'}</Typography>
            <Box sx={{ width: '174px' }}>
              <Input
                type="text"
                value={gainProjection}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleGainProjection(e.target.value)
                }
                placeholder="R$ 0,00"
                onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
                  const value = e.target.value.replace(/[^0-9,]/g, '').replace(',', '.');
                  handleGainProjection(value);
                }}
              />
            </Box>

            <Flex style={{ flexDirection: 'column', marginTop: '16px' }}>
              <Typography variant="h6" sx={{ marginBottom: '8px' }}>
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
                            style={{ cursor: 'pointer', marginLeft: '5px' }}
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
          </Flex>
        </Box>
      )}

      {selectedSubject === 'others' && (
        <FormControl sx={{ width: '100%', height: '100%' }}>
          <Typography variant="h6">{'Descreva a área:'}</Typography>
          <TextareaAutosize
            value={otherDescription}
            onChange={e => setOtherDescription(e.target.value)}
            className="comment-input"
          />
        </FormControl>
      )}
    </SubjectOptionsArea>
  );
};
