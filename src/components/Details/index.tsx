import PersonalData from './customers';
import { useRouter } from 'next/router';
import { Container } from './styles';
import OfficeDetails from './offices';
import UserDetails from './users';

interface DetailsProps {
  params: string | string[];
}

const Details = ({ params }: DetailsProps) => {
  const route = useRouter();
  const { id, type } = route.query;

  if (!id) {
    return <div>Carregando...</div>;
  }

  return (
    <Container
      style={{
        gap: '0',
      }}
    >
      {params.includes('cliente') && (
        <>
          <PersonalData id={id} type={type} />
        </>
      )}

      {params.includes('escritorio') && (
        <>
          <OfficeDetails id={id} />
        </>
      )}

      {params.includes('usuario') && (
        <>
          <UserDetails id={id} />
        </>
      )}
    </Container>
  );
};

export default Details;
