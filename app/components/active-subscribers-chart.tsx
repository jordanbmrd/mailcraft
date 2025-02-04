"use client"
import * as React from "react"
import {Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis} from "recharts"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"

const activeSubscribersData = [
    { date: "2024-01-01", subscribers: 1200 },  // New Year spike
    { date: "2024-02-01", subscribers: 1450 },
    { date: "2024-03-01", subscribers: 1630 },  // Spring growth
    { date: "2024-04-01", subscribers: 1780 },
    { date: "2024-05-01", subscribers: 1950 },  // Summer start dip
    { date: "2024-06-01", subscribers: 1820 },
    { date: "2024-07-01", subscribers: 1740 },  // Summer vacation
    { date: "2024-08-01", subscribers: 2010 },
    { date: "2024-09-01", subscribers: 2250 },  // Back-to-school
    { date: "2024-10-01", subscribers: 2430 },
    { date: "2024-11-01", subscribers: 2650 },  // Pre-holiday growth
    { date: "2024-12-01", subscribers: 3120 },  // Holiday surge
    { date: "2025-01-01", subscribers: 2870 },  // Post-holiday churn
    { date: "2025-01-07", subscribers: 2950 },
    { date: "2025-01-14", subscribers: 3080 },
    { date: "2025-01-21", subscribers: 3240 },
    { date: "2025-01-28", subscribers: 3410 },
    { date: "2025-02-01", subscribers: 3560 },  // Current month
    { date: "2025-02-04", subscribers: 3580 },  // Current date
    // Detailed weekly data for the last 3 months
    ...Array.from({ length: 12 }).map((_, i) => ({
        date: new Date(2024, 10, i * 7 + 1).toISOString().split('T')[0],
        subscribers: 2500 + Math.floor(Math.random() * 500) + i * 50
    })),
    // Detailed daily data for last month
    ...Array.from({ length: 30 }).map((_, i) => ({
        date: new Date(2025, 0, i + 1).toISOString().split('T')[0],
        subscribers: 3000 + Math.floor(Math.random() * 200) + i * 20
    })),
].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

export default function ActiveSubscribersChart() {
    const [timeRange, setTimeRange] = React.useState<"7d" | "30d" | "90d" | "all">("7d")

    const filteredData = activeSubscribersData.filter((item) => {
        if (timeRange === "all") return true

        const currentDate = new Date(2025, 1, 4) // February 4, 2025
        const itemDate = new Date(item.date)
        const timeDiff = currentDate.getTime() - itemDate.getTime()
        const dayDiff = timeDiff / (1000 * 3600 * 24)

        return dayDiff <= parseInt(timeRange.replace('d', ''))
    })

    return (
        <Card className="mt-6">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-1">
                    <CardTitle>Active Subscribers</CardTitle>
                    <CardDescription>Daily engagement overview</CardDescription>
                </div>
                <Select value={timeRange} onValueChange={(value) => setTimeRange(value as "7d" | "30d" | "90d" | "all")}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select range" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="7d">Last 7 days</SelectItem>
                        <SelectItem value="30d">Last 30 days</SelectItem>
                        <SelectItem value="90d">Last 90 days</SelectItem>
                        <SelectItem value="all">All time</SelectItem>
                    </SelectContent>
                </Select>
            </CardHeader>
            <CardContent>
                <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={filteredData}>
                            <defs>
                                <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                </linearGradient>
                            </defs>

                            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />

                            <XAxis
                                dataKey="date"
                                tick={{ fill: '#64748b' }}
                                tickLine={{ stroke: '#64748b' }}
                                tickFormatter={(value) => {
                                    const date = new Date(value)
                                    return timeRange === "all"
                                        ? date.toLocaleDateString("en-US", { month: 'short', year: '2-digit' })
                                        : date.toLocaleDateString("en-US", { month: 'short', day: 'numeric' })
                                }}
                            />

                            <YAxis
                                tick={{ fill: '#64748b' }}
                                tickLine={{ stroke: '#64748b' }}
                                tickFormatter={(value) => `${value / 1000}k`}
                            />

                            <Tooltip
                                contentStyle={{
                                    background: '#fff',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                }}
                                formatter={(value) => [`${value} subscribers`, '']}
                                labelFormatter={(label) =>
                                    new Date(label).toLocaleDateString("en-US", {
                                        weekday: 'short',
                                        month: 'short',
                                        day: 'numeric'
                                    })
                                }
                            />

                            <Area
                                type="monotone"
                                dataKey="subscribers"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                fill="url(#gradient)"
                                fillOpacity={0.2}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
