import AuthForm from '@/components/auth/AuthForm';
import React from 'react';

export const metadata = {
  title: 'Patient Login - MediCare+',
  description: 'Sign in to your MediCare+ account to access healthcare consultations.',
};

function page() {
  return (
    
      <AuthForm type="login" userRole="patient" />

    
  )
}

export default page
