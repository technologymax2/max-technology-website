import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import OrderPage from './components/OrderPage';
import logoImg from './logo.jpg';
import './App.css'; // የእርስዎ የድሮ ስታይል ፋይል

function App() {
  const API_BASE_URL = 'https://max-tech-backend.onrender.com';
  
  // የትኛው ገጽ መታየት እንዳለበት ለመወሰን ('home', 'login', 'signup', 'admin-dashboard', 'order-page')
  const [currentScreen, setCurrentScreen] = useState('home'); 
  const [user, setUser] = useState(null); 
  
  // ፎርሞች
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });
  const [authStatus, setAuthStatus] = useState('');
  const [adminMessages, setAdminMessages] = useState([]);
  const [newAdminForm, setNewAdminForm] = useState({ name: '', email: '', password: '' });
  const [adminAddStatus, setAdminAddStatus] = useState('');
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('');

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
          setAuthStatus('✅ ምዝገባው ተሳክቷል! አሁን መግባት ይችላሉ።'); 
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
  // 1️⃣ ዌብሳይቱ ሲከፈት መጀመሪያ የሚመጣው ዋናው ገጽ (HOME VIEW)
  // ==========================================
  if (currentScreen === 'home') {
    return (
      <div className="home-container" style={{ fontFamily: 'Arial, sans-serif' }}>
        {/* 🌐 የላይኛው የናቪጌሽን ባር (Navbar) */}
        <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 40px', background: '#ffffff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', position: 'sticky', top: 0, zIndex: 100 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src={logoImg} alt="Logo" style={{ width: '45px', borderRadius: '50%' }} />
            <span style={{ fontWeight: 'bold', fontSize: '20px', color: '#333' }}>Max Technology</span>
          </div>
          <div style={{ display: 'flex', gap: '15px' }}>
            <button onClick={() => { setAuthStatus(''); setCurrentScreen('login'); }} style={{ padding: '8px 20px', background: 'transparent', border: '1px solid #007bff', color: '#007bff', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>ይግቡ (Login)</button>
            <button onClick={() => { setAuthStatus(''); setCurrentScreen('signup'); }} style={{ padding: '8px 20px', background: '#007bff', border: 'none', color: 'white', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>ይመዝገቡ (Signup)</button>
          </div>
        </nav>

        {/* 👋 የማስተዋወቂያ ክፍል (Hero Section) */}
        <header style={{ textAlign: 'center', padding: '100px 20px', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
          <h1 style={{ fontSize: '42px', color: '#2c3e50', marginBottom: '20px' }}>እንኳን ወደ Max Technology በሰላም መጡ!</h1>
          <p style={{ fontSize: '18px', color: '#7f8c8d', maxWidth: '600px', margin: '0 auto 30px auto', lineHeight: '1.6' }}>
            እኛ የድርጅትዎን ስራ የሚያቀልጡ ድንቅ ድህረ-ገጾችን (Websites) እና ዘመናዊ ሲስተሞችን በጥራት እንሰራለን።
          </p>
          <button onClick={() => setCurrentScreen('login')} style={{ padding: '12px 30px', background: '#28a745', color: 'white', border: 'none', borderRadius: '5px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            አሁኑኑ ስራ ያዙ!
          </button>
        </header>

        {/* ከስር ያለው ፉተር (Footer) */}
        <footer style={{ textAlign: 'center', padding: '20px', background: '#343a40', color: 'white', marginTop: '50px' }}>
          <p>© 2026 Mamaru Anmaw. መብቱ በህግ የተጠበቀ ነው።</p>
        </footer>
      </div>
    );
  }

  // ==========================================
  // 2️⃣ የሎጊን እና ሳይንአፕ ገጽ (LOGIN / SIGNUP)
  // ==========================================
  if (currentScreen === 'login' || currentScreen === 'signup') {
    return (
      <div>
        {/* ወደ ዋናው ገጽ መመለሻ Navbar */}
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

  // ==========================================
  // 3️⃣ የአድሚን ገጽ (ADMIN DASHBOARD VIEW)
  // ==========================================
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

  // ==========================================
  // 4️⃣ የደንበኛ ማዘዣ ገጽ (ORDER PAGE VIEW)
  // ==========================================
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