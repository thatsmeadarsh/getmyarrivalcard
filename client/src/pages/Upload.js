import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const Upload = () => {
  const [file, setFile] = useState(null);
  const [extracting, setExtracting] = useState(false);
  const [extractionComplete, setExtractionComplete] = useState(false);
  const formikRef = useRef();
  const navigate = useNavigate();
  
  // Handle file change
  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setExtracting(true);
      
      // Create form data
      const formData = new FormData();
      formData.append('itinerary', selectedFile);
      
      try {
        // Extract data from PDF
        const res = await axios.post('/api/itineraries/extract', formData);
        
        // Update form values with extracted data
        if (res.data.success && formikRef.current) {
          formikRef.current.setValues({
            ...formikRef.current.values,
            ...res.data.data
          });
          setExtractionComplete(true);
        }
      } catch (err) {
        console.error('Error extracting data:', err);
      } finally {
        setExtracting(false);
      }
    }
  };
  
  return (
    <div className="container mt-5">
      <h1>Upload Your Itinerary</h1>
      
      {/* Highlighted PDF upload section */}
      <div className="card mb-4 bg-light">
        <div className="card-body text-center">
          <h2>Step 1: Upload Your Itinerary PDF</h2>
          <p>Upload your travel itinerary PDF to automatically extract information</p>
          
          <div className="mb-3">
            <input
              type="file"
              id="itinerary-file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="form-control"
              style={{ display: 'none' }}
            />
            <label htmlFor="itinerary-file" className="btn btn-primary">
              {file ? file.name : 'Choose PDF file'}
            </label>
          </div>
          
          {extracting && <p className="text-info">Extracting data from your PDF...</p>}
          {extractionComplete && <p className="text-success">Data extracted successfully! Please verify the information below.</p>}
        </div>
      </div>
      
      <h2>Step 2: Verify and Complete Your Information</h2>
      
      <Formik
        innerRef={formikRef}
        initialValues={{
          destinationCountry: '',
          arrivalDate: '',
          departureDate: '',
          flightNumber: '',
          airline: '',
          accommodationAddress: '',
          accommodationPhone: '',
          purpose: 'tourism'
        }}
        validationSchema={Yup.object({
          destinationCountry: Yup.string().required('Required'),
          arrivalDate: Yup.date().required('Required'),
          departureDate: Yup.date().required('Required'),
          flightNumber: Yup.string().required('Required'),
          airline: Yup.string().required('Required'),
          accommodationAddress: Yup.string().required('Required'),
          purpose: Yup.string().required('Required')
        })}
        onSubmit={async (values, { setSubmitting }) => {
          const formData = new FormData();
          if (file) {
            formData.append('itinerary', file);
          }
          
          // Append form values
          Object.keys(values).forEach(key => {
            formData.append(key, values[key]);
          });
          
          try {
            const res = await axios.post('/api/itineraries', formData);
            if (res.data.success) {
              navigate('/dashboard');
            }
          } catch (err) {
            console.error('Error uploading itinerary:', err);
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <div className="mb-3">
              <label htmlFor="destination-country" className="form-label">Destination Country</label>
              <Field name="destinationCountry" type="text" id="destination-country" className="form-control" />
              <ErrorMessage name="destinationCountry" component="div" className="text-danger" />
            </div>
            
            <div className="mb-3">
              <label htmlFor="arrival-date" className="form-label">Arrival Date</label>
              <Field name="arrivalDate" type="date" id="arrival-date" className="form-control" />
              <ErrorMessage name="arrivalDate" component="div" className="text-danger" />
            </div>
            
            <div className="mb-3">
              <label htmlFor="departure-date" className="form-label">Departure Date</label>
              <Field name="departureDate" type="date" id="departure-date" className="form-control" />
              <ErrorMessage name="departureDate" component="div" className="text-danger" />
            </div>
            
            <div className="mb-3">
              <label htmlFor="flight-number" className="form-label">Flight Number</label>
              <Field name="flightNumber" type="text" id="flight-number" className="form-control" />
              <ErrorMessage name="flightNumber" component="div" className="text-danger" />
            </div>
            
            <div className="mb-3">
              <label htmlFor="airline-input" className="form-label">Airline</label>
              <Field name="airline" type="text" id="airline-input" className="form-control" />
              <ErrorMessage name="airline" component="div" className="text-danger" />
            </div>
            
            <div className="mb-3">
              <label htmlFor="accommodation-address" className="form-label">Accommodation Address</label>
              <Field name="accommodationAddress" as="textarea" id="accommodation-address" className="form-control" />
              <ErrorMessage name="accommodationAddress" component="div" className="text-danger" />
            </div>
            
            <div className="mb-3">
              <label htmlFor="accommodation-phone" className="form-label">Accommodation Phone</label>
              <Field name="accommodationPhone" type="text" id="accommodation-phone" className="form-control" />
              <ErrorMessage name="accommodationPhone" component="div" className="text-danger" />
            </div>
            
            <div className="mb-3">
              <label htmlFor="purpose-select" className="form-label">Purpose of Travel</label>
              <Field name="purpose" as="select" id="purpose-select" className="form-control">
                <option value="tourism">Tourism</option>
                <option value="business">Business</option>
                <option value="education">Education</option>
                <option value="other">Other</option>
              </Field>
              <ErrorMessage name="purpose" component="div" className="text-danger" />
            </div>
            
            <button type="submit" className="btn btn-primary" disabled={isSubmitting || extracting}>
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default Upload;