import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import OrderPage from './components/OrderPage';
import logoImg from './logo.jpg';
import './App.css';
import Footer from './components/Footer';

function App() {
  const API_BASE_URL = 'https://max-tech-backend.onrender.com';
  
  // --- STATES ---
  const [currentScreen, setCurrentScreen] = useState('home'); 
  const [user, setUser] = useState(null); 
  const [projects, setProjects] = useState([]); // ፕሮጀክቶችን ለመያዝ
  
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });
  const [authStatus, setAuthStatus] = useState('');
  const [adminMessages, setAdminMessages] = useState([]);
  const [newAdminForm, setNewAdminForm] = useState({ name: '', email: '', password: '' });
  const [adminAddStatus, setAdminAddStatus] = useState('');
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('');

  // --- EFFECT: ፕሮጀክቶችን ከባክኤንድ ማምጣት ---
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/projects`)
      .then(res => res.json())
      .then(data => { if (data.success) setProjects(data.projects); })
      .catch(err => console.error("ፕሮጀክቶችን ማምጣት አልተቻለም", err));
  }, []);

  // --- EFFECT: አድሚን መልዕክቶችን ማምጣት ---
  useEffect(() => {
    if (user && user.role === 'admin') fetchMessages();
  }, [user]);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/messages`);
      const data = await res.json();
      if (data.success) setAdminMessages(data.messages);
    } catch (err) { console.error(err); }
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    const url = currentScreen === 'login' ? '/api/auth/login' : '/api/auth/signup';
    try {
      const response = await fetch(`${API_BASE_URL}${url}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authForm)
      });
      const data = await response.json();
      if (response.ok && data.success) {
        if (currentScreen === 'login') {
          setUser(data.user);
          setCurrentScreen(data.user.role === 'admin' ? 'admin-dashboard' : 'order-page');
        } else {
          setAuthStatus('✅ ምዝገባው ተሳክቷል!');
          setCurrentScreen('login');
        }
      } else { setAuthStatus(data.error); }
    } catch { setAuthStatus('የሰርቨር ስህተት!'); }
  };

  const handleAddAdminSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/add-admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAdminForm)
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setAdminAddStatus(`✅ አድሚን ተፈጥሯል!`);
        setNewAdminForm({ name: '', email: '', password: '' });
      } else { setAdminAddStatus(data.error); }
    } catch { setAdminAddStatus('ስህተት!'); }
  };

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        setStatus('ትዕዛዝዎ ገብቷል!');
        setFormData({ name: '', email: '', message: '' });
      }
    } catch { setStatus('ስህተት!'); }
  };

  const handleDeleteMessage = async (id) => {
    if (window.confirm('ማጥፋት ይፈልጋሉ?')) {
      await fetch(`${API_BASE_URL}/api/admin/messages/${id}`, { method: 'DELETE' });
      fetchMessages();
    }
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentScreen('home');
  };

  // ==========================================
  // VIEW RENDERER
  // ==========================================

  // 1. HOME VIEW
  if (currentScreen === 'home') {
    return (
      <div className="home-container" style={{ fontFamily: 'Arial, sans-serif' }}>
        <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 40px', background: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', position: 'sticky', top: 0, zIndex: 100 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src={logoImg} alt="Logo" style={{ width: '45px', borderRadius: '50%' }} />
            <span style={{ fontWeight: 'bold', fontSize: '20px', color: '#333' }}>Max Technology</span>
          </div>
          <div style={{ display: 'flex', gap: '15px' }}>
            <button onClick={() => setCurrentScreen('login')} style={{ padding: '8px 20px', background: 'transparent', border: '1px solid #007bff', color: '#007bff', borderRadius: '5px', cursor: 'pointer' }}>ይግቡ</button>
            <button onClick={() => setCurrentScreen('signup')} style={{ padding: '8px 20px', background: '#007bff', border: 'none', color: 'white', borderRadius: '5px', cursor: 'pointer' }}>ይመዝገቡ</button>
          </div>
        </nav>

        <header style={{ textAlign: 'center', padding: '100px 20px', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
          <h1 style={{ fontSize: '42px', color: '#2c3e50', marginBottom: '20px' }}>እንኳን ወደ Max Technology በሰላም መጡ!</h1>
          <button onClick={() => setCurrentScreen('login')} style={{ padding: '12px 30px', background: '#28a745', color: 'white', border: 'none', borderRadius: '5px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer' }}>አሁኑኑ ይዘዙን!</button>
        </header>

        {/* ፕሮጀክቶች መታየቻ ክፍል */}
        <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>የሰራናቸው ድንቅ ስራዎች</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            {projects.map(p => (
              <div key={p._id} style={{ background: '#fff', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', padding: '15px' }}>
                <img src={p.imageUrl} alt={p.title} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                <h3>{p.title}</h3>
                <a href={p.link} target="_blank" rel="noopener noreferrer" style={{ color: '#007bff', textDecoration: 'none', fontWeight: 'bold' }}>ሊንኩን ይመልከቱ ➡</a>
              </div>
            ))}
          </div>
        </div>

        <Footer />
      </div>
    );
  }

  // 2. AUTH VIEW
  if (currentScreen === 'login' || currentScreen === 'signup') {
    return (
      <div>
        <nav style={{ padding: '15px 40px', background: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <span onClick={() => setCurrentScreen('home')} style={{ cursor: 'pointer', color: '#007bff', fontWeight: 'bold' }}>⬅ ወደ ዋናው ገጽ ይመለሱ</span>
        </nav>
        <Login 
          authMode={currentScreen} 
          setAuthMode={setCurrentScreen} 
          authForm={authForm} 
          handleAuthChange={(e) => setAuthForm({...authForm, [e.target.name]: e.target.value})} 
          handleAuthSubmit={handleAuthSubmit} 
          authStatus={authStatus} 
          logoImg={logoImg} 
        />
      </div>
    );
  }

  // 3. ADMIN VIEW
  if (currentScreen === 'admin-dashboard' && user?.role === 'admin') {
    return (
      <AdminDashboard 
        user={user} 
        handleLogout={handleLogout} 
        adminMessages={adminMessages} 
        fetchMessages={fetchMessages} 
        newAdminForm={newAdminForm} 
        handleNewAdminChange={(e) => setNewAdminForm({...newAdminForm, [e.target.name]: e.target.value})} 
        handleAddAdminSubmit={handleAddAdminSubmit} 
        adminAddStatus={adminAddStatus} 
        API_BASE_URL={API_BASE_URL} 
        handleDeleteMessage={handleDeleteMessage} 
      />
    );
  }

  // 4. ORDER VIEW
  if (currentScreen === 'order-page' && user) {
    return (
      <OrderPage 
        user={user} 
        handleLogout={handleLogout} 
        formData={formData} 
        handleContactChange={(e) => setFormData({...formData, [e.target.name]: e.target.value})} 
        handleOrderSubmit={handleOrderSubmit} 
        status={status} 
        logoImg={logoImg} 
        API_BASE_URL={API_BASE_URL} 
      />
    );
  }

  return null;
}

export default App;