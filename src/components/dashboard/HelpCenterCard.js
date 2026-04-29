'use client';

import { CircleHelp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';

const faqs = [
  {
    question: 'How do I fund this wallet?',
    answer: 'Create an account first, then use Deposit Funds or Friendbot on Stellar testnet to activate the address.',
  },
  {
    question: 'Why is a transfer pending?',
    answer: 'Pending transfers usually mean the recipient still needs to create or fund an X-Ramp account.',
  },
  {
    question: 'Can I save receipts for records?',
    answer: 'Yes. Open any transaction from history and use the print/save PDF option from the receipt modal.',
  },
];

export function HelpCenterCard() {
  return (
    <Card className="dark-surface">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-zinc-950">
          <CircleHelp className="h-4 w-4" />
          Help & FAQ
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {faqs.map((item) => (
          <div key={item.question} className="rounded-xs border border-zinc-200 bg-zinc-50 p-3">
            <p className="font-medium text-zinc-950">{item.question}</p>
            <p className="mt-1 text-sm text-zinc-500">{item.answer}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
