'use client';

import React from 'react';
import { Disclosure } from '@headlessui/react';
import { ChevronUpIcon } from '@heroicons/react/24/outline';

const faqs = [
  {
    question: "How do I add a new job application?",
    answer: "Click the 'Add application' button on the Applications page. Fill in the company name, position, application date, and other relevant details. You can also add notes and the job posting URL for reference."
  },
  {
    question: "How do I schedule an interview?",
    answer: "Go to the Dashboard and click 'Schedule Interview'. Select the job application, set the interview date and time, add the location (or virtual meeting link), and any relevant notes."
  },
  {
    question: "How can I track my application status?",
    answer: "Each application has a status that can be updated: Applied, Interviewing, Offer, or Rejected. You can update this status by editing the application. The Monthly Summary page provides statistics about your applications."
  },
  {
    question: "Can I search for specific applications?",
    answer: "Yes! Use the search bar at the top of the page to search for applications by company name or position. This is especially helpful when you have many applications to manage."
  },
  {
    question: "How do notifications work?",
    answer: "You'll receive notifications for upcoming interviews (within the next 7 days). Click the bell icon in the top navigation bar to view your notifications."
  },
  {
    question: "How can I update my profile?",
    answer: "Go to the Settings page to update your profile information. You can change your name and manage other account settings there."
  }
];

export default function HelpPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Help Center</h1>
        <p className="mt-2 text-sm text-gray-600">
          Find answers to common questions about using CareerTrack Pro
        </p>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Disclosure key={index}>
                {({ open }) => (
                  <div className="border border-gray-200 rounded-lg">
                    <Disclosure.Button className="flex w-full justify-between rounded-lg bg-white px-4 py-3 text-left text-sm font-medium text-gray-900 hover:bg-teal-50 focus:outline-none focus-visible:ring focus-visible:ring-teal-500 focus-visible:ring-opacity-75">
                      <span>{faq.question}</span>
                      <ChevronUpIcon
                        className={`${
                          open ? 'rotate-180 transform' : ''
                        } h-5 w-5 text-gray-500`}
                      />
                    </Disclosure.Button>
                    <Disclosure.Panel className="px-4 py-3 text-sm text-gray-500 border-t border-gray-200">
                      {faq.answer}
                    </Disclosure.Panel>
                  </div>
                )}
              </Disclosure>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 