// client/src/components/admin/AdminSidebar.jsx

import React from 'react';
import AdminSidebarContent from './AdminSidebarContent.jsx';

const AdminSidebar = () => {
    return (
        // --- YAHAN SE `m-4` HATA DIYA GAYA HAI ---
        // `flex-shrink-0` add kiya taaki yeh chhota na ho
        <aside className="hidden md:block w-64 bg-background rounded-xl border border-border shadow-lg flex-shrink-0">
            <AdminSidebarContent />
        </aside>
    );
};

export default AdminSidebar;