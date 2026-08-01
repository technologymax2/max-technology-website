import React, { useState, useEffect } from "react";
import Login from "./components/Login";
import AdminDashboard from "./components/AdminDashboard";
import HrDashboard from "./components/HrDashboard";
import OrderPage from "./components/OrderPage";
import Footer from "./components/Footer";
import VerifyEmployee from "./components/VerifyEmployee"; // 1. VerifyEmployee ን እዚህ አስገብተናል (Import)
import logoImg from "./logo.jpg";

function App() {
  const API_BASE_URL = "https://max-tech-backend.onrender.com";
  const [currentScreen, setCurrentScreen] = useState("home");
  const [user, setUser] = useState(null);
  const [authForm, setAuthForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [authStatus, setAuthStatus] = useState("");
  const [adminMessages, setAdminMessages] = useState([]);
  const [newAdminForm, setNewAdminForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [adminAddStatus, setAdminAddStatus] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [status, setStatus] = useState("");
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    if (user && user.role === "admin") {
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
    const url = currentScreen === "login" ? "/api/auth/login" : "/api/auth/signup";
    try {
      const response = await fetch(`${API_BASE_URL}${url}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(authForm),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        if (currentScreen === "login") {
          setUser(data.user);
          if (data.user.role === "admin") {
            setCurrentScreen("admin-dashboard");
          } else if (data.user.role === "hr") {
            setCurrentScreen("hr-dashboard");
          } else {
            setCurrentScreen("order-page");
          }
        } else {
          setAuthStatus("✅ ምዝገባው ተሳክቷል! አሁን መግባት ይችላሉ።");
          setCurrentScreen("login");
        }
      } else {
        setAuthStatus(data.error);
      }
    } catch {
      setAuthStatus("የሰርቨር ስህተት!");
    }
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentScreen("home");
  };

  if (currentScreen === "home") {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col justify-between">
        <nav className="w-full bg-white shadow-sm px-6 py-4 flex justify-between items-center sticky top-0 z-50">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentScreen("home")}>
            <img src={logoImg} alt="Logo" className="w-10 h-10 rounded-full object-cover shadow" />
            <span className="text-xl font-bold text-blue-600">Max Technology</span>
          </div>
          <div className="flex items-center gap-3">
            {/* ሰራተኛ ማረጋገጫ (Verify ID) መክፈቻ አዝራር */}
            <button 
              onClick={() => setCurrentScreen("verify-employee")} 
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition"
            >
              Verify ID
            </button>
            <button 
              onClick={() => { setAuthStatus(""); setCurrentScreen("login"); }} 
              className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition"
            >
              Login
            </button>
            <button 
              onClick={() => { setAuthStatus(""); setCurrentScreen("signup"); }} 
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
            >
              Signup
            </button>
          </div>
        </nav>
        <header className="max-w-4xl mx-auto px-6 py-16 text-center">
          <h1 className="text-3xl sm:text-5xl font-extrabold text-gray-900 mb-6">
            እንኳን ወደ <span className="text-blue-600">Max Technology</span> በሰላም መጡ!
          </h1>
          <p className="text-gray-600 mb-8">እኛ የድርጅትዎን ስራ የሚያቀል ድህረ-ገጾችን እና ሲስተምን እንሰራለን።</p>
          <button 
            onClick={() => setCurrentScreen("login")} 
            className="px-8 py-3.5 text-white bg-blue-600 rounded-xl shadow-lg hover:bg-blue-700 transition"
          >
            አሁኑኑ ይዘዙን!
          </button>
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
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-gray-800">{p.title}</h3>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
        <Footer />
      </div>
    );
  }

  if (currentScreen === "login" || currentScreen === "signup") {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
        <nav className="w-full bg-white shadow-sm px-6 py-4">
          <button onClick={() => setCurrentScreen("home")} className="text-blue-600 font-semibold hover:underline">
            ⬅ ወደ ዋናው ገጽ ይመለሱ
          </button>
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

  // 2. የሰራተኛ ማረጋገጫ ገጽ (Verify Employee Screen) እዚህ ተጨምሯል
  if (currentScreen === "verify-employee") {
    return (
      <VerifyEmployee 
        API_BASE_URL={API_BASE_URL} 
        setCurrentScreen={setCurrentScreen} 
      />
    );
  }

  if (currentScreen === "admin-dashboard" && user?.role === "admin") {
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
            method: "POST", 
            headers: { "Content-Type": "application/json" }, 
            body: JSON.stringify(newAdminForm), 
          }); 
          const data = await res.json(); 
          if (data.success) { 
            setAdminAddStatus("✅ አድሚን ተፈጥሯል!"); 
            setNewAdminForm({ name: "", email: "", password: "" }); 
          } else { 
            setAdminAddStatus(data.error); 
          } 
        }} 
        adminAddStatus={adminAddStatus} 
        API_BASE_URL={API_BASE_URL} 
        handleDeleteMessage={async (id) => { 
          if (window.confirm("ማጥፋት ይፈልጋሉ?")) { 
            await fetch(`${API_BASE_URL}/api/admin/messages/${id}`, { 
              method: "DELETE", 
            }); 
            fetchMessages(); 
          } 
        }} 
        projects={projects} 
        setProjects={setProjects} 
      />
    );
  }

  if (currentScreen === "hr-dashboard" && user?.role === "hr") {
    return (
      <HrDashboard 
        user={user} 
        handleLogout={handleLogout} 
        API_BASE_URL={API_BASE_URL} 
      />
    );
  }

  if (currentScreen === "order-page" && user) {
    return (
      <OrderPage 
        user={user} 
        handleLogout={handleLogout} 
        formData={formData} 
        handleContactChange={(e) => setFormData({ ...formData, [e.target.name]: e.target.value })} 
        handleOrderSubmit={async (e) => { 
          e.preventDefault(); 
          const res = await fetch(`${API_BASE_URL}/api/contact`, { 
            method: "POST", 
            headers: { "Content-Type": "application/json" }, 
            body: JSON.stringify(formData), 
          }); 
          if (res.ok) { 
            setStatus("ትዕዛዝዎ ገብቷል!"); 
            setFormData({ name: "", email: "", message: "" }); 
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

export default App;
