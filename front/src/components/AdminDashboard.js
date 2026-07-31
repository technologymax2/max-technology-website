import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Users,
  Briefcase,
  Mail,
  ShieldAlert,
  UserPlus,
  Trash2,
  Lock,
  Send,
  CheckCircle,
  Menu,
  X,
  LogOut,
  Settings,
  RefreshCw
} from "lucide-react";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // States for data
  const [stats, setStats] = useState({ users: 0, projects: 0, messages: 0, hrs: 0 });
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [messages, setMessages] = useState([]);
  const [hrs, setHrs] = useState([]);
  
  // Form states
  const [projectForm, setProjectForm] = useState({ title: "", link: "", imageUrl: "" });
  const [hrForm, setHrForm] = useState({ name: "", email: "", password: "" });
  const [replyText, setReplyText] = useState({});
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ message: "", type: "" });

  const API_BASE = "https://your-backend-url.com/api"; // Replace with your actual backend URL or localhost

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: "", type: "" }), 4000);
  };

  // Fetch all data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, projectsRes, messagesRes, hrsRes] = await Promise.all([
        axios.get(`${API_BASE}/admin/users`).catch(() => ({ data: { users: [] } })),
        axios.get(`${API_BASE}/projects`).catch(() => ({ data: { projects: [] } })),
        axios.get(`${API_BASE}/admin/messages`).catch(() => ({ data: { messages: [] } })),
        axios.get(`${API_BASE}/admin/hrs`).catch(() => ({ data: { hrs: [] } })),
      ]);

      setUsers(usersRes.data.users || []);
      setProjects(projectsRes.data.projects || []);
      setMessages(messagesRes.data.messages || []);
      setHrs(hrsRes.data.hrs || []);

      setStats({
        users: (usersRes.data.users || []).length,
        projects: (projectsRes.data.projects || []).length,
        messages: (messagesRes.data.messages || []).length,
        hrs: (hrsRes.data.hrs || []).length,
      });
    } catch (error) {
      showNotification("መረጃዎችን ማምጣት አልተቻለም።", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- Project Actions ---
  const handleAddProject = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/admin/projects`, projectForm);
      showNotification("ፕሮጀክት በስኬት ተመዝግቧል!");
      setProjectForm({ title: "", link: "", imageUrl: "" });
      fetchData();
    } catch (error) {
      showNotification("ፕሮጀክት መመዝገብ አልተቻለም", "error");
    }
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm("ይህንን ፕሮጀክት ማጥፋት ይፈልጋሉ?")) return;
    try {
      await axios.delete(`${API_BASE}/admin/projects/${id}`);
      showNotification("ፕሮጀክቱ ተሰርዟል!");
      fetchData();
    } catch (error) {
      showNotification("ማጥፋት አልተቻለም", "error");
    }
  };

  // --- HR Actions ---
  const handleAddHR = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/admin/hrs`, hrForm);
      showNotification("HR በስኬት ተመዝግቧል!");
      setHrForm({ name: "", email: "", password: "" });
      fetchData();
    } catch (error) {
      showNotification(error.response?.data?.error || "HR መመዝገብ አልተቻለም", "error");
    }
  };

  const handleDeleteHR = async (id) => {
    if (!window.confirm("ይህንን HR ማጥፋት ይፈልጋሉ?")) return;
    try {
      await axios.delete(`${API_BASE}/admin/hrs/${id}`);
      showNotification("HR ተሰርዟል!");
      fetchData();
    } catch (error) {
      showNotification("ማጥፋት አልተቻለም", "error");
    }
  };

  const handleResetHRPassword = async (id) => {
    const newPassword = prompt("ለዚህ HR አዲስ ፓስወርድ ያስገቡ (ቢያንስ 6 ፊደላት):");
    if (!newPassword) return;
    try {
      await axios.put(`${API_BASE}/admin/hrs/reset-password/${id}`, { newPassword });
      showNotification("የ HR ፓስወርድ ተቀይሯል!");
    } catch (error) {
      showNotification(error.response?.data?.error || "ፓስወርድ መቀየር አልተቻለም", "error");
    }
  };

  // --- User & Block Actions ---
  const handleToggleBlock = async (id, currentStatus) => {
    try {
      await axios.put(`${API_BASE}/admin/users/block/${id}`, { isBlocked: !currentStatus });
      showNotification("የተጠቃሚው ሁኔታ ተቀይሯል!");
      fetchData();
    } catch (error) {
      showNotification("ክዋኔው አልተሳካም", "error");
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("ይህንን ተጠቃሚ ሙሉ በሙሉ ማጥፋት ይፈልጋሉ?")) return;
    try {
      await axios.delete(`${API_BASE}/admin/users/delete/${id}`);
      showNotification("ተጠቃሚው ተሰርዟል!");
      fetchData();
    } catch (error) {
      showNotification("ማጥፋት አልተቻለም", "error");
    }
  };

  // --- Messages & Reply Actions ---
  const handleSendReply = async (id) => {
    const reply = replyText[id];
    if (!reply) return showNotification("እባክዎ ምላሽ ይጻፉ!", "error");
    try {
      await axios.post(`${API_BASE}/admin/reply/${id}`, { reply });
      showNotification("ምላሹ ተልኳል!");
      setReplyText({ ...replyText, [id]: "" });
      fetchData();
    } catch (error) {
      showNotification("ምላሽ መላክ አልተቻለም", "error");
    }
  };

  const handleDeleteMessage = async (id) => {
    if (!window.confirm("መልዕክቱን ማጥፋት ይፈልጋሉ?")) return;
    try {
      await axios.delete(`${API_BASE}/admin/messages/${id}`);
      showNotification("መልዕክቱ ተሰርዟል!");
      fetchData();
    } catch (error) {
      showNotification("ማጥፋት አልተቻለም", "error");
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans text-right" dir="rtl">
      {/* Mobile Sidebar Toggle */}
      <div className="lg:hidden fixed top-4 right-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 bg-blue-600 text-white rounded-md shadow-lg"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Notification Toast */}
      {notification.message && (
        <div
          className={`fixed top-5 left-5 z-50 px-6 py-3 rounded-lg shadow-xl text-white font-medium transition-all ${
            notification.type === "error" ? "bg-red-500" : "bg-green-600"
          }`}
        >
          {notification.message}
        </div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 right-0 z-40 w-64 bg-slate-900 text-slate-300 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "translate-x-full"
        } lg:static lg:block shadow-2xl`}
      >
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Settings className="text-blue-500" /> የአድሚን ፓነል
          </h1>
        </div>

        <nav className="p-4 space-y-2">
          {[
            { id: "overview", label: "አጠቃላይ እይታ", icon: Users },
            { id: "users", label: "ተጠቃሚዎች እና ደንበኞች", icon: Users },
            { id: "hrs", label: "የሰው ሃብት (HR) አስተዳደር", icon: UserPlus },
            { id: "projects", label: "ፖርትፎሊዮ / ፕሮጀክቶች", icon: Briefcase },
            { id: "messages", label: "መልዕክቶች እና ትዕዛዞች", icon: Mail },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                  activeTab === item.id
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                    : "hover:bg-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-6 right-6 left-6">
          <button
            onClick={() => {
              localStorage.clear();
              window.location.href = "/login";
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition-all font-medium"
          >
            <LogOut size={20} />
            <span>ውጣ (Logout)</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-8 shadow-sm">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-gray-800">
              {activeTab === "overview" && "ዳሽቦርድ አጠቃላይ መረጃ"}
              {activeTab === "users" && "የተጠቃሚዎች ዝርዝር እና መቆጣጠሪያ"}
              {activeTab === "hrs" && "የ HR ባለሙያዎች ማስተዳደሪያ"}
              {activeTab === "projects" && "የፖርትፎሊዮ ፕሮጀክቶች አስተዳደር"}
              {activeTab === "messages" && "የደንበኞች መልዕክቶች እና ትዕዛዞች"}
            </h2>
          </div>
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all text-sm font-medium"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            <span>አድስ</span>
          </button>
        </header>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-8 bg-gray-50">
          {/* OVERVIEW TAB */}
          {activeTab === "overview" && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { title: "ጠቅላላ ተጠቃሚዎች", count: stats.users, icon: Users, color: "bg-blue-500" },
                  { title: "ፕሮጀክቶች", count: stats.projects, icon: Briefcase, color: "bg-purple-500" },
                  { title: "የመጡ መልዕክቶች", count: stats.messages, icon: Mail, color: "bg-amber-500" },
                  { title: "የ HR ባለሙያዎች", count: stats.hrs, icon: UserPlus, color: "bg-emerald-500" },
                ].map((stat, i) => {
                  const Icon = stat.icon;
                  return (
                    <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                        <h3 className="text-3xl font-bold text-gray-800 mt-2">{stat.count}</h3>
                      </div>
                      <div className={`p-4 rounded-xl text-white shadow-md ${stat.color}`}>
                        <Icon size={24} />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-4">እንኳን ደህና መጡ!</h3>
                <p className="text-gray-600 leading-relaxed">
                  ይህ የሲስተሙ ዋና መቆጣጠሪያ ማዕከል ነው። ከဘေး ሜኑ (Sidebar) ላይ በመምረጥ ተጠቃሚዎችን ማገድ፣ የ HR ባለሙያዎችን መመዝገብ፣ አዳዲስ ፕሮጀክቶችን መጨመር እና ለተጠቃሚዎች መልዕክት መመለስ ይችላሉ።
                </p>
              </div>
            </div>
          )}

          {/* USERS TAB */}
          {activeTab === "users" && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-800">የተመዝገቡ ተጠቃሚዎች እና ደንበኞች</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-gray-600 text-sm font-semibold border-b border-gray-100">
                      <th className="p-4">ስም</th>
                      <th className="p-4">ኢሜይል</th>
                      <th className="p-4">ሁኔታ</th>
                      <th className="p-4">ድርጊቶች</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                    {users.map((u) => (
                      <tr key={u._id} className="hover:bg-gray-50/50">
                        <td className="p-4 font-medium">{u.name}</td>
                        <td className="p-4 text-gray-500">{u.email}</td>
                        <td className="p-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              u.isBlocked
                                ? "bg-red-100 text-red-600"
                                : "bg-green-100 text-green-600"
                            }`}
                          >
                            {u.isBlocked ? "ታግዷል" : "ንቁ (Active)"}
                          </span>
                        </td>
                        <td className="p-4 flex items-center gap-2">
                          <button
                            onClick={() => handleToggleBlock(u._id, u.isBlocked)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-all ${
                              u.isBlocked ? "bg-emerald-600 hover:bg-emerald-700" : "bg-amber-500 hover:bg-amber-600"
                            }`}
                          >
                            {u.isBlocked ? "ክፈት (Unblock)" : "አግድ (Block)"}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u._id)}
                            className="p-1.5 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr>
                        <td colSpan="4" className="p-6 text-center text-gray-400">ምንም ተጠቃሚ የለም</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* HRS TAB */}
          {activeTab === "hrs" && (
            <div className="space-y-8">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-4">አዲስ የ HR ባለሙያ መመዝገቢያ</h3>
                <form onSubmit={handleAddHR} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    placeholder="የሰራተኛው ስም"
                    value={hrForm.name}
                    onChange={(e) => setHrForm({ ...hrForm, name: e.target.value })}
                    required
                    className="px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <input
                    type="email"
                    placeholder="ኢሜይል አድራሻ"
                    value={hrForm.email}
                    onChange={(e) => setHrForm({ ...hrForm, email: e.target.value })}
                    required
                    className="px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <input
                    type="password"
                    placeholder="ፓስወርድ"
                    value={hrForm.password}
                    onChange={(e) => setHrForm({ ...hrForm, password: e.target.value })}
                    required
                    className="px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <div className="md:col-span-3">
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all text-sm shadow-md shadow-blue-600/20"
                    >
                      HR መዝግብ
                    </button>
                  </div>
                </form>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-lg font-bold text-gray-800">የተመዘገቡ HR ባለሙያዎች ዝርዝር</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-right border-collapse">
                    <thead>
                      <tr className="bg-gray-50 text-gray-600 text-sm font-semibold border-b border-gray-100">
                        <th className="p-4">ስም</th>
                        <th className="p-4">ኢሜይል</th>
                        <th className="p-4">ድርጊቶች</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                      {hrs.map((hr) => (
                        <tr key={hr._id} className="hover:bg-gray-50/50">
                          <td className="p-4 font-medium">{hr.name}</td>
                          <td className="p-4 text-gray-500">{hr.email}</td>
                          <td className="p-4 flex items-center gap-2">
                            <button
                              onClick={() => handleResetHRPassword(hr._id)}
                              className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-700 rounded-lg text-xs font-medium transition-all"
                            >
                              ፓስወርድ ቀይር
                            </button>
                            <button
                              onClick={() => handleDeleteHR(hr._id)}
                              className="p-1.5 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-all"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {hrs.length === 0 && (
                        <tr>
                          <td colSpan="3" className="p-6 text-center text-gray-400">ምንም HR አልተመዘገበም</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* PROJECTS TAB */}
          {activeTab === "projects" && (
            <div className="space-y-8">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-4">አዲስ ፕሮጀክት መመዝገቢያ</h3>
                <form onSubmit={handleAddProject} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    placeholder="የፕሮጀክቱ ርዕስ"
                    value={projectForm.title}
                    onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                    required
                    className="px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <input
                    type="text"
                    placeholder="የፕሮጀክት ሊንክ (URL)"
                    value={projectForm.link}
                    onChange={(e) => setProjectForm({ ...projectForm, link: e.target.value })}
                    required
                    className="px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <input
                    type="text"
                    placeholder="የፎቶ ሊንክ (Image URL)"
                    value={projectForm.imageUrl}
                    onChange={(e) => setProjectForm({ ...projectForm, imageUrl: e.target.value })}
                    required
                    className="px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <div className="md:col-span-3">
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all text-sm shadow-md shadow-blue-600/20"
                    >
                      ፕሮጀክት መዝግብ
                    </button>
                  </div>
                </form>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-lg font-bold text-gray-800">የተመዘገቡ ፕሮጀክቶች</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
                  {projects.map((proj) => (
                    <div key={proj._id} className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm bg-gray-50 flex flex-col justify-between">
                      <div>
                        {proj.imageUrl && (
                          <img src={proj.imageUrl} alt={proj.title} className="w-full h-40 object-cover" />
                        )}
                        <div className="p-4">
                          <h4 className="font-bold text-gray-800 text-base mb-1">{proj.title}</h4>
                          <a href={proj.link} target="_blank" rel="noreferrer" className="text-blue-600 text-xs hover:underline truncate block">
                            {proj.link}
                          </a>
                        </div>
                      </div>
                      <div className="p-4 border-t border-gray-100 flex justify-end">
                        <button
                          onClick={() => handleDeleteProject(proj._id)}
                          className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg text-xs font-medium transition-all flex items-center gap-1"
                        >
                          <Trash2 size={14} /> አጥፋ
                        </button>
                      </div>
                    </div>
                  ))}
                  {projects.length === 0 && (
                    <p className="text-gray-400 col-span-3 text-center py-6">ምንም ፕሮጀክት የለም</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* MESSAGES TAB */}
          {activeTab === "messages" && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-800">የደንበኞች መልዕክቶች እና ትዕዛዞች</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {messages.map((msg) => (
                  <div key={msg._id} className="p-6 space-y-4 hover:bg-gray-50/50 transition-all">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-gray-800">{msg.name}</h4>
                        <p className="text-sm text-gray-500">{msg.email}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${msg.status === "ምላሽ ተሰጥቷል" ? "bg-green-100 text-green-600" : "bg-amber-100 text-amber-600"}`}>
                          {msg.status}
                        </span>
                        <button onClick={() => handleDeleteMessage(msg._id)} className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-all">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-xl text-sm text-gray-700">
                      <p className="font-medium text-gray-500 mb-1">የላከው መልዕክት፦</p>
                      <p>{msg.message}</p>
                    </div>

                    {msg.reply && (
                      <div className="bg-blue-50/50 p-4 rounded-xl text-sm text-blue-900 border border-blue-100">
                        <p className="font-medium text-blue-600 mb-1">የተሰጠ ምላሽ፦</p>
                        <p>{msg.reply}</p>
                      </div>
                    )}

                    <div className="flex items-center gap-3 pt-2">
                      <input
                        type="text"
                        placeholder="ምላሽ ይጻፉ..."
                        value={replyText[msg._id] || ""}
                        onChange={(e) => setReplyText({ ...replyText, [msg._id]: e.target.value })}
                        className="flex-1 px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                      <button
                        onClick={() => handleSendReply(msg._id)}
                        className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-all shadow-md shadow-blue-600/20 flex items-center gap-2"
                      >
                        <Send size={16} /> ላክ
                      </button>
                    </div>
                  </div>
                ))}
                {messages.length === 0 && (
                  <p className="p-6 text-center text-gray-400">ምንም መልዕክት የለም</p>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
