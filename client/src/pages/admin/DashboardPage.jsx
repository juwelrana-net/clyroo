// client/src/pages/admin/DashboardPage.jsx

import React, { useState, useEffect } from 'react';
import { useOutletContext, useLocation } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { Loader2 } from 'lucide-react';

// Components Import Karein
import RevenueChart from '@/components/admin/RevenueChart.jsx';
import SalesChart from '@/components/admin/SalesChart.jsx';
import TopCategoriesTable from '@/components/admin/TopCategoriesTable.jsx'; // <--- Naya Component
import StockPieChart from '@/components/admin/StockPieChart.jsx';       // <--- Naya Component

const StatCard = ({ title, value, subtext }) => (
    <div className="bg-background p-6 rounded-lg border border-border shadow-sm">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <p className="text-3xl font-bold">{value}</p>
        {subtext && <p className="text-xs text-muted-foreground">{subtext}</p>}
    </div>
);

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
        <div className="space-y-8"> {/* Vertical spacing badha di */}

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
                />
                <StatCard
                    title="Total Products"
                    value={dashboardStats.totalProducts}
                    subtext="Total types of products listed"
                />
                <StatCard
                    title="Total Stock (Unsold)"
                    value={dashboardStats.totalStock}
                    subtext="Total credentials available to sell"
                />
                <StatCard
                    title="Total Sales"
                    value={dashboardStats.totalSales}
                    subtext="Total orders completed"
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

            {/* --- NAYA SECTION: Category Table & Pie Chart --- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left: Top Selling Categories */}
                <TopCategoriesTable data={dashboardStats.topCategories} />

                {/* Right: Stock Distribution Pie Chart */}
                <StockPieChart data={dashboardStats.stockDistribution} />
            </div>

        </div>
    );
};
export default DashboardPage;