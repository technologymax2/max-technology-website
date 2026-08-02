import React, { useState, useEffect, useCallback } from "react";

function SalesDashboard({ user, API_BASE_URL }) {
  const [leads, setLeads] = useState([]);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [comments, setComments] = useState({});
  const [statuses, setStatuses] = useState({});

  const fetchLeads = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/sales/leads`);
      const data = await res.json();
      if (data.success) setLeads(data.leads);
    } catch (err) {
      console.error("ሊንኮችን ማምጣት አልተቻለም");
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

  // የጥሪ ሁኔታ እና አስተያየት መላኪያ
  const handleUpdateLead = async (id) => {
    const status = statuses[id] || "ያልተደወለ";
    const comment = comments[id] || "";

    try {
      const res = await fetch(`${API_BASE_URL}/api/sales/leads/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, comment, salesPerson: user?.name }),
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

  return (
    <div className="p-4 text-white bg-[#0d0f12] min-h-screen">
      <h2 className="text-xl font-bold mb-4">🛒 የሽያጭ እና የጥሪ ማስተዳደሪያ (Sales CRM)</h2>

      {/* ኤክሴል ፋይል መጫኛ ፎርም */}
      <div className="bg-[#161b22] p-4 rounded-xl border border-[#30363d] mb-6">
        <h3 className="text-base font-bold mb-2">📁 የደንበኞች Excel ፋይል ስቀል</h3>
        <form onSubmit={handleUploadExcel} className="flex gap-3 items-center">
          <input
            type="file"
            accept=".xlsx, .xls, .csv"
            onChange={(e) => setFile(e.target.files[0])}
            className="bg-[#0d0f12] border border-[#30363d] p-2 rounded text-sm text-white"
          />
          <button
            type="submit"
            disabled={uploading}
            className="bg-yellow-400 text-black font-bold px-4 py-2 rounded text-sm hover:bg-yellow-500 transition"
          >
            {uploading ? "በመጫን ላይ..." : "ፋይሉን ጫን"}
          </button>
        </form>
      </div>

      {/* የደንበኞች ዝርዝር እና የጥሪ ሁኔታ መቆጣጠሪያ */}
      <div className="bg-[#161b22] p-4 rounded-xl border border-[#30363d]">
        <h3 className="text-base font-bold mb-3">📞 የደንበኞች ጥሪ ዝርዝር ({leads.length})</h3>
        <div className="flex flex-col gap-3">
          {leads.map((lead) => (
            <div key={lead._id} className="bg-[#0d0f12] border border-[#30363d] p-3 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
              <div>
                <h4 className="font-bold text-yellow-400">{lead.name}</h4>
                <p className="text-xs text-gray-300">ስልክ: <a href={`tel:${lead.phone}`} className="text-blue-400 underline">{lead.phone}</a> | አድራሻ: {lead.address || "አልተጠቀሰም"}</p>
                <p className="text-xs text-gray-400 mt-1">የቀድሞ ሁኔታ: <span className="text-white font-semibold">{lead.status}</span> | አስተያየት: {lead.comment || "ምንም የለም"}</p>
              </div>

              <div className="flex flex-wrap gap-2 items-center w-full md:w-auto">
                <select
                  value={statuses[lead._id] || lead.status}
                  onChange={(e) => setStatuses({ ...statuses, [lead._id]: e.target.value })}
                  className="bg-[#161b22] border border-[#30363d] text-white p-1.5 rounded text-xs"
                >
                  <option value="ያልተደወለ">ያልተደወለ</option>
                  <option value="ያልተነሳ">ያልተነሳ</option>
                  <option value="ጥሪው ያበቃ">ጥሪው ያበቃ</option>
                  <option value="ተስማምቷል">ተስማምቷል</option>
                </select>

                <input
                  type="text"
                  placeholder="አስተያየት ጻፍ..."
                  value={comments[lead._id] !== undefined ? comments[lead._id] : lead.comment}
                  onChange={(e) => setComments({ ...comments, [lead._id]: e.target.value })}
                  className="bg-[#161b22] border border-[#30363d] text-white p-1.5 rounded text-xs flex-1 md:w-36"
                />

                <button
                  onClick={() => handleUpdateLead(lead._id)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-xs font-bold"
                >
                  መዝግብ
                </button>
              </div>
            </div>
          ))}
          {leads.length === 0 && <p className="text-gray-400 text-sm">ምንም ደንበኛ አልተመዘገበም እባክዎ Excel ፋይል ይስቀሉፋ።</p>}
        </div>
      </div>
    </div>
  );
}

export default SalesDashboard;
