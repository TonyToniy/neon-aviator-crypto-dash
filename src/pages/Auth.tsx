
import React from 'react';
import { Navigate } from 'react-router-dom';
import AuthForm from '@/components/AuthForm';
import { useAuth } from '@/hooks/useAuth';
import { Plane } from 'lucide-react';

const Auth = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="animate-spin">
          <Plane className="w-8 h-8 text-neon-blue" />
        </div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-cyber-grid bg-grid opacity-5"></div>
      
      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-neon-blue to-neon-purple rounded-xl">
              <Plane className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
              AVIATOR
            </h1>
          </div>
          <p className="text-gray-400">Take flight with crypto gaming</p>
        </div>

        <AuthForm onSuccess={() => {}} />
      </div>
    </div>
  );
};

export default Auth;
