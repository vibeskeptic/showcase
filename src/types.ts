export interface Repo {
  id: number
  name: string
  full_name: string
  description: string | null
  html_url: string
  homepage: string | null
  stargazers_count: number
  forks_count: number
  open_issues_count: number
  language: string | null
  topics: string[]
  fork: boolean
  archived: boolean
  updated_at: string
}

export interface LogIndex {
  [title: string]: {
    order: number
    file: string
  }
}

export type ContentBlock =
  | { type: 'text'; text: string }
  | { type: 'tool_use'; id: string; name: string; input: Record<string, unknown> }
  | { type: 'tool_result'; tool_use_id: string; content: string | ContentBlock[]; is_error?: boolean }
  | { type: 'thinking'; thinking: string }

export interface RawLogEntry {
  type: 'user' | 'assistant' | 'progress' | 'file-history-snapshot'
  uuid?: string
  parentUuid?: string | null
  isSidechain?: boolean
  message?: {
    id?: string
    role: 'user' | 'assistant'
    content: string | ContentBlock[]
    stop_reason?: string | null
  }
  timestamp?: string
}

export type DisplayEntry =
  | { kind: 'user'; text: string; timestamp: string }
  | { kind: 'assistant'; text: string; timestamp: string }
  | { kind: 'tool'; toolName: string; input: Record<string, unknown>; timestamp: string }
