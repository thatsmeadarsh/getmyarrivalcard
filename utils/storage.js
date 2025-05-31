const azureStorage = require('./azureStorage');
const localStorage = require('./localStorage');

// Determine which storage to use based on environment
const isProduction = process.env.NODE_ENV === 'production';

// Upload a file to the appropriate storage
const uploadFile = async (file, fileName) => {
  if (isProduction) {
    return await azureStorage.uploadFile(file, fileName);
  } else {
    return await localStorage.uploadFile(file, fileName);
  }
};

// Get a file from the appropriate storage
const getFile = async (fileName) => {
  if (isProduction) {
    return await azureStorage.getFile(fileName);
  } else {
    return await localStorage.getFile(fileName);
  }
};

module.exports = {
  uploadFile,
  getFile
};