// client/src/pages/AdminDashboardPage.jsx

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button.jsx';
import AddProductForm from '@/components/AddProductForm.jsx';
import AddCredentialForm from '@/components/AddCredentialForm.jsx';
import ManageCredentials from '@/components/ManageCredentials.jsx';
import ManageProducts from '@/components/ManageProducts.jsx';
import EditProductForm from '@/components/EditProductForm.jsx';
import ManagePaymentMethods from '@/components/ManagePaymentMethods.jsx';
import AddPaymentMethodForm from '@/components/AddPaymentMethodForm.jsx';
import EditCredentialForm from '@/components/EditCredentialForm.jsx';
import EditPaymentMethodForm from '@/components/EditPaymentMethodForm.jsx'; // <-- Naya popup import karein
import { Loader2 } from 'lucide-react';

const AdminDashboardPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [isCredEditOpen, setIsCredEditOpen] = useState(false);
    const [editingCredential, setEditingCredential] = useState(null);

    const [paymentMethods, setPaymentMethods] = useState([]);
    const [loadingMethods, setLoadingMethods] = useState(true);
    const managePaymentMethodsRef = useRef(null);

    // --- NAYE STATE EDIT POPUP KE LIYE ---
    const [isPaymentEditOpen, setIsPaymentEditOpen] = useState(false);
    const [editingPaymentMethod, setEditingPaymentMethod] = useState(null);

    const manageCredentialsRef = useRef(null);

    const fetchProducts = async () => {
        try {
            const res = await axios.get('/api/products');
            setProducts(res.data);
        } catch (err) {
            console.error("Products fetch nahi ho paye", err);
        } finally {
            if (loading) setLoading(false);
        }
    };

    const fetchPaymentMethods = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const res = await axios.get('/api/payment-methods/admin', {
                headers: { 'x-auth-token': token }
            });
            setPaymentMethods(res.data);
        } catch (err) {
            console.error("Payment methods fetch nahi ho paye", err);
        } finally {
            if (loadingMethods) setLoadingMethods(false);
        }
    };

    useEffect(() => {
        fetchProducts();
        fetchPaymentMethods();
    }, []);

    const handleEditProduct = (product) => {
        setEditingProduct(product);
        setIsEditOpen(true);
    };

    const handleEditCredential = (credential) => {
        setEditingCredential(credential);
        setIsCredEditOpen(true);
    };

    // --- NAYA FUNCTION EDIT POPUP KHOLNE KE LIYE ---
    const handleEditPaymentMethod = (method) => {
        setEditingPaymentMethod(method);
        setIsPaymentEditOpen(true);
    };

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        navigate('/login');
    };

    const handlePaymentMethodChange = () => {
        fetchPaymentMethods();
        if (managePaymentMethodsRef.current) {
            managePaymentMethodsRef.current.refreshList();
        }
    };

    if (loading || loadingMethods) {
        return <div className="min-h-screen flex items-center justify-center text-primary"><Loader2 className="animate-spin mr-2" size={24} /> Loading...</div>;
    }

    return (
        <div className="container mx-auto max-w-7xl px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-4xl font-bold text-primary">Admin Dashboard</h1>
                <Button variant="outline" onClick={handleLogout}>Logout</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Column 1: Product Management */}
                <div className="space-y-8 lg:col-span-1">
                    <AddProductForm onProductChange={fetchProducts} />
                    <ManageProducts
                        products={products}
                        onProductChange={fetchProducts}
                        onEdit={handleEditProduct}
                    />
                </div>

                {/* Column 2: Credential (Stock) Management */}
                <div className="space-y-8 lg:col-span-1">
                    <AddCredentialForm products={products} onStockChange={fetchProducts} />
                    <ManageCredentials ref={manageCredentialsRef} products={products} onStockChange={fetchProducts} onEdit={handleEditCredential} />
                </div>

                {/* Column 3: Payment Method Management */}
                <div className="space-y-8 lg:col-span-1">
                    <AddPaymentMethodForm onMethodChange={handlePaymentMethodChange} />
                    <ManagePaymentMethods
                        ref={managePaymentMethodsRef}
                        paymentMethods={paymentMethods}
                        onMethodChange={handlePaymentMethodChange}
                        onEdit={handleEditPaymentMethod} // <-- Edit function ko yahaan pass karein
                    />
                </div>
            </div>

            {/* Edit Product Popup */}
            {isEditOpen && (
                <EditProductForm
                    product={editingProduct}
                    isOpen={isEditOpen}
                    onClose={() => setIsEditOpen(false)}
                    onProductChange={fetchProducts}
                />
            )}

            {/* Edit Credential Popup */}
            {isCredEditOpen && (
                <EditCredentialForm
                    credential={editingCredential}
                    isOpen={isCredEditOpen}
                    onClose={() => setIsCredEditOpen(false)}
                    onCredentialChange={() => {
                        fetchProducts();
                        if (manageCredentialsRef.current) {
                            manageCredentialsRef.current.refreshList();
                        }
                    }}
                />
            )}

            {/* --- NAYA EDIT POPUP RENDER KAREIN --- */}
            {isPaymentEditOpen && (
                <EditPaymentMethodForm
                    method={editingPaymentMethod}
                    isOpen={isPaymentEditOpen}
                    onClose={() => setIsPaymentEditOpen(false)}
                    onMethodChange={handlePaymentMethodChange}
                />
            )}

        </div>
    );
};

export default AdminDashboardPage;