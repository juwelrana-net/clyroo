// client/src/pages/admin/NotificationsPage.jsx

import React from 'react';
import { useOutletContext } from 'react-router-dom'; // Import karein
import NotificationSettingsForm from '@/components/NotificationSettingsForm.jsx';
import AccessDenied from '@/components/admin/AccessDenied.jsx'; // Naya import

const NotificationsPage = () => {
    // --- NAYA PERMISSION CHECK ---
    const { adminUser } = useOutletContext(); // adminUser ko context se lein
    if (!adminUser?.permissions?.manageNotifications) {
        return <AccessDenied pageName="Manage Notifications" />;
    }
    // --- CHECK KHATAM ---

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Sale Notifications</h1>
            <div className="max-w-2xl mx-auto">
                <NotificationSettingsForm />
            </div>
        </div>
    );
};

export default NotificationsPage;