export interface Task {
  id: string;
  title: string;
  category: string;
  categoryColor: string;
  dueDate: string | null;
  done: boolean;
  notionUrl?: string;
}

export interface FinanceEntry {
  id: string;
  client: string;
  type: 'income' | 'expense';
  amount: number;
  date: string | null;
  notionUrl?: string;
}

export interface Insight {
  id: string;
  title: string;
  description: string;
  category: string;
  coverColor: string;
  tags: string[];
  date: string | null;
  notionUrl?: string;
}

export interface Work {
  id: string;
  title: string;
  description: string;
  category: string;
  coverColor: string;
  status: 'done' | 'progress' | 'todo';
  notionUrl?: string;
}

export interface SearchResult {
  id: string;
  title: string;
  type: 'task' | 'insight' | 'work' | 'finance';
  icon: string;
  url: string;
}
