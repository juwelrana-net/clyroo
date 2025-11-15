// client/src/layouts/AdminLayout.jsx

import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import api from '@/lib/api.js';
import AdminSidebar from '@/components/admin/AdminSidebar.jsx';
import AdminHeader from '@/components/admin/AdminHeader.jsx';
import { Loader2 } from 'lucide-react';
import { useLocation } from 'react-router-dom';

// Saare Popups (Edit Forms) ko import karein
import EditProductForm from '@/components/EditProductForm.jsx';
import EditCredentialForm from '@/components/EditCredentialForm.jsx';
import EditPaymentMethodForm from '@/components/EditPaymentMethodForm.jsx';
import EditContactForm from '@/components/EditContactForm.jsx';
import EditCategoryForm from '@/components/EditCategoryForm.jsx';

const AdminLayout = () => {
    const navigate = useNavigate();
    const location = useLocation(); // Current URL check karne ke liye

    // --- Saari State aur Data Fetching Logic yahaan move kar di gayi hai ---

    // Data States
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [contactLinks, setContactLinks] = useState([]);

    const [dashboardStats, setDashboardStats] = useState(null);
    const [statRange, setStatRange] = useState('30days'); // Default range
    const [loadingStats, setLoadingStats] = useState(true);

    // Loading States
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [loadingMethods, setLoadingMethods] = useState(true);
    const [loadingLinks, setLoadingLinks] = useState(true);

    // Refs
    const manageCredentialsRef = useRef(null);
    const managePaymentMethodsRef = useRef(null);

    // Popup States
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [isCredEditOpen, setIsCredEditOpen] = useState(false);
    const [editingCredential, setEditingCredential] = useState(null);
    const [isPaymentEditOpen, setIsPaymentEditOpen] = useState(false);
    const [editingPaymentMethod, setEditingPaymentMethod] = useState(null);
    const [isContactEditOpen, setIsContactEditOpen] = useState(false);
    const [editingContactLink, setEditingContactLink] = useState(null);
    const [isCategoryEditOpen, setIsCategoryEditOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);

    // --- Data Fetching Functions ---
    // (Yeh sab purani AdminDashboardPage.jsx se copy kiye gaye hain)

    const fetchDashboardStats = async (range) => {
        try {
            setLoadingStats(true);
            const res = await api.get(`/api/admin/stats?range=${range}`);
            setDashboardStats(res.data);
        } catch (err) {
            console.error("Dashboard stats fetch nahi ho paye", err);
            handleAuthError(err); // Auth error check karein
        } finally {
            setLoadingStats(false);
        }
    };

    const fetchProducts = async () => {
        try {
            setLoadingProducts(true);
            const res = await api.get('/api/products');
            setProducts(res.data);
        } catch (err) {
            console.error("Products fetch nahi ho paye", err);
        } finally {
            setLoadingProducts(false);
        }
    };

    const fetchCategories = async () => {
        try {
            setLoadingCategories(true);
            const res = await api.get('/api/categories/admin');
            setCategories(res.data);
        } catch (err) {
            console.error("Categories fetch nahi ho paye", err);
            handleAuthError(err);
        } finally {
            setLoadingCategories(false);
        }
    };

    const fetchPaymentMethods = async () => {
        try {
            setLoadingMethods(true);
            const res = await api.get('/api/payment-methods/admin');
            setPaymentMethods(res.data);
        } catch (err) {
            console.error("Payment methods fetch nahi ho paye", err);
            handleAuthError(err);
        } finally {
            setLoadingMethods(false);
        }
    };

    const fetchContactLinks = async () => {
        try {
            setLoadingLinks(true);
            const res = await api.get('/api/contact/admin');
            setContactLinks(res.data);
        } catch (err) {
            console.error("Contact links fetch nahi ho paye", err);
            handleAuthError(err);
        } finally {
            setLoadingLinks(false);
        }
    };

    // Auth Error Helper
    const handleAuthError = (err) => {
        if (err.response && err.response.status === 401) {
            localStorage.removeItem('adminToken');
            navigate('/login');
        }
    };

    // Pehli baar load hone par saara data fetch karein
    useEffect(() => {
        fetchProducts();
        fetchCategories();
        fetchPaymentMethods();
        fetchContactLinks();
        fetchDashboardStats(statRange);
    }, [navigate]); // navigate ko dependency mein rakhein

    // Jab statRange (dropdown) badle, toh stats ko dobara fetch karein
    useEffect(() => {
        fetchDashboardStats(statRange);
    }, [statRange]);

    // Taaki jab hum /admin/dashboard par wapas aayein, toh data refresh ho
    useEffect(() => {
        if (location.pathname === '/admin/dashboard' || location.pathname === '/admin') {
            // Stats aur Products/Stock ko refresh karein
            fetchDashboardStats(statRange);
            fetchProducts();
        }
    }, [location.pathname, statRange]); // location aur range par depend karega

    // --- Handlers (Yeh bhi AdminDashboardPage.jsx se hain) ---

    // Product Handlers
    const handleProductChange = () => fetchProducts();
    const handleEditProduct = (product) => {
        setEditingProduct(product);
        setIsEditOpen(true);
    };

    // Stock/Credential Handlers
    const handleStockChange = () => {
        fetchProducts(); // Stock badlega toh product list refresh karni hogi
    };
    const handleEditCredential = (credential) => {
        setEditingCredential(credential);
        setIsCredEditOpen(true);
    };
    const handleCredentialChange = () => {
        handleStockChange(); // Product list refresh
        if (manageCredentialsRef.current) {
            manageCredentialsRef.current.refreshList(); // Credential list refresh
        }
    };

    // Category Handlers
    const handleCategoryChange = () => fetchCategories();
    const handleEditCategory = (category) => {
        setEditingCategory(category);
        setIsCategoryEditOpen(true);
    };

    // Payment Handlers
    const handlePaymentMethodChange = () => {
        fetchPaymentMethods();
        if (managePaymentMethodsRef.current) {
            managePaymentMethodsRef.current.refreshList();
        }
    };
    const handleEditPaymentMethod = (method) => {
        setEditingPaymentMethod(method);
        setIsPaymentEditOpen(true);
    };

    // Contact Handlers
    const handleContactChange = () => fetchContactLinks();
    const handleEditContactLink = (link) => {
        setEditingContactLink(link);
        setIsContactEditOpen(true);
    };

    // --- Loading State ---
    const isLoading = loadingProducts || loadingCategories || loadingMethods || loadingLinks || (loadingStats && !dashboardStats);

    if (isLoading) {
        return (
            <div className="flex min-h-screen bg-secondary/30 items-center justify-center">
                <Loader2 className="animate-spin h-10 w-10 text-primary" />
            </div>
        );
    }

    // Saare data aur functions ko ek object mein bundle karein
    const outletContext = {
        products,
        categories,
        paymentMethods,
        contactLinks,
        dashboardStats,
        setStatRange,
        manageCredentialsRef,
        managePaymentMethodsRef,
        handleProductChange,
        handleEditProduct,
        handleStockChange,
        handleEditCredential,
        handleCredentialChange,
        handleCategoryChange,
        handleEditCategory,
        handlePaymentMethodChange,
        handleEditPaymentMethod,
        handleContactChange,
        handleEditContactLink
    };

    return (
        <div className="flex min-h-screen bg-secondary/30">
            {/* 1. Sidebar */}
            <AdminSidebar />

            {/* 2. Main Content Area */}
            <div className="flex-1 flex flex-col">
                <AdminHeader />

                {/* 3. Page Content */}
                <main className="flex-1 p-4 md:p-8">
                    {/* Saara data aur functions Outlet ke zariye child pages ko pass karein */}
                    <Outlet context={outletContext} />
                </main>
            </div>

            {/* --- Saare Popups ab Layout Level par hain --- */}

            {/* Edit Product Popup */}
            {isEditOpen && (
                <EditProductForm
                    product={editingProduct}
                    isOpen={isEditOpen}
                    onClose={() => setIsEditOpen(false)}
                    onProductChange={handleProductChange}
                    categories={categories}
                />
            )}

            {/* Edit Credential Popup */}
            {isCredEditOpen && (
                <EditCredentialForm
                    credential={editingCredential}
                    isOpen={isCredEditOpen}
                    onClose={() => setIsCredEditOpen(false)}
                    onCredentialChange={handleCredentialChange}
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
                    onContactChange={handleContactChange}
                />
            )}

            {/* Edit Category Popup */}
            {isCategoryEditOpen && (
                <EditCategoryForm
                    category={editingCategory}
                    isOpen={isCategoryEditOpen}
                    onClose={() => setIsCategoryEditOpen(false)}
                    onCategoryChange={handleCategoryChange}
                />
            )}
        </div>
    );
};

export default AdminLayout;