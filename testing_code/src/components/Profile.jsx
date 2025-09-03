import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { attendanceAPI } from '../api/api';

const Profile = () => {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAttendance();
  }, []);

  const loadAttendance = async () => {
    try {
      const response = await attendanceAPI.getPastAttendance();
      setAttendance(response.data.records || []);
    } catch (error) {
      console.error('Failed to load attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="profile">
      <h2>Profile</h2>
      
      <div className="profile-info">
        <h3>User Information</h3>
        <p><strong>Name:</strong> {user?.name}</p>
        <p><strong>Email:</strong> {user?.email}</p>
        <p><strong>Role:</strong> {user?.role}</p>
        {user?.organization && (
          <p><strong>Organization:</strong> {user.organization.name}</p>
        )}
      </div>

      {user?.role === 'user' && (
        <div className="attendance-history">
          <h3>Recent Attendance</h3>
          {loading ? (
            <p>Loading attendance...</p>
          ) : attendance.length > 0 ? (
            <div className="attendance-list">
              {attendance.slice(0, 10).map((record) => (
                <div key={record._id} className="attendance-item">
                  <span className={`type ${record.type}`}>{record.type}</span>
                  <span className="time">{formatDate(record.timestamp)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p>No attendance records found.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Profile;
