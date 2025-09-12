import React from "react";
import { Admin_Navbar } from "./Admin_Navbar";
import EmployeeLayout from "./EmployeeLayout";
import { AttendanceRecordLayout } from "./AttendanceRecordLayout";
import { useAuth } from "../../context/AuthContext";
import {
  Users,
  FileText,
  BarChart3,
  QrCode,
  Home,
  TrendingUp,
  Clock,
  UserCheck,
} from "lucide-react";

const AdminHome = () => {
  const { activeAdminView, setAdminView } = useAuth();

  // Dashboard component for home view
  const Dashboard = () => (
    <div className="p-6 w-[100vw]">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Employees
              </p>
              <p className="text-3xl font-bold">248</p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Today's Attendance
              </p>
              <p className="text-3xl font-bold">189</p>
            </div>
            <UserCheck className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Attendance Rate
              </p>
              <p className="text-3xl font-bold">76%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                QR Scans Today
              </p>
              <p className="text-3xl font-bold">342</p>
            </div>
            <QrCode className="h-8 w-8 text-orange-500" />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setAdminView("qrcodes")}
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors"
          >
            <QrCode className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">
              Generate QR codes for attendance tracking and access control
            </p>
          </button>
          <button
            onClick={() => setAdminView("employees")}
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors"
          >
            <Users className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">Manage employee information and profiles</p>
          </button>
          <button
            onClick={() => setAdminView("reports")}
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors"
          >
            <FileText className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">
              View detailed attendance reports and analytics
            </p>
          </button>
        </div>
      </div>
    </div>
  );

  // QR Code Generator View
  const QRCodeView = () => (
    <div className="p-6  w-[100vw]">
      <h1 className="text-2xl font-bold mb-6">QR Code Management</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Generate QR Codes</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              QR Code Type
            </label>
            <select className="w-full p-2 border border-gray-300 rounded-md">
              <option>Check-in QR Code</option>
              <option>Check-out QR Code</option>
              <option>Event QR Code</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location/Event Name
            </label>
            <input
              type="text"
              placeholder="Enter location or event name"
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <button className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
            Generate QR Code
          </button>
        </div>
      </div>
    </div>
  );

  // Reports View (using your existing AttendanceRecordLayout)
  const ReportsView = () => (
    <div className="p-6  w-[100vw]">
      <h1 className="text-2xl font-bold mb-6">Attendance Reports</h1>
      <AttendanceRecordLayout />
    </div>
  );

  // Employees View (using your existing EmployeeLayout)
  const EmployeesView = () => (
    <div className="w-[100vw] overflow-x-hidden min-h-[100vh] p-3">
      <h1 className="text-2xl font-bold mb-6">Employee Management</h1>
      <EmployeeLayout />
    </div>
  );

  // Main render function with proper conditional rendering
  const renderContent = () => {
    switch (activeAdminView) {
      case "home":
        return <Dashboard />;
      case "employees":
        return <EmployeesView />;
      case "reports":
        return <ReportsView />;
      case "qrcodes":
        return <QRCodeView />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Admin_Navbar />
      {renderContent()}
    </div>
  );
};

export default AdminHome;
