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
import { Loader2, ShieldAlert } from 'lucide-react';
import { toast } from "sonner"; // <--- Import Toast

const DeleteAdminDialog = ({ isOpen, onClose, onAdminChange, adminToDelete }) => {
    const [loading, setLoading] = useState(false);

    if (!adminToDelete) return null;

    const handleDelete = async () => {
        setLoading(true);
        try {
            await api.delete(`/api/admin-control/${adminToDelete._id}`);
            toast.success("Admin account deleted successfully.");
            onAdminChange();
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.msg || "Failed to delete admin.");
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