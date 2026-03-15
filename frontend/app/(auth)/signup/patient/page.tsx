import AuthForm from '@/components/auth/AuthForm';
import React from 'react';


export const metadata = {
  title: 'Create Patient Account - MediCare+',
  description: 'Join MediCare+ to access quality healthcare consultations from certified doctors.',
};

function page() {
  return (
    <div>
      <AuthForm type="signup" userRole="patient" />
      
    </div>
  )
}

export default page
