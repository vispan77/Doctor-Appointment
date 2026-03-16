"use client"
import { Loader2 } from 'lucide-react'
import React from 'react'

function Loader() {
  return (
    <div className='flex items-center justify-center w-full h-full p-4'>
        <Loader2 className='w-10 h-10 animate-spin text-blue-500' />
      
    </div>
  )
}

export default Loader
