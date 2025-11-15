// client/src/pages/admin/StocksPage.jsx

import React from 'react';
import { useOutletContext } from 'react-router-dom';
import AddCredentialForm from '@/components/AddCredentialForm.jsx';
import ManageCredentials from '@/components/ManageCredentials.jsx';

const StocksPage = () => {
    // AdminLayout (parent) se data aur functions receive karein
    const {
        products,
        manageCredentialsRef,
        handleStockChange,
        handleEditCredential
    } = useOutletContext();

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Manage Stocks (Credentials)</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Column 1: Add Stock */}
                <AddCredentialForm
                    products={products}
                    onStockChange={handleStockChange}
                />

                {/* Column 2: Manage Stock */}
                <ManageCredentials
                    ref={manageCredentialsRef} // Ref ko yahaan pass karein
                    products={products}
                    onStockChange={handleStockChange}
                    onEdit={handleEditCredential}
                />
            </div>
        </div>
    );
};

export default StocksPage;