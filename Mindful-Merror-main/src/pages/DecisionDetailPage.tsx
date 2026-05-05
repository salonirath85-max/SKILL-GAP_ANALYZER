import { useParams, Navigate } from 'react-router-dom';
import { useDecisionStore } from '@/store/decisionStore';
import { Layout } from '@/components/layout/Layout';
import { DecisionDetail } from '@/components/decisions/DecisionDetail';

const DecisionDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const decision = useDecisionStore((state) => 
    state.decisions.find((d) => d.id === id)
  );

  if (!decision) {
    return <Navigate to="/" replace />;
  }

  return (
    <Layout>
      <DecisionDetail decision={decision} />
    </Layout>
  );
};

export default DecisionDetailPage;
