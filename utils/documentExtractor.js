const { DocumentAnalysisClient } = require("@azure/ai-form-recognizer");
const { AzureKeyCredential } = require("@azure/core-auth");

// Azure Document Intelligence configuration from environment variables
const endpoint = process.env.DOCUMENT_INTELLIGENCE_ENDPOINT;
const apiKey = process.env.DOCUMENT_INTELLIGENCE_KEY;

// Extract data from PDF
const extractItineraryData = async (fileBuffer) => {
  try {
    // Create client
    const client = new DocumentAnalysisClient(
      endpoint, 
      new AzureKeyCredential(apiKey)
    );
    
    // Analyze document
    const poller = await client.beginAnalyzeDocument(
      "prebuilt-document", // Using the prebuilt document model
      fileBuffer
    );
    
    // Get results
    const { documents, pages, tables } = await poller.pollUntilDone();
    
    // Extract relevant information
    const extractedData = {
      destinationCountry: extractDestinationCountry(documents, pages),
      arrivalDate: extractArrivalDate(documents, pages),
      departureDate: extractDepartureDate(documents, pages),
      flightNumber: extractFlightNumber(documents, pages),
      airline: extractAirline(documents, pages),
      accommodationAddress: extractAccommodationAddress(documents, pages),
      accommodationPhone: extractAccommodationPhone(documents, pages),
      purpose: "tourism" // Default value
    };
    
    return extractedData;
  } catch (error) {
    console.error("Error extracting data from document:", error);
    return null;
  }
};

// Helper functions to extract specific fields
const extractDestinationCountry = (documents, pages) => {
  const countryKeywords = ["destination", "country", "travel to"];
  
  for (const doc of documents || []) {
    for (const field in doc.fields) {
      const value = doc.fields[field].content?.toLowerCase() || "";
      if (countryKeywords.some(keyword => value.includes(keyword))) {
        return value.replace(/.*destination:?\s*/i, "").trim();
      }
    }
  }
  
  return "";
};

const extractArrivalDate = (documents, pages) => {
  const dateKeywords = ["arrival", "arrive", "arriving"];
  
  for (const doc of documents || []) {
    for (const field in doc.fields) {
      const value = doc.fields[field].content?.toLowerCase() || "";
      if (dateKeywords.some(keyword => value.includes(keyword))) {
        const dateMatch = value.match(/\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}/);
        if (dateMatch) return dateMatch[0];
      }
    }
  }
  
  return "";
};

const extractDepartureDate = (documents, pages) => {
  const dateKeywords = ["departure", "depart", "departing", "return"];
  
  for (const doc of documents || []) {
    for (const field in doc.fields) {
      const value = doc.fields[field].content?.toLowerCase() || "";
      if (dateKeywords.some(keyword => value.includes(keyword))) {
        const dateMatch = value.match(/\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}/);
        if (dateMatch) return dateMatch[0];
      }
    }
  }
  
  return "";
};

const extractFlightNumber = (documents, pages) => {
  const flightKeywords = ["flight", "flight number", "flight #"];
  
  for (const doc of documents || []) {
    for (const field in doc.fields) {
      const value = doc.fields[field].content?.toLowerCase() || "";
      if (flightKeywords.some(keyword => value.includes(keyword))) {
        const flightMatch = value.match(/[A-Z]{2}\s?\d{1,4}/i);
        if (flightMatch) return flightMatch[0];
      }
    }
  }
  
  return "";
};

const extractAirline = (documents, pages) => {
  const airlines = ["american airlines", "delta", "united", "lufthansa", "british airways", 
                   "air france", "emirates", "qatar airways", "singapore airlines"];
  
  for (const doc of documents || []) {
    for (const field in doc.fields) {
      const value = doc.fields[field].content?.toLowerCase() || "";
      for (const airline of airlines) {
        if (value.includes(airline)) {
          return airline.charAt(0).toUpperCase() + airline.slice(1);
        }
      }
    }
  }
  
  return "";
};

const extractAccommodationAddress = (documents, pages) => {
  const addressKeywords = ["hotel", "accommodation", "staying at", "address", "resort"];
  
  for (const doc of documents || []) {
    for (const field in doc.fields) {
      const value = doc.fields[field].content?.toLowerCase() || "";
      if (addressKeywords.some(keyword => value.includes(keyword))) {
        const lines = value.split('\n');
        for (let i = 0; i < lines.length; i++) {
          if (addressKeywords.some(keyword => lines[i].includes(keyword))) {
            return lines[i] + (lines[i+1] ? '\n' + lines[i+1] : '');
          }
        }
      }
    }
  }
  
  return "";
};

const extractAccommodationPhone = (documents, pages) => {
  const phoneKeywords = ["phone", "tel", "telephone", "contact"];
  
  for (const doc of documents || []) {
    for (const field in doc.fields) {
      const value = doc.fields[field].content?.toLowerCase() || "";
      if (phoneKeywords.some(keyword => value.includes(keyword))) {
        const phoneMatch = value.match(/\+?[\d\s\(\)\-\.]{10,20}/);
        if (phoneMatch) return phoneMatch[0];
      }
    }
  }
  
  return "";
};

module.exports = {
  extractItineraryData
};