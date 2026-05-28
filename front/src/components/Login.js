import React from 'react';
import './Login.css'; // 👈 አዲሱ የስታይል ፋይል ማገናኛ
import Footer from './Footer';

function Login({ authMode, setAuthMode, authForm, handleAuthChange, handleAuthSubmit, authStatus, logoImg }) {
  return (
    <div><div className="auth-page-wrapper">
      <div className="auth-box fade-in">
        <img src={logoImg} alt="Logo" className="auth-logo" />
        <h2>{authMode === 'login' ? 'ወደ Max Technology ይግቡ' : 'የደንበኛ አካውንት ይክፈቱ'}</h2>
        
        <form onSubmit={handleAuthSubmit} className="form-group auth-form-gap">
          {authMode === 'signup' && (
            <input 
              type="text" 
              name="name" 
              placeholder="ሙሉ ስም" 
              onChange={handleAuthChange} 
              required 
              className="input-field" 
            />
          )}
          <input 
            type="text" 
            name="email" 
            placeholder="ኢሜይል ወይም የተጠቃሚ ስም" 
            onChange={handleAuthChange} 
            required 
            className="input-field" 
          />
          <input 
            type="password" 
            name="password" 
            placeholder="ፓስወርድ" 
            onChange={handleAuthChange} 
            required 
            className="input-field" 
          />
          <button type="submit" className="submit-btn auth-submit-btn">
            {authMode === 'login' ? 'ይግቡ' : 'ይመዝገቡ'}
          </button>
        </form>

        {authStatus && <p className="auth-error-msg">{authStatus}</p>}
        
        <p className="auth-toggle-text" onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}>
          {authMode === 'login' ? 'አካውንት የለዎትም? ይመዝገቡ' : 'ቀድሞ አካውንት አለዎት? ይግቡ'}
        </p>
      </div>
      
    </div>
    <Footer />
    </div>
  );
}

export default Login;