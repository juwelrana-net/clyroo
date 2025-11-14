// client/src/components/AddCategoryForm.jsx

import React, { useState } from 'react';
import api from '@/lib/api.js';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';

const AddCategoryForm = ({ onCategoryChange }) => {
    const [name, setName] = useState('');
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(null);
        setError(null);
        try {
            await api.post('/api/categories/admin', { name });
            setMessage(`Category "${name}" added!`);
            setName('');
            onCategoryChange(); // Dashboard ko refresh karein
        } catch (err) {
            setError(err.response?.data?.msg || "Failed to add category.");
        }
    };

    return (
        <div className="bg-secondary/30 border border-border rounded-lg p-6">
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
                <Button type="submit" className="w-full">
                    Add Category
                </Button>
                {message && (
                    <p className="text-green-500 text-sm mt-2">{message}</p>
                )}
                {error && <p className="text-destructive text-sm mt-2">{error}</p>}
            </form>
        </div>
    );
};

export default AddCategoryForm;