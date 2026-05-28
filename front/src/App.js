import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import OrderPage from './components/OrderPage';
import logoImg from './logo.jpg';

function App() {
  const API_BASE_URL = 'https://max-tech-backend.onrender.com';
  
  const [user, setUser] = useState(null); 
  const [authMode, setAuthMode] = useState('login'); 
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
          setAuthMode(data.user.role === 'admin' ? 'admin-dashboard' : 'order-page');
        } else {
          setAuthStatus('ምዝገባው ተሳክቷል! ይግቡ።'); setAuthMode('login');
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

  if (authMode === 'login' || authMode === 'signup') {
    return <Login authMode={authMode} setAuthMode={setAuthMode} authForm={authForm} handleAuthChange={(e) => setAuthForm({...authForm, [e.target.name]: e.target.value})} handleAuthSubmit={handleAuthSubmit} authStatus={authStatus} logoImg={logoImg} />;
  }
  if (authMode === 'admin-dashboard' && user?.role === 'admin') {
    return <AdminDashboard user={user} handleLogout={() => { setUser(null); setAuthMode('login'); }} adminMessages={adminMessages} fetchMessages={fetchMessages} newAdminForm={newAdminForm} handleNewAdminChange={(e) => setNewAdminForm({...newAdminForm, [e.target.name]: e.target.value})} handleAddAdminSubmit={handleAddAdminSubmit} adminAddStatus={adminAddStatus} API_BASE_URL={API_BASE_URL} handleDeleteMessage={handleDeleteMessage} />;
  }
  if (authMode === 'order-page' && user) {
    return <OrderPage user={user} handleLogout={() => { setUser(null); setAuthMode('login'); }} formData={formData} handleContactChange={(e) => setFormData({...formData, [e.target.name]: e.target.value})} handleOrderSubmit={handleOrderSubmit} status={status} logoImg={logoImg} API_BASE_URL={API_BASE_URL} />;
  }
  return null;
}

export default App;