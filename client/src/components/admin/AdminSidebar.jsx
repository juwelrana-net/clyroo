// client/src/components/admin/AdminSidebar.jsx

import React from 'react';
import AdminSidebarContent from './AdminSidebarContent.jsx';

const AdminSidebar = () => {
    return (
        // Desktop par dikhega (hidden md:block)
        // 'm-4' se margin aur 'rounded-xl' se rounded corners
        <aside className="hidden md:block w-64 bg-background m-4 rounded-xl border border-border shadow-lg">
            <AdminSidebarContent />
        </aside>
    );
};

export default AdminSidebar;