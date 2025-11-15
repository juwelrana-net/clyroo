// client/src/pages/admin/DashboardPage.jsx

import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';

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
    const { dashboardStats, setStatRange } = useOutletContext();

    // Greeting (waise hi rahega)
    const getGreeting = () => {
        const hours = new Date().getHours();
        if (hours < 12) return "Good Morning";
        if (hours < 18) return "Good Afternoon";
        return "Good Evening";
    };

    // Agar stats abhi load nahi hue (safety check)
    if (!dashboardStats) {
        return null; // Layout mein loader isse handle kar lega
    }

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-bold">{getGreeting()}, Admin!</h1>
                    <p className="text-muted-foreground">Aapke store ka overview yahaan hai.</p>
                </div>
                {/* Ab yeh Select component kaam karega */}
                <Select
                    defaultValue="30days"
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
            <div className="mt-8 bg-background p-6 rounded-lg border border-border h-64 flex items-center justify-center">
                <p className="text-muted-foreground">(Future Charts/Graphs yahaan add honge)</p>
            </div>
        </div>
    );
};
export default DashboardPage;