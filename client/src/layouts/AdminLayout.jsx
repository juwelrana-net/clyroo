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
    const location = useLocation();

    // Data States
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [contactLinks, setContactLinks] = useState([]);

    // Stats State
    const [dashboardStats, setDashboardStats] = useState(null);
    const [statRange, setStatRange] = useState('30days');
    const [loadingStats, setLoadingStats] = useState(true);

    const [chartData, setChartData] = useState([]);
    const [loadingCharts, setLoadingCharts] = useState(true);

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
    const fetchDashboardStats = async (range) => {
        try {
            setLoadingStats(true);
            const res = await api.get(`/api/admin/stats?range=${range}`);
            setDashboardStats(res.data);
        } catch (err) {
            console.error("Dashboard stats fetch nahi ho paye", err);
            handleAuthError(err);
        } finally {
            setLoadingStats(false);
        }
    };

    const fetchChartData = async (range) => {
        try {
            setLoadingCharts(true);
            const res = await api.get(`/api/admin/stats/charts?range=${range}`);
            setChartData(res.data);
        } catch (err) {
            console.error("Chart data fetch nahi ho paya", err);
            // Auth error check karein (optional but good)
            handleAuthError(err);
        } finally {
            setLoadingCharts(false);
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

    const handleAuthError = (err) => {
        if (err.response && err.response.status === 401) {
            localStorage.removeItem('adminToken');
            navigate('/login');
        }
    };

    useEffect(() => {
        fetchProducts();
        fetchCategories();
        fetchPaymentMethods();
        fetchContactLinks();
        fetchDashboardStats(statRange);
        fetchChartData(statRange);
    }, [navigate]);

    useEffect(() => {
        fetchDashboardStats(statRange);
        fetchChartData(statRange);
    }, [statRange]);

    useEffect(() => {
        if (location.pathname === '/admin/dashboard' || location.pathname === '/admin') {
            fetchDashboardStats(statRange);
            fetchChartData(statRange);
            fetchProducts();
        }
    }, [location.pathname, statRange]);

    // --- Handlers ---
    const handleProductChange = () => fetchProducts();
    const handleEditProduct = (product) => {
        setEditingProduct(product);
        setIsEditOpen(true);
    };
    const handleStockChange = () => fetchProducts();
    const handleEditCredential = (credential) => {
        setEditingCredential(credential);
        setIsCredEditOpen(true);
    };
    const handleCredentialChange = () => {
        handleStockChange();
        if (manageCredentialsRef.current) {
            manageCredentialsRef.current.refreshList();
        }
    };
    const handleCategoryChange = () => fetchCategories();
    const handleEditCategory = (category) => {
        setEditingCategory(category);
        setIsCategoryEditOpen(true);
    };
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
    const handleContactChange = () => fetchContactLinks();
    const handleEditContactLink = (link) => {
        setEditingContactLink(link);
        setIsContactEditOpen(true);
    };

    // --- Loading State ---
    const isLoading = loadingProducts || loadingCategories || loadingMethods || loadingLinks || loadingStats || loadingCharts;
    if (isLoading) {
        return (
            <div className="flex min-h-screen bg-secondary/30 items-center justify-center">
                <Loader2 className="animate-spin h-10 w-10 text-primary" />
            </div>
        );
    }

    const outletContext = {
        products,
        categories,
        paymentMethods,
        contactLinks,
        dashboardStats,
        setStatRange,
        statRange,
        chartData,
        loadingCharts,
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

    // --- YAHAN SE JSX UPDATE HUA HAI ---
    return (
        // 1. Pura background `bg-secondary/30` hoga aur padding `p-4` ya `p-8` hogi
        <div className="h-screen bg-secondary/30 p-4 md:p-8">

            {/* 2. Ek container banayein jo max-width-7xl (1280px) hoga */}
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-6 w-full h-full">

                {/* 3. Sidebar (yeh abhi bhi w-64 hai) */}
                <AdminSidebar />

                {/* 4. Main Content Area (Header + Content) */}
                <div className="flex-1 flex flex-col gap-6 w-full">

                    {/* Header (Navbar) */}
                    <AdminHeader />

                    {/* Main Panel (Content) */}
                    <main className="flex-1 bg-background rounded-xl border border-border shadow-lg p-4 md:p-8">
                        {/* Saara data aur functions Outlet ke zariye child pages ko pass karein */}
                        <Outlet context={outletContext} />
                    </main>
                </div>
            </div>

            {/* --- Saare Popups waise hi rahenge --- */}
            {isEditOpen && (
                <EditProductForm
                    product={editingProduct}
                    isOpen={isEditOpen}
                    onClose={() => setIsEditOpen(false)}
                    onProductChange={handleProductChange}
                    categories={categories}
                />
            )}
            {/* ... (baaki saare popups) ... */}
            {isCredEditOpen && (
                <EditCredentialForm
                    credential={editingCredential}
                    isOpen={isCredEditOpen}
                    onClose={() => setIsCredEditOpen(false)}
                    onCredentialChange={handleCredentialChange}
                />
            )}
            {isPaymentEditOpen && (
                <EditPaymentMethodForm
                    method={editingPaymentMethod}
                    isOpen={isPaymentEditOpen}
                    onClose={() => setIsPaymentEditOpen(false)}
                    onMethodChange={handlePaymentMethodChange}
                />
            )}
            {isContactEditOpen && (
                <EditContactForm
                    link={editingContactLink}
                    isOpen={isContactEditOpen}
                    onClose={() => setIsContactEditOpen(false)}
                    onContactChange={handleContactChange}
                />
            )}
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