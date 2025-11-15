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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">

                {/* Column 1: Add Link */}
                <div className="lg:col-span-1">
                    <AddContactForm
                        onContactChange={handleContactChange}
                    />
                </div>

                {/* Column 2: Manage Links */}
                <div className="lg:col-span-2">
                    <ManageContactLinks
                        contactLinks={contactLinks}
                        onContactChange={handleContactChange}
                        onEdit={handleEditContactLink}
                    />
                </div>
            </div>
        </div>
    );
};

export default ContactsPage;