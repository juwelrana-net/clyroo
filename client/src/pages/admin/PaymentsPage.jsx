// client/src/pages/admin/PaymentsPage.jsx

import React from 'react';
import { useOutletContext } from 'react-router-dom';
import AddPaymentMethodForm from '@/components/AddPaymentMethodForm.jsx';
import ManagePaymentMethods from '@/components/ManagePaymentMethods.jsx';
import AccessDenied from '@/components/admin/AccessDenied.jsx'; // Naya import

const PaymentsPage = () => {
    const {
        adminUser, // adminUser ko context se lein
        paymentMethods,
        managePaymentMethodsRef,
        handlePaymentMethodChange,
        handleEditPaymentMethod
    } = useOutletContext();

    // --- NAYA PERMISSION CHECK ---
    if (!adminUser?.permissions?.managePayments) {
        return <AccessDenied pageName="Manage Payments" />;
    }
    // --- CHECK KHATAM ---

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Manage Payment Methods</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <AddPaymentMethodForm
                    onMethodChange={handlePaymentMethodChange}
                />
                <ManagePaymentMethods
                    ref={managePaymentMethodsRef}
                    paymentMethods={paymentMethods}
                    onMethodChange={handlePaymentMethodChange}
                    onEdit={handleEditPaymentMethod}
                />
            </div>
        </div>
    );
};

export default PaymentsPage;