// client/src/components/AddProductForm.jsx

import React, { useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Plus, Trash2 } from 'lucide-react';

// Prop ka naam yahaan badla gaya hai
const AddProductForm = ({ onProductChange }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [fields, setFields] = useState(['']);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

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
        const token = localStorage.getItem('adminToken');
        const validFields = fields.filter(f => f.trim().length > 0);
        if (validFields.length === 0) {
            setError("Please add at least one credential field (e.g., 'Email').");
            return;
        }

        try {
            await axios.post('/api/admin/products',
                {
                    name,
                    description,
                    price: Number(price),
                    imageUrl,
                    credentialFields: validFields
                },
                { headers: { 'x-auth-token': token } }
            );
            setMessage(`Product "${name}" added!`);
            setName('');
            setDescription('');
            setPrice('');
            setImageUrl('');
            setFields(['']);

            // Yahaan function call badla gaya hai
            onProductChange();

        } catch (err) {
            setError(err.response?.data?.msg || "Product add nahi ho paya.");
        }
    };

    return (
        <div className="bg-secondary/30 border border-border rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-primary">Add New Product</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <Label htmlFor="name">Product Name</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="AWS 8v Japan-Tokyo" required />
                </div>
                <div>
                    <Label htmlFor="price">Price ($)</Label>
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
                <Button type="submit" className="w-full">Add Product</Button>
                {message && <p className="text-green-500 text-sm mt-2">{message}</p>}
                {error && <p className="text-destructive text-sm mt-2">{error}</p>}
            </form>
        </div>
    );
};

export default AddProductForm;