// client/src/pages/admin/ProductsPage.jsx

import React from 'react';
import { useOutletContext } from 'react-router-dom';
import AddProductForm from '@/components/AddProductForm.jsx';
import ManageProducts from '@/components/ManageProducts.jsx';

const ProductsPage = () => {
    // AdminLayout se saara data aur functions receive karein
    const {
        products,
        categories,
        handleProductChange,
        handleEditProduct
    } = useOutletContext();

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Manage Products</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">

                {/* Column 1: Add Product */}
                <div className="lg:col-span-1">
                    <AddProductForm
                        onProductChange={handleProductChange}
                        categories={categories}
                    />
                </div>

                {/* Column 2: Manage Products */}
                <div className="lg:col-span-2">
                    <ManageProducts
                        products={products}
                        onProductChange={handleProductChange}
                        onEdit={handleEditProduct}
                    />
                </div>
            </div>
        </div>
    );
};

export default ProductsPage;