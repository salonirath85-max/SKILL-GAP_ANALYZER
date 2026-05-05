import { Layout } from '@/components/layout/Layout';
import { DecisionForm } from '@/components/decisions/DecisionForm';

const AddDecision = () => {
  return (
    <Layout>
      <div className="mb-8 text-center">
        <h1 className="font-serif text-3xl font-medium">Capture a Decision</h1>
        <p className="mt-2 text-muted-foreground">
          Record your reasoning so your future self can understand why
        </p>
      </div>
      <DecisionForm />
    </Layout>
  );
};

export default AddDecision;
