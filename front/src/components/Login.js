import React from 'react';

function Login({ 
  authMode, 
  setAuthMode, 
  authForm, 
  handleAuthChange, 
  handleAuthSubmit, 
  authStatus, 
  logoImg 
}) {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 w-full">
      {/* ሎጎ እና ራእስ */}
      <div className="text-center mb-8">
        {logoImg && (
          <img 
            src={logoImg} 
            alt="Logo" 
            className="w-16 h-16 rounded-full mx-auto mb-3 object-cover shadow-md border-2 border-blue-500" 
          />
        )}
        <h2 className="text-2xl font-bold text-gray-800">
          {authMode === 'login' ? 'እንኳን ደህና መጡ!' : 'አዲስ አካውንት ይፍጠሩ'}
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          {authMode === 'login' 
            ? 'ለመቀጠል መረጃዎትን ያስገቡ' 
            : 'መረጃዎትን በመሞላት ይመዝገቡ'}
        </p>
      </div>

      {/* የሁኔታ ማሳወቂያ (Error / Success message) */}
      {authStatus && (
        <div className={`mb-4 p-3 rounded-lg text-sm font-medium text-center ${
          authStatus.includes('✅') 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-600 border border-red-200'
        }`}>
          {authStatus}
        </div>
      )}

      {/* ዋናው ፎርም */}
      <form onSubmit={handleAuthSubmit} className="space-y-4">
        {authMode === 'signup' && (
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
              ሙሉ ስም
            </label>
            <input 
              type="text" 
              name="name" 
              required 
              placeholder="እባክዎ ሙሉ ስምዎትን ያስገቡ"
              value={authForm.name || ''} 
              onChange={handleAuthChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm"
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
            ኢሜይል / ዩዘርኔም
          </label>
          <input 
            type="text" 
            name="email" 
            required 
            placeholder="example@mail.com"
            value={authForm.email || ''} 
            onChange={handleAuthChange}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
            ፓስወርድ
          </label>
          <input 
            type="password" 
            name="password" 
            required 
            placeholder="••••••••"
            value={authForm.password || ''} 
            onChange={handleAuthChange}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm"
          />
        </div>

        <button 
          type="submit" 
          className="w-full py-3.5 bg-blue-600 text-white font-semibold rounded-xl shadow-lg hover:bg-blue-700 active:scale-[0.98] transition duration-200 text-sm mt-2"
        >
          {authMode === 'login' ? 'ግባ (Login)' : 'ተመዝገብ (Sign Up)'}
        </button>
      </form>

      {/* ሁነቶችን (Modes) መቀየሪያ */}
      <div className="mt-6 text-center text-sm text-gray-600">
        {authMode === 'login' ? (
          <p>
            አካውንት የለዎትም?{' '}
            <button 
              onClick={() => setAuthMode('signup')} 
              className="text-blue-600 font-semibold hover:underline focus:outline-none"
            >
              ተመዝገብ
            </button>
          </p>
        ) : (
          <p>
            ቀድሞ አካውንት አለዎት?{' '}
            <button 
              onClick={() => setAuthMode('login')} 
              className="text-blue-600 font-semibold hover:underline focus:outline-none"
            >
              ግባ
            </button>
          </p>
        )}
      </div>
    </div>
  );
}

export default Login;
