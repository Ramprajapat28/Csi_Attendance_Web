import React, { useState, useRef, useEffect } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { attendanceAPI } from '../api/api';

const QRScanner = () => {
  const [scanResult, setScanResult] = useState('');
  const [message, setMessage] = useState('');
  const [scanning, setScanning] = useState(false);
  const [attendanceType, setAttendanceType] = useState('check-in');
  const [loading, setLoading] = useState(false);
  const videoRef = useRef(null);
  const codeReader = useRef(null);

  useEffect(() => {
    codeReader.current = new BrowserMultiFormatReader();
    
    return () => {
      if (codeReader.current) {
        codeReader.current.reset();
      }
    };
  }, []);

  const startScanning = async () => {
    try {
      setScanning(true);
      setMessage('');
      setScanResult('');

      const constraints = {
        video: { facingMode: 'environment' }
      };

      await codeReader.current.decodeFromConstraints(
        constraints,
        videoRef.current,
        (result, error) => {
          if (result) {
            handleScan(result.text);
          }
          if (error && !(error.name === 'NotFoundException')) {
            console.error('QR Scanner Error:', error);
          }
        }
      );
    } catch (error) {
      console.error('Failed to start camera:', error);
      setMessage('❌ Camera access error. Please allow camera permission.');
      setScanning(false);
    }
  };

  const stopScanning = () => {
    if (codeReader.current) {
      codeReader.current.reset();
    }
    setScanning(false);
  };

  const handleScan = async (data) => {
    if (data && !loading) {
      setLoading(true);
      setScanResult(data);
      
      try {
        let qrData;
        try {
          qrData = JSON.parse(data);
        } catch {
          qrData = { code: data };
        }

        const response = await attendanceAPI.scanQR({
          code: qrData.code || data,
          type: attendanceType,
          location: { latitude: 0, longitude: 0, accuracy: 0 },
          deviceInfo: {}
        });

        setMessage(`✅ ${response.data.message}`);
        stopScanning();
        
        setTimeout(() => setMessage(''), 3000);
        
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Failed to record attendance';
        setMessage(`❌ ${errorMessage}`);
        stopScanning();
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="qr-scanner">
      <h2>QR Code Scanner</h2>
      
      <div className="scanner-controls">
        <div className="form-group">
          <label>Attendance Type:</label>
          <select 
            value={attendanceType} 
            onChange={(e) => setAttendanceType(e.target.value)}
            disabled={scanning}
          >
            <option value="check-in">Check In</option>
            <option value="check-out">Check Out</option>
          </select>
        </div>
        
        <div className="scanner-buttons">
          {!scanning ? (
            <button onClick={startScanning} className="start-scan-btn">
              Start Scanning
            </button>
          ) : (
            <button onClick={stopScanning} className="stop-scan-btn">
              Stop Scanning
            </button>
          )}
        </div>
      </div>

      {message && (
        <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      {scanning && (
        <div className="scanner-container">
          <video ref={videoRef} style={{ width: '100%', maxWidth: '400px' }} />
          
          {loading && (
            <div className="scanner-overlay">
              <div className="loading">Processing...</div>
            </div>
          )}
        </div>
      )}

      {scanResult && (
        <div className="scan-result">
          <h4>Last Scanned:</h4>
          <p>{scanResult}</p>
        </div>
      )}
    </div>
  );
};

export default QRScanner;
