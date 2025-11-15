// client/src/pages/admin/CategoriesPage.jsx

import React from 'react';
import { useOutletContext } from 'react-router-dom';
import AddCategoryForm from '@/components/AddCategoryForm.jsx';
import ManageCategories from '@/components/ManageCategories.jsx';

const CategoriesPage = () => {
    // AdminLayout (parent) se data aur functions receive karein
    const {
        categories,
        handleCategoryChange,
        handleEditCategory
    } = useOutletContext();

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Manage Categories</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">

                {/* Column 1: Add Category */}
                <div className="lg:col-span-1">
                    <AddCategoryForm
                        onCategoryChange={handleCategoryChange}
                    />
                </div>

                {/* Column 2: Manage Categories */}
                <div className="lg:col-span-2">
                    <ManageCategories
                        categories={categories}
                        onCategoryChange={handleCategoryChange}
                        onEdit={handleEditCategory}
                    />
                </div>
            </div>
        </div>
    );
};

export default CategoriesPage;