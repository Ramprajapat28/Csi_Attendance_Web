import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../components/AuthProvider';
import { adminAPI, qrAPI } from '../api/api';

const Home = () => {
  const { user } = useAuth();
  const [todaysAttendance, setTodaysAttendance] = useState([]);
  const [qrCodes, setQrCodes] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.role === 'organization') {
      loadAdminData();
    }
  }, [user]);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [attendanceRes, qrRes] = await Promise.all([
        adminAPI.getTodaysAttendance(),
        adminAPI.getOrgQRCodes()
      ]);
      
      setTodaysAttendance(attendanceRes.data.records || []);
      setQrCodes(qrRes.data);
    } catch (error) {
      console.error('Failed to load admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateNewQR = async (qrType) => {
    try {
      await qrAPI.generateQR(qrType);
      loadAdminData(); // Refresh data
      alert(`New ${qrType} QR code generated successfully!`);
    } catch (error) {
      alert(`Failed to generate QR: ${error.response?.data?.message}`);
    }
  };

  return (
    <div className="home">
      <h2>Welcome, {user?.name}!</h2>
      
      {user?.role === 'user' && (
        <div className="user-dashboard">
          <div className="quick-actions">
            <Link to="/scanner" className="action-btn scan-btn">
              📱 Scan QR Code
            </Link>
            <Link to="/profile" className="action-btn profile-btn">
              👤 View Profile
            </Link>
          </div>
          
          <div className="info-card">
            <h3>Instructions</h3>
            <ul>
              <li>Use "Scan QR Code" to mark your attendance</li>
              <li>Select check-in or check-out before scanning</li>
              <li>View your attendance history in Profile</li>
            </ul>
          </div>
        </div>
      )}

      {user?.role === 'organization' && (
        <div className="admin-dashboard">
          <div className="dashboard-stats">
            <div className="stat-card">
              <h4>Today's Attendance</h4>
              <p className="stat-number">{todaysAttendance.length}</p>
            </div>
          </div>

          <div className="qr-management">
            <h3>QR Code Management</h3>
            <div className="qr-actions">
              <button 
                onClick={() => generateNewQR('check-in')}
                className="action-btn"
              >
                Generate Check-in QR
              </button>
              <button 
                onClick={() => generateNewQR('check-out')}
                className="action-btn"
              >
                Generate Check-out QR
              </button>
            </div>
            
            {qrCodes && (
              <div className="current-qrs">
                <div className="qr-display">
                  <h4>Current Check-in QR</h4>
                  {qrCodes.checkInQRCode?.qrImageData && (
                    <img 
                      src={qrCodes.checkInQRCode.qrImageData} 
                      alt="Check-in QR" 
                      className="qr-image"
                    />
                  )}
                </div>
                
                <div className="qr-display">
                  <h4>Current Check-out QR</h4>
                  {qrCodes.checkOutQRCode?.qrImageData && (
                    <img 
                      src={qrCodes.checkOutQRCode.qrImageData} 
                      alt="Check-out QR" 
                      className="qr-image"
                    />
                  )}
                </div>
              </div>
            )}
          </div>

          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className="attendance-summary">
              <h3>Today's Attendance Summary</h3>
              {todaysAttendance.length > 0 ? (
                <div className="attendance-table">
                  {todaysAttendance.map((record) => (
                    <div key={record._id} className="attendance-row">
                      <span>{record.userId?.name}</span>
                      <span className={`type ${record.type}`}>{record.type}</span>
                      <span>{new Date(record.timestamp).toLocaleTimeString()}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No attendance records today.</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Home;
