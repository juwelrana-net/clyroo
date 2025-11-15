// client/src/pages/admin/PaymentsPage.jsx

import React from 'react';
import { useOutletContext } from 'react-router-dom';
import AddPaymentMethodForm from '@/components/AddPaymentMethodForm.jsx';
import ManagePaymentMethods from '@/components/ManagePaymentMethods.jsx';

const PaymentsPage = () => {
    // AdminLayout (parent) se data aur functions receive karein
    const {
        paymentMethods,
        managePaymentMethodsRef,
        handlePaymentMethodChange,
        handleEditPaymentMethod
    } = useOutletContext();

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Manage Payment Methods</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">

                {/* Column 1: Add Method */}
                <div className="lg:col-span-1">
                    <AddPaymentMethodForm
                        onMethodChange={handlePaymentMethodChange}
                    />
                </div>

                {/* Column 2: Manage Methods */}
                <div className="lg:col-span-2">
                    <ManagePaymentMethods
                        ref={managePaymentMethodsRef} // Ref ko yahaan pass karein
                        paymentMethods={paymentMethods}
                        onMethodChange={handlePaymentMethodChange}
                        onEdit={handleEditPaymentMethod}
                    />
                </div>
            </div>
        </div>
    );
};

export default PaymentsPage;