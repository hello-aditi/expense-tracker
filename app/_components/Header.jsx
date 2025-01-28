import React from 'react'
import Image from 'next/image';
import { Button } from '@/components/ui/button';

function Header() {
  return (
    <div className='p-2 flex justify-between items-center border shadow-sm'>
        <Image src={'./logo.svg'} 
        alt='logo'
        width={80}
        height={30}
        /> <h1>Expensa...</h1>
        <Button>Get Started</Button>
    </div>
  )
}

export default Header