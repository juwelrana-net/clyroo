// client/src/pages/admin/AdminControlPage.jsx

import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '@/lib/api.js';
import { Button } from '@/components/ui/button.jsx';
import { Loader2, Plus, Users, ShieldAlert, Edit, Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar.jsx";
import AdminForm from '@/components/admin/AdminForm.jsx'; // Naya component
import DeleteAdminDialog from '@/components/admin/DeleteAdminDialog.jsx'; // Naya component

// Chhota helper component Admin card ke liye
const AdminCard = ({ admin, onEdit, onDelete }) => {
    const getInitials = (name) => {
        if (!name) return 'A';
        const names = name.split(' ');
        if (names.length > 1) {
            return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    return (
        <div className="bg-background p-4 rounded-lg border border-border flex justify-between items-center shadow-sm">
            <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                    <AvatarImage src={admin.profileImageUrl} alt={admin.name} />
                    <AvatarFallback>{getInitials(admin.name)}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="font-semibold text-foreground">{admin.name}</p>
                    <p className="text-sm text-muted-foreground">{admin.email}</p>
                    {admin.isSuperAdmin && (
                        <span className="text-xs font-bold text-primary">✨ Super Admin</span>
                    )}
                </div>
            </div>
            <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={() => onEdit(admin)}>
                    <Edit className="h-4 w-4" />
                </Button>
                <Button variant="destructive" size="icon" onClick={() => onDelete(admin)}>
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
};


// Main Page Component
const AdminControlPage = () => {
    // Apne permissions check karne ke liye (waise yeh route protected hai)
    const { adminUser } = useOutletContext();
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Popups ke liye state
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [editingAdmin, setEditingAdmin] = useState(null); // Add/Edit ke liye
    const [adminToDelete, setAdminToDelete] = useState(null); // Delete ke liye

    const fetchAdmins = async () => {
        try {
            setLoading(true);
            const res = await api.get('/api/admin-control');
            setAdmins(res.data);
        } catch (err) {
            setError(err.response?.data?.msg || "Failed to fetch admins");
        } finally {
            setLoading(false);
        }
    };

    // Page load par admins fetch karein
    useEffect(() => {
        fetchAdmins();
    }, []);

    // Form 'Add' mode mein kholne ke liye
    const handleAddNew = () => {
        setEditingAdmin(null); // Edit mode off
        setIsFormOpen(true);
    };

    // Form 'Edit' mode mein kholne ke liye
    const handleEdit = (admin) => {
        setEditingAdmin(admin); // Edit mode on
        setIsFormOpen(true);
    };

    // Delete confirmation kholne ke liye
    const handleDelete = (admin) => {
        setAdminToDelete(admin);
        setIsDeleteOpen(true);
    };

    // Add/Edit/Delete ke baad list ko refresh karein
    const handleAdminChange = () => {
        fetchAdmins();
    };

    // Sirf Super Admin hi yeh page dekh sakta hai (UI check)
    if (!adminUser?.isSuperAdmin) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center">
                <ShieldAlert className="h-16 w-16 text-destructive mb-4" />
                <h1 className="text-2xl font-bold">Access Denied</h1>
                <p className="text-muted-foreground">
                    Only Super Admins can manage other admins.
                </p>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <Users /> Admin Control
                </h1>
                <Button onClick={handleAddNew}>
                    <Plus className="mr-2 h-4 w-4" /> Add New Admin
                </Button>
            </div>

            {loading && <Loader2 className="animate-spin h-8 w-8 text-primary mx-auto" />}

            {error && <p className="text-destructive text-center">{error}</p>}

            {!loading && !error && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {admins.length === 0 && (
                        <p className="text-muted-foreground col-span-2 text-center">
                            No other admins found.
                        </p>
                    )}
                    {admins.map((admin) => (
                        <AdminCard
                            key={admin._id}
                            admin={admin}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}

            {/* --- Popups --- */}
            {isFormOpen && (
                <AdminForm
                    isOpen={isFormOpen}
                    onClose={() => setIsFormOpen(false)}
                    onAdminChange={handleAdminChange}
                    editingAdmin={editingAdmin}
                />
            )}

            {isDeleteOpen && (
                <DeleteAdminDialog
                    isOpen={isDeleteOpen}
                    onClose={() => setIsDeleteOpen(false)}
                    onAdminChange={handleAdminChange}
                    adminToDelete={adminToDelete}
                />
            )}
        </div>
    );
};

export default AdminControlPage;