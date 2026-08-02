import React, { useState, useEffect, useCallback } from "react";

function SalesDashboard({ user, handleLogout, API_BASE_URL }) {
  const [leads, setLeads] = useState([]);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [comments, setComments] = useState({});
  const [statuses, setStatuses] = useState({});
  const [selectedLeadIds, setSelectedLeadIds] = useState([]);

  // 👈 አዳዲስ የፍለጋ እና የማጣሪያ (Search & Filter) ስቴቶች
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ሁሉም");

  const fetchLeads = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/sales/leads`);
      const data = await res.json();
      if (data.success) setLeads(data.leads);
    } catch (err) {
      console.error("መረጃዎችን ማምጣት አልተቻለም");
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Excel ፋይል መጫኛ
  const handleUploadExcel = async (e) => {
    e.preventDefault();
    if (!file) return alert("እባክዎ ፋይል ይምረጡ!");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("uploadedBy", user?.name || "የሽያጭ ሰራተኛ");

    setUploading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/sales/upload-excel`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        setFile(null);
        fetchLeads();
      } else {
        alert(data.error || "መጫን አልተቻለም");
      }
    } catch (err) {
      alert("ስህተት ተፈጥሯል");
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateLead = async (id) => {
    const status = statuses[id] || "ያልተደወለ";
    const comment = comments[id] || "";

    try {
      const res = await fetch(`${API_BASE_URL}/api/sales/leads/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          status, 
          comment, 
          salesPerson: user?.name,
          updatedBy: user?.name || "የሽያጭ ሰራተኛ" 
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert("ተዘምኗል!");
        fetchLeads();
      }
    } catch (err) {
      alert("ማዘመን አልተቻለም");
    }
  };

  const handleDeleteLead = async (id) => {
    const firstConfirm = window.confirm("እርግጠኛ ሆንክ ይህንን የደንበኛ መረጃ ማጥፋት ትፈልጋለህ?");
    if (!firstConfirm) return;

    const secondConfirm = window.confirm("⚠️ አስጠንቀቅ! ይህ መረጃ ከዚህ በኃላ ይመለስ ዘንድ አይቻልም። በእርግጥ ይሰረዝ?");
    if (!secondConfirm) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/sales/leads/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deletedBy: user?.name || "የሽያጭ ሰራተኛ" }),
      });
      const data = await res.json();
      if (data.success) {
        alert("መረጃው በተሳካ ሁኔታ ተሰርዟል!");
        fetchLeads();
      }
    } catch (err) {
      alert("ስህተት ተፈጥሯል");
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = filteredLeads.map((lead) => lead._id);
      setSelectedLeadIds(allIds);
    } else {
      setSelectedLeadIds([]);
    }
  };

  const handleSelectOne = (id) => {
    if (selectedLeadIds.includes(id)) {
      setSelectedLeadIds(selectedLeadIds.filter((item) => item !== id));
    } else {
      setSelectedLeadIds([...selectedLeadIds, id]);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedLeadIds.length === 0) {
      return alert("እባክዎ መጀመሪያ ሊጥፏቸው የሚፈልጓቸውን ደንበኞች ይምረጡ!");
    }

    const firstConfirm = window.confirm(`እርግጠኛ ሆንክ የተመረጡትን ${selectedLeadIds.length} ደንበኞች ማጥፋት ትፈልጋለህ?`);
    if (!firstConfirm) return;

    const secondConfirm = window.confirm("⚠️ አስጠንቀቅ! እነዚህ መረጃዎች ሙሉ በሙሉ ይሰረዛሉ። መቀጠል ይፈልጋሉ?");
    if (!secondConfirm) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/sales/leads-bulk`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          ids: selectedLeadIds,
          deletedBy: user?.name || "የሽያጭ ሰራተኛ" 
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert(data.message);
        setSelectedLeadIds([]);
        fetchLeads();
      } else {
        alert(data.error || "ማጥፋት አልተቻለም");
      }
    } catch (err) {
      console.error("Bulk delete error:", err);
      alert("በማጥፋት ሂደት ላይ ስህተት ተፈጥሯል");
    }
  };

  // 👈 ፍለጋውን እና ማጣሪያውን (Filtering logic) እዚህ ማስተካከል
  const filteredLeads = leads.filter((lead) => {
    const matchesSearch = 
      lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone?.includes(searchTerm) ||
      lead.address?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === "ሁሉም" || lead.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-yellow-400">🛒 የሽያጭ እና የጥሪ ማስተዳደሪያ (Sales CRM)</h1>
          <p className="text-xs text-gray-400">እንኳን ደህና መጡ፣ <span className="text-white font-semibold">{user?.name || "የሽያጭ ሰራተኛ"}</span></p>
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
        >
          ውጣ (Logout)
        </button>
      </header>

      <main className="flex-grow p-6 max-w-7xl mx-auto w-full flex flex-col gap-6">
        {/* Excel ፋይል መጫኛ */}
        <div className="bg-gray-800 p-5 rounded-xl border border-gray-700 shadow-md">
          <h3 className="text-base font-bold mb-3 text-gray-200">📁 የደንበኞች Excel ፋይል ስቀል</h3>
          <form onSubmit={handleUploadExcel} className="flex flex-wrap gap-3 items-center">
            <input
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={(e) => setFile(e.target.files[0])}
              className="bg-gray-900 border border-gray-700 p-2 rounded text-sm text-gray-300 flex-1 min-w-[240px]"
            />
            <button
              type="submit"
              disabled={uploading}
              className="bg-yellow-400 text-black font-bold px-5 py-2.5 rounded text-sm hover:bg-yellow-500 transition disabled:opacity-50"
            >
              {uploading ? "በመጫን ላይ..." : "ፋይሉን ጫን"}
            </button>
          </form>
        </div>

        {/* የደንበኞች ዝርዝር እና የፍለጋ/ማጣሪያ ክፍል */}
        <div className="bg-gray-800 p-5 rounded-xl border border-gray-700 shadow-md flex-grow">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3">
            <h3 className="text-base font-bold text-gray-200">📞 የደንበኞች ጥሪ ዝርዝር ({filteredLeads.length} ከ {leads.length})</h3>
            
            {leads.length > 0 && (
              <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer bg-gray-900 px-3 py-1.5 rounded border border-gray-700">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={filteredLeads.length > 0 && selectedLeadIds.length === filteredLeads.length}
                    className="w-4 h-4 accent-yellow-400 cursor-pointer"
                  />
                  ሁሉንም ምረጥ
                </label>

                <button
                  onClick={handleDeleteSelected}
                  disabled={selectedLeadIds.length === 0}
                  className="bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white px-4 py-1.5 rounded text-xs font-bold transition"
                >
                  🗑️ አጥፋ ({selectedLeadIds.length})
                </button>
              </div>
            )}
          </div>

          {/* 👈 የፍለጋ (Search Input) እና የሁኔታ ማጣሪያ (Status Filter Dropdown) መቆጣጠሪያ */}
          <div className="flex flex-col md:flex-row gap-3 mb-4">
            <input
              type="text"
              placeholder="🔍 በደንበኛ ስም፣ በስልክ ቁጥር ወይም በአድራሻ ይፈልጉ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-gray-900 border border-gray-700 text-white p-2.5 rounded text-xs flex-1"
            />

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-gray-900 border border-gray-700 text-yellow-400 p-2.5 rounded text-xs font-semibold"
            >
              <option value="ሁሉም">ሁሉም ሁኔታዎች (All Statuses)</option>
              <option value="ያልተደወለ">ያልተደወለ</option>
              <option value="በጥበቃ ላይ">በጥበቃ ላይ</option>
              <option value="ያልተነሳ">ያልተነሳ</option>
              <option value="ጥሪው ያበቃ">ጥሪው ያበቃ</option>
              <option value="ተስማምቷል">ተስማምቷል</option>
            </select>
          </div>

          <div className="flex flex-col gap-3">
            {filteredLeads.map((lead, index) => (
              <div key={lead._id} className="bg-gray-900 border border-gray-700 p-4 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selectedLeadIds.includes(lead._id)}
                    onChange={() => handleSelectOne(lead._id)}
                    className="mt-1 w-4 h-4 accent-yellow-400 cursor-pointer"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-gray-800 text-yellow-400 px-2 py-0.5 rounded font-mono">#{index + 1}</span>
                      <h4 className="font-bold text-yellow-400 text-base">{lead.name}</h4>
                    </div>

                    <p className="text-xs text-gray-300 mt-1">
                      ስልክ: <a href={`tel:${lead.phone}`} className="text-blue-400 underline font-semibold">{lead.phone}</a> | 
                      አድራሻ: {lead.address || "አልተጠቀሰም"} | 
                      የስራ ዓይነት: {lead.businessType || "አልተጠቀሰም"}
                    </p>

                    <p className="text-xs text-gray-400 mt-1">
                      የቀድሞ ሁኔታ: <span className="text-yellow-200 font-semibold">{lead.status}</span> | 
                      አስተያየት/ሁኔታ: <span className="text-green-400 font-medium">{lead.comment || "ምንም የለም"}</span>
                    </p>
                    
                    <div className="text-[11px] text-gray-500 mt-1 flex gap-3">
                      {lead.uploadedBy && <span>የጫነው: {lead.uploadedBy}</span>}
                      {lead.updatedBy && <span>ያዘመነው: {lead.updatedBy}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 items-center w-full md:w-auto">
                  <select
                    value={statuses[lead._id] || lead.status}
                    onChange={(e) => setStatuses({ ...statuses, [lead._id]: e.target.value })}
                    className="bg-gray-800 border border-gray-700 text-white p-2 rounded text-xs"
                  >
                    <option value="ያልተደወለ">ያልተደወለ</option>
                    <option value="በጥበቃ ላይ">በጥበቃ ላይ</option>
                    <option value="ያልተነሳ">ያልተነሳ</option>
                    <option value="ጥሪው ያበቃ">ጥሪው ያበቃ</option>
                    <option value="ተስማምቷል">ተስማምቷል</option>
                  </select>

                  <input
                    type="text"
                    placeholder="አስተያየት ጻፍ..."
                    value={comments[lead._id] !== undefined ? comments[lead._id] : lead.comment}
                    onChange={(e) => setComments({ ...comments, [lead._id]: e.target.value })}
                    className="bg-gray-800 border border-gray-700 text-white p-2 rounded text-xs flex-1 md:w-40"
                  />

                  <button
                    onClick={() => handleUpdateLead(lead._id)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-xs font-bold transition"
                  >
                    መዝግብ
                  </button>

                  <button
                    onClick={() => handleDeleteLead(lead._id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-xs font-bold transition"
                  >
                    አጥፋ
                  </button>
                </div>
              </div>
            ))}
            {filteredLeads.length === 0 && <p className="text-gray-400 text-sm text-center py-6">ምንም የሚዛመድ የደንበኛ መረጃ አልተገኘም።</p>}
          </div>
        </div>
      </main>
    </div>
  );
}

export default SalesDashboard;
