import React from 'react';
import Image from 'next/image';
import { SignInButton } from '@clerk/nextjs'; 

function Hero() {
  return (
<section className="bg-gray-50 flex items-center flex-col">
  <div className="mx-auto max-w-screen-xl px-4 py-32 lg:flex lg:h-screen lg:items-center">
    <div className="mx-auto max-w-xl text-center">
      <h1 className="text-3xl font-extrabold sm:text-5xl">
        Manage Your Expenses
        <strong className="font-extrabold text-primary sm:block"> Control Your Money </strong>
      </h1>

      <p className="mt-4 sm:text-xl/relaxed">
        Paisa sahi jagah kharch karo with Expensa...
      </p>

        <SignInButton className="bg-primary hover:bg-black text-white  active:bg-black py-2 px-4 rounded w-30">
          Get Started
          </SignInButton> 

    </div>
  </div>
  <Image src='/dashboard.jpg' alt='dashboard'
  width={1000}
  height={700}
  className='mt-9 rounded-xl border-2'
  
  />
</section>
  )
}

export default Hero