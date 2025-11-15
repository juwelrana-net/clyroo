// client/src/components/admin/AdminSidebar.jsx

import React from 'react';
import AdminSidebarContent from './AdminSidebarContent.jsx';

// adminUser prop receive karein
const AdminSidebar = ({ adminUser }) => {
    return (
        <aside className="hidden md:block w-64 bg-background rounded-xl border border-border shadow-lg flex-shrink-0">
            {/* adminUser prop ko AdminSidebarContent mein pass karein */}
            <AdminSidebarContent adminUser={adminUser} />
        </aside>
    );
};

export default AdminSidebar;