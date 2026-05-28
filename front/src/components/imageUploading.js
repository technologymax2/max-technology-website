export const uploadImageToImgBB = async (file, setUploading) => {
  if (!file) {
    alert("እባክዎ መጀመሪያ ፋይል ይምረጡ!");
    return null;
  }
  
  if (setUploading) setUploading(true);

  const formData = new FormData();
  formData.append('image', file);

  try {
    // እዚህ ጋር የራስዎን አዲስ የፈጠሩትን Key ያስገቡ
    const API_KEY = 'YOUR_ACTUAL_API_KEY_HERE'; 
    
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${API_KEY}`, {
      method: 'POST',
      body: formData
    });

    const data = await response.json();
    
    if (data.success) {
      return data.data.url;
    } else {
      // ስህተቱ ከባክኤንድ የሚመጣውን መረጃ በግልጽ ያሳያል
      throw new Error(data.error?.message || 'ምስሉን ወደ ሰርቨር መላክ አልተቻለም');
    }
  } catch (err) {
    console.error('Upload Error:', err);
    throw err;
  } finally {
    if (setUploading) setUploading(false);
  }
};