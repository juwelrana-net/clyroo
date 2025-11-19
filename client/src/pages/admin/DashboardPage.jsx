// client/src/pages/admin/DashboardPage.jsx

import React, { useState, useEffect } from 'react';
import { useOutletContext, useLocation } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { Loader2, DollarSign, Package, Layers, ShoppingCart } from 'lucide-react';

// Components Import Karein
import RevenueChart from '@/components/admin/RevenueChart.jsx';
import SalesChart from '@/components/admin/SalesChart.jsx';
import TopCategoriesTable from '@/components/admin/TopCategoriesTable.jsx';
import StockPieChart from '@/components/admin/StockPieChart.jsx';
import { cn } from '@/lib/utils.js';

// --- UPDATED StatCard COMPONENT ---
const StatCard = ({ title, value, subtext, icon: Icon, gradientClass }) => (
    <div className={cn(
        "relative p-6 rounded-xl shadow-sm border border-border/50 overflow-hidden transition-all hover:shadow-md",
        "bg-gradient-to-br from-secondary/50 to-background", // Fallback
        gradientClass // Custom gradient color
    )}>
        {/* Absolute positioned icon - Fixed for Light Mode */}
        {Icon && (
            <Icon
                className="absolute -top-2 -right-2 h-16 w-16 text-primary/10 -rotate-12 transition-transform group-hover:scale-110 pointer-events-none"
            />
        )}

        <div className="relative z-10">
            <h3 className="text-sm font-medium text-muted-foreground tracking-wide uppercase">
                {title}
            </h3>
            <p className="text-4xl font-extrabold mt-2 text-foreground tracking-tight">
                {value}
            </p>
            {subtext && (
                <p className="text-xs font-medium text-muted-foreground mt-2 bg-background/40 inline-block px-2 py-1 rounded-md backdrop-blur-sm">
                    {subtext}
                </p>
            )}
        </div>
    </div>
);
// --- END UPDATED StatCard COMPONENT ---

const DashboardPage = () => {
    const {
        dashboardStats,
        setStatRange,
        statRange,
        chartData,
        loadingCharts,
        adminUser
    } = useOutletContext();

    const getGreeting = () => {
        const hours = new Date().getHours();
        if (hours < 12) return "Good Morning";
        if (hours < 18) return "Good Afternoon";
        return "Good Evening";
    };

    const [isWaving, setIsWaving] = useState(false);
    const location = useLocation();

    useEffect(() => {
        setIsWaving(true);
        const timer = setTimeout(() => {
            setIsWaving(false);
        }, 2500);
        return () => clearTimeout(timer);
    }, [location.pathname]);

    const getFirstName = () => {
        if (!adminUser || !adminUser.name) {
            return "Admin";
        }
        return adminUser.name.split(' ')[0];
    };

    if (!dashboardStats) {
        return null;
    }

    return (
        <div className="space-y-8">

            {/* Header & Filter */}
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        {getGreeting()}, {getFirstName()}!
                        <span
                            className={isWaving ? "wave-animation" : ""}
                            style={{ display: 'inline-block' }}
                        >
                            👋
                        </span>
                    </h1>
                    <p className="text-muted-foreground">Here is an overview of your store.</p>
                </div>
                <Select
                    defaultValue={statRange}
                    onValueChange={(value) => setStatRange(value)}
                >
                    <SelectTrigger className="w-full md:w-[180px]">
                        <SelectValue placeholder="Select date range" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="7days">Last 7 Days</SelectItem>
                        <SelectItem value="30days">Last 30 Days</SelectItem>
                        <SelectItem value="yesterday">Yesterday</SelectItem>
                        <SelectItem value="alltime">All Time</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Stats Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Revenue"
                    value={`${dashboardStats.totalRevenue.toFixed(2)} USDT`}
                    subtext={`based on ${dashboardStats.totalSales} sales`}
                    icon={DollarSign}
                    gradientClass="bg-gradient-to-br from-green-500/20 via-green-500/5 to-background"
                />
                <StatCard
                    title="Total Products"
                    value={dashboardStats.totalProducts}
                    subtext="Active listings"
                    icon={Package}
                    gradientClass="bg-gradient-to-br from-blue-500/20 via-blue-500/5 to-background"
                />
                <StatCard
                    title="Total Stock"
                    value={dashboardStats.totalStock}
                    subtext="Available credentials"
                    icon={Layers}
                    gradientClass="bg-gradient-to-br from-yellow-500/20 via-yellow-500/5 to-background"
                />
                <StatCard
                    title="Total Sales"
                    value={dashboardStats.totalSales}
                    subtext="Orders completed"
                    icon={ShoppingCart}
                    gradientClass="bg-gradient-to-br from-purple-500/20 via-purple-500/5 to-background"
                />
            </div>

            {/* Charts Row 1: Revenue & Sales */}
            <div>
                {loadingCharts ? (
                    <div className="h-64 flex items-center justify-center bg-background rounded-lg border border-border">
                        <Loader2 className="animate-spin h-8 w-8 text-primary" />
                    </div>
                ) : chartData && chartData.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <RevenueChart data={chartData} />
                        <SalesChart data={chartData} />
                    </div>
                ) : (
                    <div className="h-64 flex items-center justify-center bg-background rounded-lg border border-border">
                        <p className="text-muted-foreground">No chart data found for this range.</p>
                    </div>
                )}
            </div>

            {/* Category Table & Pie Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TopCategoriesTable data={dashboardStats.topCategories} />
                <StockPieChart data={dashboardStats.stockDistribution} />
            </div>

        </div>
    );
};
export default DashboardPage;