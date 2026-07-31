import React, { useState, useEffect } from 'react';
import Footer from './Footer';
import { uploadImageToImgBB } from './imageUploading';

function HRDashboard({ user, handleLogout, API_BASE_URL }) {
  const [employeeList, setEmployeeList] = useState([]);
  
  // 🌐 የቋንቋ መቆጣጠሪያ ሁኔታ (Language State: 'am' ወይም 'en')
  const [lang, setLang] = useState('am');

  const [activeTab, setActiveTab] = useState('employees');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const [employeeForm, setEmployeeForm] = useState({
    fullName: '',
    age: '',
    faydaNumber: '',
    dateOfIssue: '',
    expireDate: '',
    address: '',
    zone: '',
    city: '',
    nationality: '',
    phoneNumber: '',
    woreda: '',
    position: '',
    imageUrl: '',
    orgPhoneNumber: ''
  });
  const [employeeStatus, setEmployeeStatus] = useState('');
  const [selectedIdCard, setSelectedIdCard] = useState(null);
  const [empUploading, setEmpUploading] = useState(false);

  const t = {
    am: {
      title: "HR መቆጣጠሪያ",
      welcome: "እንኳን ደህና መጡ",
      logout: "ውጣ (Logout)",
      menu: "ምናሌዎች (Menu)",
      employeesTab: "📋 ሰራተኞች ዝርዝር",
      registerTab: "➕ አዲስ ሰራተኛ መመዝገቢያ",
      regTitle: "➕ አዲስ ሰራተኛ መመዝገቢያ",
      fullName: "ሙሉ ስም (Full Name)",
      age: "እድሜ (Age)",
      nationality: "ዜግነት (Nationality)",
      faydaNumber: "የፋይዳ ቁጥር (Fayda - በትክክል 16 አሃዝ)",
      faydaHint: "ቁጥሩ በትክክል 16 ዲጂት መሆን አለበት",
      dateOfIssue: "የወጣበት ቀን (Date of Issue)",
      expireDate: "ሚያልቅበት ቀን (Expire Date)",
      position: "የስራ መደብ (Position)",
      phone: "ስልክ (በትክክል 10 አሃዝ)",
      phoneHint: "10 ዲጂት",
      address: "አድራሻ (Address)",
      zone: "ዞን (Zone)",
      city: "ከተማ (City)",
      woreda: "ወረዳ (Woreda)",
      orgPhone: "የድርጅቱ ስልክ (Org Phone)",
      photoLabel: "የሰራተኛ ፎቶ ይጫኑ (Image Upload)",
      uploading: "ፎቶ በመጫን ላይ...",
      submitBtn: "ሰራተኛውን መዝግብ",
      listTitle: "📋 የተመዘገቡ ሰራተኞች ዝርዝር",
      nameCol: "ስም / Name",
      posCol: "የስራ መደብ / Position",
      faydaCol: "የፋይዳ ቁጥር",
      actionsCol: "እርምጃዎች",
      idBtn: "🪪 መታወቂያ",
      deleteBtn: "🗑 አጥፋ",
      noEmployees: "ምንም የተመዘገበ ሰራተኛ የለም።",
      photoSuccess: "📸 የሰራተኛው ፎቶ በስኬት ተጭኗል!",
      photoError: "ፎቶ መጫን አልተቻለም፡ ",
      faydaError: "❌ ስህተት፡ የፋይዳ ቁጥር በትክክል 16 አሃዝ (Digits) መሆን አለበት!",
      phoneError: "❌ ስህተት፡ ስልክ ቁጥር በትክክል 10 አሃዝ (Digits) መሆን አለበት!",
      successMsg: "✅ ሰራተኛው በስኬት ተመዝግቧል እና መታወቂያው ተዘጋጅቷል!",
      serverError: "የሰርቨር ስህተት!",
      deleteConfirm: "ይህንን ሰራተኛ ከዝርዝር ውስጥ ማጥፋት ይፈልጋሉ?",
      deletedAlert: "ሰራተኛው ተሰርዟል!",
      deleteFail: "ማጥፋት አልተቻለም",
      printBtn: "🖨 መታወቂያውን አትም (Print ID Card)"
    },
    en: {
      title: "HR Dashboard",
      welcome: "Welcome",
      logout: "Logout",
      menu: "Menu",
      employeesTab: "📋 Employee List",
      registerTab: "➕ Register Employee",
      regTitle: "➕ Register New Employee",
      fullName: "Full Name",
      age: "Age",
      nationality: "Nationality",
      faydaNumber: "Fayda Number (Exactly 16 Digits)",
      faydaHint: "Must be exactly 16 digits",
      dateOfIssue: "Date of Issue",
      expireDate: "Expire Date",
      position: "Position",
      phone: "Phone (Exactly 10 Digits)",
      phoneHint: "10 digits",
      address: "Address",
      zone: "Zone",
      city: "City",
      woreda: "Woreda",
      orgPhone: "Org Phone",
      photoLabel: "Upload Employee Photo",
      uploading: "Uploading photo...",
      submitBtn: "Register Employee",
      listTitle: "📋 Registered Employees List",
      nameCol: "Name",
      posCol: "Position",
      faydaCol: "Fayda Number",
      actionsCol: "Actions",
      idBtn: "🪪 ID Card",
      deleteBtn: "🗑 Delete",
      noEmployees: "No registered employees found.",
      photoSuccess: "📸 Employee photo uploaded successfully!",
      photoError: "Failed to upload photo: ",
      faydaError: "❌ Error: Fayda number must be exactly 16 digits!",
      phoneError: "❌ Error: Phone number must be exactly 10 digits!",
      successMsg: "✅ Employee registered successfully and ID created!",
      serverError: "Server error!",
      deleteConfirm: "Do you want to delete this employee from the list?",
      deletedAlert: "Employee deleted!",
      deleteFail: "Failed to delete",
      printBtn: "🖨 Print ID Card"
    }
  }[lang];

  useEffect(() => {
    fetchEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [API_BASE_URL]);

  const fetchEmployees = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/hr/employees`);
      const data = await res.json();
      if (data.success) {
        setEmployeeList(data.employees);
      }
    } catch (err) {
      console.error('Error fetching employees', err);
    }
  };

  const handleEmployeePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const imageUrl = await uploadImageToImgBB(file, setEmpUploading);
      setEmployeeForm(prev => ({ ...prev, imageUrl: imageUrl }));
      alert(t.photoSuccess);
    } catch (err) {
      alert(t.photoError + err.message);
    }
  };

  const handleEmployeeSubmit = async (e) => {
    e.preventDefault();

    if (!/^\d{16}$/.test(employeeForm.faydaNumber)) {
      setEmployeeStatus(t.faydaError);
      return;
    }

    if (!/^\d{10}$/.test(employeeForm.phoneNumber)) {
      setEmployeeStatus(t.phoneError);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/hr/employees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...employeeForm, status: 'approved', approved: true })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setEmployeeStatus(t.successMsg);
        setEmployeeForm({
          fullName: '',
          age: '',
          faydaNumber: '',
          dateOfIssue: '',
          expireDate: '',
          address: '',
          zone: '',
          city: '',
          nationality: '',
          phoneNumber: '',
          woreda: '',
          position: '',
          imageUrl: '',
          orgPhoneNumber: ''
        });
        fetchEmployees();
      } else {
        setEmployeeStatus(data.error || t.serverError);
      }
    } catch (err) {
      setEmployeeStatus(t.serverError);
    }
  };

  const handleDeleteEmployee = async (id) => {
    if (!window.confirm(t.deleteConfirm)) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/hr/employees/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        alert(t.deletedAlert);
        fetchEmployees();
      }
    } catch (err) {
      alert(t.deleteFail);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8 relative">
      
      {/* ሄደር */}
      <div className="flex flex-wrap justify-between items-center bg-gray-800 p-4 sm:p-5 rounded-2xl shadow-md gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="bg-yellow-400 text-gray-900 border-none p-2 px-3 rounded-xl text-lg cursor-pointer font-bold hover:bg-yellow-500 transition"
          >
            ☰
          </button>
          <h2 className="text-lg sm:text-2xl font-bold flex items-center gap-2">
            🏢 {t.title} - {t.welcome} {user?.name || ''}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-gray-900 p-1 rounded-xl border border-gray-700">
            <button onClick={() => setLang('am')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${lang === 'am' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}>አማርኛ</button>
            <button onClick={() => setLang('en')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${lang === 'en' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}>English</button>
          </div>
          <button onClick={handleLogout} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition shadow text-sm">
            {t.logout}
          </button>
        </div>
      </div>

      <div className="flex relative gap-6 items-start flex-1">
        {sidebarOpen && (
          <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/60 z-40 lg:hidden"></div>
        )}

        <div className={`fixed lg:relative top-0 left-0 h-full lg:h-auto w-64 bg-gray-800 border-r lg:border border-gray-700 rounded-none lg:rounded-2xl p-4 flex flex-col gap-2 z-50 transition-transform duration-300 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
          <div className="flex justify-between items-center mb-2 lg:hidden">
            <span className="text-sm font-bold text-gray-400">{t.menu}</span>
            <button onClick={() => setSidebarOpen(false)} className="bg-transparent border-none text-white text-xl cursor-pointer">✕</button>
          </div>
          <button onClick={() => { setActiveTab('employees'); setSidebarOpen(false); }} className={`w-full text-left p-3 rounded-xl font-bold transition ${activeTab === 'employees' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>{t.employeesTab}</button>
          <button onClick={() => { setActiveTab('register'); setSidebarOpen(false); }} className={`w-full text-left p-3 rounded-xl font-bold transition ${activeTab === 'register' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>{t.registerTab}</button>
        </div>

        <div className="flex-1 w-full min-w-0">
          <div className="grid grid-cols-1 gap-8">
            
            {/* መመዝገቢያ ፎርም */}
            {(activeTab === 'register' || window.innerWidth >= 1024) && (
              <div className={`bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700 ${activeTab !== 'register' ? 'hidden lg:block' : ''}`}>
                <h3 className="text-xl font-bold mb-4 text-blue-400">{t.regTitle}</h3>
                <form onSubmit={handleEmployeeSubmit} className="flex flex-col gap-3">
                  <input type="text" placeholder={t.fullName} value={employeeForm.fullName} onChange={(e) => setEmployeeForm({ ...employeeForm, fullName: e.target.value })} required className="p-3 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input type="number" placeholder={t.age} value={employeeForm.age} onChange={(e) => setEmployeeForm({ ...employeeForm, age: e.target.value })} required className="p-3 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm" />
                    <input type="text" placeholder={t.nationality} value={employeeForm.nationality} onChange={(e) => setEmployeeForm({ ...employeeForm, nationality: e.target.value })} required className="p-3 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm" />
                  </div>
                  <div>
                    <input type="text" maxLength="16" placeholder={t.faydaNumber} value={employeeForm.faydaNumber} onChange={(e) => setEmployeeForm({ ...employeeForm, faydaNumber: e.target.value.replace(/\D/g, '') })} required className="w-full p-3 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm" />
                    <span className="text-[11px] text-gray-400 pl-1">{t.faydaHint} ({employeeForm.faydaNumber.length}/16)</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input type="text" placeholder={t.dateOfIssue} value={employeeForm.dateOfIssue} onChange={(e) => setEmployeeForm({ ...employeeForm, dateOfIssue: e.target.value })} required className="p-3 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm" />
                    <input type="text" placeholder={t.expireDate} value={employeeForm.expireDate} onChange={(e) => setEmployeeForm({ ...employeeForm, expireDate: e.target.value })} required className="p-3 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input type="text" placeholder={t.position} value={employeeForm.position} onChange={(e) => setEmployeeForm({ ...employeeForm, position: e.target.value })} required className="p-3 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm" />
                    <div>
                      <input type="text" maxLength="10" placeholder={t.phone} value={employeeForm.phoneNumber} onChange={(e) => setEmployeeForm({ ...employeeForm, phoneNumber: e.target.value.replace(/\D/g, '') })} required className="w-full p-3 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm" />
                      <span className="text-[11px] text-gray-400 pl-1">{t.phoneHint} ({employeeForm.phoneNumber.length}/10)</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input type="text" placeholder={t.address} value={employeeForm.address} onChange={(e) => setEmployeeForm({ ...employeeForm, address: e.target.value })} required className="p-3 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm" />
                    <input type="text" placeholder={t.zone} value={employeeForm.zone} onChange={(e) => setEmployeeForm({ ...employeeForm, zone: e.target.value })} className="p-3 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm" />
                    <input type="text" placeholder={t.city} value={employeeForm.city} onChange={(e) => setEmployeeForm({ ...employeeForm, city: e.target.value })} required className="p-3 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input type="text" placeholder={t.woreda} value={employeeForm.woreda} onChange={(e) => setEmployeeForm({ ...employeeForm, woreda: e.target.value })} required className="p-3 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm" />
                    <input type="text" placeholder={t.orgPhone} value={employeeForm.orgPhoneNumber} onChange={(e) => setEmployeeForm({ ...employeeForm, orgPhoneNumber: e.target.value })} required className="p-3 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-400">{t.photoLabel}</label>
                    <input type="file" onChange={handleEmployeePhotoUpload} className="p-2 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm file:bg-blue-600 file:text-white file:rounded-lg file:border-0" />
                  </div>
                  <button type="submit" disabled={empUploading} className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl mt-2 disabled:opacity-50 transition">
                    {empUploading ? t.uploading : t.submitBtn}
                  </button>
                </form>
                {employeeStatus && <p className="mt-4 text-center font-medium text-green-400 text-sm">{employeeStatus}</p>}
              </div>
            )}

            {/* ሰራተኞች ዝርዝር ታብ */}
            {(activeTab === 'employees' || window.innerWidth >= 1024) && (
              <div className={`bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700 overflow-x-auto ${activeTab !== 'employees' ? 'hidden lg:block' : ''}`}>
                <h3 className="text-xl font-bold mb-4 text-blue-400">{t.listTitle}</h3>
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="border-b border-gray-700 text-gray-400 text-sm">
                      <th className="p-3">{t.nameCol}</th>
                      <th className="p-3">{t.posCol}</th>
                      <th className="p-3">{t.faydaCol}</th>
                      <th className="p-3">{t.actionsCol}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {employeeList.map((emp) => (
                      <tr key={emp._id} className="hover:bg-gray-700/30">
                        <td className="p-3 font-semibold flex items-center gap-3">
                          <img src={emp.imageUrl || 'https://via.placeholder.com/40'} alt={emp.fullName} className="w-10 h-10 rounded-full object-cover border border-blue-500" />
                          {emp.fullName}
                        </td>
                        <td className="p-3 text-gray-300">{emp.position}</td>
                        <td className="p-3 font-mono text-xs text-blue-300">{emp.faydaNumber}</td>
                        <td className="p-3">
                          <div className="flex gap-2 items-center">
                            <button onClick={() => setSelectedIdCard(emp)} className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition">
                              {t.idBtn}
                            </button>
                            <button onClick={() => handleDeleteEmployee(emp._id)} className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition">
                              {t.deleteBtn}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {employeeList.length === 0 && (
                      <tr><td colSpan="4" className="p-6 text-center text-gray-500">{t.noEmployees}</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* 🪪 Dual-Language Digital ID Card Modal (በሁለቱም ቋንቋዎች የተዋቀረ መታወቂያ) */}
      {selectedIdCard && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-blue-950 via-gray-900 to-indigo-950 p-6 rounded-3xl w-full max-w-md shadow-2xl border-2 border-blue-500/50 text-center relative">
            <button onClick={() => setSelectedIdCard(null)} className="absolute top-4 right-4 text-gray-400 hover:text-white font-bold text-xl bg-gray-800/80 w-8 h-8 rounded-full flex items-center justify-center">
              ✕
            </button>
            
            {/* የድርጅት ራስጌ (በሁለቱም ቋንቋ) */}
            <div className="mb-3 border-b border-blue-500/30 pb-2">
              <h2 className="text-base font-extrabold tracking-wider text-white">MAX TECHNOLOGY / ማክ ቴክኖሎጂ</h2>
              <p className="text-[10px] text-blue-300 uppercase tracking-widest">Official Employee Digital ID / የሰራተኛ ዲጂታል መታወቂያ</p>
            </div>

            {/* የሰራተኛ መረጃ (በሁለቱም ቋንቋዎች) */}
            <div className="flex gap-4 items-center mb-4 text-left">
              <img src={selectedIdCard.imageUrl || 'https://via.placeholder.com/100'} alt={selectedIdCard.fullName} className="w-24 h-28 rounded-xl object-cover border-2 border-blue-400 shadow-md shrink-0" />
              <div className="text-xs space-y-1 text-gray-200 w-full">
                <p><strong>ስም / Name:</strong> {selectedIdCard.fullName}</p>
                <p><strong>የስራ መደብ / Position:</strong> {selectedIdCard.position}</p>
                <p><strong>እድሜ / Age:</strong> {selectedIdCard.age} | <strong>ዜግነት / Nat:</strong> {selectedIdCard.nationality}</p>
                <p><strong>የፋይዳ ቁጥር / Fayda:</strong> <span className="font-mono text-blue-300">{selectedIdCard.faydaNumber}</span></p>
                <p><strong>ስልክ / Phone:</strong> {selectedIdCard.phoneNumber}</p>
              </div>
            </div>

            {/* አድራሻ እና ቀናት (በሁለቱም ቋንቋዎች) */}
            <div className="bg-black/40 p-2.5 rounded-xl border border-white/10 text-[11px] text-gray-300 space-y-1 mb-4 text-left">
              <p><strong>አድራሻ / Address:</strong> {selectedIdCard.address}, ከተማ/City: {selectedIdCard.city}, ወረዳ/Woreda: {selectedIdCard.woreda}</p>
              <div className="flex justify-between pt-1 border-t border-white/10 text-[10px]">
                <span>ወጣበት / Issued: <strong>{selectedIdCard.dateOfIssue}</strong></span>
                <span>ያልቃል / Expires: <strong>{selectedIdCard.expireDate}</strong></span>
              </div>
            </div>

            {/* ማረጋገጫ እና QR ኮድ */}
            <div className="flex justify-between items-center bg-blue-950/40 p-2.5 rounded-xl border border-blue-500/20 mb-4">
              <div className="text-left text-[10px] text-gray-300">
                <p className="text-green-400 font-bold">✔ HR Verified & Signed / የተረጋገጠ</p>
                <p>የድርጅቱ ስልክ / Org Phone: <strong className="text-white">{selectedIdCard.orgPhoneNumber}</strong></p>
              </div>
              <div className="bg-white p-1 rounded-lg">
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=65x65&data=Fayda-${selectedIdCard.faydaNumber}-${selectedIdCard.fullName}`} alt="QR Code" className="w-14 h-14" />
              </div>
            </div>

            <button onClick={() => window.print()} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg text-sm transition">
              {t.printBtn}
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default HRDashboard;
