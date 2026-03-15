"use client"

import { userAuthStore } from '@/store/authStore'
import React, { useEffect } from 'react'

function Providers({ children }: { children: React.ReactNode }) {
    const { fetchProfile, token } = userAuthStore();

    useEffect(() => {
        if (token) {
            fetchProfile();
        }
    }, [token, fetchProfile]);


    return (
        <div>
            {children}
        </div>
    )
}

export default Providers
