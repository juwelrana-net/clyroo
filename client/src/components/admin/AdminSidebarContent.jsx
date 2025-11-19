// client/src/components/admin/AdminSidebarContent.jsx

import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button.jsx';
import {
    LayoutDashboard,
    Package,
    Layers,
    HandCoins,
    FolderKanban,
    Headset,
    BellRing,
    Users,
    LogOut,
    ShieldAlert,
} from 'lucide-react';
import { cn } from '@/lib/utils.js';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog.jsx";

// AdminNavLink helper (Same as before)
const AdminNavLink = ({ to, icon: Icon, children, disabled }) => {
    const navLinkClass = ({ isActive }) =>
        cn(
            "flex items-center gap-3 rounded-lg px-4 py-3 text-muted-foreground transition-all",
            !disabled && "hover:text-primary hover:bg-primary/10",
            isActive && !disabled && "bg-primary/10 text-primary font-semibold",
            disabled && "opacity-50 cursor-not-allowed"
        );

    return (
        <NavLink
            to={disabled ? "#" : to}
            onClick={(e) => disabled && e.preventDefault()}
            className={navLinkClass}
            aria-disabled={disabled}
        >
            <Icon className="h-5 w-5" />
            {children}
            {disabled && <ShieldAlert className="h-4 w-4 ml-auto text-yellow-500" />}
        </NavLink>
    );
};

const AdminSidebarContent = ({ adminUser }) => {
    const [logoutPopupOpen, setLogoutPopupOpen] = useState(false);
    const navigate = useNavigate();
    const permissions = adminUser?.permissions || {};

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        navigate('/login');
    };

    return (
        <>
            <nav className="flex h-full flex-col p-4">
                <div className="flex-1 mt-4 space-y-2">
                    <AdminNavLink to="/admin/dashboard" icon={LayoutDashboard}>
                        Dashboard
                    </AdminNavLink>
                    <AdminNavLink to="/admin/products" icon={Package} disabled={!permissions.manageProducts}>
                        Products
                    </AdminNavLink>
                    <AdminNavLink to="/admin/stocks" icon={Layers} disabled={!permissions.manageStock}>
                        Stocks
                    </AdminNavLink>
                    <AdminNavLink to="/admin/payments" icon={HandCoins} disabled={!permissions.managePayments}>
                        Payments
                    </AdminNavLink>
                    <AdminNavLink to="/admin/categories" icon={FolderKanban} disabled={!permissions.manageCategories}>
                        Category
                    </AdminNavLink>
                    <AdminNavLink to="/admin/contacts" icon={Headset} disabled={!permissions.manageContacts}>
                        Contact
                    </AdminNavLink>
                    <AdminNavLink to="/admin/notifications" icon={BellRing} disabled={!permissions.manageNotifications}>
                        Notifications
                    </AdminNavLink>
                    <AdminNavLink to="/admin/admincontrol" icon={Users} disabled={!permissions.manageAdmins}>
                        Admin Control
                    </AdminNavLink>
                </div>

                <div className="mt-auto pt-4 border-t border-border">
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 px-4 py-3 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => setLogoutPopupOpen(true)}
                    >
                        <LogOut className="h-5 w-5" />
                        Logout
                    </Button>
                </div>
            </nav>

            {/* --- CREATIVE LOGOUT POPUP --- */}
            <Dialog open={logoutPopupOpen} onOpenChange={setLogoutPopupOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-2xl text-center">👋 See You Later!</DialogTitle>
                        <DialogDescription className="text-center pt-2 text-muted-foreground">
                            Are you sure you want to sign out?
                            <br />
                            We'll keep the lights on for you until you return!
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="sm:justify-center pt-4 gap-2">
                        <Button variant="outline" onClick={() => setLogoutPopupOpen(false)}>
                            Stay Here
                        </Button>
                        <Button variant="destructive" onClick={handleLogout}>
                            Yes, Log Me Out
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default AdminSidebarContent;