// client/src/pages/admin/NotificationsPage.jsx

import React from 'react';
// import { useOutletContext } from 'react-router-dom'; // Is page ko data ki zaroorat nahi hai
import NotificationSettingsForm from '@/components/NotificationSettingsForm.jsx';

const NotificationsPage = () => {
    // Is page ko AdminLayout se data lene ki zaroorat nahi hai,
    // kyunki NotificationSettingsForm apna data khud fetch aur save karta hai.

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Sale Notifications</h1>

            {/* Jaisa aapne kaha tha, yeh content page ke beech mein (max-width) dikhega */}
            <div className="max-w-2xl mx-auto">
                {/* Humne purana wrapper (bg-background, border, etc.) hata diya hai, 
                   kyunki form component mein yeh pehle se hai. */}
                <NotificationSettingsForm />
            </div>
        </div>
    );
};

export default NotificationsPage;