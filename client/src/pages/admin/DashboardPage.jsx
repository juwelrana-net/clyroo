// client/src/pages/admin/DashboardPage.jsx

import React, { useState, useEffect } from 'react';
import { useOutletContext, useLocation } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { Loader2 } from 'lucide-react';

import RevenueChart from '@/components/admin/RevenueChart.jsx';
import SalesChart from '@/components/admin/SalesChart.jsx';

// Ek naya component Stats Card ke liye (optional, par clean rehta hai)
const StatCard = ({ title, value, subtext }) => (
    <div className="bg-background p-6 rounded-lg border border-border shadow-sm">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <p className="text-3xl font-bold">{value}</p>
        {subtext && <p className="text-xs text-muted-foreground">{subtext}</p>}
    </div>
);


const DashboardPage = () => {
    // AdminLayout se REAL data aur function receive karein
    const {
        dashboardStats,
        setStatRange,
        statRange,
        chartData,
        loadingCharts,
        adminUser
    } = useOutletContext();

    // Greeting (waise hi rahega)
    const getGreeting = () => {
        const hours = new Date().getHours();
        if (hours < 12) return "Good Morning";
        if (hours < 18) return "Good Afternoon";
        return "Good Evening";
    };

    const [isWaving, setIsWaving] = useState(false);
    const location = useLocation(); // Page change detect karne ke liye

    useEffect(() => {
        // 1. Animation shuru karein
        setIsWaving(true);

        // 2. Ek timer set karein jo 2.5 second (animation ki lambai) ke baad animation ko band kar dega
        const timer = setTimeout(() => {
            setIsWaving(false);
        }, 2500); // 2.5 seconds

        // 3. Cleanup function: Agar user page chhod de, toh timer ko clear kar dein
        return () => clearTimeout(timer);

    }, [location.pathname]); // Yeh effect tab chalega jab bhi aapka URL (page) badlega

    const getFirstName = () => {
        // Safety check: Agar user nahi hai ya naam nahi hai
        if (!adminUser || !adminUser.name) {
            return "Admin"; // Fallback
        }
        // "Juwel Rana" ko "Juwel" mein badlein
        return adminUser.name.split(' ')[0];
    };

    // Agar stats abhi load nahi hue (safety check)
    if (!dashboardStats) {
        return null; // Layout mein loader isse handle kar lega
    }

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        {getGreeting()}, {getFirstName()}!

                        {/* Emoji ko span mein daalein.
                          Agar isWaving true hai, toh CSS class add hogi.
                          'inline-block' zaroori hai taaki 'transform' (rotate) kaam kare.
                        */}
                        <span
                            className={isWaving ? "wave-animation" : ""}
                            style={{ display: 'inline-block' }}
                        >
                            👋
                        </span>
                    </h1>
                    <p className="text-muted-foreground">Aapke store ka overview yahaan hai.</p>
                </div>
                {/* Ab yeh Select component kaam karega */}
                <Select
                    defaultValue={statRange}
                    onValueChange={(value) => setStatRange(value)} // State ko update karega
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

            {/* Stats Cards (Ab real data use kar rahe hain) */}
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

            {/* Future Charts Area (waise hi rahega) */}
            <div className="mt-8">
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
        </div>
    );
};
export default DashboardPage;