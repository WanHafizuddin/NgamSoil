import { useParams } from 'react-router-dom';

export function MaturityTestPage() {
  const { id } = useParams();
  return <h1>{id}</h1>;
}
