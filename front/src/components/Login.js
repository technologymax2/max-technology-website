import React from 'react';

function Login({ authMode, setAuthMode, authForm, handleAuthChange, handleAuthSubmit, authStatus, logoImg }) {
  return (
    <div className="auth-box" style={{ maxWidth: '420px', margin: '80px auto', padding: '30px', border: '1px solid #ddd', borderRadius: '12px', textAlign: 'center' }}>
      <img src={logoImg} alt="Logo" style={{ width: '70px', borderRadius: '50%' }} />
      <h2>{authMode === 'login' ? 'ወደ Max Technology ይግቡ' : 'የደንበኛ አካውንት ይክፈቱ'}</h2>
      <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {authMode === 'signup' && (
          <input type="text" name="name" placeholder="ሙሉ ስም" onChange={handleAuthChange} required style={{ padding: '12px', borderRadius: '6px', border: '1px solid #ccc' }} />
        )}
        <input type="text" name="email" placeholder="ኢሜይል ወይም የተጠቃሚ ስም" onChange={handleAuthChange} required style={{ padding: '12px', borderRadius: '6px', border: '1px solid #ccc' }} />
        <input type="password" name="password" placeholder="ፓስወርድ" onChange={handleAuthChange} required style={{ padding: '12px', borderRadius: '6px', border: '1px solid #ccc' }} />
        <button type="submit" style={{ padding: '12px', background: '#007bff', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
          {authMode === 'login' ? 'ይግቡ' : 'ይመዝገቡ'}
        </button>
      </form>
      {authStatus && <p style={{ color: 'red', fontWeight: 'bold', marginTop: '10px' }}>{authStatus}</p>}
      <p style={{ marginTop: '20px', cursor: 'pointer', color: '#007bff' }} onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}>
        {authMode === 'login' ? 'አካውንት የለዎትም? ይመዝገቡ' : 'ቀድሞ አካውንት አለዎት? ይግቡ'}
      </p>
    </div>
  );
}

export default Login;