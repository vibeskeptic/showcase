import { useState, useEffect } from 'react'
import type { LogIndex, RawLogEntry, DisplayEntry, ContentBlock } from '../types'

const GITHUB_RAW = 'https://raw.githubusercontent.com/vibeskeptic'

function getBaseUrl(repoName: string): string {
  if (import.meta.env.DEV) {
    return `/test-logs/${repoName}`
  }
  return `${GITHUB_RAW}/${repoName}/main/.claude/logs`
}

function summarizeTool(name: string, input: Record<string, unknown>): string {
  switch (name) {
    case 'Read':
      return String(input.file_path ?? '')
    case 'Write':
      return String(input.file_path ?? '')
    case 'Edit':
      return String(input.file_path ?? '')
    case 'Bash':
      return String(input.command ?? '').slice(0, 120)
    case 'Grep':
      return `"${input.pattern}"${input.path ? ` in ${input.path}` : ''}`
    case 'Glob':
      return String(input.pattern ?? '')
    case 'Agent':
      return String(input.description ?? '')
    case 'WebFetch':
      return String(input.url ?? '')
    case 'WebSearch':
      return String(input.query ?? '')
    default:
      return JSON.stringify(input).slice(0, 120)
  }
}

function parseEntries(text: string): DisplayEntry[] {
  const lines = text.split('\n').filter((l) => l.trim())
  const display: DisplayEntry[] = []
  const seenMessageIds = new Set<string>()

  for (const line of lines) {
    let entry: RawLogEntry
    try {
      entry = JSON.parse(line) as RawLogEntry
    } catch {
      continue
    }

    if (entry.type === 'progress' || entry.type === 'file-history-snapshot') continue
    if (entry.isSidechain) continue

    const ts = entry.timestamp ?? ''

    if (entry.type === 'user' && entry.message) {
      const { content } = entry.message
      if (typeof content === 'string' && content.trim()) {
        display.push({ kind: 'user', text: content, timestamp: ts })
      }
      // Array content = tool results — skip
    }

    if (entry.type === 'assistant' && entry.message) {
      const { id, content, stop_reason } = entry.message
      // Only process the final version of each message (not streaming chunks)
      if (stop_reason === null) continue
      if (id && seenMessageIds.has(id)) continue
      if (id) seenMessageIds.add(id)

      if (Array.isArray(content)) {
        for (const block of content as ContentBlock[]) {
          if (block.type === 'text' && block.text.trim()) {
            display.push({ kind: 'assistant', text: block.text, timestamp: ts })
          } else if (block.type === 'tool_use') {
            display.push({
              kind: 'tool',
              toolName: block.name,
              input: block.input,
              timestamp: ts,
            })
          }
          // skip thinking
        }
      }
    }
  }

  return display
}

export function useLogIndex(repoName: string) {
  const [index, setIndex] = useState<LogIndex | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    fetch(`${getBaseUrl(repoName)}/index.json`)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load index: ${res.status}`)
        return res.json() as Promise<LogIndex>
      })
      .then((data) => {
        if (!cancelled) setIndex(data)
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Unknown error')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [repoName])

  return { index, loading, error }
}

export function useLogEntries(repoName: string, file: string | null) {
  const [entries, setEntries] = useState<DisplayEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!file) return
    let cancelled = false
    setLoading(true)
    setError(null)
    setEntries([])

    fetch(`${getBaseUrl(repoName)}/${file}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load log: ${res.status}`)
        return res.text()
      })
      .then((text) => {
        if (!cancelled) setEntries(parseEntries(text))
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Unknown error')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [repoName, file])

  return { entries, loading, error }
}

export { summarizeTool }
