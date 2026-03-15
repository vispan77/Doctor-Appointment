import AuthForm from '@/components/auth/AuthForm';
import React from 'react'


export const metadata = {
  title: 'Join MediCare+ as Healthcare Provider',
  description: 'Register as a healthcare provider on MediCare+ to offer online consultations.',
};

function page() {
  return (
    <div>
      <AuthForm type="signup" userRole="doctor" />
    </div>
  )
}

export default page
