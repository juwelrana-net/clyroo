// client/src/components/EditProductForm.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { toast } from "sonner"; // <--- Import Toast
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog.jsx";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select.jsx';

const EditProductForm = ({ product, isOpen, onClose, onProductChange, categories = [] }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [fields, setFields] = useState(['']);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [loading, setLoading] = useState(false); // Loading state
    const token = localStorage.getItem('adminToken');

    useEffect(() => {
        if (product) {
            setName(product.name || '');
            setDescription(product.description || '');
            setPrice(product.price || '');
            setImageUrl(product.imageUrl || '');
            setFields(product.credentialFields.length > 0 ? product.credentialFields : ['']);
            setSelectedCategory(product.category?._id || null);
        }
    }, [product]);

    if (!product) return null;

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
        setLoading(true);

        const validFields = fields.filter(f => f.trim().length > 0);
        if (validFields.length === 0) {
            toast.error("Please add at least one credential field.");
            setLoading(false);
            return;
        }

        if (!selectedCategory) {
            toast.error("Please select a category.");
            setLoading(false);
            return;
        }

        try {
            await axios.put(
                `/api/admin/products/${product._id}`,
                {
                    name,
                    description,
                    price: Number(price),
                    imageUrl,
                    credentialFields: validFields,
                    categoryId: selectedCategory,
                },
                { headers: { 'x-auth-token': token } }
            );

            toast.success(`Product "${name}" updated successfully!`);
            onProductChange();
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.msg || "Failed to update product.");
        } finally {
            setLoading(false);
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
                        <Label htmlFor="edit-category">Category</Label>
                        <Select onValueChange={setSelectedCategory} value={selectedCategory || ""}>
                            <SelectTrigger id="edit-category">
                                <SelectValue placeholder="Select a category..." />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.length > 0 ? (
                                    categories.map((cat) => (
                                        <SelectItem key={cat._id} value={cat._id}>
                                            {cat.name}
                                        </SelectItem>
                                    ))
                                ) : (
                                    <SelectItem value="none" disabled>
                                        No categories found
                                    </SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="edit-price">Price (USDT)</Label>
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

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? <Loader2 className="animate-spin mr-2" /> : null}
                            {loading ? "Saving..." : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default EditProductForm;