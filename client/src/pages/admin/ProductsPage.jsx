// client/src/pages/admin/ProductsPage.jsx

import React from 'react';
import { useOutletContext } from 'react-router-dom';
import AddProductForm from '@/components/AddProductForm.jsx';
import ManageProducts from '@/components/ManageProducts.jsx';
import AccessDenied from '@/components/admin/AccessDenied.jsx'; // Naya import

const ProductsPage = () => {
    const {
        adminUser, // adminUser ko context se lein
        products,
        categories,
        handleProductChange,
        handleEditProduct
    } = useOutletContext();

    // --- NAYA PERMISSION CHECK ---
    if (!adminUser?.permissions?.manageProducts) {
        return <AccessDenied pageName="Manage Products" />;
    }
    // --- CHECK KHATAM ---

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Manage Products</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <AddProductForm
                    onProductChange={handleProductChange}
                    categories={categories}
                />
                <ManageProducts
                    products={products}
                    onProductChange={handleProductChange}
                    onEdit={handleEditProduct}
                />
            </div>
        </div>
    );
};

export default ProductsPage;