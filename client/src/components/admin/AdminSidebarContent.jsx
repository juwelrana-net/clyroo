// client/src/components/admin/AdminSidebarContent.jsx

import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button.jsx';
import {
    LayoutDashboard, // Dashboard ke liye
    Package,
    Layers,
    HandCoins,
    FolderKanban,
    Headset,
    BellRing,
    LogOut,
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

// NavLink ke liye ek helper component
const AdminNavLink = ({ to, icon: Icon, children }) => {
    const navLinkClass = ({ isActive }) =>
        cn(
            "flex items-center gap-3 rounded-lg px-4 py-3 text-muted-foreground transition-all hover:text-primary hover:bg-primary/10",
            isActive && "bg-primary/10 text-primary font-semibold"
        );

    return (
        <NavLink to={to} className={navLinkClass}>
            <Icon className="h-5 w-5" />
            {children}
        </NavLink>
    );
};

// Main Content
const AdminSidebarContent = () => {
    const [logoutPopupOpen, setLogoutPopupOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        navigate('/login');
    };

    return (
        <>
            {/* Nav links ka poora structure */}
            <nav className="flex h-full flex-col p-4">
                {/* Logo */}
                {/* <div className="flex items-center gap-2 px-4 pb-4 border-b border-border">
                    <Package2 size={28} className="text-primary" />
                    <span className="text-2xl font-bold text-primary">clyroo</span>
                </div> */}

                {/* Nav Links */}
                <div className="flex-1 mt-4 space-y-2">
                    <AdminNavLink to="/admin/dashboard" icon={LayoutDashboard}>
                        Dashboard
                    </AdminNavLink>
                    <AdminNavLink to="/admin/products" icon={Package}>
                        Products
                    </AdminNavLink>
                    <AdminNavLink to="/admin/stocks" icon={Layers}>
                        Stocks
                    </AdminNavLink>
                    <AdminNavLink to="/admin/payments" icon={HandCoins}>
                        Payments
                    </AdminNavLink>
                    <AdminNavLink to="/admin/categories" icon={FolderKanban}>
                        Category
                    </AdminNavLink>
                    <AdminNavLink to="/admin/contacts" icon={Headset}>
                        Contact
                    </AdminNavLink>
                    <AdminNavLink to="/admin/notifications" icon={BellRing}>
                        Notifications
                    </AdminNavLink>
                </div>

                {/* Logout Button (Neeche) */}
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

            {/* Logout Popup */}
            <Dialog open={logoutPopupOpen} onOpenChange={setLogoutPopupOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-2xl text-center">👋 Good Bye!</DialogTitle>
                        <DialogDescription className="text-center pt-2">
                            Kya aap waqai logout karna chahte hain?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="sm:justify-center pt-4">
                        <Button variant="outline" onClick={() => setLogoutPopupOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleLogout}>
                            Sure, I want to Logout
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default AdminSidebarContent;