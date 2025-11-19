// client/src/components/admin/TopCategoriesTable.jsx

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.jsx";
import { Trophy } from 'lucide-react';

const TopCategoriesTable = ({ data }) => {
    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    Top Selling Categories
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm text-left">
                        <thead className="[&_tr]:border-b">
                            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Rank</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Category</th>
                                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Sales</th>
                                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Revenue</th>
                            </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                            {data && data.length > 0 ? (
                                data.map((item, index) => (
                                    <tr key={item.name} className="border-b transition-colors hover:bg-muted/50">
                                        <td className="p-4 align-middle font-bold text-primary">#{index + 1}</td>
                                        <td className="p-4 align-middle font-medium">{item.name}</td>
                                        <td className="p-4 align-middle text-right">{item.sales}</td>
                                        <td className="p-4 align-middle text-right">${item.revenue.toFixed(2)}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-muted-foreground">
                                        No sales data available for this range.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
};

export default TopCategoriesTable;