'use client';

import { AppProvider, useApp } from '@/lib/app-store';
import AppShell from '@/components/shell/AppShell';
import PlannerTab from '@/components/tabs/PlannerTab';
import BudgetTab from '@/components/tabs/BudgetTab';
import StressTab from '@/components/tabs/StressTab';
import RSVPTab from '@/components/tabs/RSVPTab';
import CommandTab from '@/components/tabs/CommandTab';

function TabContent() {
  const { activeTab } = useApp();

  return (
    <>
      {activeTab === 'planner' && <PlannerTab />}
      {activeTab === 'budget' && <BudgetTab />}
      {activeTab === 'stress' && <StressTab />}
      {activeTab === 'rsvp' && <RSVPTab />}
      {activeTab === 'command' && <CommandTab />}
    </>
  );
}

export default function Home() {
  return (
    <AppProvider>
      <AppShell>
        <TabContent />
      </AppShell>
    </AppProvider>
  );
}
