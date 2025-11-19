// client/src/components/admin/DeleteAccountDialog.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

const DeleteAccountDialog = ({ isOpen, onClose }) => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleDelete = async () => {
        setLoading(true);
        try {
            await api.delete('/api/profile/delete');
            localStorage.removeItem('adminToken');
            toast.success("Your account has been deleted.");
            onClose();
            navigate('/login');
        } catch (err) {
            toast.error(err.response?.data?.msg || "Failed to delete account.");
            setLoading(false);
        }
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={onClose}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                        <ShieldAlert className="text-destructive" />
                        Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your
                        admin account and remove your profile image from Cloudinary.
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
                        {loading ? "Deleting..." : "Yes, delete my account"}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default DeleteAccountDialog;