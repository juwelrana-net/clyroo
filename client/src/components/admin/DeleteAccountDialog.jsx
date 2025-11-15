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
} from '@/components/ui/alert-dialog.jsx'; // 'AlertDialogAction' import nahi kar rahe
import { Loader2, AlertCircle, ShieldAlert } from 'lucide-react';

const DeleteAccountDialog = ({ isOpen, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleDelete = async () => {
        setLoading(true);
        setError(null);
        try {
            // API route ko call karein
            await api.delete('/api/profile/delete');

            // Token hatayein (Logout)
            localStorage.removeItem('adminToken');

            onClose(); // Popup band karein

            // Login page par bhej dein
            navigate('/login');

        } catch (err) {
            setError(err.response?.data?.msg || "Failed to delete account. Please try again.");
            setLoading(false);
        }
    };

    return (
        // onOpenChange ko onClose se link kar dein
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

                {/* Error message (agar aaye) */}
                {error && (
                    <div className="text-destructive-foreground bg-destructive/80 p-3 rounded-lg flex items-center gap-3 text-sm">
                        <AlertCircle size={16} /> {error}
                    </div>
                )}

                <AlertDialogFooter>
                    {/* Cancel Button */}
                    <AlertDialogCancel onClick={onClose} disabled={loading}>
                        Cancel
                    </AlertDialogCancel>

                    {/* Delete Button (Custom Button) */}
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