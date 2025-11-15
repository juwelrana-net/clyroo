// client/src/pages/admin/CategoriesPage.jsx

import React from 'react';
import { useOutletContext } from 'react-router-dom';
import AddCategoryForm from '@/components/AddCategoryForm.jsx';
import ManageCategories from '@/components/ManageCategories.jsx';
import AccessDenied from '@/components/admin/AccessDenied.jsx'; // Naya import

const CategoriesPage = () => {
    const {
        adminUser, // adminUser ko context se lein
        categories,
        handleCategoryChange,
        handleEditCategory
    } = useOutletContext();

    // --- NAYA PERMISSION CHECK ---
    if (!adminUser?.permissions?.manageCategories) {
        return <AccessDenied pageName="Manage Categories" />;
    }
    // --- CHECK KHATAM ---

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Manage Categories</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <AddCategoryForm
                    onCategoryChange={handleCategoryChange}
                />
                <ManageCategories
                    categories={categories}
                    onCategoryChange={handleCategoryChange}
                    onEdit={handleEditCategory}
                />
            </div>
        </div>
    );
};

export default CategoriesPage;