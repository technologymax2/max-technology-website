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
    <div className="admin-dashboard-container" style={{ width: "100%", maxWidth: "1200px", margin: "0 auto", padding: "10px", boxSizing: "border-box" }}>
      <div className="admin-header" style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "10px" }}>
        <h2>👑 ዋናውን መቆጣጠሪያ ማዕከል (Admin Panel)</h2>
        <button onClick={handleLogout} className="btn-logout">
          ውጣ (Logout)
        </button>
      </div>

      {/* ሪስፖንሲቭ የሆኑ ታቦች (ስክሪን ሲያንስ በራሳቸው እንዲሰለፉ) */}
      <div className="admin-tabs-nav" style={{ display: "flex", flexWrap: "wrap", gap: "8px", margin: "15px 0" }}>
        <button
          className={`tab-nav-btn ${activeTab === "messages" ? "active-tab" : ""}`}
          onClick={() => setActiveTab("messages")}
        >
          💬 መልዕክቶች
        </button>
        <button
          className={`tab-nav-btn ${activeTab === "projects" ? "active-tab" : ""}`}
          onClick={() => setActiveTab("projects")}
        >
          📁 ፕሮጀክቶች
        </button>
        <button
          className={`tab-nav-btn ${activeTab === "admins" ? "active-tab" : ""}`}
          onClick={() => setActiveTab("admins")}
        >
          👑 አድሚኖች
        </button>
        <button
          className={`tab-nav-btn ${activeTab === "hrs" ? "active-tab" : ""}`}
          onClick={() => setActiveTab("hrs")}
        >
          👥 የሰው ሃብት (HR)
        </button>
        <button
          className={`tab-nav-btn ${activeTab === "users" ? "active-tab" : ""}`}
          onClick={() => setActiveTab("users")}
        >
          👤 ደንበኞች
        </button>
      </div>

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

      {/* 2. መልዕክቶች (Telegram Split Mode - ለሞባይል የተስተካከለ) */}
      {activeTab === "messages" && (
        <>
          <h3 className="admin-section-heading">
            💬 የደንበኞች መልዕክት ዝርዝር (Telegram Split Mode)
          </h3>
          <div className="telegram-admin-layout" style={{ display: "flex", flexWrap: "wrap", gap: "15px" }}>
            <div className="telegram-sidebar" style={{ flex: "1 1 250px", minWidth: "250px" }}>
              <div className="sidebar-header">👥 ተጠቃሚዎች ({uniqueUsers.length})</div>
              <div className="sidebar-users-list">
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

            <div className="telegram-chat-window" style={{ flex: "2 1 400px", minWidth: "280px" }}>
              {selectedUserEmail ? (
                <>
                  <div className="chat-window-header">
                    💬 ከ <strong>{uniqueUsers.find((u) => u.email === selectedUserEmail)?.name}</strong> ጋር መልዕክቶች
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
                      padding: "15px",
                      background: "#161b22",
                      borderTop: "1px solid #30363d",
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "10px",
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
                        minWidth: "180px",
                        padding: "12px",
                        background: "#0d0f12",
                        color: "#fff",
                        border: "1px solid #30363d",
                        borderRadius: "10px",
                      }}
                    />
                    <button
                      onClick={handleSendAdminMessage}
                      className="btn-action"
                      style={{
                        background: "#ffd700",
                        color: "#0d0f12",
                        padding: "0 20px",
                        border: "none",
                        borderRadius: "10px",
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

      {/* 3. አድሚኖች አስተዳደር */}
      {activeTab === "admins" && (
        <div className="grid admin-grid-gap" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
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

          <div className="card admin-table-card" style={{ overflowX: "auto" }}>
            <h3>📋 ያሉ አድሚኖች ዝርዝር</h3>
            <table className="custom-table responsive-table" style={{ width: "100%", minWidth: "450px" }}>
              <thead>
                <tr>
                  <th>ስም</th>
                  <th>ኢሜይል</th>
                  <th>የሚስጥር ቃል ማስተካከያ</th>
                  <th>ድርጊት</th>
                </tr>
              </thead>
              <tbody>
                {adminList.map((adm) => (
                  <tr key={adm._id}>
                    <td data-label="ስም">
                      <strong>{adm.name}</strong>
                    </td>
                    <td data-label="ኢሜይል">{adm.email}</td>
                    <td data-label="የሚስጥር ቃል ማስተካከያ">
                      <div className="admin-inline-flex admin-wrap-fix">
                        <input
                          type="text"
                          placeholder="አዲስ የሚስጥር ቃል"
                          value={
                            passwordReset.id === adm._id
                              ? passwordReset.newPassword
                              : ""
                          }
                          onChange={(e) =>
                            setPasswordReset({
                              id: adm._id,
                              newPassword: e.target.value,
                            })
                          }
                          className="input-field admin-table-input"
                        />
                        <button
                          onClick={() => handleResetPassword(adm._id)}
                          className="btn-action btn-edit btn-padding-fix"
                        >
                          ቀይር
                        </button>
                      </div>
                    </td>
                    <td data-label="ድርጊት">
                      <div className="admin-inline-flex">
                        <button
                          onClick={() => {
                            setEditingAdmin(adm._id);
                            setEditForm({ name: adm.name, email: adm.email });
                          }}
                          className="btn-action btn-reply btn-padding-fix"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDeleteAdmin(adm._id)}
                          className="btn-action btn-delete btn-padding-fix"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. የሰው ሃብት (HR) አስተዳደር */}
      {activeTab === "hrs" && (
        <div className="grid admin-grid-gap" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
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

          <div className="card admin-table-card" style={{ overflowX: "auto" }}>
            <h3>📋 የተመዘገቡ HR ባለሙያዎች ዝርዝር</h3>
            <table className="custom-table responsive-table" style={{ width: "100%", minWidth: "450px" }}>
              <thead>
                <tr>
                  <th>ስም</th>
                  <th>ኢሜይል</th>
                  <th>ፓስወርድ መቀየሪያ</th>
                  <th>ድርጊት</th>
                </tr>
              </thead>
              <tbody>
                {hrList.map((hr) => (
                  <tr key={hr._id}>
                    <td data-label="ስም">
                      <strong>{hr.name}</strong>
                    </td>
                    <td data-label="ኢሜይል">{hr.email}</td>
                    <td data-label="ፓስወርድ መቀየሪያ">
                      <button
                        onClick={() => handleResetHRPassword(hr._id)}
                        className="btn-action btn-edit btn-padding-fix"
                      >
                        ፓስወርድ ቀይር
                      </button>
                    </td>
                    <td data-label="ድርጊት">
                      <button
                        onClick={() => handleDeleteHR(hr._id)}
                        className="btn-action btn-delete btn-padding-fix"
                      >
                        🗑️ አጥፋ
                      </button>
                    </td>
                  </tr>
                ))}
                {hrList.length === 0 && (
                  <tr>
                    <td colSpan="4" className="admin-empty-text">
                      ምንም HR ባለሙያ አልተመዘገበም
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. ደንበኞች */}
      {activeTab === "users" && (
        <div className="card admin-full-width-card" style={{ overflowX: "auto" }}>
          <h3>👤 የተመዘገቡ ተጠቃሚዎች እና ደንበኞች</h3>
          <table className="custom-table responsive-table" style={{ width: "100%", minWidth: "500px" }}>
            <thead>
              <tr>
                <th>ተጠቃሚ ስም</th>
                <th>ኢሜይል</th>
                <th>ሁኔታ (Status)</th>
                <th>ድርጊቶች</th>
              </tr>
            </thead>
            <tbody>
              {userList.map((u) => (
                <tr key={u._id} className={u.isBlocked ? "blocked-user-row" : ""}>
                  <td data-label="ተጠቃሚ ስም">
                    <strong>{u.name}</strong>
                  </td>
                  <td data-label="ኢሜይል">{u.email}</td>
                  <td data-label="ሁኔታ">
                    <span className={`status-badge ${u.isBlocked ? "badge-blocked" : "badge-active"}`}>
                      {u.isBlocked ? "🚫 ታግዷል" : "🟢 ንቁ"}
                    </span>
                  </td>
                  <td data-label="ድርጊቶች">
                    <div className="admin-inline-flex" style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                      <button
                        onClick={() => handleToggleBlockUser(u._id, u.isBlocked)}
                        className={`btn-action ${u.isBlocked ? "btn-unblock" : "btn-block-action"}`}
                        style={{ padding: "6px 12px", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}
                      >
                        {u.isBlocked ? "🔓 ክፈት" : "🚫 አግድ"}
                      </button>
                      <button
                        onClick={() => handleDeleteUser(u._id)}
                        className="btn-action btn-delete"
                        style={{ padding: "6px 12px", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}
                      >
                        🗑️ አጥፋ
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

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

export default AdminDashboard;
