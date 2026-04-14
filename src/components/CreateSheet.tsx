'use client';

import { useState, useEffect } from 'react';
import { useMutation } from '@/lib/hooks';

type Mode = 'task' | 'memo' | 'project' | 'expense';

const STATUS_OPTIONS = ['To Do', 'In Progress', 'Done'] as const;

// DB IDs must match the server-side constants but are sent as payload
const DB_IDS = {
  TASKS: '242003c7-f7be-804a-9d6e-f76d5d0347b4',
  TIMELINE: '28f003c7-f7be-8080-85b4-d73efe3cb896',
  INSIGHTS: '241003c7-f7be-800b-b71c-df3acddc5bb8',
  WORKS: '241003c7-f7be-8011-8ba4-cecf131df2a0',
} as const;

interface CreateSheetProps {
  open: boolean;
  onClose: () => void;
  onCreated: (message: string) => void;
  defaultTab?: Mode;
}

export default function CreateSheet({ open, onClose, onCreated, defaultTab = 'task' }: CreateSheetProps) {
  const [mode, setMode] = useState<Mode>(defaultTab);
  const [title, setTitle] = useState('');
  const [memo, setMemo] = useState('');
  const [status, setStatus] = useState<string>('To Do');
  const [amount, setAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState(() => new Date().toISOString().slice(0, 10));

  // Sync mode with defaultTab when sheet opens
  useEffect(() => {
    if (open) setMode(defaultTab);
  }, [open, defaultTab]);

  const taskMutation = useMutation('tasks', 'POST');
  const pageMutation = useMutation('pages', 'POST');

  const isLoading = taskMutation.loading || pageMutation.loading;

  const reset = () => {
    setTitle('');
    setMemo('');
    setStatus('To Do');
    setAmount('');
    setExpenseDate(new Date().toISOString().slice(0, 10));
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleCreate = async () => {
    if (!title.trim()) return;

    let result: any = null;

    if (mode === 'task') {
      result = await taskMutation.mutate({ action: 'create', title: title.trim() });
    } else if (mode === 'memo') {
      result = await pageMutation.mutate({
        dbId: DB_IDS.INSIGHTS,
        title: title.trim(),
        properties: memo.trim()
          ? { Description: { rich_text: [{ text: { content: memo.trim() } }] } }
          : undefined,
      });
    } else if (mode === 'project') {
      result = await pageMutation.mutate({
        dbId: DB_IDS.WORKS,
        title: title.trim(),
        properties: {
          Status: { status: { name: status } },
        },
      });
    } else if (mode === 'expense') {
      const amt = Number(amount);
      if (!Number.isFinite(amt) || amt <= 0) return;
      result = await pageMutation.mutate({
        dbId: DB_IDS.TIMELINE,
        title: title.trim(),
        properties: {
          Amount: { number: amt },
          Type: { select: { name: '지출' } },
          Date: { date: { start: expenseDate } },
        },
      });
    }

    if (result) {
      const labels: Record<Mode, string> = {
        task: 'Task created',
        memo: 'Memo created',
        project: 'Project created',
        expense: '지출 기록됨',
      };
      onCreated(labels[mode]);
      handleClose();
    }
  };

  const canSubmit = mode === 'expense'
    ? title.trim().length > 0 && Number(amount) > 0
    : title.trim().length > 0;

  return (
    <>
      <div
        className={`sheet-backdrop${open ? ' open' : ''}`}
        onClick={handleClose}
      />
      <div className={`sheet${open ? ' open' : ''}`}>
        <div className="sheet-handle" />
        <div className="sheet-title">Create New</div>

        {/* Tabs */}
        <div className="sheet-tabs">
          {(['task', 'memo', 'project', 'expense'] as Mode[]).map((m) => (
            <button
              key={m}
              className={`pill${mode === m ? ' active' : ''}`}
              onClick={() => setMode(m)}
              type="button"
            >
              {m === 'task' ? 'Quick Task' : m === 'memo' ? 'Memo' : m === 'project' ? 'Project' : '지출'}
            </button>
          ))}
        </div>

        {/* Title input (all modes) */}
        <input
          className="sheet-input"
          placeholder={
            mode === 'task' ? 'Task title...'
            : mode === 'memo' ? 'Memo title...'
            : mode === 'project' ? 'Project name...'
            : '지출 항목...'
          }
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus={open}
        />

        {/* Memo textarea */}
        {mode === 'memo' && (
          <textarea
            className="sheet-textarea"
            placeholder="Write your memo..."
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            style={{ marginTop: 12 }}
          />
        )}

        {/* Project status selector */}
        {mode === 'project' && (
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            {STATUS_OPTIONS.map((s) => (
              <button
                key={s}
                className={`pill${status === s ? ' active' : ''}`}
                onClick={() => setStatus(s)}
                type="button"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Expense amount + date */}
        {mode === 'expense' && (
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <input
              className="sheet-input"
              type="number"
              inputMode="numeric"
              placeholder="금액 (원)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              style={{ flex: 1, marginTop: 0 }}
            />
            <input
              className="sheet-input"
              type="date"
              value={expenseDate}
              onChange={(e) => setExpenseDate(e.target.value)}
              style={{ flex: 1, marginTop: 0 }}
            />
          </div>
        )}

        <button
          className="sheet-btn"
          onClick={handleCreate}
          disabled={!canSubmit || isLoading}
          type="button"
        >
          {isLoading ? 'Creating...' : 'Create'}
        </button>
      </div>
    </>
  );
}
