import React, { useState, useEffect, useMemo } from "react";
import "./AdminDashboard.css";
import Footer from "./Footer";
import { uploadImageToImgBB } from "./imageUploading";

function AdminDashboard({ user, handleLogout, adminMessages, fetchMessages, newAdminForm, handleNewAdminChange, handleAddAdminSubmit, adminAddStatus, API_BASE_URL, handleDeleteMessage, projects, setProjects, }) {
  const [replyText, setReplyText] = useState({});
  const [adminList, setAdminList] = useState([]);
  const [userList, setUserList] = useState([]);
  const [hrList, setHrList] = useState([]); // የ HR ዝርዝር ማከማቻ

  // ንቁ ታብ (messages, admins, users, hrs, projects)
  const [activeTab, setActiveTab] = useState("messages");

  // አድሚን ማስተካከያ (Editing Admin)
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", email: "" });
  const [passwordReset, setPasswordReset] = useState({
    id: "",
    newPassword: "",
  });

  // የ HR መመዝገቢያ ፎርም ስቴት
  const [hrForm, setHrForm] = useState({ name: "", email: "", password: "" });

  // ቻት ስታይል ዩዘሮች (Telegram Style)
  const [selectedUserEmail, setSelectedUserEmail] = useState(null);

  // ፕሮጀክት መመዝገቢያ ስቴት
  const [projectForm, setProjectForm] = useState({
    title: "",
    link: "",
    imageUrl: "",
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchMessages();
    fetchAdmins();
    fetchUsers();
    fetchHrs(); // HRዎችን ማምጫ
    const interval = setInterval(() => {
      fetchMessages();
    }, 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [API_BASE_URL]);

  // Unique Users for Chat
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

  // አድሚኖችን ማምጫ
  const fetchAdmins = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/list`);
      const data = await res.json();
      if (data.success) setAdminList(data.admins);
    } catch (err) {
      console.error("አድሚኖችን ማምጣት አልተቻለም");
    }
  };

  // ተጠቃሚዎችን ማምጫ
  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users`);
      const data = await res.json();
      if (data.success) setUserList(data.users);
    } catch (err) {
      console.error("ተጠቃሚዎችን ማምጣት አልተቻለም");
    }
  };

  // HRዎችን ማምጫ (አዲስ የተጨመረ)
  const fetchHrs = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/hrs`);
      const data = await res.json();
      if (data.success) setHrList(data.hrs);
    } catch (err) {
      console.error("HR ማምጣት አልተቻለም");
    }
  };

  // መልዕክት መላኪያ
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
      alert("መልዕክቱን መላክ አልተቻለም። ድንገተኛ ስህተት አጋጥሟል");
    }
  };

  // ፎቶ መጫኛ
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

  // ፕሮጀክት መመዝገቢያ
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
        alert("ፖርትፎሊዮ/ፕሮጀክት በተሳካ ሁኔታ ተመዝግቧል!");
        setProjectForm({ title: "", link: "", imageUrl: "" });
      }
    } catch (err) {
      alert("ስህተት አጋጥሟል ወይምሰርቨር ጋር መገናኘት አልተቻለም");
    }
  };

  // HR መመዝገቢያ (አዲስ የተጨመረ)
  const handleAddHRCtl = async (e) => {
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

  // HR ማጥፊያ (አዲስ የተጨመረ)
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
      alert("HR ማጥፋት አልተቻለም");
    }
  };

  // የ HR ፓስወርድ መቀየሪያ (አዲስ የተጨመረ)
  const handleResetHRPassword = async (id) => {
    const newPassword = prompt("ለዚህ HR አዲስ ፓስወርድ ያስገቡ (ቢያንስ 6 ፊደላት):");
    if (!newPassword) return;
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/admin/hrs/reset-password/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ newPassword }),
        }
      );
      const data = await res.json();
      if (data.success) {
        alert("የ HR ፓስወርድ በስኬት ተለውጧል!");
      } else {
        alert(data.error || "ፓስወርድ መቀየር አልተቻለም");
      }
    } catch (err) {
      alert("የ HR ፓስወርድ መቀየር አልተቻለም");
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
        alert("አድሚኑ ፓስወርድ ሰክሰስፉሊ ተቀይሯል!");
        setPasswordReset({ id: "", newPassword: "" });
      }
    } catch (err) {
      alert("ፓስወርድ መቀየር አልተቻለም");
    }
  };

  const handleDeleteAdmin = async (id) => {
    if (!window.confirm("እርግጠኛ ነዎት አድሚኑን ከሰርቨር ላይ ማጥፋት ይፈልጋሉ?")) return;
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
    const actionText = isBlocked ? "ክፈት (Unblock)" : "አግድ (Block)";
    if (!window.confirm(`እርግጠኛ ነዎት ተጠቃሚውን ${actionText} ማድረግ ይፈልጋሉ?`)) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users/block/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isBlocked: !isBlocked }),
      });
      if (res.ok) {
        alert(`ተጠቃሚው በተሳካ ሁኔታ ${isBlocked ? "እንዲከፈት ተደርጓል" : "ታግዷል"}!`);
        fetchUsers();
      }
    } catch (err) {
      alert("ክዋኔው አልተሳካም");
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("እርግጠኛ ነዎት ተጠቃሚውን ሙሉ በሙሉ ማጥፋት ይፈልጋሉ?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users/delete/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        alert("ተጠቃሚው ሙሉ በሙሉ ተሰርዟል!");
        fetchUsers();
        fetchMessages();
      }
    } catch (err) {
      alert("ተጠቃሚውን ማጥፋት አልተቻለም");
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
    <div className="admin-dashboard-container"> <div className="admin-header"> <h2>👑 ዋናውን መቆጣጠሪያ ማዕከል (Admin Panel)</h2> <button onClick={handleLogout} className="btn-logout"> ውጣ (Logout) </button> </div> {/* የዳሽቦርድ ታቦች መምረጫ */} <div className="admin-tabs-nav"> <button className={`tab-nav-btn ${ activeTab === "messages" ? "active-tab" : "" }`} onClick={() => setActiveTab("messages")} > 💬 መልዕክቶች </button> <button className={`tab-nav-btn ${ activeTab === "projects" ? "active-tab" : "" }`} onClick={() => setActiveTab("projects")} > 📁 ፕሮጀክቶች </button> <button className={`tab-nav-btn ${ activeTab === "admins" ? "active-tab" : "" }`} onClick={() => setActiveTab("admins")} > 👑 አድሚኖች </button> <button className={`tab-nav-btn ${activeTab === "hrs" ? "active-tab" : ""}`} onClick={() => setActiveTab("hrs")} > 👥 የሰው ሃብት (HR) </button> <button className={`tab-nav-btn ${activeTab === "users" ? "active-tab" : ""}`} onClick={() => setActiveTab("users")} > 👤 ደንበኞች </button> </div> {/* 1. ፕሮጀክቶች */} {activeTab === "projects" && ( <div className="card"> <h3>📁 ፕሮጀክቶች ማስተዳደሪያ</h3> <div className="project-form-section" style={{ marginBottom: "30px", paddingBottom: "20px", borderBottom: "1px solid #333", }} > <input type="text" placeholder="የፕሮጀክት ስም" value={projectForm.title} onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value }) } className="input-field" /> <input type="url" placeholder="የፕሮጀክት ሊንክ" value={projectForm.link} onChange={(e) => setProjectForm({ ...projectForm, link: e.target.value }) } className="input-field" /> <input type="file" onChange={handleImageUpload} className="input-field" /> <button onClick={handleProjectSubmit} className="btn-action" disabled={uploading} > {uploading ? "በመጫን ላይ..." : "መዝግብ"} </button> </div> <h3>📋 ያሉ ፕሮጀክቶች</h3> <div className="admin-projects-list" style={{ display: "grid", gap: "15px" }} > {projects && projects.length > 0 ? ( projects.map((p) => ( <div key={p._id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px", background: "#161b22", borderRadius: "8px", border: "1px solid #30363d", }} > <div style={{ display: "flex", alignItems: "center", gap: "10px", }} > <img src={p.imageUrl} alt={p.title} style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "4px", }} /> <span>{p.title}</span> </div> <button onClick={() => handleDeleteProject(p._id)} style={{ background: "#ff4444", color: "white", border: "none", padding: "8px 15px", borderRadius: "5px", cursor: "pointer", }} > 🗑️ አጥፋ </button> </div> )) ) : ( <p>ምንም ፕሮጀክት የለም</p> )} </div> </div> )} {/* 2. መልዕክቶች (Telegram Split Mode) */} {activeTab === "messages" && ( <> <h3 className="admin-section-heading"> 💬 የደንበኞች መልዕክት ዝርዝር (Telegram Split Mode) </h3> <div className="telegram-admin-layout"> <div className="telegram-sidebar"> <div className="sidebar-header"> 👥 ተጠቃሚዎች ({uniqueUsers.length}) </div> <div className="sidebar-users-list"> {uniqueUsers.map((u) => ( <div key={u.email} className={`sidebar-user-item ${ selectedUserEmail === u.email ? "active-chat-user" : "" }`} onClick={() => setSelectedUserEmail(u.email)} > <span className="sidebar-avatar">👤</span> <div className="sidebar-user-details"> <h4>{u.name}</h4> <p>{u.email}</p> </div> </div> ))} {uniqueUsers.length === 0 && ( <p className="no-chats-text">ምንም ቻት የለም</p> )} </div> </div> <div className="telegram-chat-window"> {selectedUserEmail ? ( <> <div className="chat-window-header"> 💬 ከ{" "} <strong> { uniqueUsers.find((u) => u.email === selectedUserEmail) ?.name } </strong>{" "} ጋር መልዕክቶች </div> <div className="chat-window-body"> {filteredMessages.map((msg) => ( <div key={msg._id} className="admin-chat-block"> {!msg.message.startsWith("[አድሚን መልዕክት]") && ( <div className="admin-user-msg-bubble"> <p>{msg.message}</p> <span className="chat-block-time"> 🕒 {new Date(msg.date).toLocaleDateString()} </span> </div> )} {msg.reply && ( <div className="admin-reply-msg-bubble"> <span className="reply-label">አድሚን ምላሽ፦</span> <p>{msg.reply}</p> </div> )} <div className="admin-msg-delete-row"> <button onClick={() => handleDeleteMessage(msg._id)} className="admin-delete-msg-btn" > 🗑️ መልዕክቱን አጥፊ </button> </div> </div> ))} </div> <div className="admin-chat-footer-input" style={{ padding: "20px", background: "#161b22", borderTop: "1px solid #30363d", display: "flex", gap: "10px", }} > <input type="text" placeholder="መልዕክትዎ ይጻፉ... (ለመላክ Enter ይጫኑ)" value={replyText["global_admin_chat"] || ""} onChange={(e) => setReplyText({ ...replyText, global_admin_chat: e.target.value, }) } onKeyDown={(e) => { if (e.key === "Enter") handleSendAdminMessage(); }} className="input-field" style={{ flex: 1, padding: "14px", background: "#0d0f12", color: "#fff", border: "1px solid #30363d", borderRadius: "10px", }} /> <button onClick={handleSendAdminMessage} className="btn-action" style={{ background: "#ffd700", color: "#0d0f12", padding: "0 25px", border: "none", borderRadius: "10px", fontWeight: "bold", cursor: "pointer", }} > 📁 ላክ </button> </div> </> ) : ( <div className="select-chat-placeholder"> <p>እባክዎ ከဘራውዘር ዝርዝር ውስጥ ተጠቃሚ ይምረጡ</p> </div> )} </div> </div>
        </>
      )}

      {/* 3. አድሚኖች አስተዳደር */}
      {activeTab === "admins" && (
        <div className="grid admin-grid-gap"> <div className="card admin-form-card"> <h3>➕ አዲስ አድሚን ይፍጠሩ</h3> <form onSubmit={(e) => { handleAddAdminSubmit(e); setTimeout(fetchAdmins, 1000); }} className="form-group admin-form-top" > <input type="text" name="name" placeholder="የአድሚን ስም" value={newAdminForm.name} onChange={handleNewAdminChange} required className="input-field admin-input-bottom" /> <input type="text" name="email" placeholder="የአድሚን ኢሜይል" value={newAdminForm.email} onChange={handleNewAdminChange} required className="input-field admin-input-bottom" /> <input type="password" name="password" placeholder="የሚስጥር ቃል" value={newAdminForm.password} onChange={handleNewAdminChange} required className="input-field admin-input-large-bottom" /> <button type="submit" className="submit-btn"> አድሚኑን መዝግብ </button> </form> {adminAddStatus && <p className="status-msg">{adminAddStatus}</p>} </div> <div className="card admin-table-card"> <h3>📋 ያሉ አድሚኖች ዝርዝር</h3> <table className="custom-table responsive-table"> <thead> <tr> <th>ስም</th> <th>ኢሜይል</th> <th>የሚስጥር ቃል ማስተካከያ</th> <th>ድርጊት</th> </tr> </thead> <tbody> {adminList.map((adm) => ( <tr key={adm._id}> <td data-label="ስም"> <strong>{adm.name}</strong> </td> <td data-label="ኢሜይል">{adm.email}</td> <td data-label="የሚስጥር ቃል ማስተካከያ"> <div className="admin-inline-flex admin-wrap-fix"> <input type="text" placeholder="አዲስ የሚስጥር ቃል" value={ passwordReset.id === adm._id ? passwordReset.newPassword : "" } onChange={(e) => setPasswordReset({ id: adm._id, newPassword: e.target.value, }) } className="input-field admin-table-input" /> <button onClick={() => handleResetPassword(adm._id)} className="btn-action btn-edit btn-padding-fix" > ቀይር </button> </div> </td> <td data-label="ድርጊት"> <div className="admin-inline-flex"> <button onClick={() => { setEditingAdmin(adm._id); setEditForm({ name: adm.name, email: adm.email }); }} className="btn-action btn-reply btn-padding-fix" > ✏️ </button> <button onClick={() => handleDeleteAdmin(adm._id)} className="btn-action btn-delete btn-padding-fix" > 🗑️ </button> </div> </td> </tr> ))} </tbody> </table> </div> </div>
      )}

      {/* 4. የሰው ሃብት (HR) አስተዳደር (አዲስ የተጨመረ) */}
      {activeTab === "hrs" && (
        <div className="grid admin-grid-gap"> <div className="card admin-form-card"> <h3>👥 አዲስ HR ባለሙያ መመዝገቢያ</h3> <form onSubmit={handleAddHRCtl} className="form-group admin-form-top" > <input type="text" placeholder="የሰራተኛው ስም" value={hrForm.name} onChange={(e) => setHrForm({ ...hrForm, name: e.target.value })} required className="input-field admin-input-bottom" /> <input type="email" placeholder="ኢሜይል አድራሻ" value={hrForm.email} onChange={(e) => setHrForm({ ...hrForm, email: e.target.value }) } required className="input-field admin-input-bottom" /> <input type="password" placeholder="ፓስወርድ" value={hrForm.password} onChange={(e) => setHrForm({ ...hrForm, password: e.target.value }) } required className="input-field admin-input-large-bottom" /> <button type="submit" className="submit-btn"> HR መዝግብ </button> </form> </div> <div className="card admin-table-card"> <h3>📋 የተመዘገቡ HR ባለሙያዎች ዝርዝር</h3> <table className="custom-table responsive-table"> <thead> <tr> <th>ስም</th> <th>ኢሜይል</th> <th>ፓስወርድ መቀየሪያ</th> <th>ድርጊት</th> </tr> </thead> <tbody> {hrList.map((hr) => ( <tr key={hr._id}> <td data-label="ስም"> <strong>{hr.name}</strong> </td> <td data-label="ኢሜይል">{hr.email}</td> <td data-label="ፓስወርድ መቀየሪያ"> <button onClick={() => handleResetHRPassword(hr._id)} className="btn-action btn-edit btn-padding-fix" > ፓስወርድ ቀይር </button> </td> <td data-label="ድርጊት"> <button onClick={() => handleDeleteHR(hr._id)} className="btn-action btn-delete btn-padding-fix" > 🗑️ አጥፋ </button> </td> </tr> ))} {hrList.length === 0 && ( <tr> <td colSpan="4" className="admin-empty-text"> ምንም HR አልተመዘገበም </td> </tr> )} </tbody> </table> </div> </div>
      )}

      {/* 5. ደንበኞች / ተጠቃሚዎች አስተዳደር */}
      {activeTab === "users" && (
        <div className="card admin-full-width-card"> <h3>👤 የተመዘገቡ ተጠቃሚዎች እና ደንበኞች (ብሎክ እና ማጥፊያ ማዕከል)</h3> <table className="custom-table responsive-table"> <thead> <tr> <th>ተጠቃሚ ስም</th> <th>ኢሜይል</th> <th>ሁኔታ (Status)</th> <th>ድርጊቶች</th> </tr> </thead> <tbody> {userList.map((u) => ( <tr key={u._id} className={u.isBlocked ? "blocked-user-row" : ""} > <td data-label="ተጠቃሚ ስም"> <strong>{u.name}</strong> </td> <td data-label="ኢሜይል"> {u.email}{" "} {u.isChatOnly && ( <span style={{ fontSize: "11px", color: "#ffd700", background: "#222", padding: "2px 6px", borderRadius: "4px", marginLeft: "5px", }} > 💬 ቻት ብቻ </span> )} </td> <td data-label="ሁኔታ"> <span className={`status-badge ${ u.isBlocked ? "badge-blocked" : "badge-active" }`} > {u.isBlocked ? "🚫 ታግዷል" : "🟢 ንቁ (Active)"} </span> </td> <td data-label="ድርጊቶች"> <div className="admin-inline-flex"> <button onClick={() => handleToggleBlockUser(u._id, u.isBlocked) } className={`btn-action ${ u.isBlocked ? "btn-unblock" : "btn-block-action" }`} style={{ padding: "6px 14px", borderRadius: "6px", fontWeight: "bold", cursor: "pointer", }} > {u.isBlocked ? "🔓 ክፈት" : "🚫 አግድ"} </button> <button onClick={() => handleDeleteUser(u._id)} className="btn-action btn-delete" style={{ padding: "6px 14px", borderRadius: "6px", fontWeight: "bold", cursor: "pointer", }} > 🗑️ አጥፋ </button> </div> </td> </tr> ))} {userList.length === 0 && ( <tr> <td colSpan="4" className="admin-empty-text"> ምንም ተጠቃሚ አልተገኘም </td> </tr> )} </tbody> </table> </div>
      )}

      {/* አድሚን ማስተካከያ ሞዳል (Modal) */}
      {editingAdmin && (
        <div className="modal-overlay"> <div className="modal-content"> <h3>✏️ አድሚን ማስተካከያ</h3> <form onSubmit={handleUpdateAdmin} className="form-group admin-form-top" > <input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value }) } required className="input-field" /> <input type="text" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value }) } required className="input-field" /> <div className="admin-inline-flex admin-form-top"> <button type="submit" className="btn-action btn-reply btn-flex-one" > አስተካክል </button> <button type="button" onClick={() => setEditingAdmin(null)} className="btn-action btn-delete btn-flex-one" > ሰርዝ </button> </div> </form> </div> </div>
      )}

      <Footer />
    </div>
  );
}

export default AdminDashboard;
