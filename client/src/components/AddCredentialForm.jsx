// client/src/components/AddCredentialForm.jsx

import React, { useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { Loader2 } from 'lucide-react';
import { toast } from "sonner"; // <--- Import Toast

const AddCredentialForm = ({ products, onStockChange }) => {
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [loadingFields, setLoadingFields] = useState(false);
    const [credentialData, setCredentialData] = useState({});
    const [loading, setLoading] = useState(false); // Loading state

    const handleProductSelect = (productId) => {
        setLoadingFields(true);
        const product = products.find(p => p._id === productId);
        setSelectedProduct(product);

        const initialData = {};
        if (product && product.credentialFields) {
            product.credentialFields.forEach(field => {
                initialData[field] = '';
            });
        }
        setCredentialData(initialData);
        setLoadingFields(false);
    };

    const handleInputChange = (fieldName, value) => {
        setCredentialData(prev => ({
            ...prev,
            [fieldName]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (!selectedProduct) {
            toast.error("Please select a product first.");
            setLoading(false);
            return;
        }
        const token = localStorage.getItem('adminToken');

        try {
            await axios.post('/api/admin/credentials',
                {
                    productId: selectedProduct._id,
                    credentialData: credentialData
                },
                { headers: { 'x-auth-token': token } }
            );

            toast.success(`Stock added for ${selectedProduct.name}!`);

            // Reset Form
            const initialData = {};
            selectedProduct.credentialFields.forEach(field => {
                initialData[field] = '';
            });
            setCredentialData(initialData);

            onStockChange();

        } catch (err) {
            toast.error(err.response?.data?.msg || "Failed to add stock.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-secondary/30 border border-border rounded-lg p-6 h-full">
            <h2 className="text-2xl font-bold mb-4 text-primary">Add Stock (Credentials)</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <Label htmlFor="product">Select Product</Label>
                    <Select onValueChange={handleProductSelect} value={selectedProduct?._id || ''}>
                        <SelectTrigger id="product">
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

                {loadingFields && <Loader2 className="animate-spin" />}

                {selectedProduct && !loadingFields && (
                    <div className="space-y-3 border border-border/50 p-4 rounded-md">
                        <Label className="text-base">New Stock Item for: {selectedProduct.name}</Label>
                        {selectedProduct.credentialFields.map((field) => (
                            <div key={field}>
                                <Label htmlFor={field} className="text-muted-foreground">{field}</Label>
                                <Input
                                    id={field}
                                    value={credentialData[field] || ''}
                                    onChange={(e) => handleInputChange(field, e.target.value)}
                                    placeholder={`Enter ${field}...`}
                                    required
                                />
                            </div>
                        ))}
                    </div>
                )}

                <Button type="submit" className="w-full" disabled={!selectedProduct || loading}>
                    {loading ? <Loader2 className="animate-spin mr-2" /> : null}
                    {loading ? "Adding..." : "Add 1 Stock Item"}
                </Button>
            </form>
        </div>
    );
};

export default AddCredentialForm;