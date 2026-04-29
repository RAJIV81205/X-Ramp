'use client';

import { Bell, BellRing } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { useExperience } from '../preferences/ExperienceProvider';

export function NotificationPreferences() {
  const { notifications, setNotifications } = useExperience();

  const toggle = (key) => {
    setNotifications((current) => ({
      ...current,
      [key]: !current[key],
    }));
  };

  const items = [
    {
      key: 'transactionAlerts',
      title: 'Transaction alerts',
      description: 'Show quick alerts after transfers and wallet actions.',
    },
    {
      key: 'weeklySummary',
      title: 'Weekly summary',
      description: 'Keep a lightweight activity digest enabled.',
    },
    {
      key: 'priceAlerts',
      title: 'Price watch',
      description: 'Save a basic preference for rate-based reminders.',
    },
  ];

  return (
    <Card className="dark-surface">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-zinc-950">
          <BellRing className="h-4 w-4" />
          Alerts & Notifications
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => toggle(item.key)}
            className="flex w-full items-start justify-between rounded-xs border border-zinc-200 p-3 text-left transition-colors hover:bg-zinc-50"
          >
            <div>
              <p className="font-medium text-zinc-950">{item.title}</p>
              <p className="mt-1 text-sm text-zinc-500">{item.description}</p>
            </div>
            <span className={`mt-1 inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${notifications[item.key] ? 'bg-emerald-100 text-emerald-700' : 'bg-zinc-200 text-zinc-700'}`}>
              <Bell className="mr-1 h-3 w-3" />
              {notifications[item.key] ? 'On' : 'Off'}
            </span>
          </button>
        ))}
      </CardContent>
    </Card>
  );
}
