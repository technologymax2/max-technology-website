export const uploadImageToImgBB = async (file, setUploading) => {
  if (!file) {
    alert("እባክዎ መጀመሪያ ፋይል ይምረጡ!");
    return null;
  }
  
  if (setUploading) setUploading(true);

  const API_KEY = 'ebd592608f4dba1e8271bec8e920c408'; 
  const formData = new FormData();
  formData.append('image', file);
  // አንዳንድ ጊዜ key-ውን እንደ formData አካል መላክ ሊያስፈልግ ይችላል
  formData.append('key', API_KEY); 

  try {
    const response = await fetch(`https://api.imgbb.com/1/upload`, {
      method: 'POST',
      body: formData
    });

    const data = await response.json();
    
    if (data.success) {
      return data.data.url;
    } else {
      throw new Error(data.error?.message || 'ምስሉን ወደ ሰርቨር መላክ አልተቻለም');
    }
  } catch (err) {
    console.error('Upload Error:', err);
    throw err;
  } finally {
    if (setUploading) setUploading(false);
  }
};