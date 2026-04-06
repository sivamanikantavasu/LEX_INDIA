import { RouterProvider } from 'react-router';
import { router } from './routes';
import { AdminDataProvider } from './contexts/AdminDataContext';
import { AuthProvider } from './contexts/AuthContext';
import { EducatorProvider } from './contexts/EducatorContext';
import { LegalExpertProvider } from './contexts/LegalExpertContext';

export default function App() {
  return (
    <AuthProvider>
      <AdminDataProvider>
        <EducatorProvider>
          <LegalExpertProvider>
            <RouterProvider router={router} />
          </LegalExpertProvider>
        </EducatorProvider>
      </AdminDataProvider>
    </AuthProvider>
  );
}