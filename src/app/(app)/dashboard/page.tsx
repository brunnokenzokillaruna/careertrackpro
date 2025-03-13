'use client';

import React, { useEffect, useState } from 'react';
import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { supabase } from '@/lib/supabase/client';
import { Interview } from '@/lib/types';
import toast from 'react-hot-toast';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import InterviewModal from '@/components/interviews/InterviewModal';
import { PlusIcon } from '@heroicons/react/24/outline';
import CalendarPatch from '@/components/calendar/CalendarPatch';

const locales = {
  'en-US': require('date-fns/locale/en-US'),
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export default function DashboardPage() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [stats, setStats] = useState({
    totalApplications: 0,
    activeInterviews: 0,
    applicationsThisMonth: 0,
    responseRate: 0,
  });
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState<Interview | undefined>(undefined);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [calendarView, setCalendarView] = useState<View>('week');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Load interviews
      const { data: interviewsData, error: interviewsError } = await supabase
        .from('interviews')
        .select('*')
        .eq('user_id', user.id)
        .gte('interview_date', new Date().toISOString());

      if (interviewsError) throw interviewsError;
      setInterviews(interviewsData || []);

      // Load statistics
      const { data: applicationsData, error: applicationsError } = await supabase
        .from('job_applications')
        .select('*')
        .eq('user_id', user.id);

      if (applicationsError) throw applicationsError;

      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const totalApplications = applicationsData?.length || 0;
      const activeInterviews = interviewsData?.length || 0;
      const applicationsThisMonth = applicationsData?.filter(
        app => new Date(app.applied_date) >= firstDayOfMonth
      ).length || 0;
      const responsesReceived = applicationsData?.filter(
        app => app.status !== 'Applied'
      ).length || 0;
      const responseRate = totalApplications > 0 
        ? Math.round((responsesReceived / totalApplications) * 100) 
        : 0;

      setStats({
        totalApplications,
        activeInterviews,
        applicationsThisMonth,
        responseRate,
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    }
  };

  const calendarEvents = interviews.map(interview => ({
    title: `Interview at ${interview.location || 'TBD'}`,
    start: new Date(interview.interview_date),
    end: new Date(new Date(interview.interview_date).getTime() + 60 * 60 * 1000), // 1 hour duration
    resource: interview,
  }));

  const handleSelectEvent = (event: any) => {
    const interview = event.resource as Interview;
    setSelectedInterview(interview);
    setShowInterviewModal(true);
  };

  const handleSelectSlot = ({ start }: { start: Date }) => {
    setSelectedDate(start);
    setSelectedInterview(undefined);
    setShowInterviewModal(true);
  };

  return (
    <div className="space-y-6">
      <CalendarPatch />

      <div>
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
            <p className="mt-2 text-sm text-gray-600">
              Welcome to CareerTrack Pro. Track your job applications and interviews in one place.
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <button
              onClick={() => {
                setSelectedInterview(undefined);
                setSelectedDate(undefined);
                setShowInterviewModal(true);
              }}
              className="inline-flex items-center justify-center rounded-md bg-teal-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Schedule Interview
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
          <dt className="truncate text-sm font-medium text-gray-500">Total Applications</dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
            {stats.totalApplications}
          </dd>
        </div>

        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
          <dt className="truncate text-sm font-medium text-gray-500">Active Interviews</dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
            {stats.activeInterviews}
          </dd>
        </div>

        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
          <dt className="truncate text-sm font-medium text-gray-500">Applications This Month</dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
            {stats.applicationsThisMonth}
          </dd>
        </div>

        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
          <dt className="truncate text-sm font-medium text-gray-500">Response Rate</dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
            {stats.responseRate}%
          </dd>
        </div>
      </div>

      <div className="mt-8">
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="p-6">
            <h2 className="text-base font-semibold leading-6 text-gray-900">
              Upcoming Interviews
            </h2>
            <div className="mt-2" style={{ height: '500px' }}>
              <Calendar
                localizer={localizer}
                events={calendarEvents}
                startAccessor="start"
                endAccessor="end"
                style={{ height: '100%' }}
                onSelectEvent={handleSelectEvent}
                onSelectSlot={handleSelectSlot}
                selectable
                view={calendarView}
                onView={(newView: View) => setCalendarView(newView)}
                defaultView="week"
                views={['month', 'week', 'day']}
                tooltipAccessor={(event) => `${event.title}\n${event.resource?.notes || ''}`}
                popup
                step={60}
                timeslots={1}
              />
            </div>
          </div>
        </div>
      </div>

      <InterviewModal
        isOpen={showInterviewModal}
        onClose={() => setShowInterviewModal(false)}
        onInterviewAdded={loadData}
        interview={selectedInterview}
        selectedDate={selectedDate}
      />
    </div>
  );
} 