// client/src/components/ManageProducts.jsx

import React, { useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button.jsx';
import { Trash2, Edit, Loader2 } from 'lucide-react';
import { toast } from "sonner";
import ConfirmAlert from '@/components/ConfirmAlert.jsx'; // <--- 1. Import Reusable Component

const ManageProducts = ({ products, onProductChange, onEdit }) => {
    const [loadingId, setLoadingId] = useState(null);

    // --- 2. Delete State Logic ---
    const [deleteProduct, setDeleteProduct] = useState(null); // Kaunsa product delete karna hai
    const [isAlertOpen, setIsAlertOpen] = useState(false);    // Popup khula hai ya nahi

    const token = localStorage.getItem('adminToken');
    const authHeaders = { headers: { 'x-auth-token': token } };

    // Jab user Delete button dabaye
    const handleDeleteClick = (product) => {
        setDeleteProduct(product); // Product save karo
        setIsAlertOpen(true);      // Custom popup kholo
    };

    // Jab user Popup mein "Yes, Delete" dabaye
    const confirmDelete = async () => {
        if (!deleteProduct) return;

        setLoadingId(deleteProduct._id); // Loader button par bhi dikhega (optional)

        try {
            await axios.delete(`/api/admin/products/${deleteProduct._id}`, authHeaders);
            toast.success(`Product "${deleteProduct.name}" deleted successfully.`);
            onProductChange();
            setIsAlertOpen(false); // Popup band karo
            setDeleteProduct(null);
        } catch (err) {
            toast.error(err.response?.data?.msg || "Failed to delete product.");
        } finally {
            setLoadingId(null);
        }
    };

    return (
        <div className="bg-secondary/30 border border-border rounded-lg p-6 h-full">
            <h2 className="text-2xl font-bold mb-4 text-primary">Manage Products</h2>

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
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => onEdit(product)}
                                disabled={loadingId === product._id}
                                className="h-9 w-9"
                            >
                                <Edit size={16} />
                            </Button>

                            {/* --- 3. Button Action Change --- */}
                            <Button
                                variant="destructive"
                                size="icon"
                                onClick={() => handleDeleteClick(product)} // Direct delete nahi, pehle popup
                                disabled={loadingId === product._id}
                                className="h-9 w-9"
                            >
                                {loadingId === product._id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            {/* --- 4. Custom Alert Component Render --- */}
            <ConfirmAlert
                isOpen={isAlertOpen}
                onClose={() => setIsAlertOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Product?"
                description={`Are you sure you want to delete "${deleteProduct?.name}"? This will also delete all associated stock credentials.`}
                loading={loadingId === deleteProduct?._id}
            />
        </div>
    );
};

export default ManageProducts;