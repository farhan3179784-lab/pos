import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Icon } from '../components/ui/Icon';

export const NotFoundPage = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
      <div className="h-16 w-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 shadow-sm">
        <Icon name="error" size={32} />
      </div>
      <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">404 - Page Not Found</h2>
      <p className="text-sm text-slate-500 max-w-sm mt-1 mb-6">
        The POS or administration screen you requested does not exist or has been moved.
      </p>
      <Link to="/">
        <Button variant="primary" size="md" icon="dashboard">
          Back to Dashboard
        </Button>
      </Link>
    </div>
  );
};
