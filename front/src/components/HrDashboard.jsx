import React, { useState, useEffect, useRef, useCallback } from 'react';
import Footer from './Footer';

const IMGBB_API_KEY = "ebd592608f4dba1e8271bec8e920c408";

function HRDashboard({ user, handleLogout, API_BASE_URL }) {
  const [employeeList, setEmployeeList] = useState([]);
  const [activeTab, setActiveTab] = useState('employees');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const [employeeForm, setEmployeeForm] = useState({
    nameAmh: '',
    nameEng: '',
    age: '',
    faydaNumber: '',
    dateOfIssue: '',
    expireDate: '',
    addressAmh: '',
    addressEng: '',
    zone: '',
    city: '',
    nationality: '',
    phoneNumber: '',
    woreda: '',
    positionAmh: '',
    positionEng: '',
    orgPhoneNumber: ''
  });

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const [employeeStatus, setEmployeeStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedIdCard, setSelectedIdCard] = useState(null);

  // 🔄 የተስተካከለ fetchEmployees በ useCallback (ESLint Warning እንዳይፈጥር)
  const fetchEmployees = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/hr/employees`);
      const data = await res.json();
      if (data.success) {
        setEmployeeList(data.employees);
      }
    } catch (err) {
      console.error('Error fetching employees', err);
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
      setEmployeeStatus("");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "faydaNumber") {
      const cleanValue = value.replace(/\D/g, "").slice(0, 16);
      setEmployeeForm(prev => ({ ...prev, [name]: cleanValue }));
    } else if (name === "phoneNumber") {
      const cleanValue = value.replace(/\D/g, "").slice(0, 10);
      setEmployeeForm(prev => ({ ...prev, [name]: cleanValue }));
    } else {
      setEmployeeForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleEmployeeSubmit = async (e) => {
    e.preventDefault();

    if (!image) {
      setEmployeeStatus("⚠️ እባክዎ የሰራተኛውን ፎቶ ይምረጡ!");
      return;
    }

    if (employeeForm.faydaNumber.length !== 16) {
      setEmployeeStatus("❌ ስህተት፡ የፋይዳ ቁጥር በትክክል 16 አሃዝ መሆን አለበት!");
      return;
    }

    if (employeeForm.phoneNumber.length !== 10) {
      setEmployeeStatus("❌ ስህተት፡ ስልክ ቁጥር በትክክል 10 አሃዝ መሆን አለበት!");
      return;
    }

    setLoading(true);
    setEmployeeStatus("⏳ ፎቶ እና መረጃ በመጫን ላይ...");

    try {
      const imgData = new FormData();
      imgData.append("image", image);

      const imgRes = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: "POST",
        body: imgData,
      });
      const imgResult = await imgRes.json();
      if (!imgResult.success) throw new Error("ፎቶውን ወደ Cloud ማከማቻ መላክ አልተቻለም");

      const finalData = {
        ...employeeForm,
        imageUrl: imgResult.data.url,
        status: 'approved',
        approved: true
      };

      const res = await fetch(`${API_BASE_URL}/api/hr/employees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalData)
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setEmployeeStatus("✅ ሰራተኛው በስኬት ተመዝግቧል እና መታወቂያው ተዘጋጅቷል!");
        setEmployeeForm({
          nameAmh: '',
          nameEng: '',
          age: '',
          faydaNumber: '',
          dateOfIssue: '',
          expireDate: '',
          addressAmh: '',
          addressEng: '',
          zone: '',
          city: '',
          nationality: '',
          phoneNumber: '',
          woreda: '',
          positionAmh: '',
          positionEng: '',
          orgPhoneNumber: ''
        });
        setImage(null);
        setImagePreview(null);
        fetchEmployees();
      } else {
        setEmployeeStatus(data.error || "የሰርቨር ስህተት!");
      }
    } catch (err) {
      setEmployeeStatus(`❌ ስህተት፡ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEmployee = async (id) => {
    if (!window.confirm("ይህንን ሰራተኛ ከዝርዝር ውስጥ ማጥፋት ይፈልጋሉ?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/hr/employees/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        alert("ሰራተኛው ተሰርዟል!");
        fetchEmployees();
      }
    } catch (err) {
      alert("ማጥፋት አልተቻለም");
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
            🏢 HR ዳሽቦርድ - እንኳን ደህና መጡ {user?.name || ''}
          </h2>
        </div>
        <button onClick={handleLogout} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition shadow text-sm">
          ውጣ (Logout)
        </button>
      </div>

      <div className="flex relative gap-6 items-start flex-1">
        {sidebarOpen && (
          <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/60 z-40 lg:hidden"></div>
        )}

        <div className={`fixed lg:relative top-0 left-0 h-full lg:h-auto w-64 bg-gray-800 border-r lg:border border-gray-700 rounded-none lg:rounded-2xl p-4 flex flex-col gap-2 z-50 transition-transform duration-300 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
          <button onClick={() => { setActiveTab('employees'); setSidebarOpen(false); }} className={`w-full text-left p-3 rounded-xl font-bold transition ${activeTab === 'employees' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>📋 ሰራተኞች ዝርዝር</button>
          <button onClick={() => { setActiveTab('register'); setSidebarOpen(false); }} className={`w-full text-left p-3 rounded-xl font-bold transition ${activeTab === 'register' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>➕ አዲስ ሰራተኛ መመዝገቢያ</button>
        </div>

        <div className="flex-1 w-full min-w-0">
          <div className="grid grid-cols-1 gap-8">
            
            {/* መመዝገቢያ ፎርም (በሁለቱም ቋንቋዎች) */}
            {(activeTab === 'register' || window.innerWidth >= 1024) && (
              <div className={`bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700 ${activeTab !== 'register' ? 'hidden lg:block' : ''}`}>
                <h3 className="text-xl font-bold mb-4 text-blue-400">➕ አዲስ ሰራተኛ መመዝገቢያ (Dual-Language)</h3>
                
                <form onSubmit={handleEmployeeSubmit} className="flex flex-col gap-4">
                  {/* ፎቶ መምረጫ */}
                  <div className="flex flex-col items-center mb-2">
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-28 h-32 bg-gray-900 border-2 border-dashed border-gray-600 rounded-xl flex items-center justify-center cursor-pointer overflow-hidden hover:border-blue-500 transition"
                    >
                      {imagePreview ? (
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-xs text-center text-gray-400 p-2">📷 ፎቶ ይምረጡ</div>
                      )}
                    </div>
                    <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input type="text" name="nameAmh" placeholder="ሙሉ ስም (አማርኛ)" value={employeeForm.nameAmh} onChange={handleChange} required className="p-3 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm" />
                    <input type="text" name="nameEng" placeholder="Full Name (English)" value={employeeForm.nameEng} onChange={handleChange} required className="p-3 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input type="text" name="positionAmh" placeholder="የስራ መደብ (አማርኛ)" value={employeeForm.positionAmh} onChange={handleChange} required className="p-3 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm" />
                    <input type="text" name="positionEng" placeholder="Position (English)" value={employeeForm.positionEng} onChange={handleChange} required className="p-3 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <input type="text" name="faydaNumber" maxLength="16" placeholder="የፋይዳ ቁጥር (16 Digits)" value={employeeForm.faydaNumber} onChange={handleChange} required className="w-full p-3 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm" />
                      <span className="text-[11px] text-gray-400">({employeeForm.faydaNumber.length}/16)</span>
                    </div>
                    <div>
                      <input type="text" name="phoneNumber" maxLength="10" placeholder="ስልክ ቁጥር (10 Digits)" value={employeeForm.phoneNumber} onChange={handleChange} required className="w-full p-3 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm" />
                      <span className="text-[11px] text-gray-400">({employeeForm.phoneNumber.length}/10)</span>
                    </div>
                    <input type="text" name="orgPhoneNumber" placeholder="የድርጅት ስልክ / Org Phone" value={employeeForm.orgPhoneNumber} onChange={handleChange} required className="p-3 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input type="text" name="addressAmh" placeholder="አድራሻ (አማርኛ)" value={employeeForm.addressAmh} onChange={handleChange} required className="p-3 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm" />
                    <input type="text" name="addressEng" placeholder="Address (English)" value={employeeForm.addressEng} onChange={handleChange} required className="p-3 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <input type="number" name="age" placeholder="እድሜ / Age" value={employeeForm.age} onChange={handleChange} required className="p-3 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm" />
                    <input type="text" name="nationality" placeholder="ዜግነት / Nationality" value={employeeForm.nationality} onChange={handleChange} required className="p-3 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm" />
                    <input type="text" name="city" placeholder="ከተማ / City" value={employeeForm.city} onChange={handleChange} required className="p-3 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm" />
                    <input type="text" name="woreda" placeholder="ወረዳ / Woreda" value={employeeForm.woreda} onChange={handleChange} required className="p-3 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-400">የወጣበት ቀን / Issue Date</label>
                      <input type="date" name="dateOfIssue" value={employeeForm.dateOfIssue} onChange={handleChange} required className="w-full p-3 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm mt-1" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400">የማብቂያ ቀን / Expiry Date</label>
                      <input type="date" name="expireDate" value={employeeForm.expireDate} onChange={handleChange} required className="w-full p-3 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm mt-1" />
                    </div>
                  </div>

                  <button type="submit" disabled={loading} className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl mt-2 disabled:opacity-50 transition">
                    {loading ? "እየተመዘገበ ነው..." : "ሰራተኛውን መዝግብ"}
                  </button>
                </form>
                {employeeStatus && <p className="mt-4 text-center font-medium text-green-400 text-sm">{employeeStatus}</p>}
              </div>
            )}

            {/* ሰራተኞች ዝርዝር ታብ */}
            {(activeTab === 'employees' || window.innerWidth >= 1024) && (
              <div className={`bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700 overflow-x-auto ${activeTab !== 'employees' ? 'hidden lg:block' : ''}`}>
                <h3 className="text-xl font-bold mb-4 text-blue-400">📋 የተመዘገቡ ሰራተኞች ዝርዝር</h3>
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="border-b border-gray-700 text-gray-400 text-sm">
                      <th className="p-3">ስም / Name</th>
                      <th className="p-3">የስራ መደብ / Position</th>
                      <th className="p-3">የፋይዳ ቁጥር</th>
                      <th className="p-3">እርምጃዎች</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {employeeList.map((emp) => (
                      <tr key={emp._id} className="hover:bg-gray-700/30">
                        <td className="p-3 font-semibold flex items-center gap-3">
                          <img src={emp.imageUrl || 'https://via.placeholder.com/40'} alt={emp.nameAmh} className="w-10 h-10 rounded-full object-cover border border-blue-500" />
                          <div>
                            <div>{emp.nameAmh}</div>
                            <div className="text-xs text-gray-400">{emp.nameEng}</div>
                          </div>
                        </td>
                        <td className="p-3 text-gray-300">
                          <div>{emp.positionAmh}</div>
                          <div className="text-xs text-gray-400">{emp.positionEng}</div>
                        </td>
                        <td className="p-3 font-mono text-xs text-blue-300">{emp.faydaNumber}</td>
                        <td className="p-3">
                          <div className="flex gap-2 items-center">
                            <button onClick={() => setSelectedIdCard(emp)} className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition">
                              🪪 መታወቂያ
                            </button>
                            <button onClick={() => handleDeleteEmployee(emp._id)} className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition">
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
            )}

          </div>
        </div>
      </div>

      {/* 🪪 Dual-Language ID Card Modal */}
      {selectedIdCard && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white text-gray-900 rounded-2xl w-full max-w-lg shadow-2xl border-4 border-[#1e3a60] overflow-hidden relative">
            
            <button onClick={() => setSelectedIdCard(null)} className="absolute top-2 right-2 text-white hover:text-gray-200 font-bold text-lg bg-red-600 w-7 h-7 rounded-full flex items-center justify-center z-10">
              ✕
            </button>

            {/* ከላይ ሰማያዊ የርዕስ ክፍል */}
            <div className="bg-[#1e3a60] text-white text-center py-3 px-4">
              <h2 className="text-lg font-extrabold tracking-wider">POESSA DIGITAL ID</h2>
              <p className="text-[11px] text-blue-200 mt-0.5">የጎንደር ዙሪያ ሰራተኛ ማህበራዊ ዋስትና አስተዳደር</p>
            </div>

            {/* የካርዱ ዋና አካል */}
            <div className="p-5 flex flex-col gap-4">
              <div className="flex gap-5 items-start">
                
                {/* ፎቶ እና የፋይዳ ቁጥር ቦክስ */}
                <div className="flex flex-col items-center gap-2 shrink-0">
                  <div className="w-28 h-32 bg-gray-200 rounded-lg overflow-hidden border-2 border-gray-300 shadow">
                    <img src={selectedIdCard.imageUrl || 'https://via.placeholder.com/100'} alt={selectedIdCard.nameAmh} className="w-full h-full object-cover" />
                  </div>
                  <div className="bg-red-50 border border-red-200 text-red-600 font-mono text-xs px-2.5 py-1 rounded tracking-wider font-bold">
                    {selectedIdCard.faydaNumber}
                  </div>
                </div>

                {/* መረጃዎች በሁለቱም ቋንቋዎች */}
                <div className="flex-1 text-xs space-y-2 text-gray-800">
                  <div className="grid grid-cols-3 border-b pb-1">
                    <span className="font-bold text-gray-600">ስም/Name:</span>
                    <span className="col-span-2 font-semibold text-gray-900">{selectedIdCard.nameAmh} / {selectedIdCard.nameEng}</span>
                  </div>
                  <div className="grid grid-cols-3 border-b pb-1">
                    <span className="font-bold text-gray-600">የስራ መደብ/Pos:</span>
                    <span className="col-span-2 text-gray-900">{selectedIdCard.positionAmh} / {selectedIdCard.positionEng}</span>
                  </div>
                  <div className="grid grid-cols-3 border-b pb-1">
                    <span className="font-bold text-gray-600">ስልክ/Phone:</span>
                    <span className="col-span-2">{selectedIdCard.phoneNumber}</span>
                  </div>
                  <div className="grid grid-cols-3 border-b pb-1">
                    <span className="font-bold text-gray-600">አድራሻ/Address:</span>
                    <span className="col-span-2">{selectedIdCard.city} - {selectedIdCard.addressAmh}</span>
                  </div>
                  <div className="grid grid-cols-3 border-b pb-1">
                    <span className="font-bold text-gray-600">የወጣበት/Issue:</span>
                    <span className="col-span-2">{selectedIdCard.dateOfIssue}</span>
                  </div>
                  <div className="grid grid-cols-3 pb-1">
                    <span className="font-bold text-gray-600">የማብቂያ/Exp:</span>
                    <span className="col-span-2 text-red-600 font-bold">{selectedIdCard.expireDate}</span>
                  </div>
                </div>

                {/* QR Code (ከሰርቨር ማረጋገጫ ሊንክ ጋር የተገናኘ) */}
                <div className="flex flex-col items-center justify-center shrink-0">
                  <div className="bg-white p-1 border rounded shadow-sm">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=85x85&data=${encodeURIComponent(`${API_BASE_URL}/api/hr/verify/${selectedIdCard._id}`)}`} 
                      alt="QR Code" 
                      className="w-20 h-20" 
                    />
                  </div>
                  <span className="text-[9px] text-gray-500 mt-1 font-bold tracking-tight">SCAN TO VERIFY</span>
                </div>

              </div>
            </div>

            <div className="bg-gray-100 border-t border-gray-200 py-2.5 px-4 text-center">
              <p className="text-[11px] text-gray-600 font-medium">ይህንን መታወቂያ በግልጽነት ሕግጋት ድንጋጌ ይጸናል</p>
            </div>

            <div className="p-3 bg-gray-50 border-t print:hidden">
              <button onClick={() => window.print()} className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow text-sm transition">
                🖨 መታወቂያውን አትም (Print ID Card)
              </button>
            </div>

          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default HRDashboard;
