// client/src/pages/admin/StocksPage.jsx

import React from 'react';
import { useOutletContext } from 'react-router-dom';
import AddCredentialForm from '@/components/AddCredentialForm.jsx';
import ManageCredentials from '@/components/ManageCredentials.jsx';
import AccessDenied from '@/components/admin/AccessDenied.jsx'; // Naya import

const StocksPage = () => {
    const {
        adminUser, // adminUser ko context se lein
        products,
        manageCredentialsRef,
        handleStockChange,
        handleEditCredential
    } = useOutletContext();

    // --- NAYA PERMISSION CHECK ---
    if (!adminUser?.permissions?.manageStock) {
        return <AccessDenied pageName="Manage Stocks" />;
    }
    // --- CHECK KHATAM ---

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Manage Stocks (Credentials)</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <AddCredentialForm
                    products={products}
                    onStockChange={handleStockChange}
                />
                <ManageCredentials
                    ref={manageCredentialsRef}
                    products={products}
                    onStockChange={handleStockChange}
                    onEdit={handleEditCredential}
                />
            </div>
        </div>
    );
};

export default StocksPage;