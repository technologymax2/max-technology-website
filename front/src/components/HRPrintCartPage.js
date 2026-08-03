import React, { useState } from "react";
import Footer from './Footer';

const API_BASE_URL = "https://max-tech-backend.onrender.com";
const FRONTEND_URL = "https://max-technology-website.vercel.app";

function HRPrintCartPage({ handleLogout }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchFilter, setSearchFilter] = useState('phone'); // 'phone' or 'fayda'
  const [searchResults, setSearchResults] = useState([]);
  const [printCart, setPrintCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  
  const [cardStyle, setCardStyle] = useState('standard');

  const [companyLogoUrl] = useState(() => localStorage.getItem('company_logo_url') || '');
  const [companyPhone] = useState(() => localStorage.getItem('company_phone') || '');
  const [companyEmail] = useState(() => localStorage.getItem('company_email') || '');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setLoading(true);
    setStatusMessage('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/hr/search?query=${encodeURIComponent(searchTerm)}`);
      const data = await res.json();

      if (data.success && data.employees) {
        setSearchResults(data.employees);
        if (data.employees.length === 0) {
          setStatusMessage('⚠️ ምንም ሰራተኛ አልተገኘም!');
        }
      } else {
        setSearchResults([]);
        setStatusMessage('⚠️ ምንም ሰራተኛ አልተገኘም!');
      }
    } catch (err) {
      console.error('Error searching employees', err);
      setStatusMessage('❌ ፍለጋ ላይ ስህተት ተፈጥሯል!');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (employee) => {
    if (printCart.some((item) => item._id === employee._id)) {
      setStatusMessage('⚠️ ይህ ሰራተኛ አስቀድሞ ወደ ማተሚያ ዝርዝር (Cart) ገብቷል!');
      return;
    }
    setPrintCart([...printCart, { ...employee, selectedStyle: cardStyle }]);
    setStatusMessage(`✅ ${employee.nameAmh} ወደ ማተሚያ ዝርዝር ተጨምሯል!`);
  };

  const removeFromCart = (id) => {
    setPrintCart(printCart.filter((item) => item._id !== id));
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col justify-between p-3 sm:p-6 lg:p-8 relative print:bg-white print:p-0 overflow-x-hidden">
      
      {/* ሄደር */}
      <div className="flex flex-wrap justify-between items-center bg-gray-800 p-4 sm:p-5 rounded-2xl shadow-md gap-4 mb-6 print:hidden">
        <h2 className="text-lg sm:text-2xl font-bold flex items-center gap-2 text-blue-400">
          🖨️ የሰራተኛ መታወቂያ ማተሚያ ሰንጠረዥ (Print Cart)
        </h2>
        <button onClick={handleLogout} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition shadow text-sm">
          ውጣ (Logout)
        </button>
      </div>

      <div className="flex-1 w-full max-w-6xl mx-auto space-y-6 print:max-w-none print:m-0">
        
        {/* የካርድ ዲዛይን መምረጫ */}
        <div className="bg-gray-800 p-4 sm:p-5 rounded-2xl shadow-lg border border-gray-700 print:hidden">
          <label className="block text-sm font-bold text-[#d4af37] mb-3">🎴 የካርድ ዲዛይን ቅርጸት ይምረጡ (Select Card Design Style)</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setCardStyle('standard')}
              className={`py-3 px-2 sm:px-4 rounded-xl font-bold text-xs sm:text-sm transition border ${
                cardStyle === 'standard' 
                  ? 'bg-[#132943] border-[#d4af37] text-white shadow-lg' 
                  : 'bg-gray-900 border-gray-700 text-gray-400 hover:bg-gray-700'
              }`}
            >
              መደበኛ መታወቂያ (Standard ID)
            </button>
            <button
              type="button"
              onClick={() => setCardStyle('chest')}
              className={`py-3 px-2 sm:px-4 rounded-xl font-bold text-xs sm:text-sm transition border ${
                cardStyle === 'chest' 
                  ? 'bg-[#132943] border-[#d4af37] text-white shadow-lg' 
                  : 'bg-gray-900 border-gray-700 text-gray-400 hover:bg-gray-700'
              }`}
            >
              የደረት ባጅ (Chest Badge)
            </button>
          </div>
        </div>

        {/* ፍለጋ ផ្នែក */}
        <div className="bg-gray-800 p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-700 print:hidden">
          <h3 className="text-lg sm:text-xl font-bold mb-4 text-[#d4af37]">🔍 ሰራተኛ በስልክ ወይም በፋይዳ ቁጥር ፈልግ</h3>
          
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <select 
              value={searchFilter} 
              onChange={(e) => setSearchFilter(e.target.value)}
              className="p-3 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm font-semibold"
            >
              <option value="phone">በስልክ ቁጥር (Phone)</option>
              <option value="fayda">በፋይዳ ቁጥር (Fayda)</option>
            </select>

            <input 
              type="text" 
              placeholder={searchFilter === 'phone' ? "ስልክ ቁጥር ያስገቡ (ለምሳሌ: 09...)" : "የፋይዳ ቁጥር 16 አሃዝ ያስገቡ"} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 p-3 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm"
              required
            />

            <button 
              type="submit" 
              disabled={loading}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition disabled:opacity-50 text-sm"
            >
              {loading ? "እየፈለገ ነው..." : "ፈልግ (Search)"}
            </button>
          </form>

          {statusMessage && <p className="mt-3 text-sm font-medium text-green-400">{statusMessage}</p>}
        </div>

        {/* የፍለጋ ውጤቶች ዝርዝር */}
        {searchResults.length > 0 && (
          <div className="bg-gray-800 p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-700 print:hidden">
            <h3 className="text-lg font-bold mb-4 text-blue-300">📋 የፍለጋ ውጤቶች</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {searchResults.map((emp) => (
                <div key={emp._id} className="bg-gray-900 p-4 rounded-xl border border-gray-700 flex flex-col justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img src={emp.imageUrl || 'https://via.placeholder.com/50'} alt={emp.nameAmh} className="w-12 h-12 rounded-full object-cover border border-blue-500" />
                    <div>
                      <h4 className="font-bold text-white text-sm">{emp.nameAmh}</h4>
                      <p className="text-xs text-gray-400">{emp.nameEng}</p>
                      <p className="text-xs text-blue-400 font-mono mt-0.5">{emp.faydaNumber}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => addToCart(emp)}
                    className="w-full py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg transition shadow"
                  >
                    ➕ ወደ ማተሚያ ዝርዝር ጨምር (Add to Cart)
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* የማተሚያ ጋሪ (Print Cart Section) */}
        <div className="bg-gray-800 p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-700 print:bg-white print:border-none print:p-0 print:shadow-none">
          <div className="flex justify-between items-center mb-4 print:hidden">
            <h3 className="text-lg sm:text-xl font-bold text-[#d4af37]">🛒 ለማተም የተመረጡ መታወቂያዎች ({printCart.length})</h3>
            {printCart.length > 0 && (
              <button 
                onClick={handlePrint}
                className="px-4 sm:px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow transition text-xs sm:text-sm flex items-center gap-2"
              >
                🖨️ ሁሉንም አትም (Print All)
              </button>
            )}
          </div>

          {printCart.length === 0 ? (
            <div className="text-center py-8 text-gray-500 print:hidden text-sm">
              ማተሚያ ጋሪው ባዶ ነው። እባክዎ ከላይ ሰራተኞችን ፈልገው ይጨምሩ።
            </div>
          ) : (
            <div className="space-y-6">
              
              <style dangerouslySetInnerHTML={{__html: `
                @page {
                  size: auto;
                  margin: 5mm;
                }
                @media print {
                  body, html {
                    background: white !important;
                    width: 100% !important;
                    height: auto !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                  }
                  body * {
                    visibility: hidden;
                  }
                  #printable-cart-container, #printable-cart-container * {
                    visibility: visible;
                  }
                  #printable-cart-container {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100% !important;
                    display: flex !important;
                    flex-direction: column !important;
                    gap: 5mm !important;
                  }
                  .print-card-wrapper {
                    page-break-inside: avoid;
                    break-inside: avoid;
                    margin-bottom: 4mm !important;
                  }
                  .print-card-box, .print-badge-box {
                    width: 85.6mm !important;
                    height: 54mm !important;
                    min-width: 85.6mm !important;
                    min-height: 54mm !important;
                    background-color: #132943 !important;
                    color: #ffffff !important;
                    border: 2px solid #d4af37 !important;
                    box-shadow: none !important;
                    border-radius: 4mm !important;
                    overflow: hidden !important;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                  }
                }
              `}} />

              {/* የሚታተሙ መታወቂያዎች ዝርዝር */}
              <div id="printable-cart-container" className="space-y-8">
                {printCart.map((emp) => (
                  <div key={emp._id} className="relative bg-gray-900 p-3 sm:p-4 rounded-2xl border border-gray-700 print-card-wrapper print:bg-white print:border-none print:p-0">
                    
                    <button 
                      onClick={() => removeFromCart(emp._id)} 
                      className="absolute top-2 right-2 text-white hover:text-gray-200 font-bold text-xs bg-red-600 w-7 h-7 rounded-full flex items-center justify-center z-20 print:hidden shadow-lg"
                      title="ከጋሪ አስወግድ"
                    >
                      ✕
                    </button>

                    {/* 1. STANDARD ID DESIGN (3cm x 2cm ratio / optimized layout) */}
                    {emp.selectedStyle === 'standard' && (
                      <div className="space-y-4">
                        <div className="text-xs font-bold text-[#d4af37] print:hidden mb-1">የፊት እና የኋላ ገጽ (Standard ID)</div>
                        <div className="flex flex-row flex-wrap justify-center items-center gap-4">
                          
                          {/* Front Side */}
                          <div className="print-card-box relative w-[300px] h-[450px] bg-[#132943] text-white rounded-xl shadow-2xl border-2 border-[#d4af37] overflow-hidden flex flex-col mx-auto shrink-0 p-3 justify-between">
                            <div className="absolute bottom-0 right-0 w-full h-1/2 bg-gradient-to-t from-[#d4af37]/20 to-transparent pointer-events-none rounded-tl-[80px]"></div>
                            
                            <div className="text-center relative z-10">
                              <div className="w-11 h-11 mx-auto bg-white rounded-full flex items-center justify-center border-2 border-[#d4af37] shadow mb-1 overflow-hidden">
                                {emp.logoUrl || companyLogoUrl ? (
                                  <img src={emp.logoUrl || companyLogoUrl} alt="Logo" className="w-full h-full object-cover" />
                                ) : (
                                  <span className="text-[10px] font-black text-[#132943]">LOGO</span>
                                )}
                              </div>
                              <h2 className="text-[14px] font-black tracking-widest text-white">MAX TECHNOLOGY</h2>
                              <p className="text-[10px] text-[#d4af37] font-bold tracking-wider">EMPLOYEE ID CARD</p>
                            </div>

                            {/* enlarged photo */}
                            <div className="flex flex-col items-center relative z-10 px-2 my-1">
                              <div className="w-24 h-24 rounded-full p-0.5 bg-gradient-to-tr from-[#d4af37] to-blue-400 shadow-md">
                                <img src={emp.imageUrl || 'https://via.placeholder.com/120'} alt={emp.nameEng} className="w-full h-full object-cover rounded-full bg-white" />
                              </div>
                              <h3 className="text-[15px] font-black mt-2 text-center text-white leading-tight">{emp.nameAmh}</h3>
                              <h3 className="text-[13px] font-bold text-center text-gray-200 leading-tight">{emp.nameEng}</h3>
                              <p className="text-[11px] text-[#d4af37] font-bold text-center mt-0.5">{emp.positionAmh} / {emp.positionEng}</p>
                            </div>

                            <div className="py-2.5 px-3 text-[11.5px] font-semibold space-y-1.5 text-white relative z-10 bg-black/30 rounded-xl border border-[#d4af37]/30">
                              <div className="flex justify-between border-b border-white/20 pb-0.5">
                                <span className="text-gray-300 font-bold">ዜግነት:</span>
                                <span className="text-white font-bold">{emp.nationality || 'Ethiopian'}</span>
                              </div>
                              <div className="flex justify-between border-b border-white/20 pb-0.5">
                                <span className="text-gray-300 font-bold">አድራሻ:</span>
                                <span className="text-white font-bold text-right truncate max-w-[150px]">{emp.addressAmh || emp.addressEng || 'Addis Ababa'}</span>
                              </div>
                              <div className="flex justify-between pb-0.5">
                                <span className="text-gray-300 font-bold">ስልክ:</span>
                                <span className="font-mono text-white font-bold">{emp.phoneNumber || '-'}</span>
                              </div>
                            </div>

                            <div className="text-center py-1.5 text-[9.5px] font-bold text-[#d4af37] bg-[#0c1b2d] -mx-3 -mb-3 border-t border-[#d4af37]/30 z-10">
                              Max Technology Employee Card
                            </div>
                          </div>

                          {/* Back Side */}
                          <div className="print-card-box relative w-[300px] h-[450px] bg-[#132943] text-white rounded-xl shadow-2xl border-2 border-[#d4af37] overflow-hidden flex flex-col justify-between p-4 mx-auto shrink-0">
                            <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-[#d4af37]/10 to-transparent pointer-events-none"></div>

                            <div className="relative z-10">
                              <h3 className="text-[12px] font-black text-[#d4af37] border-b border-white/20 pb-1.5 mb-2.5 tracking-wider text-center">
                                የካርድ መረጃ / ID Details
                              </h3>

                              <div className="text-[10.5px] font-semibold space-y-1.5 text-white bg-black/30 p-2.5 rounded-xl border border-[#d4af37]/30 mb-2.5">
                                <div className="flex justify-between border-b border-white/20 pb-1">
                                  <span className="text-gray-300 font-bold">ድርጅት ስልክ:</span>
                                  <span className="font-mono text-white font-bold">{emp.orgPhoneNumber || companyPhone || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between pb-0.5">
                                  <span className="text-gray-300 font-bold">ኢሜይል:</span>
                                  <span className="text-white font-bold truncate max-w-[150px]">{emp.orgEmail || companyEmail || 'N/A'}</span>
                                </div>
                              </div>

                              <div className="text-[11px] font-semibold space-y-1.5 text-white bg-black/30 p-2.5 rounded-xl border border-[#d4af37]/30">
                                <div className="flex justify-between border-b border-white/20 pb-1">
                                  <span className="text-gray-300 font-bold">የፋይዳ ቁጥር:</span>
                                  <span className="font-mono font-black text-white text-[10px]">{emp.faydaNumber}</span>
                                </div>
                                <div className="flex justify-between border-b border-white/20 pb-1">
                                  <span className="text-gray-300 font-bold">የወጣበት ቀን:</span>
                                  <span className="text-white font-bold">{emp.dateOfIssue}</span>
                                </div>
                                <div className="flex justify-between pb-0.5">
                                  <span className="text-gray-300 font-bold">የሚያበቃበት:</span>
                                  <span className="text-yellow-300 font-black">{emp.expireDate}</span>
                                </div>
                              </div>
                            </div>

                            {/* enlarged QR Code */}
                            <div className="relative z-10 flex flex-col items-center justify-center my-auto bg-black/30 p-3 rounded-xl border border-[#d4af37]/30">
                              <div className="bg-white p-2.5 rounded-xl shadow-md">
                                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(`${FRONTEND_URL}/verify/${emp._id}`)}`} alt="QR Code" style={{ width: '120px', height: '120px', display: 'block' }} />
                              </div>
                              <span className="text-[10px] text-[#d4af37] font-black mt-2 tracking-wider">SCAN TO VERIFY</span>
                            </div>

                            <div className="relative z-10 bg-[#0c1b2d] -mx-4 -mb-4 py-2 px-2 text-center border-t border-[#d4af37]/30">
                              <p className="text-[9px] font-bold text-gray-300">Authorized Employee ID - Max Technology</p>
                            </div>
                          </div>

                        </div>
                      </div>
                    )}

                    {/* 2. CHEST BADGE DESIGN */}
                    {emp.selectedStyle === 'chest' && (
                      <div className="space-y-4">
                        <div className="text-xs font-bold text-[#d4af37] print:hidden mb-1">የፊት እና የኋላ ገጽ (Chest Badge)</div>
                        <div className="flex flex-row flex-wrap justify-center items-center gap-3">
                          
                          {/* Badge Front */}
                          <div className="print-badge-box relative w-[340px] h-[200px] bg-[#132943] text-white rounded-xl shadow-2xl border-2 border-[#d4af37] overflow-hidden flex flex-col justify-between p-4 shrink-0 mx-auto">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#d4af37]/15 to-transparent pointer-events-none rounded-bl-full"></div>

                            <div className="flex items-center justify-between border-b border-white/20 pb-2 relative z-10">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center border border-[#d4af37] shadow overflow-hidden">
                                  {emp.logoUrl || companyLogoUrl ? (
                                    <img src={emp.logoUrl || companyLogoUrl} alt="Logo" className="w-full h-full object-cover" />
                                  ) : (
                                    <span className="text-[8px] font-black text-[#132943]">LOGO</span>
                                  )}
                                </div>
                                <div>
                                  <h2 className="text-[12px] font-black tracking-wider text-white">MAX TECHNOLOGY</h2>
                                  <p className="text-[8.5px] text-[#d4af37] font-bold">EMPLOYEE BADGE</p>
                                </div>
                              </div>
                              <div className="text-right text-[8.5px] font-semibold text-gray-200">
                                <div>ስልክ: {emp.orgPhoneNumber || companyPhone}</div>
                                <div>ኢሜይል: {emp.orgEmail || companyEmail}</div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between gap-3 my-auto relative z-10">
                              <div className="flex items-center gap-3">
                                <div className="w-20 h-20 rounded-xl p-0.5 bg-gradient-to-tr from-[#d4af37] to-blue-400 shadow-md shrink-0">
                                  <img src={emp.imageUrl || 'https://via.placeholder.com/120'} alt={emp.nameEng} className="w-full h-full object-cover rounded-lg bg-white" />
                                </div>
                                <div className="space-y-0.5">
                                  <h3 className="text-[14px] font-black text-white leading-tight">{emp.nameAmh}</h3>
                                  <h3 className="text-[11px] font-bold text-gray-200 leading-tight">{emp.nameEng}</h3>
                                  <p className="text-[10px] text-[#d4af37] font-bold">{emp.positionAmh}</p>
                                  <div className="text-[9.5px] font-semibold text-gray-200 mt-0.5">
                                    <div>ከተማ: {emp.city} | ስልክ: {emp.phoneNumber}</div>
                                  </div>
                                </div>
                              </div>

                              <div className="flex flex-col items-center bg-black/30 p-2 rounded-xl border border-[#d4af37]/30 shrink-0">
                                <div className="bg-white p-1.5 rounded">
                                  <img src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(`${FRONTEND_URL}/verify/${emp._id}`)}`} alt="QR Code" style={{ width: '65px', height: '65px', display: 'block' }} />
                                </div>
                                <span className="text-[7.5px] text-[#d4af37] font-black mt-1">SCAN</span>
                              </div>
                            </div>

                            <div className="bg-[#0c1b2d] -mx-4 -mb-4 py-1.5 px-2 text-center border-t border-[#d4af37]/30 text-[8.5px] font-bold text-gray-300 relative z-10">
                              Authorized Corporate Badge - Max Technology
                            </div>
                          </div>

                          {/* Badge Back */}
                          <div className="print-badge-box relative w-[340px] h-[200px] bg-[#132943] text-white rounded-xl shadow-2xl border-2 border-[#d4af37] overflow-hidden flex flex-col justify-between p-4 shrink-0 mx-auto">
                            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-[#d4af37]/10 to-transparent pointer-events-none rounded-tr-full"></div>

                            <div className="flex justify-between items-center border-b border-white/20 pb-2 relative z-10">
                              <h3 className="text-[11px] font-black text-[#d4af37] tracking-wider">የባጅ ተጨማሪ መረጃ / Additional Details</h3>
                              <span className="text-[8.5px] font-mono font-bold text-gray-200">ፋይዳ: {emp.faydaNumber}</span>
                            </div>

                            <div className="flex flex-col justify-center my-auto px-1 space-y-2 relative z-10">
                              <div className="text-[10.5px] font-bold text-white grid grid-cols-2 gap-3 bg-black/30 p-3 rounded-xl border border-[#d4af37]/30">
                                <div><span className="text-gray-300 font-bold">የወጣበት ቀን:</span> <span className="text-white font-black">{emp.dateOfIssue}</span></div>
                                <div><span className="text-gray-300 font-bold">የሚያበቃበት:</span> <span className="text-yellow-300 font-black">{emp.expireDate}</span></div>
                                <div><span className="text-gray-300 font-bold">ዜግነት:</span> <span className="text-white font-black">{emp.nationality || 'Ethiopian'}</span></div>
                                <div><span className="text-gray-300 font-bold">እድሜ:</span> <span className="text-white font-black">{emp.age || '-'}</span></div>
                              </div>
                            </div>

                            <div className="bg-[#0c1b2d] -mx-4 -mb-4 py-1.5 px-2 text-center border-t border-[#d4af37]/30 text-[8.5px] font-bold text-gray-300 relative z-10">
                              Max Technology - Official Badge Identification
                            </div>
                          </div>

                        </div>
                      </div>
                    )}

                  </div>
                ))}
              </div>

            </div>
          )}
        </div>

      </div>

      <div className="print:hidden mt-8">
        <Footer/>
      </div>
    </div>
  );
}

export default HRPrintCartPage;
