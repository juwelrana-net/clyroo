// client/src/components/admin/SalesChart.jsx
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.jsx"; // ShadCN Card

const SalesChart = ({ data }) => {
    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Total Sales (Orders)</CardTitle>
            </CardHeader>
            <CardContent className="h-[250px] w-full p-0">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.2} />
                        <XAxis
                            dataKey="name"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            allowDecimals={false} // Sales poore number hote hain
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'hsl(var(--background))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '0.5rem'
                            }}
                        />
                        <Bar
                            dataKey="sales"
                            fill="hsl(var(--primary))"
                            fillOpacity={0.8}
                            radius={[4, 4, 0, 0]} // Rounded corners
                        />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
};

export default SalesChart;