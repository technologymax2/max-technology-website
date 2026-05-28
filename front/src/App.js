import React, { useState, useEffect } from 'react';
import './App.css'; 
import logoImg from './logo.jpg'; 

function App() {
  const API_BASE_URL = 'https://max-tech-backend.onrender.com';
  
  // Auth States
  const [user, setUser] = useState(null); 
  const [authMode, setAuthMode] = useState('login'); // 'login' ወይም 'signup' ወይም 'admin-dashboard' ወይም 'order-page'
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '', role: 'normal', verificationKey: '' });
  const [authStatus, setAuthStatus] = useState('');
  
  // App States
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('');
  const [adminMessages, setAdminMessages] = useState([]);

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchMessages();
    }
  }, [user]);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/messages`);
      const data = await res.json();
      if (data.success) setAdminMessages(data.messages);
    } catch (err) {
      console.error('መረጃ ማምጣት አልተቻለም');
    }
  };

  const handleAuthChange = (e) => {
    setAuthForm({ ...authForm, [e.target.name]: e.target.value });
  };

  const handleContactChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Login እና Signup አያያዝ ከ ገጽ አቅጣጫ መቀየር (Redirect) ጋር
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthStatus('በመላክ ላይ...');
    const url = authMode === 'login' ? '/api/auth/login' : '/api/auth/signup';
    
    try {
      const response = await fetch(`${API_BASE_URL}${url}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authForm)
      });
      const data = await response.json();
      
      if (response.ok && data.success) {
        if (authMode === 'login') {
          setUser(data.user);
          setAuthStatus('');
          // 🚀 [ቁጥር 3] እንደ ተጠቃሚው ማዕረግ (Role) ገጹን መቀየሪያ ሎጂክ
          if (data.user.role === 'admin') {
            setAuthMode('admin-dashboard');
          } else {
            setAuthMode('order-page');
          }
        } else {
          setAuthStatus('ምዝገባው ተሳክቷል! አሁን መግባት ይችላሉ።');
          setAuthMode('login');
        }
      } else {
        setAuthStatus(data.error || 'ስህተት ተፈጥሯል!');
      }
    } catch (error) {
      setAuthStatus('የሰርቨር ስህተት ገጥሟል።');
    }
  };

  // የትዕዛዝ መላኪያ ፎርም (Order Submission)
  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    setStatus('በመላክ ላይ...');
    try {
      const response = await fetch(`${API_BASE_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setStatus('ትዕዛዝዎ በስኬት ተመዝግቧል! አስተዳዳሪው ያየዋል።');
        setFormData({ name: '', email: '', message: '' });
      } else {
        setStatus(data.error || 'ችግር ተፈጥሯል!');
      }
    } catch (error) {
      setStatus('ከሰርቨር ጋር መገናኘት አልተቻለም።');
    }
  };

  const handleDeleteMessage = async (id) => {
    if (window.confirm('ይህንን ማጥፋት ይፈልጋሉ?')) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/admin/messages/${id}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) fetchMessages();
      } catch (err) {
        alert('ማጥፋት አልተቻለም');
      }
    }
  };

  const handleLogout = () => {
    setUser(null);
    setAuthMode('login');
  };

  // ---- 1. LOGIN / SIGNUP VIEW ----
  if (authMode === 'login' || authMode === 'signup') {
    return (
      <div className="auth-box" style={{ maxWidth: '420px', margin: '80px auto', padding: '30px', border: '1px solid #ddd', borderRadius: '12px', textAlign: 'center', boxShadow: '0px 4px 10px rgba(0,0,0,0.1)' }}>
        <img src={logoImg} alt="Logo" style={{ width: '70px', borderRadius: '50%' }} />
        <h2>{authMode === 'login' ? 'ወደ Max Technology ይግቡ' : 'አዲስ አካውንት ይክፈቱ'}</h2>
        
        <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {authMode === 'signup' && (
            <input type="text" name="name" placeholder="ሙሉ ስም" onChange={handleAuthChange} required style={{ padding: '12px', borderRadius: '6px', border: '1px solid #ccc' }} />
          )}
          <input type="text" name="email" placeholder="ኢሜይል ወይም የተጠቃሚ ስም" onChange={handleAuthChange} required style={{ padding: '12px', borderRadius: '6px', border: '1px solid #ccc' }} />
          <input type="password" name="password" placeholder="ፓስወርድ" onChange={handleAuthChange} required style={{ padding: '12px', borderRadius: '6px', border: '1px solid #ccc' }} />
          
          {authMode === 'signup' && (
            <>
              <select name="role" onChange={handleAuthChange} style={{ padding: '12px', borderRadius: '6px', border: '1px solid #ccc' }}>
                <option value="normal">Normal User (ደንበኛ)</option>
                <option value="admin">Admin User (አስተዳዳሪ)</option>
              </select>
              {/* 🚀 [ቁጥር 2] አድሚን ከተመረጠ ብቻ የቁልፍ ማስገቢያው ይከፈታል */}
              {authForm.role === 'admin' && (
                <input type="text" name="verificationKey" placeholder="የአድሚን ማረጋገጫ ቁልፍ (Verification Key)" onChange={handleAuthChange} required style={{ padding: '12px', borderRadius: '6px', border: '1px solid #ff9900', background: '#fffde6' }} />
              )}
            </>
          )}
          
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

  // ---- 2. [ቁጥር 3] ADMIN DASHBOARD VIEW ----
  if (authMode === 'admin-dashboard' && user && user.role === 'admin') {
    return (
      <div style={{ padding: '40px', fontFamily: 'Arial' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #333', paddingBottom: '15px' }}>
          <h2>👑 የባለሙያ መቆጣጠሪያ ሰሌዳ (Admin Panel)</h2>
          <button onClick={handleLogout} style={{ padding: '10px 20px', background: 'red', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>ውጣ (Logout)</button>
        </div>
        <p style={{ marginTop: '15px' }}>እንኳን ደህና መጣህ፣ ዋና አስተዳዳሪ <strong>{user.name}</strong>!</p>
        
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '25px' }} border="1" cellPadding="10">
          <thead>
            <tr style={{ background: '#007bff', color: 'white' }}>
              <th>የደንበኛ ስም</th>
              <th>ኢሜይል</th>
              <th>የታዘዘው ስራ / መልዕክት</th>
              <th>ቀን</th>
              <th>እርምጃ</th>
            </tr>
          </thead>
          <tbody>
            {adminMessages.map((msg) => (
              <tr key={msg._id} style={{ textAlign: 'center' }}>
                <td>{msg.name}</td>
                <td>{msg.email}</td>
                <td style={{ textAlign: 'left' }}>{msg.message}</td>
                <td>{new Date(msg.date).toLocaleDateString()}</td>
                <td>
                  <button onClick={() => handleDeleteMessage(msg._id)} style={{ background: 'darkred', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>አጥፋ</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {adminMessages.length === 0 && <p style={{ textAlign: 'center', marginTop: '30px', color: '#666' }}>ምንም የቀረበ ትዕዛዝ የለም።</p>}
      </div>
    );
  }

  // ---- 3. [ቁጥር 3] NORMAL USER / ORDER PAGE VIEW ----
  if (authMode === 'order-page' && user) {
    return (
      <div className="container" style={{ padding: '20px' }}>
        <nav className="navbar" style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 20px', background: '#f8f9fa', borderRadius: '8px' }}>
          <div className="logo-container">
            <img src={logoImg} alt="Logo" className="logo-image" style={{ width: '40px', borderRadius: '50%' }} />
            <span className="logo-text" style={{ marginLeft: '10px', fontWeight: 'bold' }}>Max Technology</span>
          </div>
          <div>
            <span style={{ color: '#28a745', fontWeight: 'bold', marginRight: '15px' }}>Logged in: {user.name}</span>
            <button onClick={handleLogout} style={{ padding: '6px 12px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>ውጣ</button>
          </div>
        </nav>

        {/* Order Form Section */}
        <section id="contact" style={{ maxWidth: '600px', margin: '50px auto', padding: '30px', border: '1px solid #eee', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
          <h2 style={{ textAlign: 'center', color: '#007bff' }}>🛒 የሶፍትዌር ማዘዣ ገጽ (Order Page)</h2>
          <p style={{ textAlign: 'center', color: '#666' }}>የሚፈልጉትን የዌብሳይት ወይም የሲስተም አይነት በዝርዝር ይጻፉልን።</p>
          
          <form onSubmit={handleOrderSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
            <input type="text" name="name" placeholder="የድርጅትዎ ወይም የእርስዎ ስም" value={formData.name} onChange={handleContactChange} required style={{ padding: '12px', borderRadius: '5px', border: '1px solid #ccc' }} />
            <input type="email" name="email" placeholder="መገናኛ ኢሜይል" value={formData.email} onChange={handleContactChange} required style={{ padding: '12px', borderRadius: '5px', border: '1px solid #ccc' }} />
            <textarea name="message" placeholder="ሊሰራልዎት የሚፈልጉትን ስራ ዝርዝር መግለጫ እዚህ ይጻፉ..." value={formData.message} onChange={handleContactChange} required style={{ padding: '12px', borderRadius: '5px', border: '1px solid #ccc', height: '120px' }}></textarea>
            <button type="submit" style={{ padding: '12px', background: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}>ትዕዛዝ ያስገቡ</button>
            {status && <p style={{ textAlign: 'center', color: 'green', fontWeight: 'bold' }}>{status}</p>}
          </form>
        </section>
      </div>
    );
  }

  return null;
}

export default App;