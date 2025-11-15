// client/src/components/admin/AdminForm.jsx

import React, { useState, useEffect } from 'react';
import api from '@/lib/api.js';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Switch } from '@/components/ui/switch.jsx';
import { User, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from '@/components/ui/dialog.jsx';

// Saare permissions ki list
const allPermissionsList = [
    { id: 'manageProducts', label: 'Manage Products' },
    { id: 'manageStock', label: 'Manage Stocks' },
    { id: 'managePayments', label: 'Manage Payments' },
    { id: 'manageCategories', label: 'Manage Categories' },
    { id: 'manageContacts', label: 'Manage Contacts' },
    { id: 'manageNotifications', label: 'Manage Notifications' },
    { id: 'manageAdmins', label: 'Manage Admins (Super Admin)' },
];

const AdminForm = ({ isOpen, onClose, onAdminChange, editingAdmin }) => {
    // Mode check karein
    const isEditMode = !!editingAdmin;

    // Form State
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [profileImage, setProfileImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [permissions, setPermissions] = useState(
        // Default mein saare false
        allPermissionsList.reduce((acc, perm) => {
            acc[perm.id] = false;
            return acc;
        }, {})
    );

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Agar edit mode mein hain, toh form ko data se bharein
    useEffect(() => {
        if (isEditMode) {
            setName(editingAdmin.name || '');
            setEmail(editingAdmin.email || '');
            setImagePreview(editingAdmin.profileImageUrl || null);
            // Permissions set karein
            const currentPerms = { ...permissions };
            for (const key in editingAdmin.permissions) {
                if (key in currentPerms) {
                    currentPerms[key] = editingAdmin.permissions[key];
                }
            }
            setPermissions(currentPerms);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isEditMode, editingAdmin]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    // Permission toggle handle karein
    const handlePermissionChange = (permId, checked) => {
        setPermissions((prev) => ({
            ...prev,
            [permId]: checked,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const formData = new FormData();
        formData.append('name', name);
        formData.append('email', email);

        if (password || !isEditMode) {
            formData.append('password', password);
        }
        if (profileImage) {
            formData.append('profileImage', profileImage);
        }
        // Permissions ko JSON string bana kar bhejein
        formData.append('permissions', JSON.stringify(permissions));

        try {
            if (isEditMode) {
                // Update
                await api.put(`/api/admin-control/${editingAdmin._id}`, formData);
            } else {
                // Create
                await api.post('/api/admin-control', formData);
            }
            onAdminChange(); // List refresh karein
            onClose(); // Popup band karein

        } catch (err) {
            setError(err.response?.data?.msg || "Operation failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>
                        {isEditMode ? 'Edit Admin' : 'Add New Admin'}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditMode
                            ? `Updating details for ${editingAdmin.name}.`
                            : 'Create a new admin account with specific permissions.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-4">
                    {/* Image Upload */}
                    <div className="flex flex-col items-center space-y-2">
                        <div className="relative">
                            <div className="w-20 h-20 rounded-full bg-secondary border border-border flex items-center justify-center overflow-hidden">
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Profile Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-10 h-10 text-muted-foreground" />
                                )}
                            </div>
                            <Input id="adminFormImage" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="absolute bottom-0 right-0 rounded-full h-8 w-8 p-0"
                                onClick={() => document.getElementById('adminFormImage').click()}
                            >
                                <Edit className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {error && (
                        <div className="text-destructive-foreground bg-destructive/80 p-3 rounded-lg flex items-center gap-3 text-sm">
                            <AlertCircle size={16} /> {error}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label htmlFor="admin-name">Full Name</Label>
                            <Input id="admin-name" value={name} onChange={(e) => setName(e.target.value)} required />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="admin-email">Email</Label>
                            <Input id="admin-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="admin-password">
                            Password {isEditMode ? '(Optional: Leave blank to keep unchanged)' : ''}
                        </Label>
                        <div className="relative">
                            <Input
                                id="admin-password"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required={!isEditMode} // Naya admin banate waqt required
                                className="pr-10"
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </Button>
                        </div>
                    </div>

                    {/* --- Permissions --- */}
                    <div className="space-y-2 pt-2">
                        <Label className="text-base font-semibold">Permissions</Label>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-md border border-border p-4">
                            {allPermissionsList.map((perm) => (
                                <div key={perm.id} className="flex items-center space-x-2">
                                    <Switch
                                        id={perm.id}
                                        checked={permissions[perm.id]}
                                        onCheckedChange={(checked) => handlePermissionChange(perm.id, checked)}
                                    />
                                    <Label htmlFor={perm.id} className="cursor-pointer">
                                        {perm.label}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </div>


                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? <Loader2 className="animate-spin mr-2" /> : null}
                            {loading ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Create Admin')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default AdminForm;