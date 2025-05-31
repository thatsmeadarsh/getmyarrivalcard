const { BlobServiceClient } = require('@azure/storage-blob');

// Azure Storage connection string
const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerName = 'uploads';

// Create the BlobServiceClient
const getBlobServiceClient = () => {
  if (!connectionString) {
    console.warn('Azure Storage connection string not found, using local storage');
    return null;
  }
  return BlobServiceClient.fromConnectionString(connectionString);
};

// Upload a file to Azure Blob Storage
const uploadFile = async (file, fileName) => {
  try {
    const blobServiceClient = getBlobServiceClient();
    
    // If Azure Storage is not configured, return a local path
    if (!blobServiceClient) {
      return `/uploads/${fileName}`;
    }
    
    // Get container client
    const containerClient = blobServiceClient.getContainerClient(containerName);
    
    // Create container if it doesn't exist
    try {
      await containerClient.createIfNotExists({
        access: 'blob' // Public access at the blob level
      });
    } catch (error) {
      console.warn('Error creating container, it may already exist:', error.message);
    }
    
    // Get a block blob client
    const blockBlobClient = containerClient.getBlockBlobClient(fileName);
    
    // Upload file
    await blockBlobClient.upload(file.data, file.data.length);
    
    // Return the URL of the uploaded file
    return blockBlobClient.url;
  } catch (error) {
    console.error('Error uploading file to Azure Storage:', error);
    // Fallback to local storage
    return `/uploads/${fileName}`;
  }
};

// Get a file from Azure Blob Storage
const getFile = async (fileName) => {
  try {
    const blobServiceClient = getBlobServiceClient();
    
    // If Azure Storage is not configured, return null
    if (!blobServiceClient) {
      return null;
    }
    
    // Get container client
    const containerClient = blobServiceClient.getContainerClient(containerName);
    
    // Get a block blob client
    const blockBlobClient = containerClient.getBlockBlobClient(fileName);
    
    // Download the file
    const downloadResponse = await blockBlobClient.download(0);
    
    return downloadResponse.readableStreamBody;
  } catch (error) {
    console.error('Error getting file from Azure Storage:', error);
    return null;
  }
};

module.exports = {
  uploadFile,
  getFile
};