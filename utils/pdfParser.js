const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');

// Parse a PDF file and extract travel information
const parsePDF = async (filePath) => {
  try {
    // Read the PDF file
    const dataBuffer = fs.readFileSync(filePath);
    
    // Parse the PDF
    const data = await pdfParse(dataBuffer);
    
    // Extract text content
    const text = data.text;
    
    // In a real implementation, you would use more sophisticated parsing
    // techniques to extract structured data from the PDF
    
    // For this example, we'll use a simple approach to extract some common
    // travel information patterns
    
    // Extract destination country (simplified)
    const destinationMatch = text.match(/destination:?\s*([A-Za-z\s]+)/i) ||
                            text.match(/to:?\s*([A-Za-z\s]+)/i) ||
                            text.match(/arriving in:?\s*([A-Za-z\s]+)/i);
    
    // Extract flight information (simplified)
    const flightMatch = text.match(/flight:?\s*([A-Z0-9]+)/i) ||
                       text.match(/flight number:?\s*([A-Z0-9]+)/i);
    
    // Extract airline (simplified)
    const airlineMatch = text.match(/airline:?\s*([A-Za-z\s]+)/i) ||
                        text.match(/carrier:?\s*([A-Za-z\s]+)/i);
    
    // Extract dates (simplified)
    const datePattern = /\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4}/g;
    const dates = text.match(datePattern) || [];
    
    // Extract accommodation (simplified)
    const accommodationMatch = text.match(/hotel:?\s*([A-Za-z0-9\s,]+)/i) ||
                              text.match(/accommodation:?\s*([A-Za-z0-9\s,]+)/i) ||
                              text.match(/staying at:?\s*([A-Za-z0-9\s,]+)/i);
    
    // Return extracted information
    return {
      destinationCountry: destinationMatch ? destinationMatch[1].trim() : null,
      flightNumber: flightMatch ? flightMatch[1].trim() : null,
      airline: airlineMatch ? airlineMatch[1].trim() : null,
      dates: dates,
      accommodation: accommodationMatch ? accommodationMatch[1].trim() : null,
      rawText: text
    };
  } catch (err) {
    console.error('Error parsing PDF:', err);
    throw err;
  }
};

module.exports = {
  parsePDF
};