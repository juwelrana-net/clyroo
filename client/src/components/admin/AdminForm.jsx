// client/src/components/admin/AdminForm.jsx

import React, { useState, useEffect } from 'react';
import api from '@/lib/api.js';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Switch } from '@/components/ui/switch.jsx';
import { User, Loader2, Eye, EyeOff, Edit } from 'lucide-react';
import { toast } from "sonner"; // <--- Import Toast
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from '@/components/ui/dialog.jsx';

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
    const isEditMode = !!editingAdmin;
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [profileImage, setProfileImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [permissions, setPermissions] = useState(
        allPermissionsList.reduce((acc, perm) => {
            acc[perm.id] = false;
            return acc;
        }, {})
    );
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isEditMode) {
            setName(editingAdmin.name || '');
            setEmail(editingAdmin.email || '');
            setImagePreview(editingAdmin.profileImageUrl || null);
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

    const handlePermissionChange = (permId, checked) => {
        setPermissions((prev) => ({
            ...prev,
            [permId]: checked,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
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
        formData.append('permissions', JSON.stringify(permissions));

        try {
            if (isEditMode) {
                await api.put(`/api/admin-control/${editingAdmin._id}`, formData);
                toast.success(`Admin "${name}" updated successfully!`);
            } else {
                await api.post('/api/admin-control', formData);
                toast.success(`Admin "${name}" created successfully!`);
            }
            onAdminChange();
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.msg || "Operation failed.");
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
                            Password {isEditMode ? '(Optional)' : ''}
                        </Label>
                        <div className="relative">
                            <Input
                                id="admin-password"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required={!isEditMode}
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