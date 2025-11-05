// client/src/components/ManageProducts.jsx

import React, { useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Trash2, Edit, Loader2 } from 'lucide-react'; // <-- Edit icon import karein

// Naya prop 'onEdit' lein
const ManageProducts = ({ products, onProductChange, onEdit }) => {
    const [loadingId, setLoadingId] = useState(null);
    const [error, setError] = useState(null);
    const token = localStorage.getItem('adminToken');
    const authHeaders = { headers: { 'x-auth-token': token } };

    const handleDelete = async (productId) => {
        if (!window.confirm("Are you sure? This will delete the product AND all its stock.")) {
            return;
        }
        setLoadingId(productId);
        setError(null);
        try {
            await axios.delete(`/api/admin/products/${productId}`, authHeaders);
            onProductChange();
        } catch (err) {
            setError("Delete failed. Please try again.");
        } finally {
            setLoadingId(null);
        }
    };

    return (
        <div className="bg-secondary/30 border border-border rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-primary">Manage Products</h2>
            {error && <p className="text-destructive text-sm mb-4">{error}</p>}

            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {products.length === 0 && (
                    <p className="text-muted-foreground text-sm">No products found. Add one above.</p>
                )}

                {products.map((product) => (
                    <div key={product._id} className="flex items-center justify-between gap-2 bg-background p-3 rounded-md border border-border">
                        <div>
                            <p className="text-foreground font-semibold">{product.name}</p>
                            <p className="text-xs text-muted-foreground">Stock: {product.stock}</p>
                        </div>
                        <div className="flex gap-1">
                            {/* --- NAYA EDIT BUTTON --- */}
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => onEdit(product)} // Parent ko batayein ki yeh product edit karna hai
                                disabled={loadingId === product._id}
                                className="h-9 w-9"
                            >
                                <Edit size={16} />
                            </Button>

                            {/* Delete Button */}
                            <Button
                                variant="destructive"
                                size="icon"
                                onClick={() => handleDelete(product._id)}
                                disabled={loadingId === product._id}
                                className="h-9 w-9"
                            >
                                {loadingId === product._id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ManageProducts;