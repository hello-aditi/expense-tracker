// import React from 'react';
// import Image from 'next/image';
// import { SignInButton } from '@clerk/nextjs'; 

// function Hero() {
//   return (
// <section className="bg-gray-50 flex items-center flex-col">
//   <div className="mx-auto max-w-screen-xl px-4 py-32 lg:flex lg:h-screen lg:items-center">
//     <div className="mx-auto max-w-xl text-center">
//       <h1 className="text-3xl font-extrabold sm:text-5xl">
//         Manage Your Expenses
//         <strong className="font-extrabold text-primary sm:block"> Control Your Money </strong>
//       </h1>

//       <p className="mt-4 sm:text-xl/relaxed">
//         Paisa sahi jagah kharch karo with Expensa...
//       </p>

//         <SignInButton forceRedirectUrl='./dashboard' className="bg-primary hover:bg-black text-white  active:bg-black py-2 px-4 rounded w-30">
//           Get Started
//           </SignInButton> 

//     </div>
//   </div>
//   <Image src='/dashboard.jpg' alt='dashboard'
//   width={1000}
//   height={700}
//   className='mt-9 rounded-xl border-2'

//   />
// </section>
//   )
// }

// export default Hero

import React from 'react'
import Image from 'next/image';
import { SignInButton } from '@clerk/nextjs';

function Hero() {
  return (
    <div>
      <section className="relative bg-gradient-to-br from-purple-900 via-fuchsia-900 to-gray-900 min-h-screen overflow-hidden">
        {/* Subtle Background Image */}
        <div
          style={{ backgroundImage: "url('/bg2.webp')", opacity: 0.5 }}
          className="absolute inset-0 bg-cover bg-center"
        ></div>

        {/* Header with Prominent Logo */}
        <header className="absolute top-0 left-0 w-full p-6 flex justify-center z-10">
          <div className="bg-white/80 p-3 rounded-full shadow-lg backdrop-blur-sm">
            <Image src="/logo.svg" alt="Expensa Logo" width={120} height={120} className="object-contain" />
          </div>
        </header>

        {/* Overlay Layer */}
        <div className="absolute inset-0 bg-black/70"></div>

        <div className="relative mx-auto max-w-screen-xl px-6 py-32 sm:px-8 lg:flex lg:h-screen lg:items-center lg:px-12">
          <div className="text-center bg-white/10 backdrop-blur-md p-8 rounded-xl shadow-2xl max-w-2xl mx-auto">
            <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-6xl mb-4">
              Manage Your <span className="text-fuchsia-400">Expenses</span>
              <br /> with <span className="text-fuchsia-300">Expensa..</span>
            </h1>

            <p className="mt-6 text-xl text-gray-100 max-w-lg mx-auto">
              Paisa sahi jagah kharch karo with Expensa – grow your wealth wisely!
            </p>

            <div className="mt-10">
              <SignInButton
                forceRedirectUrl="./dashboard"
                className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-bold py-4 px-8 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105 animate-pulse-once"
              >
                Get Started
              </SignInButton>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Hero