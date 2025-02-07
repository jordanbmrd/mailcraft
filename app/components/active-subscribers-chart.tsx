"use client"
import * as React from "react"
import {Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis} from "recharts"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import {useEffect, useState} from "react"
import moment from "moment"

type ChartData = {
    date: string;
    subscribers: number;
}

export default function ActiveSubscribersChart() {
    const [data, setData] = useState<ChartData[]>([])
    const [timeRange, setTimeRange] = React.useState<"7d" | "30d" | "90d" | "all">("7d")
    const [totalSubscribers, setTotalSubscribers] = useState(0)

    useEffect(() => {
        async function fetchSubscriberHistory() {
            try {
                const res = await fetch('/api/newsletter/subscribers')
                const subscribers = await res.json()

                setTotalSubscribers(subscribers.length)

                // Grouper les abonnés par date
                const groupedByDate = subscribers.reduce((acc: { [key: string]: number }, sub: any) => {
                    const date = moment(sub.joinDate).format('YYYY-MM-DD')
                    acc[date] = (acc[date] || 0) + 1
                    return acc
                }, {})

                // Créer un tableau des derniers jours
                const days = timeRange === "all" ? 90 : parseInt(timeRange.replace('d', ''))
                const daysArray = Array.from({length: days}, (_, i) => {
                    const date = moment().subtract(days - 1 - i, 'days')
                    const dateStr = date.format('YYYY-MM-DD')
                    return {
                        date: dateStr,
                        subscribers: groupedByDate[dateStr] || 0
                    }
                })

                // Calculer le cumul des abonnés
                let cumulativeSubscribers = 0
                const cumulativeData = daysArray.map(item => {
                    cumulativeSubscribers += item.subscribers
                    return {
                        date: item.date,
                        subscribers: cumulativeSubscribers
                    }
                })

                setData(cumulativeData)
            } catch (error) {
                console.error('Failed to fetch subscriber history:', error)
            }
        }
        fetchSubscriberHistory()
    }, [timeRange])

    const filteredData = data

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
                    {totalSubscribers < 2 ? (
                        <div className="h-full flex items-center justify-center text-muted-foreground">
                            Not enough data to display the chart. You need at least 2 subscribers.
                        </div>
                    ) : (
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
                                    tickFormatter={(value) => moment(value).format('MMM D')}
                                />

                                <YAxis
                                    tick={{ fill: '#64748b' }}
                                    tickLine={{ stroke: '#64748b' }}
                                    tickFormatter={(value) => `${value}`}
                                />

                                <Tooltip
                                    contentStyle={{
                                        background: '#fff',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                    }}
                                    formatter={(value) => [`${value} subscribers`, '']}
                                    labelFormatter={(label) => moment(label).format('MMM D, YYYY')}
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
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
