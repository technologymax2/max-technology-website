import React, { useState, useEffect, useMemo } from "react";
import "./AdminDashboard.css";
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

  // ንቁ ታብ
  const [activeTab, setActiveTab] = useState("messages");
  // ለሞባይል የሚሆን የጎን ምናሌ (Sidebar Menu) ክፍት/ዝግ መቆጣጠሪያ
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [editingAdmin, setEditingAdmin] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", email: "" });
  const [passwordReset, setPasswordReset] = useState({ id: "", newPassword: "" });

  // HR Form state
  const [hrForm, setHrForm] = useState({ name: "", email: "", password: "" });

  const [selectedUserEmail, setSelectedUserEmail] = useState(null);
  const [projectForm, setProjectForm] = useState({ title: "", link: "", imageUrl: "" });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchMessages();
    fetchAdmins();
    fetchUsers();
    fetchHrs();
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
    <div className="admin-dashboard-container" style={{ width: "100%", maxWidth: "1200px", margin: "0 auto", padding: "10px", boxSizing: "border-box", position: "relative" }}>
      
      {/* 📱 የሞባይል ፔጅ አናት ሄደር (ከሜኑ አዝራር ጋር) */}
      <div className="admin-header" style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "10px", padding: "10px 0", borderBottom: "1px solid #30363d", marginBottom: "15px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ background: "#ffd700", color: "#0d0f12", border: "none", padding: "8px 12px", borderRadius: "6px", fontSize: "18px", cursor: "pointer", fontWeight: "bold" }}
            title="ምናሌ ክፈት"
          >
            ☰
          </button>
          <h2 style={{ fontSize: "17px", margin: 0, color: "#fff" }}>👑 ዋናው መቆጣጠሪያ</h2>
        </div>
        <button onClick={handleLogout} className="btn-logout" style={{ padding: "6px 12px", fontSize: "13px" }}>
          ውጣ (Logout)
        </button>
      </div>

      {/* 🗂️ የጎን ምናሌ (Collapsible Menu Sidebar / Drawer) ለሞባይል እና ዴስክቶፕ */}
      <div style={{ display: "flex", gap: "20px", position: "relative" }}>
        
        {/* የጎን ምናሌ ዝርዝር */}
        <div 
          className={`admin-sidebar-menu ${sidebarOpen ? "open" : ""}`}
          style={{
            width: "240px",
            background: "#161b22",
            border: "1px solid #30363d",
            borderRadius: "10px",
            padding: "15px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            height: "fit-content",
            boxSizing: "border-box",
            /* በስልክ ስክሪን ላይ እንደ ድሮወር (Drawer) እንዲሰራ */
            transition: "all 0.3s ease",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "5px" }}>
            <span style={{ fontSize: "14px", fontWeight: "bold", color: "#8b949e" }}>ምናሌዎች (Menu)</span>
            <button 
              onClick={() => setSidebarOpen(false)} 
              style={{ background: "transparent", border: "none", color: "#fff", fontSize: "16px", cursor: "pointer" }}
              className="mobile-close-sidebar"
            >
              ✕
            </button>
          </div>

          <button
            className={`tab-nav-btn ${activeTab === "messages" ? "active-tab" : ""}`}
            onClick={() => { setActiveTab("messages"); setSidebarOpen(false); }}
            style={{ width: "100%", textAlign: "left", padding: "10px", background: activeTab === "messages" ? "#ffd700" : "transparent", color: activeTab === "messages" ? "#000" : "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}
          >
            💬 መልዕክቶች
          </button>
          <button
            className={`tab-nav-btn ${activeTab === "projects" ? "active-tab" : ""}`}
            onClick={() => { setActiveTab("projects"); setSidebarOpen(false); }}
            style={{ width: "100%", textAlign: "left", padding: "10px", background: activeTab === "projects" ? "#ffd700" : "transparent", color: activeTab === "projects" ? "#000" : "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}
          >
            📁 ፕሮጀክቶች
          </button>
          <button
            className={`tab-nav-btn ${activeTab === "admins" ? "active-tab" : ""}`}
            onClick={() => { setActiveTab("admins"); setSidebarOpen(false); }}
            style={{ width: "100%", textAlign: "left", padding: "10px", background: activeTab === "admins" ? "#ffd700" : "transparent", color: activeTab === "admins" ? "#000" : "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}
          >
            👑 አድሚኖች
          </button>
          <button
            className={`tab-nav-btn ${activeTab === "hrs" ? "active-tab" : ""}`}
            onClick={() => { setActiveTab("hrs"); setSidebarOpen(false); }}
            style={{ width: "100%", textAlign: "left", padding: "10px", background: activeTab === "hrs" ? "#ffd700" : "transparent", color: activeTab === "hrs" ? "#000" : "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}
          >
            👥 የሰው ሃብት (HR)
          </button>
          <button
            className={`tab-nav-btn ${activeTab === "users" ? "active-tab" : ""}`}
            onClick={() => { setActiveTab("users"); setSidebarOpen(false); }}
            style={{ width: "100%", textAlign: "left", padding: "10px", background: activeTab === "users" ? "#ffd700" : "transparent", color: activeTab === "users" ? "#000" : "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}
          >
            👤 ደንበኞች
          </button>
        </div>

        {/* ዋናው የይዘት ማሳያ አካባቢ */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* 1. ፕሮጀክቶች */}
          {activeTab === "projects" && (
            <div className="card">
              <h3>📁 ፕሮጀክቶች ማስተዳደሪያ</h3>
              <div
                className="project-form-section"
                style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "30px", paddingBottom: "20px", borderBottom: "1px solid #333" }}
              >
                <input
                  type="text"
                  placeholder="የፕሮጀክት ስም"
                  value={projectForm.title}
                  onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                  className="input-field"
                />
                <input
                  type="url"
                  placeholder="የፕሮጀክት ሊንክ"
                  value={projectForm.link}
                  onChange={(e) => setProjectForm({ ...projectForm, link: e.target.value })}
                  className="input-field"
                />
                <input type="file" onChange={handleImageUpload} className="input-field" />
                <button onClick={handleProjectSubmit} className="btn-action" disabled={uploading}>
                  {uploading ? "በመጫን ላይ..." : "መዝግብ"}
                </button>
              </div>
              <h3>📋 ያሉ ፕሮጀክቶች</h3>
              <div className="admin-projects-list" style={{ display: "grid", gap: "15px" }}>
                {projects && projects.length > 0 ? (
                  projects.map((p) => (
                    <div
                      key={p._id}
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "10px",
                        padding: "10px",
                        background: "#161b22",
                        borderRadius: "8px",
                        border: "1px solid #30363d",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <img
                          src={p.imageUrl}
                          alt={p.title}
                          style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "4px" }}
                        />
                        <span>{p.title}</span>
                      </div>
                      <button
                        onClick={() => handleDeleteProject(p._id)}
                        style={{
                          background: "#ff4444",
                          color: "white",
                          border: "none",
                          padding: "8px 15px",
                          borderRadius: "5px",
                          cursor: "pointer",
                        }}
                      >
                        🗑️ አጥፋ
                      </button>
                    </div>
                  ))
                ) : (
                  <p>ምንም ፕሮጀክት የለም</p>
                )}
              </div>
            </div>
          )}

          {/* 2. መልዕክቶች (Telegram Split Mode) */}
          {activeTab === "messages" && (
            <>
              <h3 className="admin-section-heading" style={{ fontSize: "15px", marginBottom: "10px" }}>
                💬 የደንበኞች መልዕክት ዝርዝር
              </h3>
              <div className="telegram-admin-layout" style={{ display: "flex", flexWrap: "wrap", gap: "15px" }}>
                <div className="telegram-sidebar" style={{ flex: "1 1 220px", minWidth: "100%" }}>
                  <div className="sidebar-header" style={{ fontSize: "13px" }}>👥 ተጠቃሚዎች ({uniqueUsers.length})</div>
                  <div className="sidebar-users-list" style={{ maxHeight: "200px", overflowY: "auto" }}>
                    {uniqueUsers.map((u) => (
                      <div
                        key={u.email}
                        className={`sidebar-user-item ${
                          selectedUserEmail === u.email ? "active-chat-user" : ""
                        }`}
                        onClick={() => setSelectedUserEmail(u.email)}
                      >
                        <span className="sidebar-avatar">👤</span>
                        <div className="sidebar-user-details">
                          <h4>{u.name}</h4>
                          <p>{u.email}</p>
                        </div>
                      </div>
                    ))}
                    {uniqueUsers.length === 0 && (
                      <p className="no-chats-text">ምንም ቻት የለም</p>
                    )}
                  </div>
                </div>

                <div className="telegram-chat-window" style={{ flex: "2 1 100%", minWidth: "100%" }}>
                  {selectedUserEmail ? (
                    <>
                      <div className="chat-window-header" style={{ fontSize: "13px" }}>
                        💬 ከ <strong>{uniqueUsers.find((u) => u.email === selectedUserEmail)?.name}</strong> ጋር
                      </div>
                      <div className="chat-window-body">
                        {filteredMessages.map((msg) => (
                          <div key={msg._id} className="admin-chat-block">
                            {!msg.message.startsWith("[አድሚን መልዕክት]") && (
                              <div className="admin-user-msg-bubble">
                                <p>{msg.message}</p>
                                <span className="chat-block-time">
                                  🕒 {new Date(msg.date).toLocaleDateString()}
                                </span>
                              </div>
                            )}
                            {msg.reply && (
                              <div className="admin-reply-msg-bubble">
                                <span className="reply-label">አድሚን ምላሽ፦</span>
                                <p>{msg.reply}</p>
                              </div>
                            )}
                            <div className="admin-msg-delete-row">
                              <button
                                onClick={() => handleDeleteMessage(msg._id)}
                                className="admin-delete-msg-btn"
                              >
                                🗑️ መልዕክቱን አጥፊ
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div
                        className="admin-chat-footer-input"
                        style={{
                          padding: "10px",
                          background: "#161b22",
                          borderTop: "1px solid #30363d",
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "8px",
                        }}
                      >
                        <input
                          type="text"
                          placeholder="መልዕክትዎ ይጻፉ..."
                          value={replyText["global_admin_chat"] || ""}
                          onChange={(e) =>
                            setReplyText({ ...replyText, global_admin_chat: e.target.value })
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSendAdminMessage();
                          }}
                          className="input-field"
                          style={{
                            flex: 1,
                            minWidth: "140px",
                            padding: "10px",
                            background: "#0d0f12",
                            color: "#fff",
                            border: "1px solid #30363d",
                            borderRadius: "8px",
                          }}
                        />
                        <button
                          onClick={handleSendAdminMessage}
                          className="btn-action"
                          style={{
                            background: "#ffd700",
                            color: "#0d0f12",
                            padding: "0 15px",
                            border: "none",
                            borderRadius: "8px",
                            fontWeight: "bold",
                            cursor: "pointer",
                          }}
                        >
                          ላክ
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="select-chat-placeholder">
                      <p>እባክዎ ተጠቃሚ ይምረጡ</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* 3. አድሚኖች አስተዳደር (ለሞባይል በካርድ መልክ እንዲታይ የተስተካከለ) */}
          {activeTab === "admins" && (
            <div className="grid admin-grid-gap" style={{ display: "grid", gridTemplateColumns: "1fr", gap: "15px" }}>
              <div className="card admin-form-card">
                <h3>➕ አዲስ አድሚን ይፍጠሩ</h3>
                <form
                  onSubmit={(e) => {
                    handleAddAdminSubmit(e);
                    setTimeout(fetchAdmins, 1000);
                  }}
                  className="form-group admin-form-top"
                >
                  <input
                    type="text"
                    name="name"
                    placeholder="የአድሚን ስም"
                    value={newAdminForm.name}
                    onChange={handleNewAdminChange}
                    required
                    className="input-field admin-input-bottom"
                  />
                  <input
                    type="text"
                    name="email"
                    placeholder="የአድሚን ኢሜይል"
                    value={newAdminForm.email}
                    onChange={handleNewAdminChange}
                    required
                    className="input-field admin-input-bottom"
                  />
                  <input
                    type="password"
                    name="password"
                    placeholder="የሚስጥር ቃል"
                    value={newAdminForm.password}
                    onChange={handleNewAdminChange}
                    required
                    className="input-field admin-input-large-bottom"
                  />
                  <button type="submit" className="submit-btn" style={{ width: "100%" }}>
                    አድሚኑን መዝግብ
                  </button>
                </form>
                {adminAddStatus && <p className="status-msg">{adminAddStatus}</p>}
              </div>

              {/* ሠንጠረዡ በስልክ ስክሪን ላይ እንዳይጣበቅ በካርድ (Card Grid) መልክ እንዲወርድ ተደርጓል */}
              <div className="card admin-table-card">
                <h3>📋 ያሉ አድሚኖች ዝርዝር</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "10px" }}>
                  {adminList.map((adm) => (
                    <div key={adm._id} style={{ background: "#161b22", padding: "12px", borderRadius: "8px", border: "1px solid #30363d", display: "flex", flexDirection: "column", gap: "8px" }}>
                      <div><strong>ስም:</strong> {adm.name}</div>
                      <div><strong>ኢሜይል:</strong> {adm.email}</div>
                      <div>
                        <strong>ፓስወርድ መቀየሪያ:</strong>
                        <div style={{ display: "flex", gap: "5px", marginTop: "5px" }}>
                          <input
                            type="text"
                            placeholder="አዲስ ፓስወርድ"
                            value={passwordReset.id === adm._id ? passwordReset.newPassword : ""}
                            onChange={(e) => setPasswordReset({ id: adm._id, newPassword: e.target.value })}
                            className="input-field"
                            style={{ padding: "6px", fontSize: "12px" }}
                          />
                          <button onClick={() => handleResetPassword(adm._id)} className="btn-action btn-edit" style={{ padding: "6px 10px", fontSize: "12px" }}>
                            ቀይር
                          </button>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "5px", justifyContent: "flex-end", marginTop: "5px" }}>
                        <button onClick={() => { setEditingAdmin(adm._id); setEditForm({ name: adm.name, email: adm.email }); }} className="btn-action btn-reply" style={{ padding: "6px 10px" }}>
                          ✏️ አስተካክል
                        </button>
                        <button onClick={() => handleDeleteAdmin(adm._id)} className="btn-action btn-delete" style={{ padding: "6px 10px" }}>
                          🗑️ አጥፋ
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 4. የሰው ሃብት (HR) አስተዳደር */}
          {activeTab === "hrs" && (
            <div className="grid admin-grid-gap" style={{ display: "grid", gridTemplateColumns: "1fr", gap: "15px" }}>
              <div className="card admin-form-card">
                <h3>👥 አዲስ HR ባለሙያ መመዝገቢያ</h3>
                <form onSubmit={handleAddHRSubmit} className="form-group admin-form-top">
                  <input
                    type="text"
                    placeholder="የሰራተኛው ስም"
                    value={hrForm.name}
                    onChange={(e) => setHrForm({ ...hrForm, name: e.target.value })}
                    required
                    className="input-field admin-input-bottom"
                  />
                  <input
                    type="email"
                    placeholder="ኢሜይል አድራሻ"
                    value={hrForm.email}
                    onChange={(e) => setHrForm({ ...hrForm, email: e.target.value })}
                    required
                    className="input-field admin-input-bottom"
                  />
                  <input
                    type="password"
                    placeholder="ፓስወርድ"
                    value={hrForm.password}
                    onChange={(e) => setHrForm({ ...hrForm, password: e.target.value })}
                    required
                    className="input-field admin-input-large-bottom"
                  />
                  <button type="submit" className="submit-btn" style={{ width: "100%" }}>
                    HR መዝግብ
                  </button>
                </form>
              </div>

              <div className="card admin-table-card">
                <h3>📋 የተመዘገቡ HR ባለሙያዎች ዝርዝር</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "10px" }}>
                  {hrList.map((hr) => (
                    <div key={hr._id} style={{ background: "#161b22", padding: "12px", borderRadius: "8px", border: "1px solid #30363d", display: "flex", flexDirection: "column", gap: "8px" }}>
                      <div><strong>ስም:</strong> {hr.name}</div>
                      <div><strong>ኢሜይል:</strong> {hr.email}</div>
                      <div style={{ display: "flex", gap: "8px", marginTop: "5px" }}>
                        <button onClick={() => handleResetHRPassword(hr._id)} className="btn-action btn-edit" style={{ flex: 1, padding: "8px", fontSize: "12px" }}>
                          ፓስወርድ ቀይር
                        </button>
                        <button onClick={() => handleDeleteHR(hr._id)} className="btn-action btn-delete" style={{ flex: 1, padding: "8px", fontSize: "12px" }}>
                          🗑️ አጥፋ
                        </button>
                      </div>
                    </div>
                  ))}
                  {hrList.length === 0 && <p className="admin-empty-text">ምንም HR ባለሙያ አልተመዘገበም</p>}
                </div>
              </div>
            </div>
          )}

          {/* 5. ደንበኞች */}
          {activeTab === "users" && (
            <div className="card admin-full-width-card">
              <h3>👤 የተመዘገቡ ተጠቃሚዎች እና ደንበኞች</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "10px" }}>
                {userList.map((u) => (
                  <div key={u._id} className={u.isBlocked ? "blocked-user-row" : ""} style={{ background: "#161b22", padding: "12px", borderRadius: "8px", border: "1px solid #30363d", display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div><strong>ተጠቃሚ ስም:</strong> {u.name}</div>
                    <div><strong>ኢሜይል:</strong> {u.email}</div>
                    <div>
                      <strong>ሁኔታ:</strong>{" "}
                      <span className={`status-badge ${u.isBlocked ? "badge-blocked" : "badge-active"}`} style={{ marginLeft: "5px", padding: "2px 6px", borderRadius: "4px", fontSize: "12px" }}>
                        {u.isBlocked ? "🚫 ታግዷል" : "🟢 ንቁ"}
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: "8px", marginTop: "5px" }}>
                      <button
                        onClick={() => handleToggleBlockUser(u._id, u.isBlocked)}
                        className={`btn-action ${u.isBlocked ? "btn-unblock" : "btn-block-action"}`}
                        style={{ flex: 1, padding: "8px", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}
                      >
                        {u.isBlocked ? "🔓 ክፈት" : "🚫 አግድ"}
                      </button>
                      <button
                        onClick={() => handleDeleteUser(u._id)}
                        className="btn-action btn-delete"
                        style={{ flex: 1, padding: "8px", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}
                      >
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
        <div className="modal-overlay">
          <div className="modal-content" style={{ width: "90%", maxWidth: "400px" }}>
            <h3>✏️ አድሚን ማስተካከያ</h3>
            <form onSubmit={handleUpdateAdmin} className="form-group admin-form-top" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                required
                className="input-field"
              />
              <input
                type="text"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                required
                className="input-field"
              />
              <div className="admin-inline-flex admin-form-top" style={{ display: "flex", gap: "10px" }}>
                <button type="submit" className="btn-action btn-reply btn-flex-one" style={{ flex: 1 }}>
                  አስተካክል
                </button>
                <button
                  type="button"
                  onClick={() => setEditingAdmin(null)}
                  className="btn-action btn-delete btn-flex-one"
                  style={{ flex: 1 }}
                >
                  ሰርዝ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

In AdminDashboard;
