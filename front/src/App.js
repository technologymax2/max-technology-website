import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useParams, useNavigate } from 'react-router-dom';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import HrDashboard from './components/HrDashboard';
import OrderPage from './components/OrderPage';
import Footer from './components/Footer';
import logoImg from './logo.jpg';

// የሰራተኛ ማረጋገጫ ገጽ (Verification Component)
function VerifyEmployeePage({ API_BASE_URL }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/hr/verify/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setEmployee(data.employee);
        } else {
          setError('ሰራተኛው አልተገኘም ወይም ሊንኩ ተበላሽቷል።');
        }
      })
      .catch(() => setError('ሰርቨር ጋር መገናኘት አልተቻለም።'))
      .finally(() => setLoading(false));
  }, [id, API_BASE_URL]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center font-bold">
        ⏳ መረጃውን በማጣራት ላይ...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-red-400 flex flex-col items-center justify-center p-4 text-center">
        <h2 className="text-xl font-bold mb-2">❌ ስህተት ተፈጥሯል</h2>
        <p className="text-sm text-gray-300 mb-4">{error}</p>
        <button onClick={() => navigate('/')} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold">
          ወደ ዋናው ገጽ ተመለስ
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
      <div className="bg-gray-800 border-2 border-green-500 rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center relative">
        <div className="absolute top-3 right-3">
          <button onClick={() => navigate('/')} className="text-gray-400 hover:text-white text-xs bg-gray-700 px-2.5 py-1 rounded-lg">
            ✕ ዝጋ
          </button>
        </div>

        <div className="inline-block bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-bold mb-4">
          ✅ ትክክለኛ ሰራተኛ (Verified Employee)
        </div>

        <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-2 border-[#d4af37] mb-4 shadow-lg">
          <img src={employee.imageUrl} alt={employee.nameEng} className="w-full h-full object-cover" />
        </div>

        <h2 className="text-lg font-bold text-white">{employee.nameAmh}</h2>
        <h3 className="text-sm text-gray-300 mb-1">{employee.nameEng}</h3>
        <p className="text-xs text-[#d4af37] font-bold mb-4">{employee.positionAmh} / {employee.positionEng}</p>

        <div className="bg-gray-900 p-3 rounded-xl text-left text-xs space-y-2 border border-gray-700">
          <div className="flex justify-between border-b border-gray-800 pb-1">
            <span className="text-gray-400">የፋይዳ ቁጥር:</span>
            <span className="font-mono text-white">{employee.faydaNumber}</span>
          </div>
          <div className="flex justify-between border-b border-gray-800 pb-1">
            <span className="text-gray-400">ስልክ ቁጥር:</span>
            <span className="text-white">{employee.phoneNumber}</span>
          </div>
          <div className="flex justify-between border-b border-gray-800 pb-1">
            <span className="text-gray-400">የድርጅት ኢሜይል:</span>
            <span className="text-white truncate max-w-[150px]">{employee.orgEmail}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">የሚያበቃበት ቀን:</span>
            <span className="text-red-400 font-bold">{employee.expireDate}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function MainApp() {
  const API_BASE_URL = 'https://max-tech-backend.onrender.com';

  const [currentScreen, setCurrentScreen] = useState('home');
  const [user, setUser] = useState(null);

  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });
  const [authStatus, setAuthStatus] = useState('');

  const [adminMessages, setAdminMessages] = useState([]);
  const [newAdminForm, setNewAdminForm] = useState({ name: '', email: '', password: '' });
  const [adminAddStatus, setAdminAddStatus] = useState('');

  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('');
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchMessages();
    }
  }, [user]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/projects`)
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.projects)) {
          setProjects(data.projects);
        } else if (Array.isArray(data)) {
          setProjects(data);
        } else {
          setProjects([]);
        }
      })
      .catch((err) => {
        console.error("ፕሮጀክቶችን ማምጣት አልተቻለም", err);
        setProjects([]);
      });
  }, [API_BASE_URL]);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/messages`);
      const data = await res.json();
      if (data.success) {
        setAdminMessages(data.messages);
      }
    } catch (err) {
      console.error(err);
    }
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
          if (data.user.role === 'admin') {
            setCurrentScreen('admin-dashboard');
          } else if (data.user.role === 'hr') {
            setCurrentScreen('hr-dashboard');
          } else {
            setCurrentScreen('order-page');
          }
        } else {
          setAuthStatus('✅ ምዝገባው ተሳክቷል! አሁን መግባት ይችላሉ።');
          setCurrentScreen('login');
        }
      } else {
        setAuthStatus(data.error);
      }
    } catch {
      setAuthStatus('የሰርቨር ስህተት!');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentScreen('home');
  };

  if (currentScreen === 'home') {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col justify-between">
        <nav className="w-full bg-white shadow-sm px-6 py-4 flex justify-between items-center sticky top-0 z-50">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentScreen('home')}>
            <img src={logoImg} alt="Logo" className="w-10 h-10 rounded-full object-cover shadow" />
            <span className="text-xl font-bold text-blue-600">Max Technology</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => { setAuthStatus(''); setCurrentScreen('login'); }} className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition">Login</button>
            <button onClick={() => { setAuthStatus(''); setCurrentScreen('signup'); }} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition">Signup</button>
          </div>
        </nav>

        <header className="max-w-4xl mx-auto px-6 py-16 text-center">
          <h1 className="text-3xl sm:text-5xl font-extrabold text-gray-900 mb-6">
            እንኳን ወደ <span className="text-blue-600">Max Technology</span> በሰላም መጡ!
          </h1>
          <p className="text-gray-600 mb-8">እኛ የድርጅትዎን ስራ የሚያቀል ድህረ-ገጾችን እና ሲስተሞችን እንሰራለን።</p>
          <button onClick={() => setCurrentScreen('login')} className="px-8 py-3.5 text-white bg-blue-600 rounded-xl shadow-lg hover:bg-blue-700 transition">አሁኑኑ ይዘዙን!</button>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-10 w-full flex-grow">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">የሠሯቸው ፕሮጀክቶች</h2>
          {projects.length === 0 ? (
            <p className="text-center text-gray-500">ምንም ፕሮጀክቶች አልተገኙም</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.map((p) => (
                <div key={p._id} className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition border border-gray-100 flex flex-col">
                  <a href={p.link || "#"} target="_blank" rel="noopener noreferrer" className="overflow-hidden block">
                    <img src={p.imageUrl} alt={p.title} className="w-full h-48 object-cover hover:scale-105 transition duration-300" />
                  </a>
                  <div className="p-5"><h3 className="text-lg font-bold text-gray-800">{p.title}</h3></div>
                </div>
              ))}
            </div>
          )}
        </main>
        <Footer />
      </div>
    );
  }

  if (currentScreen === 'login' || currentScreen === 'signup') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
        <nav className="w-full bg-white shadow-sm px-6 py-4">
          <button onClick={() => setCurrentScreen('home')} className="text-blue-600 font-semibold hover:underline">⬅ ወደ ዋናው ገጽ ይመለሱ</button>
        </nav>
        <div className="flex-grow flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-md">
            <Login
              authMode={currentScreen}
              setAuthMode={setCurrentScreen}
              authForm={authForm}
              handleAuthChange={(e) => setAuthForm({ ...authForm, [e.target.name]: e.target.value })}
              handleAuthSubmit={handleAuthSubmit}
              authStatus={authStatus}
              logoImg={logoImg}
            />
          </div>
        </div>
      </div>
    );
  }

  if (currentScreen === 'admin-dashboard' && user?.role === 'admin') {
    return (
      <AdminDashboard
        user={user}
        handleLogout={handleLogout}
        adminMessages={adminMessages}
        fetchMessages={fetchMessages}
        newAdminForm={newAdminForm}
        handleNewAdminChange={(e) => setNewAdminForm({ ...newAdminForm, [e.target.name]: e.target.value })}
        handleAddAdminSubmit={async (e) => {
          e.preventDefault();
          const res = await fetch(`${API_BASE_URL}/api/admin/add-admin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newAdminForm)
          });
          const data = await res.json();
          if (data.success) {
            setAdminAddStatus('✅ አድሚን ተፈጥሯል!');
            setNewAdminForm({ name: '', email: '', password: '' });
          } else {
            setAdminAddStatus(data.error);
          }
        }}
        adminAddStatus={adminAddStatus}
        API_BASE_URL={API_BASE_URL}
        handleDeleteMessage={async (id) => {
          if (window.confirm('ማጥፋት ይፈልጋሉ?')) {
            await fetch(`${API_BASE_URL}/api/admin/messages/${id}`, { method: 'DELETE' });
            fetchMessages();
          }
        }}
        projects={projects}
        setProjects={setProjects}
      />
    );
  }

  if (currentScreen === 'hr-dashboard' && user?.role === 'hr') {
    return <HrDashboard user={user} handleLogout={handleLogout} API_BASE_URL={API_BASE_URL} />;
  }

  if (currentScreen === 'order-page' && user) {
    return (
      <OrderPage
        user={user}
        handleLogout={handleLogout}
        formData={formData}
        handleContactChange={(e) => setFormData({ ...formData, [e.target.name]: e.target.value })}
        handleOrderSubmit={async (e) => {
          e.preventDefault();
          const res = await fetch(`${API_BASE_URL}/api/contact`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
          });
          if (res.ok) {
            setStatus('ትዕዛዝዎ ገብቷል!');
            setFormData({ name: '', email: '', message: '' });
          }
        }}
        status={status}
        logoImg={logoImg}
        API_BASE_URL={API_BASE_URL}
      />
    );
  }

  return null;
}

// ዋናው App ኤክስፖርት የሚደረግበት
function App() {
  const API_BASE_URL = 'https://max-tech-backend.onrender.com';
  return (
    <Router>
      <Routes>
        <Route path="/verify/:id" element={<VerifyEmployeePage API_BASE_URL={API_BASE_URL} />} />
        <Route path="/*" element={<MainApp />} />
      </Routes>
    </Router>
  );
}

export default App;
