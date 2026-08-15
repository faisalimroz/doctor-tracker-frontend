'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Stethoscope, Users, Activity, TrendingUp, Calendar } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';

interface DashboardStats {
  totalDoctors: number;
  totalPatients: number;
  patientDistribution: {
    _id: string;
    doctorName: string;
    specialization: string;
    patientCount: number;
  }[];
  admissionTrends: {
    date: string;
    count: number;
  }[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export default function DashboardPage() {
  const { token, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      if (!token) return;
      try {
        const res = await fetch(`${API_URL}/dashboard/stats`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (data.success) {
          setStats(data.data);
        } else {
          setError(data.message || 'Failed to fetch statistics');
        }
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        setError('Network error fetching statistics');
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading && token) {
      fetchStats();
    }
  }, [token, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Activity className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground font-medium">Aggregating hospital analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center p-6 border border-destructive/20 bg-destructive/10 text-destructive rounded-xl max-w-md">
          <h2 className="font-bold text-lg mb-2">Analytics Error</h2>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  const distributionData = stats?.patientDistribution.map((item) => ({
    name: item.doctorName.replace('Dr. ', ''),
    Patients: item.patientCount,
    specialization: item.specialization,
  })) || [];

  const trendData = stats?.admissionTrends.map((item) => {
    const dateObj = new Date(item.date);
    const formattedDate = dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC', // Ensure consistent UTC date parsing to prevent day shift
    });
    return {
      date: formattedDate,
      Admissions: item.count,
    };
  }) || [];

  // Calculate average patients per doctor
  const avgPatients = stats && stats.totalDoctors > 0 
    ? (stats.totalPatients / stats.totalDoctors).toFixed(1)
    : '0';

  return (
    <div className="space-y-8">
      {/* Upper Title Section */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Analytics Overview</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Real-time metrics, staffing counts, and patient admission trends.
        </p>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-md transition-all border-border relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-primary" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Doctors
            </CardTitle>
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Stethoscope className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">{stats?.totalDoctors || 0}</div>
            <p className="text-xs text-muted-foreground mt-2">Active practitioners on duty</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-all border-border relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Patients
            </CardTitle>
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
              <Users className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">{stats?.totalPatients || 0}</div>
            <p className="text-xs text-muted-foreground mt-2">Admitted clinical records</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-all border-border relative overflow-hidden sm:col-span-2 lg:col-span-1">
          <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-500" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Staffing Ratio
            </CardTitle>
            <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-500">
              <TrendingUp className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">{avgPatients}</div>
            <p className="text-xs text-muted-foreground mt-2">Average patients per physician</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Patient distribution per doctor */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-md">
              <Stethoscope className="h-5 w-5 text-primary" />
              <span>Patients per Practitioner</span>
            </CardTitle>
            <CardDescription>Staff load comparison based on current admissions</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {distributionData.length === 0 ? (
              <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                No patient assignments recorded.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={distributionData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
                  <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--card)',
                      borderColor: 'var(--border)',
                      borderRadius: 'var(--radius)',
                      color: 'var(--foreground)',
                    }}
                    cursor={{ fill: 'var(--secondary)', opacity: 0.4 }}
                  />
                  <Bar dataKey="Patients" fill="var(--primary)" radius={[4, 4, 0, 0]} maxBarSize={45} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Patient admission trends */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-md">
              <Calendar className="h-5 w-5 text-emerald-500" />
              <span>Admission History (30 Days)</span>
            </CardTitle>
            <CardDescription>Daily timeline of new patient enrollments</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {trendData.length === 0 ? (
              <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                No recent admission logs found.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAdmissions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="rgb(16, 185, 129)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="rgb(16, 185, 129)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
                  <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={10} tickLine={false} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={10} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--card)',
                      borderColor: 'var(--border)',
                      borderRadius: 'var(--radius)',
                      color: 'var(--foreground)',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="Admissions"
                    stroke="rgb(16, 185, 129)"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorAdmissions)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
