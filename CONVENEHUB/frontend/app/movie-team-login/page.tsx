import { Suspense } from 'react';
import { Spinner } from '@/components/ui/spinner';
import { MovieTeamLoginForm } from './movie-team-login-form';

export default function MovieTeamLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Spinner className="w-8 h-8" />
      </div>
    }>
      <MovieTeamLoginForm />
    </Suspense>
  );
}
