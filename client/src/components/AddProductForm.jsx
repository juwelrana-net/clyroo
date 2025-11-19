// client/src/components/AddProductForm.jsx

import React, { useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { toast } from "sonner"; // <--- Import Toast
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select.jsx';

const AddProductForm = ({ onProductChange, categories = [] }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [fields, setFields] = useState(['']);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [loading, setLoading] = useState(false); // Loading state add kiya

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
        const token = localStorage.getItem('adminToken');

        // Validation
        if (!selectedCategory) {
            toast.error("Please select a category.");
            setLoading(false);
            return;
        }
        const validFields = fields.filter(f => f.trim().length > 0);
        if (validFields.length === 0) {
            toast.error("Please add at least one credential field (e.g., 'Email').");
            setLoading(false);
            return;
        }

        try {
            await axios.post('/api/admin/products',
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

            toast.success(`Product "${name}" added successfully!`);

            // Reset Form
            setName('');
            setDescription('');
            setPrice('');
            setImageUrl('');
            setFields(['']);
            setSelectedCategory(null);
            onProductChange();

        } catch (err) {
            toast.error(err.response?.data?.msg || "Failed to add product.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-secondary/30 border border-border rounded-lg p-6 h-full">
            <h2 className="text-2xl font-bold mb-4 text-primary">Add New Product</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <Label htmlFor="name">Product Name</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="AWS 8v Japan-Tokyo" required />
                </div>

                <div>
                    <Label htmlFor="category">Category</Label>
                    <Select onValueChange={setSelectedCategory} value={selectedCategory || ""}>
                        <SelectTrigger id="category">
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
                                    Please add a category first
                                </SelectItem>
                            )}
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <Label htmlFor="price">Price (USDT)</Label>
                    <Input id="price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="5.00" required />
                </div>
                <div>
                    <Label htmlFor="desc">Description</Label>
                    <Textarea id="desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Product details..." />
                </div>
                <div>
                    <Label htmlFor="image">Image URL (Optional)</Label>
                    <Input id="image" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." />
                </div>
                <div>
                    <Label>Credential Fields</Label>
                    <p className="text-xs text-muted-foreground mb-2">Define which fields this product needs (e.g., "Email", "Password").</p>
                    <div className="space-y-2">
                        {fields.map((field, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <Input
                                    value={field}
                                    onChange={(event) => handleFieldChange(index, event)}
                                    placeholder="e.g., Email"
                                    required
                                />
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

                <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? <Loader2 className="animate-spin mr-2" /> : null}
                    {loading ? "Adding..." : "Add Product"}
                </Button>
            </form>
        </div>
    );
};

export default AddProductForm;