'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { useEffect, useState } from "react";

interface Subscriber {
    country: string;
}

interface CountryData {
    country: string;
    count: number;
}

export default function SubscribersByCountryChart() {
    const [data, setData] = useState<CountryData[]>([]);
    const [totalSubscribers, setTotalSubscribers] = useState(0);

    useEffect(() => {
        async function fetchSubscribers() {
            try {
                const res = await fetch('/api/newsletter/subscribers');
                const subscribers = await res.json() as Subscriber[];

                setTotalSubscribers(subscribers.length);

                // Count subscribers by country
                const countryCount = subscribers.reduce<Record<string, number>>((acc, subscriber) => {
                    const country = subscriber.country;
                    acc[country] = (acc[country] || 0) + 1;
                    return acc;
                }, {});

                // Convert to array format for the chart
                const chartData: CountryData[] = Object.entries(countryCount)
                    .map(([country, count]) => ({
                        country,
                        count,
                    }))
                    .sort((a, b) => b.count - a.count); // Sort by count in descending order

                setData(chartData);
            } catch (error) {
                console.error('Failed to fetch subscribers:', error);
            }
        }

        fetchSubscribers();
    }, []);

    return (
        <Card className="mt-6">
            <CardHeader>
                <CardTitle>Subscribers by Country</CardTitle>
                <CardDescription>Distribution of subscribers across different countries</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[300px]">
                    {totalSubscribers < 2 ? (
                        <div className="h-full flex items-center justify-center text-muted-foreground">
                            Not enough data to display the chart. You need at least 2 subscribers.
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data}>
                                <XAxis 
                                    dataKey="country" 
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis 
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `${value}`}
                                />
                                <Tooltip 
                                    cursor={{ fill: 'rgba(0, 0, 0, 0.1)' }}
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div className="rounded-lg border bg-background p-2 shadow-sm">
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <div className="flex flex-col">
                                                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                                                                Country
                                                            </span>
                                                            <span className="font-bold text-muted-foreground">
                                                                {payload[0].payload.country}
                                                            </span>
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                                                                Subscribers
                                                            </span>
                                                            <span className="font-bold">
                                                                {payload[0].value}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Bar
                                    dataKey="count"
                                    fill="#3b82f6"
                                    radius={[4, 4, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </CardContent>
        </Card>
    );
} 