import React from 'react';
import Footer from './Footer';

function Login({ authMode, setAuthMode, authForm, handleAuthChange, handleAuthSubmit, authStatus, logoImg }) {
  return (
    <div className="min-h-screen bg-[#222831] flex flex-col justify-between">
      <div className="flex-grow flex items-center justify-center p-5">
        <div className="w-full max-w-[420px] p-8 sm:p-10 bg-[#393e46] border border-yellow-500/10 rounded-[20px] text-center shadow-[0_15px_35px_rgba(0,0,0,0.4)] animate-[authFadeIn_0.6s_ease-out_forwards]">
          
          <img 
            src={logoImg} 
            alt="Logo" 
            className="w-20 h-20 rounded-full object-cover mx-auto mb-4 border-2 border-yellow-400 transition-all duration-400 hover:scale-110 hover:rotate-6" 
          />
          
          <h2 className="text-white text-2xl font-bold mb-8">
            {authMode === 'login' ? 'ወደ Max Technology ይግቡ' : 'የደንበኛ አካውንት ይክፈቱ'}
          </h2>
          
          <form onSubmit={handleAuthSubmit} className="flex flex-col gap-4">
            {authMode === 'signup' && (
              <input 
                type="text" 
                name="name" 
                placeholder="ሙሉ ስም" 
                onChange={handleAuthChange} 
                required 
                className="w-full p-3.5 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-yellow-400 transition text-sm sm:text-base" 
              />
            )}
            <input 
              type="text" 
              name="email" 
              placeholder="ኢሜይል ወይም የተጠቃሚ ስም" 
              onChange={handleAuthChange} 
              required 
              className="w-full p-3.5 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-yellow-400 transition text-sm sm:text-base" 
            />
            <input 
              type="password" 
              name="password" 
              placeholder="ፓስወርድ" 
              onChange={handleAuthChange} 
              required 
              className="w-full p-3.5 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-yellow-400 transition text-sm sm:text-base" 
            />
            <button 
              type="submit" 
              className="w-full py-3.5 mt-2 bg-yellow-400 hover:bg-transparent text-gray-900 hover:text-yellow-400 font-bold rounded-xl border-2 border-yellow-400 transition-all duration-300 shadow-md cursor-pointer"
            >
              {authMode === 'login' ? 'ይግቡ' : 'ይመዝገቡ'}
            </button>
          </form>

          {authStatus && (
            <p className="mt-4 bg-red-500/10 text-red-500 font-bold p-2.5 rounded-lg text-sm border border-red-500/20">
              {authStatus}
            </p>
          )}
          
          <p 
            onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
            className="mt-6 text-yellow-400 font-semibold text-sm sm:text-base cursor-pointer inline-block transition hover:underline hover:-translate-y-0.5"
          >
            {authMode === 'login' ? 'አካውንት የለዎትም? ይመዝገቡ' : 'ቀድሞ አካውንት አለዎት? ይግቡ'}
          </p>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}

export default Login;
