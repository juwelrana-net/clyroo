// client/src/components/ManageContactLinks.jsx

import React, { useState } from 'react';
import api from '@/lib/api.js';
import { Button } from '@/components/ui/button.jsx';
import { Trash2, Edit, Loader2, MessageCircle, Send } from 'lucide-react';
import { toast } from "sonner";
import ConfirmAlert from '@/components/ConfirmAlert.jsx'; // <--- Import

const ManageContactLinks = ({ contactLinks, onContactChange, onEdit }) => {
    const [loadingId, setLoadingId] = useState(null);

    // --- Delete State ---
    const [linkToDelete, setLinkToDelete] = useState(null);
    const [isAlertOpen, setIsAlertOpen] = useState(false);

    const handleDeleteClick = (link) => {
        setLinkToDelete(link);
        setIsAlertOpen(true);
    };

    const confirmDelete = async () => {
        if (!linkToDelete) return;
        setLoadingId(linkToDelete._id);
        try {
            await api.delete(`/api/contact/admin/${linkToDelete._id}`);
            toast.success("Contact link deleted.");
            onContactChange();
            setIsAlertOpen(false);
            setLinkToDelete(null);
        } catch (err) {
            toast.error("Delete failed. Please try again.");
        } finally {
            setLoadingId(null);
        }
    };

    return (
        <div className="bg-secondary/30 border border-border rounded-lg p-6 h-full">
            <h2 className="text-2xl font-bold mb-4 text-primary">
                Manage Contact Links
            </h2>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {contactLinks.length === 0 && (
                    <p className="text-muted-foreground text-sm">
                        No contact links found. Add one above.
                    </p>
                )}

                {contactLinks.map((link) => (
                    <div
                        key={link._id}
                        className="flex items-center justify-between gap-2 bg-background p-3 rounded-md border border-border"
                    >
                        <div className="flex items-center gap-3">
                            {link.type === 'whatsapp' ? (
                                <MessageCircle size={20} className="text-green-500" />
                            ) : (
                                <Send size={20} className="text-blue-500" />
                            )}
                            <div>
                                <p className="text-foreground font-semibold">
                                    {link.displayText}
                                </p>
                                <p className="text-xs text-muted-foreground font-mono">
                                    {link.value}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onEdit(link)}
                                disabled={loadingId === link._id}
                                className="h-9 w-9"
                            >
                                <Edit size={16} />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteClick(link)} // Updated handler
                                disabled={loadingId === link._id}
                                className="text-destructive h-9 w-9"
                            >
                                {loadingId === link._id ? (
                                    <Loader2 size={16} className="animate-spin" />
                                ) : (
                                    <Trash2 size={16} />
                                )}
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Custom Alert */}
            <ConfirmAlert
                isOpen={isAlertOpen}
                onClose={() => setIsAlertOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Contact Link?"
                description={`Are you sure you want to delete "${linkToDelete?.displayText}"?`}
                loading={loadingId === linkToDelete?._id}
            />
        </div>
    );
};

export default ManageContactLinks;