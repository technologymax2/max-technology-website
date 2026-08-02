import React, { useState, useEffect, useMemo } from "react";
import Footer from "./Footer";
import { uploadImageToImgBB } from "./imageUploading";

function AdminDashboard({
  user,
  handleLogout,
  adminMessages,
  fetchMessages,
  newAdminForm,
  handleNewAdminChange,
  handleAddAdminSubmit,
  adminAddStatus,
  API_BASE_URL,
  handleDeleteMessage,
  projects,
  setProjects,
}) {
  const [replyText, setReplyText] = useState({});
  const [adminList, setAdminList] = useState([]);
  const [userList, setUserList] = useState([]);
  const [hrList, setHrList] = useState([]);
  const [salesList, setSalesList] = useState([]); // ለሽያጭ ሰራተኞች ዝርዝር

  // ንቁ ታብ
  const [activeTab, setActiveTab] = useState("messages");
  // ለሞባይል የሚሆን የጎን ምናሌ (Sidebar Menu) ክፍት/ዝግ መቆጣጠሪያ
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [editingAdmin, setEditingAdmin] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", email: "" });
  const [passwordReset, setPasswordReset] = useState({ id: "", newPassword: "" });

  // HR Form state
  const [hrForm, setHrForm] = useState({ name: "", email: "", password: "" });

  // የሽያጭ ሰራተኛ (Sales) Form state
  const [salesForm, setSalesForm] = useState({ name: "", email: "", password: "" });

  const [selectedUserEmail, setSelectedUserEmail] = useState(null);
  const [projectForm, setProjectForm] = useState({ title: "", link: "", imageUrl: "" });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchMessages();
    fetchAdmins();
    fetchUsers();
    fetchHrs();
    fetchSales(); // የሽያጭ ሰራተኞችን ለመጥራት
    const interval = setInterval(() => {
      fetchMessages();
    }, 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [API_BASE_URL]);

  const uniqueUsers = useMemo(() => {
    const users = [];
    const seenEmails = new Set();
    adminMessages.forEach((msg) => {
      if (!seenEmails.has(msg.email)) {
        seenEmails.add(msg.email);
        users.push({ name: msg.name, email: msg.email });
      }
    });
    return users;
  }, [adminMessages]);

  useEffect(() => {
    if (uniqueUsers.length > 0 && !selectedUserEmail) {
      setSelectedUserEmail(uniqueUsers[0].email);
    }
  }, [uniqueUsers, selectedUserEmail]);

  const filteredMessages = adminMessages.filter(
    (msg) => msg.email === selectedUserEmail
  );

  const fetchAdmins = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/list`);
      const data = await res.json();
      if (data.success) setAdminList(data.admins);
    } catch (err) {
      console.error("አድሚኖችን ማምጣት አልተቻለም");
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users`);
      const data = await res.json();
      if (data.success) setUserList(data.users);
    } catch (err) {
      console.error("ተጠቃሚዎችን ማምጣት አልተቻለም");
    }
  };

  const fetchHrs = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/hrs`);
      const data = await res.json();
      if (data.success) setHrList(data.hrs);
    } catch (err) {
      console.error("HR ማምጣት አልተቻለም");
    }
  };

  // የሽያጭ ሰራተኞችን ከባክኤንድ ማምጫ
  const fetchSales = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/sales`);
      const data = await res.json();
      if (data.success) setSalesList(data.sales);
    } catch (err) {
      console.error("የሽያጭ ሰራተኞችን ማምጣት አልተቻለም");
    }
  };

  const handleSendAdminMessage = async () => {
    const txt = replyText["global_admin_chat"];
    if (!txt || !txt.trim()) return alert("እባክዎ ትክክለኛ መልዕክት ይጻፉ!");
    const activeUser = uniqueUsers.find((u) => u.email === selectedUserEmail);
    if (!activeUser) return alert("እባክዎ ትክክለኛ ደንበኛ ይምረጡ!");
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/send-new-message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: activeUser.name,
          email: selectedUserEmail,
          message: txt,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setReplyText((prev) => ({ ...prev, global_admin_chat: "" }));
        fetchMessages();
      }
    } catch (err) {
      alert("መልዕክቱን መላክ አልተቻለም።");
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    try {
      const imageUrl = await uploadImageToImgBB(file, setUploading);
      setProjectForm((prev) => ({ ...prev, imageUrl: imageUrl }));
      alert("ፎቶው በስኬት ተጭኗል!");
    } catch (err) {
      alert("ፎቶ ማውረድ አልተቻለም፦ " + err.message);
    }
  };

  const handleProjectSubmit = async (e) => {
    e.preventDefault();
    if (!projectForm.imageUrl) return alert("እባክዎ ትክክለኛ ፎቶ ያስገቡ!");
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(projectForm),
      });
      if (res.ok) {
        alert("ፕሮጀክት በተሳካ ሁኔታ ተመዝግቧል!");
        setProjectForm({ title: "", link: "", imageUrl: "" });
      }
    } catch (err) {
      alert("ስህተት አጋጥሟል");
    }
  };

  const handleAddHRSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/hrs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(hrForm),
      });
      const data = await res.json();
      if (data.success) {
        alert("HR በስኬት ተመዝግቧል!");
        setHrForm({ name: "", email: "", password: "" });
        fetchHrs();
      } else {
        alert(data.error || "HR መመዝገብ አልተቻለም");
      }
    } catch (err) {
      alert("ስህተት ተፈጥሯል");
    }
  };

  const handleDeleteHR = async (id) => {
    if (!window.confirm("ይህንን HR ማጥፋት ይፈልጋሉ?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/hrs/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        alert("HR ተሰርዟል!");
        fetchHrs();
      }
    } catch (err) {
      alert("ማጥፋት አልተቻለም");
    }
  };

  const handleResetHRPassword = async (id) => {
    const newPassword = prompt("ለዚህ HR አዲስ ፓስወርድ ያስገቡ:");
    if (!newPassword) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/hrs/reset-password/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        alert("የ HR ፓስወርድ ተቀይሯል!");
      } else {
        alert(data.error || "ፓስወርድ መቀየር አልተቻለም");
      }
    } catch (err) {
      alert("ስህተት አጋጥሟል");
    }
  };

  // የሽያጭ ሰራተኛ መመዝገቢያ ማስረከቢያ
  const handleAddSalesSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/sales`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(salesForm),
      });
      const data = await res.json();
      if (data.success) {
        alert("የሽያጭ ሰራተኛው በስኬት ተመዝግቧል!");
        setSalesForm({ name: "", email: "", password: "" });
        fetchSales();
      } else {
        alert(data.error || "የሽያጭ ሰራተኛ መመዝገብ አልተቻለም");
      }
    } catch (err) {
      alert("ስህተት ተፈጥሯል");
    }
  };

  // የሽያጭ ሰራተኛን ማጥፊያ
  const handleDeleteSales = async (id) => {
    if (!window.confirm("ይህንን የሽያጭ ሰራተኛ ማጥፋት ይፈልጋሉ?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/sales/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        alert("የሽያጭ ሰራተኛው ተሰርዟል!");
        fetchSales();
      }
    } catch (err) {
      alert("ማጥፋት አልተቻለም");
    }
  };

  // የሽያጭ ሰራተኛ ፓስወርድ መቀየሪያ
  const handleResetSalesPassword = async (id) => {
    const newPassword = prompt("ለዚህ የሽያጭ ሰራተኛ አዲስ ፓስወርድ ያስገቡ:");
    if (!newPassword) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/sales/reset-password/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        alert("የሽያጭ ሰራተኛው ፓስወርድ ተቀይሯል!");
      } else {
        alert(data.error || "ፓስወርድ መቀየር አልተቻለም");
      }
    } catch (err) {
      alert("ስህተት አጋጥሟል");
    }
  };

  const handleUpdateAdmin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/admin/update/${editingAdmin}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editForm),
        }
      );
      if (res.ok) {
        alert("አድሚን መረጃ ተስተካክሏል!");
        setEditingAdmin(null);
        fetchAdmins();
      }
    } catch (err) {
      alert("ማስተካከሉ አልተሳካም");
    }
  };

  const handleResetPassword = async (id) => {
    if (!passwordReset.newPassword || passwordReset.id !== id)
      return alert("እባክዎ ትክክለኛ ፓስወርድ ይጻፉ!");
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/admin/reset-password/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ newPassword: passwordReset.newPassword }),
        }
      );
      if (res.ok) {
        alert("አድሚኑ ፓስወርድ ተቀይሯል!");
        setPasswordReset({ id: "", newPassword: "" });
      }
    } catch (err) {
      alert("ፓስወርድ መቀየር አልተቻለም");
    }
  };

  const handleDeleteAdmin = async (id) => {
    if (!window.confirm("እርግጠኛ ነዎት አድሚኑን ማጥፋት ይፈልጋሉ?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/delete/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        alert("አድሚኑ ተሰርዟል!");
        fetchAdmins();
      }
    } catch (err) {
      alert("ማጥፋት አልተቻለም");
    }
  };

  const handleToggleBlockUser = async (id, isBlocked) => {
    const actionText = isBlocked ? "ክፈት" : "አግድ";
    if (!window.confirm(`እርግጠኛ ነዎት ተጠቃሚውን ${actionText} ማድረግ ይፈልጋሉ?`))
      return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users/block/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isBlocked: !isBlocked }),
      });
      if (res.ok) {
        alert("ተጠቃሚው ተስተካክሏል!");
        fetchUsers();
      }
    } catch (err) {
      alert("ክዋኔው አልተሳካም");
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("እርግጠኛ ነዎት ተጠቃሚውን ማጥፋት ይፈልጋሉ?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users/delete/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        alert("ተጠቃሚው ተሰርዟል!");
        fetchUsers();
        fetchMessages();
      }
    } catch (err) {
      alert("ማጥፋት አልተቻለም");
    }
  };

  const handleDeleteProject = async (id) => {
    if (window.confirm("እርግጠኛ ነዎት ፖርትፎሊዮውን ማጥፋት ይፈልጋሉ?")) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/admin/projects/${id}`, {
          method: "DELETE",
        });
        if (res.ok) {
          alert("ፖርትፎሊዮው ተሰርዟል!");
          setProjects((prev) => prev.filter((p) => p._id !== id));
        }
      } catch (err) {
        alert("ማጥፋት አልተቻለም");
      }
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-2 sm:p-4 box-border relative text-white bg-[#0d0f12] min-h-screen">
      
      {/* 📱 ሄደር (ከሜኑ አዝራር ጋር) */}
      <div className="flex flex-wrap justify-between items-center gap-3 py-3 px-2 border-b border-[#30363d] mb-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="bg-yellow-400 text-gray-900 border-none p-2 px-3 rounded-md text-lg cursor-pointer font-bold hover:bg-yellow-500 transition"
            title="ምናሌ ክፈት"
          >
            ☰
          </button>
          <h2 className="text-lg sm:text-xl font-bold m-0 text-white">👑 ዋናው መቆጣጠሪያ</h2>
        </div>
        <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-md text-xs sm:text-sm font-semibold transition">
          ውጣ (Logout)
        </button>
      </div>

      {/* ዋናው አካባቢ ከሳይድባር ጋር */}
      <div className="flex relative gap-4">
        
        {/* የሞባይል ዳርክ ባክግራውንድ ማደብዘዣ (Backdrop) */}
        {sidebarOpen && (
          <div 
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 z-40 md:hidden"
          ></div>
        )}

        {/* 🗂️ የጎን ምናሌ (Sidebar Menu / Drawer) */}
        <div 
          className={`fixed md:relative top-0 left-0 h-full md:h-auto w-64 bg-[#161b22] border-r md:border border-[#30363d] rounded-none md:rounded-xl p-4 flex flex-col gap-2 z-50 transition-transform duration-300 ease-in-out ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }`}
        >
          <div className="flex justify-between items-center mb-2 md:hidden">
            <span className="text-sm font-bold text-gray-400">ምናሌዎች (Menu)</span>
            <button 
              onClick={() => setSidebarOpen(false)} 
              className="bg-transparent border-none text-white text-xl cursor-pointer"
            >
              ✕
            </button>
          </div>

          <button
            onClick={() => { setActiveTab("messages"); setSidebarOpen(false); }}
            className={`w-full text-left p-2.5 rounded-lg font-bold transition ${
              activeTab === "messages" ? "bg-yellow-400 text-black" : "text-white hover:bg-gray-800"
            }`}
          >
            💬 መልዕክቶች
          </button>
          <button
            onClick={() => { setActiveTab("projects"); setSidebarOpen(false); }}
            className={`w-full text-left p-2.5 rounded-lg font-bold transition ${
              activeTab === "projects" ? "bg-yellow-400 text-black" : "text-white hover:bg-gray-800"
            }`}
          >
            📁 ፕሮጀክቶች
          </button>
          <button
            onClick={() => { setActiveTab("admins"); setSidebarOpen(false); }}
            className={`w-full text-left p-2.5 rounded-lg font-bold transition ${
              activeTab === "admins" ? "bg-yellow-400 text-black" : "text-white hover:bg-gray-800"
            }`}
          >
            👑 አድሚኖች
          </button>
          <button
            onClick={() => { setActiveTab("hrs"); setSidebarOpen(false); }}
            className={`w-full text-left p-2.5 rounded-lg font-bold transition ${
              activeTab === "hrs" ? "bg-yellow-400 text-black" : "text-white hover:bg-gray-800"
            }`}
          >
            👥 የሰው ሃብት (HR)
          </button>
          {/* ለሽያጭ ሰራተኞች የሚሆን አዲስ የሜኑ አዝራር */}
          <button
            onClick={() => { setActiveTab("sales"); setSidebarOpen(false); }}
            className={`w-full text-left p-2.5 rounded-lg font-bold transition ${
              activeTab === "sales" ? "bg-yellow-400 text-black" : "text-white hover:bg-gray-800"
            }`}
          >
            🛒 የሽያጭ ሰራተኞች (Sales)
          </button>
          <button
            onClick={() => { setActiveTab("users"); setSidebarOpen(false); }}
            className={`w-full text-left p-2.5 rounded-lg font-bold transition ${
              activeTab === "users" ? "bg-yellow-400 text-black" : "text-white hover:bg-gray-800"
            }`}
          >
            👤 ደንበኞች
          </button>
        </div>

        {/* ዋናው የይዘት ማሳያ አካባቢ */}
        <div className="flex-1 min-w-0">

          {/* 1. ፕሮጀክቶች */}
          {activeTab === "projects" && (
            <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4 sm:p-6">
              <h3 className="text-base font-bold mb-4">📁 ፕሮጀክቶች ማስተዳደሪያ</h3>
              <div className="flex flex-col gap-3 mb-6 pb-6 border-b border-[#333]">
                <input
                  type="text"
                  placeholder="የፕሮጀክት ስም"
                  value={projectForm.title}
                  onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                  className="bg-[#0d0f12] border border-[#30363d] text-white p-2.5 rounded-lg outline-none focus:border-yellow-400"
                />
                <input
                  type="url"
                  placeholder="የፕሮጀክት ሊንክ"
                  value={projectForm.link}
                  onChange={(e) => setProjectForm({ ...projectForm, link: e.target.value })}
                  className="bg-[#0d0f12] border border-[#30363d] text-white p-2.5 rounded-lg outline-none focus:border-yellow-400"
                />
                <input type="file" onChange={handleImageUpload} className="bg-[#0d0f12] border border-[#30363d] text-white p-2 rounded-lg" />
                <button onClick={handleProjectSubmit} className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold p-2.5 rounded-lg transition" disabled={uploading}>
                  {uploading ? "በመጫን ላይ..." : "መዝግብ"}
                </button>
              </div>
              <h3 className="text-base font-bold mb-3">📋 ያሉ ፕሮጀክቶች</h3>
              <div className="grid gap-3">
                {projects && projects.length > 0 ? (
                  projects.map((p) => (
                    <div key={p._id} className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#0d0f12] rounded-lg border border-[#30363d]">
                      <div className="flex items-center gap-3">
                        <img src={p.imageUrl} alt={p.title} className="w-12 h-12 object-cover rounded" />
                        <span className="font-medium">{p.title}</span>
                      </div>
                      <button onClick={() => handleDeleteProject(p._id)} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-md text-sm transition">
                        🗑️ አጥፋ
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400">ምንም ፕሮጀክት የለም</p>
                )}
              </div>
            </div>
          )}

          {/* 2. መልዕክቶች */}
          {activeTab === "messages" && (
            <>
              <h3 className="text-sm font-bold mb-3">💬 የደንበኞች መልዕክት ዝርዝር</h3>
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="w-full lg:w-72 bg-[#161b22] border border-[#30363d] rounded-xl p-3">
                  <div className="text-xs font-bold text-gray-400 mb-2">👥 ተጠቃሚዎች ({uniqueUsers.length})</div>
                  <div className="max-h-64 overflow-y-auto flex flex-col gap-1">
                    {uniqueUsers.map((u) => (
                      <div
                        key={u.email}
                        className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition ${
                          selectedUserEmail === u.email ? "bg-yellow-400/20 border border-yellow-400" : "hover:bg-gray-800"
                        }`}
                        onClick={() => setSelectedUserEmail(u.email)}
                      >
                        <span>👤</span>
                        <div className="overflow-hidden">
                          <h4 className="text-sm font-semibold truncate">{u.name}</h4>
                          <p className="text-xs text-gray-400 truncate">{u.email}</p>
                        </div>
                      </div>
                    ))}
                    {uniqueUsers.length === 0 && <p className="text-xs text-gray-400">ምንም ቻት የለም</p>}
                  </div>
                </div>

                <div className="flex-1 bg-[#161b22] border border-[#30363d] rounded-xl flex flex-col min-h-[350px]">
                  {selectedUserEmail ? (
                    <>
                      <div className="p-3 border-b border-[#30363d] text-xs font-bold">
                        💬 ከ <strong className="text-yellow-400">{uniqueUsers.find((u) => u.email === selectedUserEmail)?.name}</strong> ጋር
                      </div>
                      <div className="flex-1 p-3 overflow-y-auto flex flex-col gap-3">
                        {filteredMessages.map((msg) => (
                          <div key={msg._id} className="flex flex-col gap-1">
                            {!msg.message.startsWith("[አድሚን መልዕክት]") && (
                              <div className="bg-[#21262d] p-3 rounded-lg max-w-[85%] self-start">
                                <p className="text-sm">{msg.message}</p>
                                <span className="text-[10px] text-gray-400 mt-1 block">🕒 {new Date(msg.date).toLocaleDateString()}</span>
                              </div>
                            )}
                            {msg.reply && (
                              <div className="bg-yellow-400/10 border border-yellow-400/30 p-3 rounded-lg max-w-[85%] self-end">
                                <span className="text-xs font-bold text-yellow-400 block mb-1">አድሚን ምላሽ፦</span>
                                <p className="text-sm">{msg.reply}</p>
                              </div>
                            )}
                            <button onClick={() => handleDeleteMessage(msg._id)} className="text-red-400 text-xs self-start hover:underline mt-1">
                              🗑️ መልዕክቱን አጥፊ
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="p-3 bg-[#161b22] border-t border-[#30363d] flex gap-2">
                        <input
                          type="text"
                          placeholder="መልዕክትዎ ይጻፉ..."
                          value={replyText["global_admin_chat"] || ""}
                          onChange={(e) => setReplyText({ ...replyText, global_admin_chat: e.target.value })}
                          onKeyDown={(e) => { if (e.key === "Enter") handleSendAdminMessage(); }}
                          className="flex-1 bg-[#0d0f12] border border-[#30363d] text-white p-2.5 rounded-lg outline-none focus:border-yellow-400 text-sm"
                        />
                        <button onClick={handleSendAdminMessage} className="bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-2 rounded-lg font-bold text-sm transition">
                          ላክ
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-center flex-1 text-gray-400 text-sm">
                      <p>እባክዎ ተጠቃሚ ይምረጡ</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* 3. አድሚኖች */}
          {activeTab === "admins" && (
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4">
                <h3 className="text-base font-bold mb-3">➕ አዲስ አድሚን ይፍጠሩ</h3>
                <form onSubmit={(e) => { handleAddAdminSubmit(e); setTimeout(fetchAdmins, 1000); }} className="flex flex-col gap-3">
                  <input type="text" name="name" placeholder="የአድሚን ስም" value={newAdminForm.name} onChange={handleNewAdminChange} required className="bg-[#0d0f12] border border-[#30363d] text-white p-2.5 rounded-lg outline-none focus:border-yellow-400" />
                  <input type="text" name="email" placeholder="የአድሚን ኢሜይል" value={newAdminForm.email} onChange={handleNewAdminChange} required className="bg-[#0d0f12] border border-[#30363d] text-white p-2.5 rounded-lg outline-none focus:border-yellow-400" />
                  <input type="password" name="password" placeholder="የሚስጥር ቃል" value={newAdminForm.password} onChange={handleNewAdminChange} required className="bg-[#0d0f12] border border-[#30363d] text-white p-2.5 rounded-lg outline-none focus:border-yellow-400" />
                  <button type="submit" className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold p-2.5 rounded-lg transition">አድሚኑን መዝግብ</button>
                </form>
                {adminAddStatus && <p className="text-sm text-yellow-400 mt-2">{adminAddStatus}</p>}
              </div>

              <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4">
                <h3 className="text-base font-bold mb-3">📋 ያሉ አድሚኖች ዝርዝር</h3>
                <div className="flex flex-col gap-3">
                  {adminList.map((adm) => (
                    <div key={adm._id} className="bg-[#0d0f12] border border-[#30363d] p-3 rounded-lg flex flex-col gap-2">
                      <div><strong>ስም:</strong> {adm.name}</div>
                      <div><strong>ኢሜይል:</strong> {adm.email}</div>
                      <div className="flex gap-2 mt-1">
                        <input type="text" placeholder="አዲስ ፓስወርድ" value={passwordReset.id === adm._id ? passwordReset.newPassword : ""} onChange={(e) => setPasswordReset({ id: adm._id, newPassword: e.target.value })} className="bg-[#161b22] border border-[#30363d] text-white p-1.5 rounded text-xs flex-1" />
                        <button onClick={() => handleResetPassword(adm._id)} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-xs">ቀይር</button>
                      </div>
                      <div className="flex justify-end gap-2 mt-2">
                        <button onClick={() => { setEditingAdmin(adm._id); setEditForm({ name: adm.name, email: adm.email }); }} className="bg-yellow-500/20 text-yellow-400 border border-yellow-400/30 px-3 py-1 rounded text-xs">✏️ አስተካክል</button>
                        <button onClick={() => handleDeleteAdmin(adm._id)} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs">🗑️ አጥፋ</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 4. HR */}
          {activeTab === "hrs" && (
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4">
                <h3 className="text-base font-bold mb-3">👥 አዲስ HR ባለሙያ መመዝገቢያ</h3>
                <form onSubmit={handleAddHRSubmit} className="flex flex-col gap-3">
                  <input type="text" placeholder="የሰራተኛው ስም" value={hrForm.name} onChange={(e) => setHrForm({ ...hrForm, name: e.target.value })} required className="bg-[#0d0f12] border border-[#30363d] text-white p-2.5 rounded-lg outline-none focus:border-yellow-400" />
                  <input type="email" placeholder="ኢሜይል አድራሻ" value={hrForm.email} onChange={(e) => setHrForm({ ...hrForm, email: e.target.value })} required className="bg-[#0d0f12] border border-[#30363d] text-white p-2.5 rounded-lg outline-none focus:border-yellow-400" />
                  <input type="password" placeholder="ፓስወርድ" value={hrForm.password} onChange={(e) => setHrForm({ ...hrForm, password: e.target.value })} required className="bg-[#0d0f12] border border-[#30363d] text-white p-2.5 rounded-lg outline-none focus:border-yellow-400" />
                  <button type="submit" className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold p-2.5 rounded-lg transition">HR መዝግብ</button>
                </form>
              </div>

              <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4">
                <h3 className="text-base font-bold mb-3">📋 የተመዘገቡ HR ባለሙያዎች ዝርዝር</h3>
                <div className="flex flex-col gap-3">
                  {hrList.map((hr) => (
                    <div key={hr._id} className="bg-[#0d0f12] border border-[#30363d] p-3 rounded-lg flex flex-col gap-2">
                      <div><strong>ስም:</strong> {hr.name}</div>
                      <div><strong>ኢሜይል:</strong> {hr.email}</div>
                      <div className="flex gap-2 mt-2">
                        <button onClick={() => handleResetHRPassword(hr._id)} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded text-xs">ፓስወርድ ቀይር</button>
                        <button onClick={() => handleDeleteHR(hr._id)} className="flex-1 bg-red-600 hover:bg-red-700 text-white p-2 rounded text-xs">🗑️ አጥፋ</button>
                      </div>
                    </div>
                  ))}
                  {hrList.length === 0 && <p className="text-gray-400 text-sm">ምንም HR ባለሙያ አልተመዘገበም</p>}
                </div>
              </div>
            </div>
          )}

          {/* 5. የሽያጭ ሰራተኞች (Sales) */}
          {activeTab === "sales" && (
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4">
                <h3 className="text-base font-bold mb-3">🛒 አዲስ የሽያጭ ሰራተኛ መመዝገቢያ</h3>
                <form onSubmit={handleAddSalesSubmit} className="flex flex-col gap-3">
                  <input type="text" placeholder="የሰራተኛው ስም" value={salesForm.name} onChange={(e) => setSalesForm({ ...salesForm, name: e.target.value })} required className="bg-[#0d0f12] border border-[#30363d] text-white p-2.5 rounded-lg outline-none focus:border-yellow-400" />
                  <input type="email" placeholder="ኢሜይል አድራሻ" value={salesForm.email} onChange={(e) => setSalesForm({ ...salesForm, email: e.target.value })} required className="bg-[#0d0f12] border border-[#30363d] text-white p-2.5 rounded-lg outline-none focus:border-yellow-400" />
                  <input type="password" placeholder="ፓስወርድ" value={salesForm.password} onChange={(e) => setSalesForm({ ...salesForm, password: e.target.value })} required className="bg-[#0d0f12] border border-[#30363d] text-white p-2.5 rounded-lg outline-none focus:border-yellow-400" />
                  <button type="submit" className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold p-2.5 rounded-lg transition">የሽያጭ ሰራተኛ መዝግብ</button>
                </form>
              </div>

              <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4">
                <h3 className="text-base font-bold mb-3">📋 የተመዘገቡ የሽያጭ ሰራተኞች ዝርዝር</h3>
                <div className="flex flex-col gap-3">
                  {salesList.map((s) => (
                    <div key={s._id} className="bg-[#0d0f12] border border-[#30363d] p-3 rounded-lg flex flex-col gap-2">
                      <div><strong>ስም:</strong> {s.name}</div>
                      <div><strong>ኢሜይል:</strong> {s.email}</div>
                      <div className="flex gap-2 mt-2">
                        <button onClick={() => handleResetSalesPassword(s._id)} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded text-xs">ፓስወርድ ቀይር</button>
                        <button onClick={() => handleDeleteSales(s._id)} className="flex-1 bg-red-600 hover:bg-red-700 text-white p-2 rounded text-xs">🗑️ አጥፋ</button>
                      </div>
                    </div>
                  ))}
                  {salesList.length === 0 && <p className="text-gray-400 text-sm">ምንም የሽያጭ ሰራተኛ አልተመዘገበም</p>}
                </div>
              </div>
            </div>
          )}

          {/* 6. ደንበኞች */}
          {activeTab === "users" && (
            <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4">
              <h3 className="text-base font-bold mb-3">👤 የተመዘገቡ ተጠቃሚዎች እና ደንበኞች</h3>
              <div className="flex flex-col gap-3">
                {userList.map((u) => (
                  <div key={u._id} className={`bg-[#0d0f12] border border-[#30363d] p-3 rounded-lg flex flex-col gap-2 ${u.isBlocked ? "opacity-60" : ""}`}>
                    <div><strong>ተጠቃሚ ስም:</strong> {u.name}</div>
                    <div><strong>ኢሜይል:</strong> {u.email}</div>
                    <div>
                      <strong>ሁኔታ:</strong>{" "}
                      <span className={`ml-2 px-2 py-0.5 rounded text-xs ${u.isBlocked ? "bg-red-500/20 text-red-400" : "bg-green-500/20 text-green-400"}`}>
                        {u.isBlocked ? "🚫 ታግዷል" : "🟢 ንቁ"}
                      </span>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <button onClick={() => handleToggleBlockUser(u._id, u.isBlocked)} className={`flex-1 p-2 rounded font-bold text-xs ${u.isBlocked ? "bg-green-600 hover:bg-green-700 text-white" : "bg-yellow-500 text-black hover:bg-yellow-600"}`}>
                        {u.isBlocked ? "🔓 ክፈት" : "🚫 አግድ"}
                      </button>
                      <button onClick={() => handleDeleteUser(u._id)} className="flex-1 bg-red-600 hover:bg-red-700 text-white p-2 rounded font-bold text-xs">
                        🗑️ አጥፋ
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {editingAdmin && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 w-full max-w-sm">
            <h3 className="text-base font-bold mb-4">✏️ አድሚን ማስተካከያ</h3>
            <form onSubmit={handleUpdateAdmin} className="flex flex-col gap-3">
              <input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} required className="bg-[#0d0f12] border border-[#30363d] text-white p-2.5 rounded-lg outline-none focus:border-yellow-400" />
              <input type="text" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} required className="bg-[#0d0f12] border border-[#30363d] text-white p-2.5 rounded-lg outline-none focus:border-yellow-400" />
              <div className="flex gap-2 mt-2">
                <button type="submit" className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black font-bold p-2 rounded-lg text-sm">አስተካክል</button>
                <button type="button" onClick={() => setEditingAdmin(null)} className="flex-1 bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg text-sm">ሰርዝ</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default AdminDashboard;
