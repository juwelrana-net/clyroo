// client/src/components/ManageCategories.jsx

import React, { useState } from 'react';
import api from '@/lib/api.js';
import { Button } from '@/components/ui/button.jsx';
import { Trash2, Edit, Loader2 } from 'lucide-react';

const ManageCategories = ({ categories, onCategoryChange, onEdit }) => {
    const [loadingId, setLoadingId] = useState(null);
    const [error, setError] = useState(null);

    const handleDelete = async (category) => {
        if (
            !window.confirm(
                `Are you sure you want to delete "${category.name}"?`
            )
        ) {
            return;
        }
        setLoadingId(category._id);
        setError(null);
        try {
            await api.delete(`/api/categories/admin/${category._id}`);
            onCategoryChange();
        } catch (err) {
            setError(err.response?.data?.msg || "Delete failed.");
        } finally {
            setLoadingId(null);
        }
    };

    return (
        <div className="bg-secondary/30 border border-border rounded-lg p-6 h-full">
            <h2 className="text-2xl font-bold mb-4 text-primary">
                Manage Categories
            </h2>
            {error && <p className="text-destructive text-sm mb-4">{error}</p>}
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {categories.length === 0 && (
                    <p className="text-muted-foreground text-sm">
                        No categories found.
                    </p>
                )}
                {categories.map((cat) => (
                    <div
                        key={cat._id}
                        className="flex items-center justify-between gap-2 bg-background p-3 rounded-md border border-border"
                    >
                        <p className="text-foreground font-semibold">{cat.name}</p>
                        <div className="flex items-center gap-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onEdit(cat)}
                                disabled={loadingId === cat._id}
                                className="h-9 w-9"
                            >
                                <Edit size={16} />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(cat)}
                                disabled={loadingId === cat._id}
                                className="text-destructive h-9 w-9"
                            >
                                {loadingId === cat._id ? (
                                    <Loader2 size={16} className="animate-spin" />
                                ) : (
                                    <Trash2 size={16} />
                                )}
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ManageCategories;