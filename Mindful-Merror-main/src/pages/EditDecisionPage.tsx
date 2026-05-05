import { Navigate, useParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { DecisionForm } from '@/components/decisions/DecisionForm';
import { useDecisionStore } from '@/store/decisionStore';

const EditDecisionPage = () => {
  const { id } = useParams<{ id: string }>();
  const decision = useDecisionStore((state) => state.decisions.find((d) => d.id === id));

  if (!decision) {
    return <Navigate to="/" replace />;
  }

  return (
    <Layout>
      <div className="mb-8 text-center">
        <h1 className="font-serif text-3xl font-medium">Edit Decision</h1>
        <p className="mt-2 text-muted-foreground">
          Update the memory entry — you stay in control.
        </p>
      </div>
      <DecisionForm mode="edit" initialDecision={decision} />
    </Layout>
  );
};

export default EditDecisionPage;
