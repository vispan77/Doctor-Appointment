
import PatientOnboardingForm from '@/components/patient/PatientOnboardingForm';
import React from 'react'



export const metadata = {
    title: 'Complete Your Patient Profile - HealthTap',
    description: 'Complete your profile to start booking appointments.',
};


function PatientOnboardingPage() {
    return (
        <div>
            
            <PatientOnboardingForm />
        </div>
    )
}

export default PatientOnboardingPage
