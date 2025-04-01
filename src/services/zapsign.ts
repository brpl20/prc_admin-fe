import api from './api';

const zapSign = async (workId: number) => {
  const response = await api.post(`/zapsign`, {
    work_id: workId,
  });
  return response.data;
};

export { zapSign };
