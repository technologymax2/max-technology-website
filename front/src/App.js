import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import OrderPage from './components/OrderPage';
import Footer from './components/Footer';
import logoImg from './logo.jpg';
import './App.css';

function App() {
  const API_BASE_URL = 'https://max-tech-backend.onrender.com';

  const [currentScreen, setCurrentScreen] = useState('home');
  const [user, setUser] = useState(null);

  // Auth
  const [authForm, setAuthForm] = useState({
    name: '',
    email: '',
    password: ''
  });

  const [authStatus, setAuthStatus] = useState('');

  // Admin
  const [adminMessages, setAdminMessages] = useState([]);
  const [newAdminForm, setNewAdminForm] = useState({
    name: '',
    email: '',
    password: ''
  });

  const [adminAddStatus, setAdminAddStatus] = useState('');

  // Order
  const [formData, setFormData] = useState({
    name: '', email: '',message: ''
  });

  const [status, setStatus] = useState('');

  // Projects
  const [projects, setProjects] = useState([]);

  // Fetch admin messages
  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchMessages();
    }
  }, [user]);

 // ከዚህ በታች ያለውን ኮድ በ App.js ውስጥ ባለው useEffect በኩል ለውጠው
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/projects`)
      .then((res) => res.json())
      .then((data) => {
        // ዳታው በትክክል አሬይ (Array) መሆኑን እናረጋግጣለን
        if (data && Array.isArray(data.projects)) {
          setProjects(data.projects);
        } else if (Array.isArray(data)) {
          setProjects(data);
        } else {
          setProjects([]); // ዳታው ካልተገኘ ባዶ አሬይ ያድርገው
        }
      })
      .catch((err) => {
        console.error("ፕሮጀክቶችን ማምጣት አልተቻለም", err);
        setProjects([]); // ስህተት ቢኖርም ፕሮግራሙ እንዳይቆም ባዶ አሬይ እናድርገው
      });
  }, []);

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

    const url =
      currentScreen === 'login'
        ? '/api/auth/login'
        : '/api/auth/signup';

    try {
      const response = await fetch(`${API_BASE_URL}${url}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(authForm)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        if (currentScreen === 'login') {
          setUser(data.user);

          setCurrentScreen(
            data.user.role === 'admin'
              ? 'admin-dashboard'
              : 'order-page'
          );
        } else {
          setAuthStatus(
            '✅ ምዝገባው ተሳክቷል! አሁን መግባት ይችላሉ።'
          );

          setCurrentScreen('login');
        }
      } else {
        setAuthStatus(data.error);
      }
    } catch {
      setAuthStatus('የሰርቨር ስህተት!');
    }
  };

  const handleAddAdminSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/admin/add-admin`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(newAdminForm)
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setAdminAddStatus('✅ አድሚን ተፈጥሯል!');

        setNewAdminForm({
          name: '',
          email: '',
          password: ''
        });
      } else {
        setAdminAddStatus(data.error);
      }
    } catch {
      setAdminAddStatus('ስህተት!');
    }
  };

  const handleOrderSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_BASE_URL}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setStatus('ትዕዛዝዎ ገብቷል!');

        setFormData({
          name: '',
          email: '',
          message: ''
        });
      }
    } catch {
      setStatus('ስህተት!');
    }
  };

  const handleDeleteMessage = async (id) => {
    if (window.confirm('ማጥፋት ይፈልጋሉ?')) {
      await fetch(
        `${API_BASE_URL}/api/admin/messages/${id}`,
        {
          method: 'DELETE'
        }
      );

      fetchMessages();
    }
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentScreen('home');
  };

  if (currentScreen === 'home') {
    return (
      <div
        className="home-container">
        <nav>
          <div>
            <img src={logoImg} alt="Logo"/>

            <span>
              Max Technology
            </span>
          </div>

          <div style={{ display: 'flex', gap: '15px' }}>
            <button
              onClick={() => {
                setAuthStatus('');
                setCurrentScreen('login');
              }}
            >
              Login
            </button>

            <button
              onClick={() => {
                setAuthStatus('');
                setCurrentScreen('signup');
              }}
            >
              Signup
            </button>
          </div>
        </nav>
        <header>
          <h1>እንኳን ወደ Max Technology በሰላም መጡ!</h1>

          <p>
            እኛ የድርጅትዎን ስራ የሚያቀል ድህረ-ገጾችን
            እና ሲስተሞችን እንሰራለን።
          </p>

          <button
            onClick={() => setCurrentScreen('login')}> አሁኑኑ ይዘዙን!
          </button>
        </header>

        {/* Projects - አሁን ሊንክ ብቻ አለው */}
<div className="projects-display">
  {projects.map((p) => (
    <div key={p._id} className="project-card">
      <a href={p.link || "#"} target="_blank" rel="noopener noreferrer">
        <img src={p.imageUrl} alt={p.title} style={{ cursor: 'pointer' }} />
      </a>
      <h3>{p.title}</h3>
    </div>
  ))}
</div>

        <Footer />
      </div>
    );
  }

  // LOGIN / SIGNUP
  if (
    currentScreen === 'login' ||
    currentScreen === 'signup'
  ) {
    return (
      <div>
        <nav>
          <span
            onClick={() => setCurrentScreen('home')}
            style={{
              cursor: 'pointer',
              color: '#007bff',
              fontWeight: 'bold'
            }}
          >
            ⬅ ወደ ዋናው ገጽ ይመለሱ
          </span>
        </nav>

        <Login
          authMode={currentScreen}
          setAuthMode={setCurrentScreen}
          authForm={authForm}
          handleAuthChange={(e) =>
            setAuthForm({
              ...authForm,
              [e.target.name]: e.target.value
            })
          }
          handleAuthSubmit={handleAuthSubmit}
          authStatus={authStatus}
          logoImg={logoImg}
        />
      </div>
    );
  }

// ADMIN
  if (
    currentScreen === 'admin-dashboard' &&
    user?.role === 'admin'
  ) {
    return (
      <AdminDashboard
        user={user}
        handleLogout={handleLogout}
        adminMessages={adminMessages}
        fetchMessages={fetchMessages}
        newAdminForm={newAdminForm}
        handleNewAdminChange={(e) =>
          setNewAdminForm({
            ...newAdminForm,
            [e.target.name]: e.target.value
          })
        }
        handleAddAdminSubmit={handleAddAdminSubmit}
        adminAddStatus={adminAddStatus}
        API_BASE_URL={API_BASE_URL}
        handleDeleteMessage={handleDeleteMessage}
        
        // ✅ አዲሶቹ ፕሮፕሶች እዚህ መጨመር አለባቸው፦
        projects={projects}
        setProjects={setProjects}
      />
    );
  }

  // ORDER PAGE
  if (currentScreen === 'order-page' && user) {
    return (
      <OrderPage
        user={user}
        handleLogout={handleLogout}
        formData={formData}
        handleContactChange={(e) =>
          setFormData({
            ...formData,
            [e.target.name]: e.target.value
          })
        }
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