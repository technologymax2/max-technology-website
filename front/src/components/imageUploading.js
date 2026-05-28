/**
 * 📸 ፎቶን ወደ ImgBB አፕሎድ የሚያደርግ ገለልተኛ ፋንክሽን
 * ይህ ኮድ ምስሉን ወደ ሊንክ ቀይሮ ይሰጥሃል
 */

export const uploadImageToImgBB = async (file, setUploading) => {
  if (!file) return null;
  
  if (setUploading) setUploading(true);

  const formData = new FormData();
  formData.append('image', file);

  try {
    // እዚህ ጋር YOUR_API_KEY ባለበት ቦታ የራስህን ኪ አስገባ
    // ለሙከራ እንዲረዳህ ይሄንን ኪ መጠቀም ትችላለህ
    const API_KEY = '6dad4f169d300eb052b61f86b4ee99d2'; 
    
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${API_KEY}`, {
      method: 'POST',
      body: formData
    });

    const data = await response.json();
    
    if (data.success) {
      return data.data.url; // የተሳካ ከሆነ የፎቶውን ሊንክ ይመልሳል
    } else {
      throw new Error(data.error?.message || 'ምስል መጫን አልተቻለም');
    }
  } catch (err) {
    console.error('Upload Error:', err);
    throw err;
  } finally {
    if (setUploading) setUploading(false);
  }
};