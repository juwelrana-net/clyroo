// client/src/components/EditCategoryForm.jsx

import React, { useState, useEffect } from 'react';
import api from '@/lib/api.js';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from '@/components/ui/dialog.jsx';

const EditCategoryForm = ({ category, isOpen, onClose, onCategoryChange }) => {
    const [name, setName] = useState('');
    const [error, setError] = useState(null);

    useEffect(() => {
        if (category) {
            setName(category.name || '');
        }
    }, [category]);

    if (!category) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            await api.put(`/api/categories/admin/${category._id}`, { name });
            onCategoryChange();
            onClose();
        } catch (err) {
            setError(err.response?.data?.msg || "Update failed.");
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Edit Category</DialogTitle>
                    <DialogDescription>
                        Rename the category "{category.name}".
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <div>
                        <Label htmlFor="edit-category-name">Category Name</Label>
                        <Input
                            id="edit-category-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    {error && <p className="text-destructive text-sm mt-2">{error}</p>}
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit">Save Changes</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default EditCategoryForm;