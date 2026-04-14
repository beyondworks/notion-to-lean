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
  lastEditedAt?: string;
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

export interface CreatePageParams {
  dbId: string;
  title: string;
  properties?: Record<string, unknown>;
}

export interface UpdatePageParams {
  pageId: string;
  properties: Record<string, unknown>;
}

export interface PageBlock {
  id: string;
  type: string;
  content: string;
  checked?: boolean; // for to_do blocks
}

export interface PageDetail {
  id: string;
  title: string;
  cover?: string | null;
  icon?: string | null;
  properties: Record<string, any>;
  blocks: PageBlock[];
  notionUrl: string;
  lastEditedAt: string;
  lastEditedBy: string;
}
