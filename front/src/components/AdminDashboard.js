import React, { useState, useEffect, useMemo } from 'react';
import Footer from './Footer';
import { uploadImageToImgBB } from './imageUploading';

function AdminDashboard({ user, handleLogout, adminMessages, fetchMessages, newAdminForm, handleNewAdminChange, handleAddAdminSubmit, adminAddStatus, API_BASE_URL, handleDeleteMessage, projects, setProjects }) {
  const [replyText, setReplyText] = useState({});
  const [adminList, setAdminList] = useState([]);
  const [userList, setUserList] = useState([]); 
  const [employeeList, setEmployeeList] = useState([]); // 🏢 የሰራተኞች ዝርዝር
  const [activeTab, setActiveTab] = useState('messages');

  const [editingAdmin, setEditingAdmin] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', email: '' });
  const [passwordReset, setPasswordReset] = useState({ id: '', newPassword: '' });

  const [selectedUserEmail, setSelectedUserEmail] = useState(null);
  const [projectForm, setProjectForm] = useState({ title: '', link: '', imageUrl: '' });
  
  // 🏢 አዲስ ሰራተኛ መመዝገቢያ ፎርም ስቴት
  const [employeeForm, setEmployeeForm] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    department: '',
    idNumber: '',
    photoUrl: '',
    password: ''
  });
  const [employeeStatus, setEmployeeStatus] = useState('');
  const [selectedIdCard, setSelectedIdCard] = useState(null); // ለዲጂታል መታወቂያ መመልከቻ
  const [uploading, setUploading] = useState(false);
  const [empUploading, setEmpUploading] = useState(false);

  useEffect(() => {
    fetchMessages();
    fetchAdmins();
    fetchUsers();
    fetchEmployees();
    const interval = setInterval(() => { fetchMessages(); }, 5000); 
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [API_BASE_URL]);

  const uniqueUsers = useMemo(() => {
    const users = [];
    const seenEmails = new Set();
    adminMessages.forEach(msg => {
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

  const filteredMessages = adminMessages.filter(msg => msg.email === selectedUserEmail);

  const fetchAdmins = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/list`);
      const data = await res.json();
      if (data.success) setAdminList(data.admins);
    } catch (err) {
      console.error('የአድሚኖችን ዝርዝር ማምጣት አልተቻለም');
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users`);
      const data = await res.json();
      if (data.success) setUserList(data.users);
    } catch (err) {
      console.error('የተጠቃሚዎችን ዝርዝር ማምጣት አልተቻለም');
    }
  };

  // 🏢 ሰራተኞችን ከባክኤንድ ማምጫ
  const fetchEmployees = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/hr/employees`);
      const data = await res.json();
      if (data.success) {
        setEmployeeList(data.employees);
      }
    } catch (err) {
      console.error('ሰራተኞችን ማምጣት አልተቻለም', err);
    }
  };

  const handleSendAdminMessage = async () => {
    const txt = replyText['global_admin_chat'];
    if (!txt || !txt.trim()) return alert('እባክዎ መጀመሪያ መልዕክት ይጻፉ!');

    const activeUser = uniqueUsers.find(u => u.email === selectedUserEmail);
    if (!activeUser) return alert('እባክዎ መጀመሪያ ደንበኛ ይምረጡ!');

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/send-new-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: activeUser.name, 
          email: selectedUserEmail, 
          message: txt 
        })
      });
      const data = await res.json();
      if (data.success) {
        setReplyText(prev => ({ ...prev, 'global_admin_chat': '' }));
        fetchMessages();
      }
    } catch (err) {
      alert('መልዕክቱን መላክ አልተቻለም፡ የባክኤንድ ስህተት');
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const imageUrl = await uploadImageToImgBB(file, setUploading);
      setProjectForm(prev => ({ ...prev, imageUrl: imageUrl }));
      alert('📸 ምስሉ በስኬት ተጭኗል!');
    } catch (err) {
      alert('ምስል መጫን አልተቻለም፡ ' + err.message);
    }
  };

  // 🏢 የሰራተኛ ፎቶ መጫኛ
  const handleEmployeePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const imageUrl = await uploadImageToImgBB(file, setEmpUploading);
      setEmployeeForm(prev => ({ ...prev, photoUrl: imageUrl }));
      alert('📸 የሰራተኛው ፎቶ በስኬት ተጭኗል!');
    } catch (err) {
      alert('ፎቶ መጫን አልተቻለም፡ ' + err.message);
    }
  };

  // 🏢 አዲስ ሰራተኛ መመዝገቢያ (Role: employee)
  const handleEmployeeSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/api/hr/employees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(employeeForm)
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setEmployeeStatus('✅ ሰራተኛው በስኬት ተመዝግቧል (Digital ID ተዘጋጅቷል)!');
        setEmployeeForm({
          name: '',
          email: '',
          phone: '',
          position: '',
          department: '',
          idNumber: '',
          photoUrl: '',
          password: ''
        });
        fetchEmployees();
      } else {
        setEmployeeStatus(data.error || 'ስህተት ተፈጥሯል');
      }
    } catch (err) {
      setEmployeeStatus('የሰርቨር ስህተት!');
    }
  };

  // 🏢 ሰራተኛን መሰረዣ
  const handleDeleteEmployee = async (id) => {
    if (!window.confirm('ይህንን ሰራተኛ ከዝርዝር ውስጥ ማጥፋት ይፈልጋሉ?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/hr/employees/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        alert('ሰራተኛው ተሰርዟል!');
        fetchEmployees();
      }
    } catch (err) {
      alert('ማጥፋት አልተቻለም');
    }
  };

  const handleProjectSubmit = async (e) => {
    e.preventDefault();
    if (!projectForm.imageUrl) return alert('እባክዎ መጀመሪያ ምስል ይምረጡ!');
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectForm)
      });
      
      if (res.ok) {
        alert('🎯 ፕሮጀክቱ/ምስሉ ተመዝግቧል እና ለሁሉም ሰው ይታያል!');
        setProjectForm({ title: '', link: '', imageUrl: '' });
      }
    } catch (err) { 
      alert('ስህተት ተፈጥሯል፡ ወደ ዳታቤዝ መላክ አልተቻለም'); 
    }
  };

  const handleUpdateAdmin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/update/${editingAdmin}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });
      if (res.ok) {
        alert('የአድሚን መረጃ ተስተካክሏል!');
        setEditingAdmin(null);
        fetchAdmins();
      }
    } catch (err) {
      alert('ማስተካከል አልተሳካም');
    }
  };

  const handleResetPassword = async (id) => {
    if (!passwordReset.newPassword || passwordReset.id !== id) return alert('እባክዎ መጀመሪያ አዲስ ፓስወርድ ይጻፉ!');
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/reset-password/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword: passwordReset.newPassword })
      });
      if (res.ok) {
        alert('የአድሚኑ ፓስወርድ በተሳካ ሁኔታ ተቀይሯል!');
        setPasswordReset({ id: '', newPassword: '' });
      }
    } catch (err) {
      alert('ፓስወርድ መቀየር አልተቻለም');
    }
  };

  const handleDeleteAdmin = async (id) => {
    if (!window.confirm("ይህንን ረዳት አድሚን በእርግጥ ማጥፋት ይፈልጋሉ?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/delete/${id}`, { method: 'DELETE' });
      if (res.ok) {
        alert('አድሚኑ ተሰርዟል!');
        fetchAdmins();
      }
    } catch (err) {
      alert('ማጥፋት አልተሳካም');
    }
  };

  const handleToggleBlockUser = async (id, isBlocked) => {
    const actionText = isBlocked ? "ከእገዳ ማንሳት" : "ማገድ (Block)";
    if (!window.confirm(`ይህንን ተጠቃሚ በእርግጥ ${actionText} ይፈልጋሉ?`)) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users/block/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isBlocked: !isBlocked })
      });
      if (res.ok) {
        alert(`ተጠቃሚው በተሳካ ሁኔታ ${isBlocked ? 'ከእገዳ ተነስቷል' : 'ታግዷል'}!`);
        fetchUsers();
      }
    } catch (err) {
      alert('የብሎክ እርምጃው አልተሳካም');
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("ይህንን ተጠቃሚ አካውንት ሙሉ በሙሉ ማጥፋት ይፈልጋሉ? ይህ ድርጊት አይመለስም!")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users/delete/${id}`, { method: 'DELETE' });
      if (res.ok) {
        alert('ተጠቃሚው ሙሉ በሙሉ ተሰርዟል!');
        fetchUsers();
        fetchMessages();
      }
    } catch (err) {
      alert('ተጠቃሚውን ማጥፋት አልተቻለም');
    }
  };

  const handleDeleteProject = async (id) => {
    if (window.confirm('ይህንን ፕሮጀክት በእርግጥ ማጥፋት ይፈልጋሉ?')) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/admin/projects/${id}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          alert('ፕሮጀክቱ ተሰርዟል!');
          setProjects(prev => prev.filter(p => p._id !== id)); 
        }
      } catch (err) {
        alert('ማጥፋት አልተቻለም');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-gray-800 p-5 rounded-2xl shadow-md gap-4 mb-6">
        <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
          👑 የባለሙያ መቆጣጠሪያ ሰሌዳ (Admin Panel)
        </h2>
        <button 
          onClick={handleLogout} 
          className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition shadow"
        >
          ውጣ (Logout)
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap gap-2 mb-6 bg-gray-800 p-2 rounded-xl shadow">
        {[
          { id: 'messages', label: '💬 መልዕክቶች' },
          { id: 'projects', label: '🚀 ፖርትፎሊዮ' },
          { id: 'employees', label: '🏢 ሰራተኞች & ID' },
          { id: 'admins', label: '👥 አድሚኖች' },
          { id: 'users', label: '👤 ደንበኞች' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 min-w-[120px] py-3 px-4 rounded-lg font-medium transition text-sm sm:text-base ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-gray-400 hover:bg-gray-700 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Portfolio / Projects */}
      {activeTab === 'projects' && (
        <div className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700">
          <h3 className="text-xl font-bold mb-6 text-blue-400">🚀 ፖርትፎሊዮ ማስተዳደሪያ</h3>
          
          <div className="flex flex-col md:flex-row gap-4 mb-8 pb-6 border-b border-gray-700">
            <input 
              type="text" 
              placeholder="የፕሮጀክቱ ስም" 
              value={projectForm.title} 
              onChange={(e) => setProjectForm({...projectForm, title: e.target.value})} 
              className="flex-1 p-3.5 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-blue-500" 
            />
            <input 
              type="url" 
              placeholder="የፕሮጀክቱ ሊንክ" 
              value={projectForm.link} 
              onChange={(e) => setProjectForm({...projectForm, link: e.target.value})} 
              className="flex-1 p-3.5 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-blue-500" 
            />
            <input 
              type="file" 
              onChange={handleImageUpload} 
              className="flex-1 p-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer" 
            />
            <button 
              onClick={handleProjectSubmit} 
              disabled={uploading}
              className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition disabled:opacity-50"
            >
              {uploading ? 'በመጫን ላይ...' : 'መዝግብ'}
            </button>
          </div>

          <h3 className="text-lg font-bold mb-4">📋 ያሉ ፕሮጀክቶች</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects && projects.length > 0 ? (
              projects.map((p) => (
                <div key={p._id} className="flex items-center justify-between p-4 bg-gray-900 rounded-xl border border-gray-700 gap-4">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <img src={p.imageUrl} alt={p.title} className="w-14 h-14 object-cover rounded-lg shrink-0" />
                    <span className="font-medium truncate">{p.title}</span>
                  </div>
                  <button 
                    onClick={() => handleDeleteProject(p._id)} 
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition shrink-0"
                  >
                    🗑 አጥፋ
                  </button>
                </div>
              ))
            ) : (
              <p className="text-gray-400">ምንም ፕሮጀክት የለም።</p>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: HR / Employees Management */}
      {activeTab === 'employees' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Registration Form */}
          <div className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700 h-fit">
            <h3 className="text-xl font-bold mb-4 text-blue-400">➕ አዲስ ሰራተኛ መመዝገቢያ (Employee)</h3>
            <form onSubmit={handleEmployeeSubmit} className="flex flex-col gap-4">
              <input 
                type="text" 
                placeholder="ሙሉ ስም" 
                value={employeeForm.name} 
                onChange={(e) => setEmployeeForm({ ...employeeForm, name: e.target.value })} 
                required 
                className="p-3.5 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-blue-500" 
              />
              <input 
                type="email" 
                placeholder="ኢሜይል አድራሻ (Username)" 
                value={employeeForm.email} 
                onChange={(e) => setEmployeeForm({ ...employeeForm, email: e.target.value })} 
                required 
                className="p-3.5 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-blue-500" 
              />
              <input 
                type="password" 
                placeholder="የምስጢር ቃል (Password)" 
                value={employeeForm.password} 
                onChange={(e) => setEmployeeForm({ ...employeeForm, password: e.target.value })} 
                required 
                className="p-3.5 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-blue-500" 
              />
              <input 
                type="text" 
                placeholder="ስልክ ቁጥር" 
                value={employeeForm.phone} 
                onChange={(e) => setEmployeeForm({ ...employeeForm, phone: e.target.value })} 
                required 
                className="p-3.5 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-blue-500" 
              />
              <input 
                type="text" 
                placeholder="የስራ መደብ (Position, e.g. Developer)" 
                value={employeeForm.position} 
                onChange={(e) => setEmployeeForm({ ...employeeForm, position: e.target.value })} 
                required 
                className="p-3.5 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-blue-500" 
              />
              <input 
                type="text" 
                placeholder="ክፍል (Department, e.g. IT)" 
                value={employeeForm.department} 
                onChange={(e) => setEmployeeForm({ ...employeeForm, department: e.target.value })} 
                required 
                className="p-3.5 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-blue-500" 
              />
              <input 
                type="text" 
                placeholder="መታወቂያ ቁጥር (ID Number, e.g. MAX-001)" 
                value={employeeForm.idNumber} 
                onChange={(e) => setEmployeeForm({ ...employeeForm, idNumber: e.target.value })} 
                required 
                className="p-3.5 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-blue-500" 
              />
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-400">የሰራተኛ ፎቶ ይጫኑ (ወይም ሊንክ ያስገቡ)</label>
                <input 
                  type="file" 
                  onChange={handleEmployeePhotoUpload} 
                  className="p-2 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white cursor-pointer" 
                />
              </div>
              <button 
                type="submit" 
                disabled={empUploading}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition shadow disabled:opacity-50"
              >
                {empUploading ? 'ፎቶ በመጫን ላይ...' : 'ሰራተኛውን መዝግብ (Role: Employee)'}
              </button>
            </form>
            {employeeStatus && <p className="mt-4 text-center font-medium text-green-400 text-sm">{employeeStatus}</p>}
          </div>

          {/* Employees List Table */}
          <div className="lg:col-span-2 bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700 overflow-x-auto">
            <h3 className="text-xl font-bold mb-4 text-blue-400">📋 የተመዘገቡ ሰራተኞች ዝርዝር እና ዲጂታል መታወቂያ</h3>
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-gray-700 text-gray-400 text-sm">
                  <th className="p-3">ስም</th>
                  <th className="p-3">የስራ መደብ</th>
                  <th className="p-3">መታወቂያ ቁጥር</th>
                  <th className="p-3">እርምጃዎች</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {employeeList.map((emp) => (
                  <tr key={emp._id} className="hover:bg-gray-700/30">
                    <td className="p-3 font-semibold flex items-center gap-3">
                      <img 
                        src={emp.photoUrl || 'https://via.placeholder.com/40'} 
                        alt={emp.name} 
                        className="w-10 h-10 rounded-full object-cover border border-blue-500" 
                      />
                      {emp.name}
                    </td>
                    <td className="p-3 text-gray-300">{emp.position}</td>
                    <td className="p-3 text-blue-300 font-mono">{emp.idNumber}</td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setSelectedIdCard(emp)} 
                          className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition"
                        >
                          🪪 ዲጂታል መታወቂያ
                        </button>
                        <button 
                          onClick={() => handleDeleteEmployee(emp._id)} 
                          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition"
                        >
                          🗑 አጥፋ
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {employeeList.length === 0 && (
                  <tr><td colSpan="4" className="p-6 text-center text-gray-500">ምንም የተመዘገበ ሰራተኛ የለም።</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Messages (Telegram Style Split Layout) */}
      {activeTab === 'messages' && (
        <div className="flex flex-col gap-4">
          <h3 className="text-xl font-bold text-blue-400">💬 የደንበኞች የቻት ማዘዣዎች (Telegram Split Mode)</h3>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 bg-gray-800 rounded-2xl shadow-lg border border-gray-700 overflow-hidden min-h-[600px]">
            
            {/* Sidebar: Users List */}
            <div className="lg:col-span-1 border-r border-gray-700 flex flex-col bg-gray-800/50">
              <div className="p-4 font-bold bg-gray-800 border-b border-gray-700 text-gray-300">
                👥 ውይይቶች ({uniqueUsers.length})
              </div>
              <div className="overflow-y-auto flex-grow divide-y divide-gray-700/50">
                {uniqueUsers.map((u) => (
                  <div 
                    key={u.email} 
                    onClick={() => setSelectedUserEmail(u.email)}
                    className={`flex items-center gap-3 p-4 cursor-pointer transition ${
                      selectedUserEmail === u.email ? 'bg-blue-600/20 border-l-4 border-blue-500' : 'hover:bg-gray-700/50'
                    }`}
                  >
                    <span className="text-2xl p-2 bg-gray-700 rounded-full">👤</span>
                    <div className="overflow-hidden">
                      <h4 className="font-bold truncate text-white">{u.name}</h4>
                      <p className="text-xs text-gray-400 truncate">{u.email}</p>
                    </div>
                  </div>
                ))}
                {uniqueUsers.length === 0 && <p className="p-6 text-center text-gray-500">ምንም ንቁ ቻት የለም</p>}
              </div>
            </div>

            {/* Main Chat Window */}
            <div className="lg:col-span-2 flex flex-col justify-between bg-gray-900/50">
              {selectedUserEmail ? (
                <>
                  <div className="p-4 bg-gray-800 border-b border-gray-700 font-bold text-gray-200">
                    💬 የ <span className="text-blue-400">{uniqueUsers.find(u => u.email === selectedUserEmail)?.name}</span> ቻት መልዕክቶች
                  </div>
                  
                  {/* Chat Messages Body */}
                  <div className="p-4 overflow-y-auto flex-grow flex flex-col gap-4 max-h-[450px]">
                    {filteredMessages.map((msg) => (
                      <div key={msg._id} className="flex flex-col gap-2">
                        {!msg.message.startsWith('[የባለሙያ መልዕክት]') && (
                          <div className="self-start bg-gray-800 text-gray-100 p-4 rounded-2xl max-w-[80%] shadow border border-gray-700">
                            <p className="text-sm sm:text-base">{msg.message}</p>
                            <span className="text-[10px] text-gray-400 mt-1 block">📅 {new Date(msg.date).toLocaleDateString()}</span>
                          </div>
                        )}
                        
                        {msg.reply && (
                          <div className="self-end bg-blue-600 text-white p-4 rounded-2xl max-w-[80%] shadow">
                            <span className="text-xs font-bold text-blue-200 block mb-1">የእርስዎ መልዕክት፦</span>
                            <p className="text-sm sm:text-base">{msg.reply}</p>
                          </div>
                        )}
                        
                        <div className="self-start">
                          <button 
                            onClick={() => handleDeleteMessage(msg._id)} 
                            className="text-xs text-red-400 hover:text-red-300 underline mt-1"
                          >
                            🗑 መልዕክቱን አጥፋ
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Chat Footer Input */}
                  <div className="p-4 bg-gray-800 border-t border-gray-700 flex gap-3">
                    <input 
                      type="text" 
                      placeholder="ለደንበኛው መልዕክት ይጻፉ... (ለምሳሌ፦ ስልክህን ላክልኝ)" 
                      value={replyText['global_admin_chat'] || ''} 
                      onChange={(e) => setReplyText({ ...replyText, 'global_admin_chat': e.target.value })} 
                      onKeyDown={(e) => { if (e.key === 'Enter') handleSendAdminMessage(); }}
                      className="flex-1 p-3.5 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm sm:text-base focus:outline-none focus:border-blue-500"
                    />
                    <button 
                      onClick={handleSendAdminMessage} 
                      className="px-6 py-3.5 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold rounded-xl transition shadow"
                    >
                      🚀 ላክ
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full p-6 text-gray-500 text-center">
                  <p>የማንን ደንበኛ ማዘዣ ማየት እንደሚፈልጉ ከግራ በኩል ይምረጡ።</p>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Tab 4: Admins Management */}
      {activeTab === 'admins' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700 h-fit">
            <h3 className="text-xl font-bold mb-4 text-blue-400">➕ ረዳት አድሚን ይጨምሩ</h3>
            <form onSubmit={(e) => { handleAddAdminSubmit(e); setTimeout(fetchAdmins, 1000); }} className="flex flex-col gap-4">
              <input type="text" name="name" placeholder="የአዲሱ አድሚን ስም" value={newAdminForm.name} onChange={handleNewAdminChange} required className="p-3.5 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-blue-500" />
              <input type="text" name="email" placeholder="የአድሚን ዩዘርኔም" value={newAdminForm.email} onChange={handleNewAdminChange} required className="p-3.5 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-blue-500" />
              <input type="password" name="password" placeholder="የምስጢር ቃል" value={newAdminForm.password} onChange={handleNewAdminChange} required className="p-3.5 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-blue-500" />
              <button type="submit" className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition shadow">አድሚኑን መዝግብ</button>
            </form>
            {adminAddStatus && <p className="mt-4 text-center font-medium text-green-400">{adminAddStatus}</p>}
          </div>

          <div className="lg:col-span-2 bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700 overflow-x-auto">
            <h3 className="text-xl font-bold mb-4 text-blue-400">📋 የተመዘገቡ አድሚኖች ዝርዝር</h3>
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="border-b border-gray-700 text-gray-400 text-sm">
                  <th className="p-3">ስም</th>
                  <th className="p-3">ዩዘርኔም</th>
                  <th className="p-3">የፓስወርድ ማስተካከያ</th>
                  <th className="p-3">እርምጃ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {adminList.map((adm) => (
                  <tr key={adm._id} className="hover:bg-gray-700/30">
                    <td className="p-3 font-semibold">{adm.name}</td>
                    <td className="p-3 text-gray-300">{adm.email}</td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <input type="text" placeholder="አዲስ ፓስወርድ" value={passwordReset.id === adm._id ? passwordReset.newPassword : ''} onChange={(e) => setPasswordReset({ id: adm._id, newPassword: e.target.value })} className="p-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm w-32 focus:outline-none focus:border-blue-500" />
                        <button onClick={() => handleResetPassword(adm._id)} className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition">ቀይር</button>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <button onClick={() => { setEditingAdmin(adm._id); setEditForm({ name: adm.name, email: adm.email }); }} className="p-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition">✏</button>
                        <button onClick={() => handleDeleteAdmin(adm._id)} className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition">🗑</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5: Users Management */}
      {activeTab === 'users' && (
        <div className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700 overflow-x-auto">
          <h3 className="text-xl font-bold mb-4 text-blue-400">👤 የተመዘገቡ እና ቻት ያደረጉ ደንበኞች</h3>
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-gray-700 text-gray-400 text-sm">
                <th className="p-3">የደንበኛ ስም</th>
                <th className="p-3">ኢሜይል / ዩዘርኔም</th>
                <th className="p-3">ሁኔታ (Status)</th>
                <th className="p-3">እርምጃዎች</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {userList.map((u) => (
                <tr key={u._id} className={`hover:bg-gray-700/30 ${u.isBlocked ? 'bg-red-950/20' : ''}`}>
                  <td className="p-3 font-semibold">{u.name}</td>
                  <td className="p-3 text-gray-300 flex items-center gap-2">
                    {u.email} 
                    {u.isChatOnly && <span className="text-[10px] text-yellow-400 bg-gray-900 px-2 py-0.5 rounded border border-gray-700">💬 ቻት ብቻ</span>}
                  </td>
                  <td className="p-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${u.isBlocked ? 'bg-red-900/50 text-red-300 border border-red-700' : 'bg-green-900/50 text-green-300 border border-green-700'}`}>
                      {u.isBlocked ? '🚫 የታገደ' : '✔ ንቁ (Active)'}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleToggleBlockUser(u._id, u.isBlocked)} 
                        className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition ${u.isBlocked ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-yellow-600 hover:bg-yellow-700 text-white'}`}
                      >
                        {u.isBlocked ? '🔓 እገዳ አንሳ' : '🚫 እገድ'}
                      </button>
                      <button onClick={() => handleDeleteUser(u._id)} className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition">🗑 አካውንት አጥፋ</button>
                    </div>
                  </td>
                </tr>
              ))}
              {userList.length === 0 && (
                <tr><td colSpan="4" className="p-6 text-center text-gray-500">ምንም የተመዘገበ ደንበኛ አልተገኘም።</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* 🪪 Digital ID Card Modal */}
      {selectedIdCard && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-blue-900 via-gray-900 to-indigo-950 p-6 rounded-3xl w-full max-w-sm shadow-2xl border-2 border-blue-500/50 text-center relative">
            <button 
              onClick={() => setSelectedIdCard(null)} 
              className="absolute top-4 right-4 text-gray-400 hover:text-white font-bold text-xl bg-gray-800/80 w-8 h-8 rounded-full flex items-center justify-center"
            >
              ✕
            </button>

            {/* ID Card Header */}
            <div className="mb-4">
              <h2 className="text-xl font-extrabold tracking-wider text-white">MAX TECHNOLOGY</h2>
              <p className="text-xs text-blue-300 uppercase tracking-widest">Official Employee Digital ID</p>
            </div>

            {/* Employee Photo */}
            <div className="flex justify-center mb-4">
              <img 
                src={selectedIdCard.photoUrl || 'https://via.placeholder.com/120'} 
                alt={selectedIdCard.name} 
                className="w-28 h-28 rounded-2xl object-cover border-4 border-blue-400 shadow-lg" 
              />
            </div>

            {/* Employee Info */}
            <div className="mb-6 space-y-1">
              <h3 className="text-2xl font-bold text-white">{selectedIdCard.name}</h3>
              <p className="text-blue-400 font-semibold">{selectedIdCard.position}</p>
              <p className="text-xs text-gray-300 bg-white/10 py-1 px-3 rounded-full inline-block mt-1">
                Dept: {selectedIdCard.department}
              </p>
            </div>

            {/* ID Details */}
            <div className="bg-black/40 p-3 rounded-xl border border-white/10 flex justify-between items-center text-xs text-gray-300 mb-6">
              <div>
                <span className="block text-gray-500 text-[10px]">ID NUMBER</span>
                <span className="font-mono font-bold text-white text-sm">{selectedIdCard.idNumber}</span>
              </div>
              <div>
                <span className="block text-gray-500 text-[10px]">PHONE</span>
                <span className="font-semibold text-white">{selectedIdCard.phone}</span>
              </div>
            </div>

            <button 
              onClick={() => window.print()} 
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition shadow-lg text-sm"
            >
              🖨 መታወቂያውን አትም (Print ID)
            </button>
          </div>
        </div>
      )}

      {/* Edit Admin Modal */}
      {editingAdmin && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 p-6 rounded-2xl w-full max-w-md shadow-2xl border border-gray-700">
            <h3 className="text-xl font-bold mb-4 text-blue-400">📝 መረጃ ማስተካከያ</h3>
            <form onSubmit={handleUpdateAdmin} className="flex flex-col gap-4">
              <input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} required className="p-3.5 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-blue-500" />
              <input type="text" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} required className="p-3.5 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-blue-500" />
              <div className="flex gap-3 mt-2">
                <button type="submit" className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition shadow">አስቀምጥ</button>
                <button type="button" onClick={() => setEditingAdmin(null)} className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-xl transition">አቁም</button>
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
