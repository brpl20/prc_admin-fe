import React, {
  useState,
  useContext,
  forwardRef,
  useEffect,
  ForwardRefRenderFunction,
  useImperativeHandle,
} from 'react';

import { DataGrid } from '@mui/x-data-grid';
import { Box, LinearProgress, Typography } from '@mui/material';

import { WorkContext } from '@/contexts/WorkContext';
import { getAllPowers } from '@/services/powers';
import { Notification } from '@/components';
import { z } from 'zod';
export interface IRefWorkStepThreeProps {
  handleSubmitForm: () => void;
}

interface IStepThreeProps {
  nextStep: () => void;
}

const stepThreeSchema = z.object({
  power_ids: z.array(z.number()).nonempty(),
});

const WorkStepThree: ForwardRefRenderFunction<IRefWorkStepThreeProps, IStepThreeProps> = (
  { nextStep },
  ref,
) => {
  const [errors, setErrors] = useState({} as any);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [type, setType] = useState<'success' | 'error'>('success');

  const { workForm, setWorkForm } = useContext(WorkContext);

  const [powersSelected, setPowersSelected] = useState<number[]>([]);
  const [allPowers, setAllPowers] = useState<any>([]);

  const getRowClassName = (params: any) => {
    return params.rowIndex % 2 === 0 ? 'even-row' : 'odd-row';
  };

  const handleSubmitForm = () => {
    try {
      stepThreeSchema.parse({ power_ids: powersSelected });

      if (powersSelected.length > 0) {
        const data = {
          ...workForm,
          power_ids: powersSelected,
        };

        setWorkForm(data);
        saveDataLocalStorage(data);
      }

      nextStep();
    } catch (err) {
      handleFormError(err);
    }
  };

  const handleFormError = (error: any) => {
    const newErrors = error?.formErrors?.fieldErrors ?? {};
    const errorObject: { [key: string]: string } = {};
    setMessage('Preencha todos os campos obrigatórios.');
    setType('error');
    setOpenSnackbar(true);

    for (const field in newErrors) {
      if (Object.prototype.hasOwnProperty.call(newErrors, field)) {
        errorObject[field] = newErrors[field][0] as string;
      }
    }
    setErrors(errorObject);
  };

  const verifyDataLocalStorage = async () => {
    const data = localStorage.getItem('WORK/Three');

    if (data) {
      const parsedData = JSON.parse(data);

      if (parsedData.power_ids) {
        setPowersSelected(parsedData.power_ids);
      }
    }
  };

  const saveDataLocalStorage = (data: any) => {
    localStorage.setItem('WORK/Three', JSON.stringify(data));
  };

  useImperativeHandle(ref, () => ({
    handleSubmitForm,
  }));

  useEffect(() => {
    setLoading(true);
    const getPowers = async () => {
      const response = await getAllPowers();

      const attributesArray: any = [];

      response.data.forEach((obj: any) => {
        if (obj.attributes) {
          attributesArray.push(obj.attributes);
        }
      });

      setAllPowers(attributesArray);
      setLoading(false);
    };

    getPowers();
  }, []);

  useEffect(() => {
    const handleDraftWork = () => {
      const draftWork = workForm.draftWork;

      if (draftWork.id) {
        if (draftWork.attributes) {
          const attributes = draftWork.attributes;

          if (attributes.powers) {
            const power_ids = attributes.powers.map((item: any) => item.id);
            setPowersSelected(power_ids);
          }
        }
      }
    };

    const handleDataForm = () => {
      const attributes = workForm.data.attributes;

      if (attributes) {
        const power_ids = attributes.powers.map((item: any) => item.id);
        setPowersSelected(power_ids);
      }
    };

    if (workForm.data) {
      handleDataForm();
    }

    if (workForm.draftWork && workForm.draftWork.id) {
      handleDraftWork();
    }
  }, [workForm, allPowers]);

  useEffect(() => {
    verifyDataLocalStorage();
  }, [allPowers]);

  return (
    <>
      {openSnackbar && (
        <Notification
          open={openSnackbar}
          message={message}
          severity={type}
          onClose={() => setOpenSnackbar(false)}
        />
      )}

      <Box>
        <Typography
          variant="h6"
          sx={{ margin: '8px' }}
          style={{
            color: powersSelected.length <= 0 ? '#FF0000' : 'black',
          }}
        >
          {'Poderes'}
        </Typography>
        <Box sx={{ height: 400, width: '100%' }}>
          {allPowers ? (
            <DataGrid
              disableColumnMenu
              checkboxSelection
              disableRowSelectionOnClick
              loading={loading}
              slots={{
                noRowsOverlay: () =>
                  loading ? (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <LinearProgress />
                    </Box>
                  ) : (
                    <Typography variant="h6">{'Nenhum Poder Encontrado'}</Typography>
                  ),
              }}
              rows={allPowers.map((item: any) => ({
                id: item.id,
                description: item.description,
              }))}
              columns={[
                {
                  flex: 1,
                  field: 'description',
                  headerAlign: 'left',
                  headerName: 'Descrição',
                },
              ]}
              getRowClassName={getRowClassName}
              initialState={{
                pagination: { paginationModel: { pageSize: 10 } },
              }}
              localeText={{
                MuiTablePagination: {
                  labelRowsPerPage: 'Linhas por página',
                  labelDisplayedRows(paginationInfo) {
                    return `${paginationInfo.from}- ${paginationInfo.to} de ${paginationInfo.count}`;
                  },
                },
              }}
              pageSizeOptions={[5, 10, 25]}
              onRowSelectionModelChange={(data: any) => {
                setPowersSelected(data);
              }}
              rowSelectionModel={powersSelected}
            />
          ) : null}
        </Box>
      </Box>
    </>
  );
};

export default forwardRef(WorkStepThree);
