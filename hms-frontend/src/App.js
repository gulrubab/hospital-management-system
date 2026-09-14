import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Patients from "./components/Patients";
import Doctors from "./components/Doctors";
import Appointment from "./components/Appointment";
import Prescriptions from "./components/Prescriptions";
import Billing from "./components/Billing";
import Pharmacy from "./components/Pharmacy";  // ✅ Add this import
import Reports from "./components/Reports";  // ✅ Add this import
import LabReports from "./components/LabReports";
import Sidebar from "./components/Sidebar";

const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem("access_token");
    return token ? children : <Navigate to="/login" />;
};

const Layout = ({ children }) => {
    return (
        <div style={{ display: "flex" }}>
            <Sidebar />
            <div style={{ flex: 1, marginLeft: "250px", padding: "20px", overflowX: "hidden", minWidth: 0 }}>
                {children}
            </div>
        </div>
    );
};

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
                <Route path="/patients" element={<ProtectedRoute><Layout><Patients /></Layout></ProtectedRoute>} />
                <Route path="/doctors" element={<ProtectedRoute><Layout><Doctors /></Layout></ProtectedRoute>} />
                <Route path="/appointments" element={<ProtectedRoute><Layout><Appointment /></Layout></ProtectedRoute>} />
                <Route path="/prescriptions" element={<ProtectedRoute><Layout><Prescriptions /></Layout></ProtectedRoute>} />
                <Route path="/billing" element={<ProtectedRoute><Layout><Billing /></Layout></ProtectedRoute>} />
                <Route path="/pharmacy" element={<ProtectedRoute><Layout><Pharmacy /></Layout></ProtectedRoute>} />  {/* ✅ Add this route */}
                <Route path="/reports" element={<ProtectedRoute><Layout><Reports /></Layout></ProtectedRoute>} />
                <Route path="/lab-reports" element={<ProtectedRoute><Layout><LabReports /></Layout></ProtectedRoute>} />  {/* ✅ Add this route */}
                <Route path="/" element={<Navigate to="/dashboard" />} />
            </Routes>
        </Router>
    );
}

export default App;


