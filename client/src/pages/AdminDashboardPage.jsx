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
import PaymentSettings from '@/components/PaymentSettings.jsx';
import ApprovePayments from '@/components/ApprovePayments.jsx';
import EditCredentialForm from '@/components/EditCredentialForm.jsx';
import { Loader2 } from 'lucide-react';

const AdminDashboardPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [isCredEditOpen, setIsCredEditOpen] = useState(false);
    const [editingCredential, setEditingCredential] = useState(null);

    // ManageCredentials component ko control karne ke liye
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

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleEditProduct = (product) => {
        setEditingProduct(product);
        setIsEditOpen(true);
    };

    const handleEditCredential = (credential) => {
        setEditingCredential(credential);
        setIsCredEditOpen(true);
    };

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        navigate('/login');
    };

    if (loading) {
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

                {/* Column 3: Settings & Approvals */}
                <div className="space-y-8 lg:col-span-1">
                    <PaymentSettings />
                    <ApprovePayments />
                </div>
            </div>

            {/* Edit Popup */}
            {isEditOpen && (
                <EditProductForm
                    product={editingProduct}
                    isOpen={isEditOpen}
                    onClose={() => setIsEditOpen(false)}
                    onProductChange={fetchProducts}
                />
            )}

            {isCredEditOpen && (
                <EditCredentialForm
                    credential={editingCredential}
                    isOpen={isCredEditOpen}
                    onClose={() => setIsCredEditOpen(false)}

                    // onCredentialChange ko update karein
                    onCredentialChange={() => {
                        // 1. Product list refresh karein (Stock count ke liye)
                        fetchProducts();
                        // 2. ManageCredentials component ko direct refresh karein
                        if (manageCredentialsRef.current) {
                            manageCredentialsRef.current.refreshList();
                        }
                    }}
                />
            )}
        </div>
    );
};

export default AdminDashboardPage;