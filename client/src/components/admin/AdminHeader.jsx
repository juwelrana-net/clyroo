// client/src/components/admin/AdminHeader.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button.jsx';
import { ThemeToggle } from '@/components/ThemeToggle.jsx';
import { Menu, Package2, User, Edit, Trash2 } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet.jsx';
import AdminSidebarContent from './AdminSidebarContent.jsx';

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

// --- Naya: User Dropdown Component ---
const UserProfileDropdown = ({ adminUser, loadingUser, onEdit, onDelete }) => {
    // const [adminUser, setAdminUser] = useState(null);
    // const [loadingUser, setLoadingUser] = useState(true);

    // Jab component load ho, toh user data fetch karein
    // useEffect(() => {
    //     const fetchUser = async () => {
    //         try {
    //             const res = await api.get('/api/profile/me');
    //             setAdminUser(res.data);
    //         } catch (err) {
    //             console.error("Failed to fetch admin user", err);
    //             // Shayad token expire ho gaya, error handle karna zaroori nahi,
    //             // kyunki AdminRoute usse login par bhej dega
    //         } finally {
    //             setLoadingUser(false);
    //         }
    //     };
    //     fetchUser();
    // }, []);

    if (loadingUser) {
        // Data load hote waqt loading circle dikhayein
        return <Skeleton className="h-10 w-10 rounded-full" />;
    }

    if (!adminUser) {
        return (
            <Avatar>
                <AvatarFallback><User /></AvatarFallback>
            </Avatar>
        );
    }

    // User ka naam (e.g., "Juwel Rana" -> "JR")
    const getInitials = (name) => {
        const names = name.split(' ');
        if (names.length > 1) {
            return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar>
                        <AvatarImage src={adminUser.profileImageUrl} alt={adminUser.name} />
                        <AvatarFallback>{getInitials(adminUser.name)}</AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{adminUser.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                            {adminUser.email}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onEdit}>
                    <Edit className="mr-2 h-4 w-4" />
                    <span>Edit Profile</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive" onClick={onDelete}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>Delete Account</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
// --- User Dropdown Component Khatam ---


// --- Main AdminHeader Component (Update kiya gaya) ---
const AdminHeader = ({ adminUser, loadingUser, onEditProfile, onDeleteAccount }) => {
    return (
        <header className="flex h-16 items-center justify-between gap-4 bg-background px-4 md:px-6 rounded-xl border border-border shadow-lg">

            {/* Left Side: Logo & Mobile Menu */}
            <div className="flex items-center gap-4">
                {/* Mobile Menu (Sheet) */}
                <div className="md:hidden">
                    {/* ... (Sheet ka code waise hi rahega) ... */}
                </div>
                {/* Logo */}
                <Link to="/admin/dashboard" className="flex items-center gap-2">
                    {/* ... (Logo ka code waise hi rahega) ... */}
                </Link>
            </div>


            {/* Right Side: Theme Toggle + Profile Dropdown */}
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