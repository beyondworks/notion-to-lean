'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';

interface EditModeContextValue {
  isEditing: boolean;
  toggleEdit: () => void;
}

const EditModeContext = createContext<EditModeContextValue>({
  isEditing: false,
  toggleEdit: () => {},
});

export function EditModeProvider({ children }: { children: ReactNode }) {
  const [isEditing, setIsEditing] = useState(false);

  function toggleEdit() {
    setIsEditing((v) => !v);
  }

  return (
    <EditModeContext.Provider value={{ isEditing, toggleEdit }}>
      {children}
    </EditModeContext.Provider>
  );
}

export function useEditMode() {
  return useContext(EditModeContext);
}
