'use client';

import TabBar from '@/components/TabBar';
import { EditModeProvider, useEditMode } from '@/components/EditModeContext';

function TabsInner({ children }: { children: React.ReactNode }) {
  const { isEditing } = useEditMode();
  return (
    <div className={isEditing ? 'edit-mode' : undefined}>
      {children}
      <TabBar />
    </div>
  );
}

export default function TabsLayout({ children }: { children: React.ReactNode }) {
  return (
    <EditModeProvider>
      <TabsInner>{children}</TabsInner>
    </EditModeProvider>
  );
}
