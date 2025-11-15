// client/src/pages/admin/ContactsPage.jsx

import React from 'react';
import { useOutletContext } from 'react-router-dom';
import AddContactForm from '@/components/AddContactForm.jsx';
import ManageContactLinks from '@/components/ManageContactLinks.jsx';

const ContactsPage = () => {
    // AdminLayout (parent) se data aur functions receive karein
    const {
        contactLinks,
        handleContactChange,
        handleEditContactLink
    } = useOutletContext();

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Manage Contact Links</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Column 1: Add Link */}
                <AddContactForm
                    onContactChange={handleContactChange}
                />

                {/* Column 2: Manage Links */}
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