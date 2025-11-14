// client/src/pages/AdminDashboardPage.jsx

import React, { useState, useEffect, useRef } from 'react';
// import axios from 'axios'; // <-- YEH LINE HATA DEIN
import api from '@/lib/api.js'; // <-- YEH NAYI LINE ADD KAREIN
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
import EditPaymentMethodForm from '@/components/EditPaymentMethodForm.jsx';
import { Loader2 } from 'lucide-react';
import AddContactForm from '@/components/AddContactForm.jsx';
import ManageContactLinks from '@/components/ManageContactLinks.jsx';
import EditContactForm from '@/components/EditContactForm.jsx';
import AddCategoryForm from '@/components/AddCategoryForm.jsx';
import ManageCategories from '@/components/ManageCategories.jsx';
import EditCategoryForm from '@/components/EditCategoryForm.jsx';

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

    const [isPaymentEditOpen, setIsPaymentEditOpen] = useState(false);
    const [editingPaymentMethod, setEditingPaymentMethod] = useState(null);

    const [contactLinks, setContactLinks] = useState([]);
    const [loadingLinks, setLoadingLinks] = useState(true);
    const [isContactEditOpen, setIsContactEditOpen] = useState(false);
    const [editingContactLink, setEditingContactLink] = useState(null);

    const [categories, setCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [isCategoryEditOpen, setIsCategoryEditOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);

    const manageCredentialsRef = useRef(null);

    const fetchProducts = async () => {
        try {
            // Hum yahaan 'api.get' use kar rahe hain, lekin ismein token ki zaroorat nahi hai
            // Kyunki '/api/products' ek public route hai.
            const res = await api.get('/api/products');
            setProducts(res.data);
        } catch (err) {
            console.error("Products fetch nahi ho paye", err);
        } finally {
            if (loading) setLoading(false);
        }
    };

    const fetchPaymentMethods = async () => {
        try {
            // --- YEH BLOCK UPDATE HUA ---
            // Ab hum 'api' instance use kar rahe hain
            // Interceptor is request mein token khud add kar dega
            const res = await api.get('/api/payment-methods/admin');
            // Humne headers waala part hata diya hai
            setPaymentMethods(res.data);
        } catch (err) {
            console.error("Payment methods fetch nahi ho paye", err);
            // Agar token invalid hai toh login page par bhej dein
            if (err.response && err.response.status === 401) {
                navigate('/login');
            }
        } finally {
            if (loadingMethods) setLoadingMethods(false);
        }
    };

    const fetchContactLinks = async () => {
        try {
            setLoadingLinks(true); // Isse hum har update par loading dikha sakte hain
            const res = await api.get('/api/contact/admin');
            setContactLinks(res.data);
        } catch (err) {
            console.error("Contact links fetch nahi ho paye", err);
            if (err.response && err.response.status === 401) {
                navigate('/login');
            }
        } finally {
            setLoadingLinks(false);
        }
    };

    const fetchCategories = async () => {
        try {
            setLoadingCategories(true);
            const res = await api.get('/api/categories/admin');
            setCategories(res.data);
        } catch (err) {
            console.error("Categories fetch nahi ho paye", err);
        } finally {
            setLoadingCategories(false);
        }
    };

    useEffect(() => {
        fetchProducts();
        fetchPaymentMethods();
        fetchContactLinks();
        fetchCategories();
    }, [navigate]);

    const handleEditProduct = (product) => {
        setEditingProduct(product);
        setIsEditOpen(true);
    };

    const handleEditCredential = (credential) => {
        setEditingCredential(credential);
        setIsCredEditOpen(true);
    };

    const handleEditPaymentMethod = (method) => {
        setEditingPaymentMethod(method);
        setIsPaymentEditOpen(true);
    };

    const handleEditContactLink = (link) => {
        setEditingContactLink(link);
        setIsContactEditOpen(true);
    };

    const handleEditCategory = (category) => {
        setEditingCategory(category);
        setIsCategoryEditOpen(true);
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

    if (loading || loadingMethods || loadingLinks || loadingCategories) {
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
                    {/* Categories ko product form mein pass karein */}
                    <AddProductForm
                        onProductChange={fetchProducts}
                        categories={categories}  // <-- YEH LINE ADD YA CONFIRM KAREIN
                    />
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

                {/* Column 3: Settings Management (Payment + Contact) */}
                <div className="space-y-8 lg:col-span-1">
                    <AddPaymentMethodForm onMethodChange={handlePaymentMethodChange} />
                    <ManagePaymentMethods
                        ref={managePaymentMethodsRef}
                        paymentMethods={paymentMethods}
                        onMethodChange={handlePaymentMethodChange}
                        onEdit={handleEditPaymentMethod}
                    />

                    <AddContactForm onContactChange={fetchContactLinks} />
                    <ManageContactLinks
                        contactLinks={contactLinks}
                        onContactChange={fetchContactLinks}
                        onEdit={handleEditContactLink}
                    />

                    <AddCategoryForm onCategoryChange={fetchCategories} />
                    <ManageCategories
                        categories={categories}
                        onCategoryChange={fetchCategories}
                        onEdit={handleEditCategory}
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
                    categories={categories}
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

            {/* Edit Payment Method Popup */}
            {isPaymentEditOpen && (
                <EditPaymentMethodForm
                    method={editingPaymentMethod}
                    isOpen={isPaymentEditOpen}
                    onClose={() => setIsPaymentEditOpen(false)}
                    onMethodChange={handlePaymentMethodChange}
                />
            )}

            {/* Edit Contact Us Popup */}
            {isContactEditOpen && (
                <EditContactForm
                    link={editingContactLink}
                    isOpen={isContactEditOpen}
                    onClose={() => setIsContactEditOpen(false)}
                    onContactChange={fetchContactLinks}
                />
            )}

            {/* Edit Category Popup */}
            {isCategoryEditOpen && (
                <EditCategoryForm
                    category={editingCategory}
                    isOpen={isCategoryEditOpen}
                    onClose={() => setIsCategoryEditOpen(false)}
                    onCategoryChange={fetchCategories}
                />
            )}

        </div>
    );
};

export default AdminDashboardPage;