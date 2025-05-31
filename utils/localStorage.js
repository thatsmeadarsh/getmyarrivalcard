const fs = require('fs');
const path = require('path');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Upload a file to local storage
const uploadFile = async (file, fileName) => {
  try {
    const filePath = path.join(uploadsDir, fileName);
    
    // Write file to disk
    await fs.promises.writeFile(filePath, file.data);
    
    // Return the URL of the uploaded file
    return `/uploads/${fileName}`;
  } catch (error) {
    console.error('Error uploading file to local storage:', error);
    throw error;
  }
};

// Get a file from local storage
const getFile = async (fileName) => {
  try {
    const filePath = path.join(uploadsDir, fileName);
    
    // Read file from disk
    const fileData = await fs.promises.readFile(filePath);
    
    return fileData;
  } catch (error) {
    console.error('Error getting file from local storage:', error);
    throw error;
  }
};

module.exports = {
  uploadFile,
  getFile
};