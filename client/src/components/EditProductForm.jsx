// client/src/components/EditProductForm.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Plus, Trash2 } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog.jsx"; // Dialog import karein

const EditProductForm = ({ product, isOpen, onClose, onProductChange }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [fields, setFields] = useState(['']);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    const token = localStorage.getItem('adminToken');

    // Jab product prop badle, form ko us data se bharein
    useEffect(() => {
        if (product) {
            setName(product.name || '');
            setDescription(product.description || '');
            setPrice(product.price || '');
            setImageUrl(product.imageUrl || '');
            setFields(product.credentialFields.length > 0 ? product.credentialFields : ['']);
        }
    }, [product]); // Yeh tab run hoga jab 'product' prop update hoga

    if (!product) return null; // Agar koi product select nahi hai, toh kuchh render na karein

    const handleFieldChange = (index, event) => {
        const newFields = [...fields];
        newFields[index] = event.target.value;
        setFields(newFields);
    };

    const handleAddField = () => {
        setFields([...fields, '']);
    };

    const handleRemoveField = (index) => {
        const newFields = [...fields];
        newFields.splice(index, 1);
        setFields(newFields);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(null);
        setError(null);
        const validFields = fields.filter(f => f.trim().length > 0);
        if (validFields.length === 0) {
            setError("Please add at least one credential field (e.g., 'Email').");
            return;
        }

        try {
            await axios.put(
                `/api/admin/products/${product._id}`, // Naya PUT route
                {
                    name,
                    description,
                    price: Number(price),
                    imageUrl,
                    credentialFields: validFields
                },
                { headers: { 'x-auth-token': token } }
            );
            setMessage(`Product "${name}" updated!`);
            onProductChange(); // Dashboard refresh karein
            onClose(); // Popup band karein
        } catch (err) {
            setError(err.response?.data?.msg || "Product update nahi ho paya.");
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Edit Product: {product.name}</DialogTitle>
                    <DialogDescription>
                        Make changes to your product. Click save when you're done.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-4">
                    <div>
                        <Label htmlFor="edit-name">Product Name</Label>
                        <Input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>
                    <div>
                        <Label htmlFor="edit-price">Price ($)</Label>
                        <Input id="edit-price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} required />
                    </div>
                    <div>
                        <Label htmlFor="edit-desc">Description</Label>
                        <Textarea id="edit-desc" value={description} onChange={(e) => setDescription(e.target.value)} />
                    </div>
                    <div>
                        <Label htmlFor="edit-image">Image URL (Optional)</Label>
                        <Input id="edit-image" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
                    </div>
                    <div>
                        <Label>Credential Fields</Label>
                        <p className="text-xs text-muted-foreground mb-2">Define fields this product needs (e.g., "Email", "Password").</p>
                        <div className="space-y-2">
                            {fields.map((field, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <Input value={field} onChange={(event) => handleFieldChange(index, event)} required />
                                    {fields.length > 1 && (
                                        <Button type="button" variant="destructive" size="icon" onClick={() => handleRemoveField(index)}>
                                            <Trash2 size={16} />
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                        <Button type="button" variant="outline" size="sm" className="mt-2" onClick={handleAddField}>
                            <Plus size={16} className="mr-2" />
                            Add Field
                        </Button>
                    </div>
                    {message && <p className="text-green-500 text-sm mt-2">{message}</p>}
                    {error && <p className="text-destructive text-sm mt-2">{error}</p>}
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit">Save Changes</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default EditProductForm;