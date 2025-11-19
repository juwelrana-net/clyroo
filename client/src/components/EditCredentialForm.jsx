// client/src/components/EditCredentialForm.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { toast } from "sonner"; // <--- Import Toast
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog.jsx";
import { Loader2 } from 'lucide-react'; // Loader icon

const EditCredentialForm = ({ credential, isOpen, onClose, onCredentialChange }) => {
    const [editData, setEditData] = useState({});
    const [loading, setLoading] = useState(false); // Loading state
    const token = localStorage.getItem('adminToken');

    useEffect(() => {
        if (credential && credential.credentialData) {
            setEditData(credential.credentialData);
        }
    }, [credential]);

    if (!credential) return null;

    const handleEditChange = (key, value) => {
        setEditData(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await axios.put(
                `/api/admin/credentials/${credential._id}`,
                { credentialData: editData },
                { headers: { 'x-auth-token': token } }
            );

            toast.success("Credential updated successfully!");
            onCredentialChange();
            onClose();

        } catch (err) {
            toast.error(err.response?.data?.msg || "Update failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Edit Credential</DialogTitle>
                    <DialogDescription>
                        Credential ID: {credential._id}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSave} className="space-y-4 max-h-[70vh] overflow-y-auto pr-4">

                    {Object.keys(editData).map((key) => (
                        <div key={key}>
                            <Label htmlFor={`edit-${key}`} className="text-muted-foreground">{key}</Label>
                            <Input
                                id={`edit-${key}`}
                                value={editData[key]}
                                onChange={(e) => handleEditChange(key, e.target.value)}
                            />
                        </div>
                    ))}

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? <Loader2 className="animate-spin mr-2" /> : null}
                            {loading ? "Saving..." : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default EditCredentialForm;