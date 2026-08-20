import { useNavigate, Link } from 'react-router-dom';
import { FiAlertTriangle } from 'react-icons/fi';
import Button from '../components/ui/Button';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-16">
      <FiAlertTriangle className="text-gray-300 mb-4" size={48} />
      <h1 className="text-3xl md:text-4xl font-section-title text-gray-900 mb-2">Page not found</h1>
      <p className="text-gray-500 mb-8 max-w-sm">
        The page you're looking for doesn't exist or may have been moved.
      </p>
      <div className="flex items-center gap-4">
        <Button onClick={() => navigate('/')}>Back to Home</Button>
        <Link to="/products" className="text-sm font-semibold text-gray-600 hover:text-gray-900">
          Browse Products
        </Link>
      </div>
    </div>
  );
}
