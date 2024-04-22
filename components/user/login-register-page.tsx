import React from 'react';
import { LoginForm } from './login-form';
import { RegisterForm } from './register-form';

export function LoginRegisterPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="flex flex-col items-center space-y-4">
        <LoginForm />
      </div>
      <div className="flex flex-col items-center space-y-4">
        <RegisterForm />
      </div>
    </div>
  );
}

