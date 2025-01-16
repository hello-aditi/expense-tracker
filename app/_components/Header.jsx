import React from 'react'
import Image from 'next/image';
import { Button } from '@/components/ui/button';

function Header() {
  return (
    <div className='bg-gray-900 p-2 flex justify-between items-center'>
        <Image src={'./logo.svg'} 
        alt='logo'
        width={100}
        height={50}
        />
        <Button>Get Started</Button>
    </div>
  )
}

export default Header