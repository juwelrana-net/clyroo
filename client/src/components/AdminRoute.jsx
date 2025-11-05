// client/src/components/AdminRoute.jsx

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const AdminRoute = () => {
    const token = localStorage.getItem('adminToken');

    // Check karein ki token hai ya nahi
    if (token) {
        // Agar token hai, toh children components (jaise Dashboard) ko render karein
        return <Outlet />;
    } else {
        // Agar token nahi hai, toh login page par bhej dein
        return <Navigate to="/login" replace />;
    }
};

export default AdminRoute;