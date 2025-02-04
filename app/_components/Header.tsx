import React from 'react';
import Image from 'next/image';
import { SignInButton } from '@clerk/nextjs';

function Header() {
  return (
    <div className='p-2 flex justify-between items-center border shadow-sm'>
      <Image
        src={'./logo.svg'}
        alt='logo'
        width={80}
        height={30}
      />
      EXPENSA...
      <div className="flex justify-center items-center">
        {/* Wrap SignInButton in a div and apply styles to the wrapper */}
        <div className="bg-primary hover:bg-black text-white active:bg-black py-2 px-4 rounded w-30">
          <SignInButton forceRedirectUrl='./dashboard' />
        </div>
      </div>
    </div>
  );
}

export default Header;