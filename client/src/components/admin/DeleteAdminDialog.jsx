// client/src/components/admin/DeleteAdminDialog.jsx

import React, { useState } from 'react';
import api from '@/lib/api.js';
import { Button } from '@/components/ui/button.jsx';
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogCancel,
} from '@/components/ui/alert-dialog.jsx';
import { Loader2, AlertCircle, ShieldAlert } from 'lucide-react';

const DeleteAdminDialog = ({ isOpen, onClose, onAdminChange, adminToDelete }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Agar koi admin nahi hai, toh null return karein
    if (!adminToDelete) return null;

    const handleDelete = async () => {
        setLoading(true);
        setError(null);
        try {
            await api.delete(`/api/admin-control/${adminToDelete._id}`);
            onAdminChange(); // List refresh karein
            onClose(); // Popup band karein
        } catch (err) {
            setError(err.response?.data?.msg || "Failed to delete admin.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={onClose}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                        <ShieldAlert className="text-destructive" />
                        Delete Admin?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to delete the admin{' '}
                        <strong>{adminToDelete.name}</strong> ({adminToDelete.email})?
                        <br />
                        This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                {error && (
                    <div className="text-destructive-foreground bg-destructive/80 p-3 rounded-lg flex items-center gap-3 text-sm">
                        <AlertCircle size={16} /> {error}
                    </div>
                )}

                <AlertDialogFooter>
                    <AlertDialogCancel onClick={onClose} disabled={loading}>
                        Cancel
                    </AlertDialogCancel>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={loading}
                    >
                        {loading && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
                        {loading ? "Deleting..." : "Yes, delete admin"}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default DeleteAdminDialog;