import { useParams } from 'react-router-dom';

export function BatchDetailPage() {
  const { id } = useParams();
  return <h1>{id}</h1>;
}
