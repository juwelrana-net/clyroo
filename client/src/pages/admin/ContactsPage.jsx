// client/src/pages/admin/ContactsPage.jsx

import React from 'react';
import { useOutletContext } from 'react-router-dom';
import AddContactForm from '@/components/AddContactForm.jsx';
import ManageContactLinks from '@/components/ManageContactLinks.jsx';
import AccessDenied from '@/components/admin/AccessDenied.jsx'; // Naya import

const ContactsPage = () => {
    const {
        adminUser, // adminUser ko context se lein
        contactLinks,
        handleContactChange,
        handleEditContactLink
    } = useOutletContext();

    // --- NAYA PERMISSION CHECK ---
    if (!adminUser?.permissions?.manageContacts) {
        return <AccessDenied pageName="Manage Contacts" />;
    }
    // --- CHECK KHATAM ---

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Manage Contact Links</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <AddContactForm
                    onContactChange={handleContactChange}
                />
                <ManageContactLinks
                    contactLinks={contactLinks}
                    onContactChange={handleContactChange}
                    onEdit={handleEditContactLink}
                />
            </div>
        </div>
    );
};

export default ContactsPage;