// client/src/components/ManageCredentials.jsx

import React, { useState, forwardRef, useImperativeHandle } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { Trash2, Edit, Loader2 } from 'lucide-react';
import { toast } from "sonner";
import ConfirmAlert from '@/components/ConfirmAlert.jsx'; // <--- Import

const formatDataToString = (data) => {
    if (!data) return "";
    const dataObj = data instanceof Map ? Object.fromEntries(data) : data;
    return Object.entries(dataObj)
        .map(([key, value]) => `${key}: ${value}`)
        .join(' | ');
};

const ManageCredentials = forwardRef(({ products, onStockChange, onEdit }, ref) => {
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [credentials, setCredentials] = useState([]);
    const [loading, setLoading] = useState(false);

    // --- Delete State ---
    const [deleteId, setDeleteId] = useState(null);
    const [isAlertOpen, setIsAlertOpen] = useState(false);

    const token = localStorage.getItem('adminToken');
    const authHeaders = { headers: { 'x-auth-token': token } };

    const fetchCredentials = async (product) => {
        if (!product) {
            setCredentials([]);
            setSelectedProduct(null);
            return;
        }
        setSelectedProduct(product);
        setLoading(true);
        try {
            const res = await axios.get(`/api/admin/products/${product._id}/credentials`, authHeaders);
            setCredentials(res.data);
        } catch (err) {
            toast.error("Failed to fetch credentials.");
        } finally {
            setLoading(false);
        }
    };

    useImperativeHandle(ref, () => ({
        refreshList: () => {
            if (selectedProduct) {
                fetchCredentials(selectedProduct);
            }
        }
    }));

    // Button click handler
    const handleDeleteClick = (id) => {
        setDeleteId(id);
        setIsAlertOpen(true);
    };

    // Actual Delete Logic
    const confirmDelete = async () => {
        if (!deleteId) return;
        try {
            await axios.delete(`/api/admin/credentials/${deleteId}`, authHeaders);
            toast.success("Credential deleted successfully.");
            setCredentials(prev => prev.filter(c => c._id !== deleteId));
            onStockChange();
            setIsAlertOpen(false);
        } catch (err) {
            toast.error("Failed to delete credential.");
        } finally {
            setDeleteId(null);
        }
    };

    return (
        <div className="bg-secondary/30 border border-border rounded-lg p-6 h-full">
            <h2 className="text-2xl font-bold mb-4 text-primary">Manage Stock</h2>

            <div className="mb-4">
                <Label htmlFor="product-select">Select Product to Manage</Label>
                <Select
                    onValueChange={(productId) => fetchCredentials(products.find(p => p._id === productId))}
                    value={selectedProduct?._id || ''}
                >
                    <SelectTrigger id="product-select">
                        <SelectValue placeholder="Product chunein..." />
                    </SelectTrigger>
                    <SelectContent>
                        {products.length > 0 ? (
                            products.map((product) => (
                                <SelectItem key={product._id} value={product._id}>
                                    {product.name} (Stock: {product.stock})
                                </SelectItem>
                            ))
                        ) : (
                            <SelectItem value="none" disabled>No products found</SelectItem>
                        )}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {loading && <Loader2 className="animate-spin mx-auto" />}

                {!loading && credentials.length === 0 && selectedProduct &&
                    <p className="text-muted-foreground text-sm">No credentials found for this product.</p>
                }

                {!loading && credentials.map((cred) => (
                    <div key={cred._id} className="bg-background p-3 rounded-md border-border">
                        <p className={`text-sm font-mono truncate ${cred.isSold ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                            {formatDataToString(cred.credentialData)}
                        </p>

                        <div className="flex items-center justify-between mt-2">
                            {cred.isSold && <span className="text-xs text-red-500">(Sold)</span>}
                            {!cred.isSold && <span></span>}

                            <div className="flex gap-1">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => onEdit(cred)}
                                    className="text-primary h-8 w-8"
                                    disabled={cred.isSold}
                                >
                                    <Edit size={16} />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteClick(cred._id)} // Updated handler
                                    className="text-destructive h-8 w-8"
                                >
                                    <Trash2 size={16} />
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Custom Alert */}
            <ConfirmAlert
                isOpen={isAlertOpen}
                onClose={() => setIsAlertOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Credential?"
                description="Are you sure you want to delete this stock item? This action cannot be undone."
            />
        </div>
    );
});

export default ManageCredentials;