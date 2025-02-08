'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { JobApplication } from '@/lib/types';
import toast from 'react-hot-toast';

interface MonthlyStats {
  totalApplications: number;
  statusBreakdown: {
    Applied: number;
    Interviewing: number;
    Offer: number;
    Rejected: number;
  };
  platformBreakdown: { [key: string]: number };
  responseRate: number;
}

export default function MonthlySummaryPage() {
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats>({
    totalApplications: 0,
    statusBreakdown: {
      Applied: 0,
      Interviewing: 0,
      Offer: 0,
      Rejected: 0,
    },
    platformBreakdown: {},
    responseRate: 0,
  });

  useEffect(() => {
    loadMonthlyStats();
  }, [selectedMonth]);

  const loadMonthlyStats = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get the date range for the selected month
      const [year, month] = selectedMonth.split('-');
      const startDate = new Date(Number(year), Number(month) - 1, 1);
      const endDate = new Date(Number(year), Number(month), 0);

      // Fetch applications for the selected month
      const { data: applications, error } = await supabase
        .from('job_applications')
        .select('*')
        .eq('user_id', user.id)
        .gte('applied_date', startDate.toISOString().split('T')[0])
        .lte('applied_date', endDate.toISOString().split('T')[0]);

      if (error) throw error;

      // Calculate statistics
      const stats: MonthlyStats = {
        totalApplications: applications?.length || 0,
        statusBreakdown: {
          Applied: 0,
          Interviewing: 0,
          Offer: 0,
          Rejected: 0,
        },
        platformBreakdown: {},
        responseRate: 0,
      };

      applications?.forEach((app: JobApplication) => {
        // Status breakdown
        stats.statusBreakdown[app.status]++;

        // Platform breakdown
        if (app.platform) {
          stats.platformBreakdown[app.platform] = (stats.platformBreakdown[app.platform] || 0) + 1;
        }
      });

      // Calculate response rate (anything other than 'Applied' status)
      const responses = applications?.filter(app => app.status !== 'Applied').length || 0;
      stats.responseRate = stats.totalApplications > 0
        ? (responses / stats.totalApplications) * 100
        : 0;

      setMonthlyStats(stats);
    } catch (error) {
      console.error('Error loading monthly stats:', error);
      toast.error('Failed to load monthly statistics');
    } finally {
      setLoading(false);
    }
  };

  const getAvailableMonths = () => {
    const months = [];
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    // Generate last 12 months
    for (let i = 0; i < 12; i++) {
      let year = currentYear;
      let month = currentMonth - i;
      
      if (month <= 0) {
        month += 12;
        year -= 1;
      }

      months.push({
        value: `${year}-${String(month).padStart(2, '0')}`,
        label: new Date(year, month - 1).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }),
      });
    }

    return months;
  };

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Monthly Summary</h1>
          <p className="mt-2 text-sm text-gray-700">
            Track your job application progress and statistics for each month
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            {getAvailableMonths().map((month) => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading statistics...</div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
            <dt className="truncate text-sm font-medium text-gray-500">Total Applications</dt>
            <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
              {monthlyStats.totalApplications}
            </dd>
          </div>

          <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
            <dt className="truncate text-sm font-medium text-gray-500">Response Rate</dt>
            <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
              {monthlyStats.responseRate.toFixed(1)}%
            </dd>
          </div>

          <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
            <dt className="truncate text-sm font-medium text-gray-500">Active Interviews</dt>
            <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
              {monthlyStats.statusBreakdown.Interviewing}
            </dd>
          </div>

          <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
            <dt className="truncate text-sm font-medium text-gray-500">Offers Received</dt>
            <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
              {monthlyStats.statusBreakdown.Offer}
            </dd>
          </div>
        </div>
      )}

      {!loading && (
        <>
          {/* Status Breakdown */}
          <div className="overflow-hidden rounded-lg bg-white shadow">
            <div className="p-6">
              <h3 className="text-base font-semibold leading-6 text-gray-900">Application Status Breakdown</h3>
              <div className="mt-6 grid grid-cols-1 gap-4">
                {Object.entries(monthlyStats.statusBreakdown).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className={`h-4 w-4 rounded-full mr-2 ${
                        status === 'Applied' ? 'bg-blue-500' :
                        status === 'Interviewing' ? 'bg-yellow-500' :
                        status === 'Offer' ? 'bg-green-500' :
                        'bg-red-500'
                      }`} />
                      <span className="text-sm text-gray-600">{status}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Platform Breakdown */}
          {Object.keys(monthlyStats.platformBreakdown).length > 0 && (
            <div className="overflow-hidden rounded-lg bg-white shadow">
              <div className="p-6">
                <h3 className="text-base font-semibold leading-6 text-gray-900">Application Platforms</h3>
                <div className="mt-6 grid grid-cols-1 gap-4">
                  {Object.entries(monthlyStats.platformBreakdown)
                    .sort(([, a], [, b]) => b - a)
                    .map(([platform, count]) => (
                      <div key={platform} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{platform}</span>
                        <span className="text-sm font-medium text-gray-900">{count}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
} 