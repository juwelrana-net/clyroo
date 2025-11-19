// client/src/components/AddCategoryForm.jsx

import React, { useState } from 'react';
import api from '@/lib/api.js';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { toast } from "sonner"; // <--- Import Toast
import { Loader2 } from 'lucide-react';

const AddCategoryForm = ({ onCategoryChange }) => {
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/api/categories/admin', { name });

            toast.success(`Category "${name}" added successfully!`);

            setName('');
            onCategoryChange();
        } catch (err) {
            toast.error(err.response?.data?.msg || "Failed to add category.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-secondary/30 border border-border rounded-lg p-6 h-full">
            <h2 className="text-2xl font-bold mb-4 text-primary">Add Category</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <Label htmlFor="category-name">Category Name</Label>
                    <Input
                        id="category-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g., AWS, Azure"
                        required
                    />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? <Loader2 className="animate-spin mr-2" /> : null}
                    {loading ? "Adding..." : "Add Category"}
                </Button>
            </form>
        </div>
    );
};

export default AddCategoryForm;