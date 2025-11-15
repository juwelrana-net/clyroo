// client/src/components/AddCredentialForm.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { Loader2 } from 'lucide-react';

const AddCredentialForm = ({ products, onStockChange }) => {
    const [selectedProduct, setSelectedProduct] = useState(null); // Ab poora product object store karenge
    const [loadingFields, setLoadingFields] = useState(false);

    // Yahaan credential ka data store hoga, e.g., { "Email": "...", "Password": "..." }
    const [credentialData, setCredentialData] = useState({});

    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    // Jab product select karein, toh uske fields load karein
    const handleProductSelect = (productId) => {
        setLoadingFields(true);
        const product = products.find(p => p._id === productId);
        setSelectedProduct(product);

        // Naye fields ke liye state ko reset karein
        const initialData = {};
        if (product && product.credentialFields) {
            product.credentialFields.forEach(field => {
                initialData[field] = '';
            });
        }
        setCredentialData(initialData);
        setLoadingFields(false);
    };

    // Jab admin fields mein type kare
    const handleInputChange = (fieldName, value) => {
        setCredentialData(prev => ({
            ...prev,
            [fieldName]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(null);
        setError(null);
        if (!selectedProduct) {
            setError("Please select a product first.");
            return;
        }
        const token = localStorage.getItem('adminToken');

        try {
            // Naya data object API ko bhejein
            await axios.post('/api/admin/credentials',
                {
                    productId: selectedProduct._id,
                    credentialData: credentialData // Yeh ab ek object hai
                },
                { headers: { 'x-auth-token': token } }
            );

            setMessage(`1 new stock item added for ${selectedProduct.name}.`);

            // Form ko reset karein
            const initialData = {};
            selectedProduct.credentialFields.forEach(field => {
                initialData[field] = '';
            });
            setCredentialData(initialData);

            onStockChange(); // Dashboard refresh karein

        } catch (err) {
            setError(err.response?.data?.msg || "Credential add nahi ho paya.");
        }
    };

    return (
        <div className="bg-secondary/30 border border-border rounded-lg p-6 h-full">
            <h2 className="text-2xl font-bold mb-4 text-primary">Add Stock (Credentials)</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Product Select */}
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

                {/* --- YEH BLOCK POORA NAYA HAI --- */}
                {/* Dynamic fields product ke basis par */}
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
                {/* --- NAYA BLOCK KHATAM --- */}

                <Button type="submit" className="w-full" disabled={!selectedProduct}>
                    Add 1 Stock Item
                </Button>

                {message && <p className="text-green-500 text-sm mt-2">{message}</p>}
                {error && <p className="text-destructive text-sm mt-2">{error}</p>}
            </form>
        </div>
    );
};

export default AddCredentialForm;