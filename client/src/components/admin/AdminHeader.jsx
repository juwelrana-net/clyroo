// client/src/components/admin/AdminHeader.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button.jsx';
import { ThemeToggle } from '@/components/ThemeToggle.jsx';
import { Menu, Package2, User, Edit, Trash2 } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet.jsx';
import AdminSidebarContent from './AdminSidebarContent.jsx'; // Mobile menu ke liye

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.jsx";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar.jsx";
import { Skeleton } from "@/components/ui/skeleton.jsx";

// User Dropdown Component (waisa hi hai)
const UserProfileDropdown = ({ adminUser, loadingUser, onEdit, onDelete }) => {
    if (loadingUser) {
        return <Skeleton className="h-10 w-10 rounded-full" />;
    }
    if (!adminUser) {
        return (
            <Avatar>
                <AvatarFallback><User /></AvatarFallback>
            </Avatar>
        );
    }
    const getInitials = (name) => {
        if (!name || typeof name !== 'string' || name.trim().length === 0) {
            return adminUser.email ? adminUser.email[0].toUpperCase() : 'A';
        }
        const names = name.split(' ');
        if (names.length > 1) {
            return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };
    const isSuperAdmin = adminUser.isSuperAdmin === true;
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar>
                        <AvatarImage src={adminUser.profileImageUrl} alt={adminUser.name || 'Admin'} />
                        <AvatarFallback>{getInitials(adminUser.name)}</AvatarFallback>
                    </Avatar>
                    {isSuperAdmin && (
                        <span className="avatar-glow-ring"></span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{adminUser.name || 'Admin User'}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                            {adminUser.email}
                        </p>
                        {isSuperAdmin && (
                            <span className="text-xs font-bold text-primary mt-1">
                                ✨ Super Admin
                            </span>
                        )}
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {isSuperAdmin ? (
                    <>
                        <DropdownMenuItem onClick={onEdit}>
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Edit Profile</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive" onClick={onDelete}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Delete Account</span>
                        </DropdownMenuItem>
                    </>
                ) : (
                    <DropdownMenuLabel className="font-normal text-muted-foreground text-xs px-2">
                        Only Super Admins can edit profiles.
                    </DropdownMenuLabel>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};


// Main AdminHeader Component
const AdminHeader = ({ adminUser, loadingUser, onEditProfile, onDeleteAccount }) => {
    return (
        <header className="flex h-16 items-center justify-between gap-4 bg-background px-4 md:px-6 rounded-xl border border-border shadow-lg">
            <div className="flex items-center gap-4">
                {/* Mobile Menu */}
                <div className="md:hidden">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="outline" size="icon">
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Toggle Menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-64 p-0">
                            <SheetHeader className="sr-only">
                                <SheetTitle>Admin Menu</SheetTitle>
                                <SheetDescription>Admin panel navigation links</SheetDescription>
                            </SheetHeader>

                            {/* --- YEH UPDATE HAI --- */}
                            {/* adminUser ko yahaan pass karein taaki mobile menu bhi permissions check kar sake */}
                            <AdminSidebarContent adminUser={adminUser} />
                            {/* --- UPDATE KHATAM --- */}

                        </SheetContent>
                    </Sheet>
                </div>

                {/* Logo (waisa hi hai) */}
                <Link to="/admin/dashboard" className="flex items-center gap-2">
                    <Package2 size={24} className="text-primary" />
                    <span className="text-xl font-bold text-primary">clyroo</span>
                </Link>
            </div>

            {/* Right Side (waisa hi hai) */}
            <div className="flex items-center gap-3">
                <ThemeToggle />
                <UserProfileDropdown
                    adminUser={adminUser}
                    loadingUser={loadingUser}
                    onEdit={onEditProfile}
                    onDelete={onDeleteAccount}
                />
            </div>
        </header>
    );
};

export default AdminHeader;