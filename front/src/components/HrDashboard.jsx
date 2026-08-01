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
  const [validationErrors, setValidationErrors] = useState({});

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
    let errors = { ...validationErrors };

    if (name === "faydaNumber") {
      const cleanValue = value.replace(/\D/g, "").slice(0, 16);
      if (cleanValue.length > 0 && cleanValue.length < 16) {
        errors[name] = `⚠️ የፋይዳ ቁጥር ልክ 16 ዲጂት መሆን አለበት! (አሁን፡ ${cleanValue.length})`;
      } else {
        delete errors[name];
      }
      setEmployeeForm(prev => ({ ...prev, [name]: cleanValue }));
    } else if (["phoneNumber", "orgPhoneNumber"].includes(name)) {
      let cleanValue = value.replace(/\D/g, "");
      
      if (name === "phoneNumber" && cleanValue.length > 0 && cleanValue[0] !== "0") {
        errors[name] = "⚠️ ስልክ ቁጥር በ '0' መጀመር አለበት!";
        setValidationErrors(errors);
        return;
      }

      if (cleanValue.length > 10) {
        cleanValue = cleanValue.substring(0, 10);
      }

      if (cleanValue.length > 0 && cleanValue.length < 10) {
        errors[name] = `⚠️ ልክ 10 ዲጂት መሆን አለበት! (አሁን፡ ${cleanValue.length})`;
      } else {
        delete errors[name];
      }

      setEmployeeForm(prev => ({ ...prev, [name]: cleanValue }));
    } else if (name === "expireDate" && employeeForm.dateOfIssue && value < employeeForm.dateOfIssue) {
      errors.expireDate = "⚠️ የማብቂያ ቀን ከተሰጠበት ቀን ቀድሞ ሊሆን አይችልም!";
      setValidationErrors(errors);
      setEmployeeForm(prev => ({ ...prev, [name]: value }));
    } else {
      if (name === "expireDate") delete errors.expireDate;
      setEmployeeForm(prev => ({ ...prev, [name]: value }));
    }

    setValidationErrors(errors);
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

    if (validationErrors.expireDate) {
      setEmployeeStatus("❌ እባክዎ የቀን ስህተቱን ያስተካክሉ!");
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
        setValidationErrors({});
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
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8 relative print:bg-white print:p-0">
      
      {/* ሄደር */}
      <div className="flex flex-wrap justify-between items-center bg-gray-800 p-4 sm:p-5 rounded-2xl shadow-md gap-4 mb-6 print:hidden">
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

      <div className="flex relative gap-6 items-start flex-1 print:block">
        {sidebarOpen && (
          <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/60 z-40 lg:hidden"></div>
        )}

        <div className={`fixed lg:relative top-0 left-0 h-full lg:h-auto w-64 bg-gray-800 border-r lg:border border-gray-700 rounded-none lg:rounded-2xl p-4 flex flex-col gap-2 z-50 transition-transform duration-300 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"} print:hidden`}>
          <button onClick={() => { setActiveTab('employees'); setSidebarOpen(false); }} className={`w-full text-left p-3 rounded-xl font-bold transition ${activeTab === 'employees' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>📋 ሰራተኞች ዝርዝር</button>
          <button onClick={() => { setActiveTab('register'); setSidebarOpen(false); }} className={`w-full text-left p-3 rounded-xl font-bold transition ${activeTab === 'register' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>➕ አዲስ ሰራተኛ መመዝገቢያ</button>
        </div>

        <div className="flex-1 w-full min-w-0 print:w-full">
          <div className="grid grid-cols-1 gap-8 print:block">
            
            {/* መመዝገቢያ ፎርም */}
            {(activeTab === 'register' || window.innerWidth >= 1024) && (
              <div className={`bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700 ${activeTab !== 'register' ? 'hidden lg:block' : ''} print:hidden`}>
                <h3 className="text-xl font-bold mb-4 text-blue-400">➕ አዲስ ሰራተኛ መመዝገቢያ</h3>
                
                <form onSubmit={handleEmployeeSubmit} className="flex flex-col gap-4">
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
                      {validationErrors.faydaNumber && <span className="text-[11px] text-red-400 block">{validationErrors.faydaNumber}</span>}
                    </div>
                    <div>
                      <input type="text" name="phoneNumber" maxLength="10" placeholder="ስልክ ቁጥር (10 Digits)" value={employeeForm.phoneNumber} onChange={handleChange} required className="w-full p-3 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm" />
                      <span className="text-[11px] text-gray-400">({employeeForm.phoneNumber.length}/10)</span>
                      {validationErrors.phoneNumber && <span className="text-[11px] text-red-400 block">{validationErrors.phoneNumber}</span>}
                    </div>
                    <div>
                      <input type="text" name="orgPhoneNumber" maxLength="10" placeholder="የድርጅት ስልክ / Org Phone" value={employeeForm.orgPhoneNumber} onChange={handleChange} required className="w-full p-3 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm" />
                      {validationErrors.orgPhoneNumber && <span className="text-[11px] text-red-400 block">{validationErrors.orgPhoneNumber}</span>}
                    </div>
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
                      {validationErrors.expireDate && <span className="text-[11px] text-red-400 block mt-1">{validationErrors.expireDate}</span>}
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
              <div className={`bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700 overflow-x-auto ${activeTab !== 'employees' ? 'hidden lg:block' : ''} print:hidden`}>
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

      {/* 🪪 ID Card Modal (Front & Back Views) */}
      {selectedIdCard && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto print:fixed print:inset-0 print:bg-white print:p-0 print:flex print:items-center print:justify-center">
          
          <style dangerouslySetInnerHTML={{__html: `
            @page {
              size: 54mm 85.6mm;
              margin: 0;
            }
            @media print {
              body, html {
                width: 54mm;
                height: 85.6mm;
                margin: 0 !important;
                padding: 0 !important;
                background: white !important;
              }
              body * {
                visibility: hidden;
              }
              .printable-page, .printable-page * {
                visibility: visible;
              }
              .printable-page {
                position: absolute;
                left: 0;
                top: 0;
                width: 54mm !important;
                height: 85.6mm !important;
                max-width: none !important;
                box-shadow: none !important;
                border-radius: 0px !important;
                overflow: hidden !important;
                page-break-after: always;
                page-break-inside: avoid;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
            }
          `}} />

          <div className="flex flex-col items-center gap-6 my-auto relative">
            <button onClick={() => setSelectedIdCard(null)} className="absolute -top-12 right-0 text-white hover:text-gray-200 font-bold text-base bg-red-600 w-8 h-8 rounded-full flex items-center justify-center z-35 print:hidden">
              ✕
            </button>

            {/* FRONT SIDE */}
            <div className="flex flex-col items-center">
              <span className="text-xs text-blue-400 font-bold mb-1 print:hidden">የፊት ገጽ (Front Side)</span>
              <div className="w-6 h-4 bg-gray-400 rounded-t-md border border-gray-600 print:hidden mb-[-2px] z-10"></div>
              
              <div className="printable-page w-[300px] h-[460px] bg-[#0b192c] text-white rounded-2xl shadow-2xl border-2 border-[#d4af37] overflow-hidden relative flex flex-col print:rounded-none print:w-[54mm] print:h-[85.6mm] print:border-none">
                
                {/* Decorative Gold Wave Background Accent */}
                <div className="absolute bottom-0 right-0 w-full h-1/2 bg-gradient-to-t from-[#d4af37]/20 to-transparent pointer-events-none rounded-tl-[100px]"></div>

                {/* Header */}
                <div className="pt-4 pb-2 px-3 text-center relative z-10">
                  <div className="w-8 h-8 mx-auto bg-white rounded-full flex items-center justify-center border border-[#d4af37] shadow mb-1">
                    <span className="text-[10px] font-extrabold text-[#0b192c]">LOGO</span>
                  </div>
                  <h2 className="text-xs font-extrabold tracking-wider text-white">MAX TECHNOLOGY</h2>
                  <p className="text-[9px] text-[#d4af37] font-medium tracking-wide">EMPLOYEE ID CARD</p>
                </div>

                {/* Profile Image & Names Section */}
                <div className="flex flex-col items-center relative z-10 px-4 mt-1">
                  <div className="w-20 h-20 rounded-full p-1 bg-gradient-to-tr from-[#d4af37] to-blue-400 shadow-md">
                    <img 
                      src={selectedIdCard.imageUrl || 'https://via.placeholder.com/100'} 
                      alt={selectedIdCard.nameEng} 
                      className="w-full h-full object-cover rounded-full bg-white" 
                    />
                  </div>
                  <h3 className="text-xs font-bold mt-1.5 text-center text-white leading-tight">
                    {selectedIdCard.nameAmh}
                  </h3>
                  <h3 className="text-xs font-semibold text-center text-gray-300 leading-tight">
                    {selectedIdCard.nameEng}
                  </h3>
                  <p className="text-[10px] text-[#d4af37] font-semibold text-center mt-0.5">
                    {selectedIdCard.positionAmh} / {selectedIdCard.positionEng}
                  </p>
                </div>

                {/* Details Section (Address & Nationality) */}
                <div className="px-3 py-2 text-[10px] space-y-1 text-gray-200 relative z-10 bg-black/20 backdrop-blur-xs mx-3 rounded-lg border border-white/10 mt-2">
                  <div className="flex justify-between border-b border-white/10 pb-0.5">
                    <span className="text-gray-400 font-medium">ዜግነት / Nationality:</span>
                    <span className="text-white font-medium">{selectedIdCard.nationality || '-'}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/10 pb-0.5">
                    <span className="text-gray-400 font-medium">አድራሻ / Address:</span>
                    <span className="text-white text-right truncate max-w-[150px]">{selectedIdCard.addressAmh || selectedIdCard.addressEng || '-'}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/10 pb-0.5">
                    <span className="text-gray-400 font-medium">ከተማ / City:</span>
                    <span className="text-white">{selectedIdCard.city || '-'}</span>
                  </div>
                  <div className="flex justify-between pb-0.5">
                    <span className="text-gray-400 font-medium">ስልክ / Phone:</span>
                    <span className="font-mono text-white">{selectedIdCard.phoneNumber || '-'}</span>
                  </div>
                </div>

                {/* Footer brand */}
                <div className="absolute bottom-0 left-0 w-full py-2 text-center text-[9px] text-gray-400 bg-[#07101a] border-t border-[#d4af37]/30 z-10">
                  Max Technology Employee Card
                </div>

              </div>
            </div>

            {/* BACK SIDE */}
            <div className="flex flex-col items-center">
              <span className="text-xs text-blue-400 font-bold mb-1 print:hidden">የጀርባ ገጽ (Back Side)</span>
              <div className="w-6 h-4 bg-gray-400 rounded-t-md border border-gray-600 print:hidden mb-[-2px] z-10"></div>

              <div className="printable-page w-[300px] h-[460px] bg-[#0b192c] text-white rounded-2xl shadow-2xl border-2 border-[#d4af37] overflow-hidden relative flex flex-col justify-between p-4 print:rounded-none print:w-[54mm] print:h-[85.6mm] print:border-none">
                
                {/* Decorative Accent */}
                <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-[#d4af37]/10 to-transparent pointer-events-none"></div>

                <div className="relative z-10">
                  <h3 className="text-xs font-bold text-[#d4af37] border-b border-white/10 pb-2 mb-2 tracking-wider text-center">
                    የካርድ መረጃ / ID Details
                  </h3>

                  <div className="text-[10px] space-y-1.5 text-gray-200 bg-black/20 p-2.5 rounded-lg border border-white/10">
                    <div className="flex justify-between border-b border-white/10 pb-1">
                      <span className="text-gray-400 font-medium">የፋይዳ ቁጥር (Fayda No):</span>
                      <span className="font-mono font-semibold text-white">{selectedIdCard.faydaNumber}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/10 pb-1">
                      <span className="text-gray-400 font-medium">የተሰጠበት ቀን (Issue Date):</span>
                      <span className="text-white">{selectedIdCard.dateOfIssue}</span>
                    </div>
                    <div className="flex justify-between pb-0.5">
                      <span className="text-gray-400 font-medium">የሚያበቃበት ቀን (Expiry):</span>
                      <span className="text-red-400 font-bold">{selectedIdCard.expireDate}</span>
                    </div>
                  </div>
                </div>

                {/* Large Centered QR Code Section */}
                <div className="relative z-10 flex flex-col items-center justify-center my-auto bg-black/30 p-3 rounded-xl border border-white/10">
                  <div className="bg-white p-2 rounded-xl shadow-md">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`${API_BASE_URL}/api/hr/verify/${selectedIdCard._id}`)}`} 
                      alt="QR Code" 
                      style={{ width: '110px', height: '110px', display: 'block' }} 
                    />
                  </div>
                  <span className="text-[9px] text-[#d4af37] font-bold mt-2 tracking-wide">SCAN TO VERIFY</span>
                </div>

                {/* Verification Footer */}
                <div className="relative z-10 bg-[#07101a] -mx-4 -mb-4 py-2 px-3 text-center border-t border-[#d4af37]/30">
                  <p className="text-[8px] text-gray-400">
                    Authorized Employee Identification Card - Max Technology
                  </p>
                </div>

              </div>
            </div>

            <div className="p-3 bg-gray-800 border border-gray-700 rounded-xl mt-2 w-[300px] print:hidden">
              <button onClick={() => window.print()} className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow text-sm transition">
                🖨 መታወቂያውን አትም (Print ID Card)
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  );
}

export default HRDashboard;
