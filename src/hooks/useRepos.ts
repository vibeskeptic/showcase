import { useState, useEffect } from 'react'
import type { Repo } from '../types'

const USER = 'vibeskeptic'
const API_URL = `https://api.github.com/users/${USER}/repos?per_page=100&sort=updated`

interface UseReposResult {
  repos: Repo[]
  loading: boolean
  error: string | null
}

export function useRepos(): UseReposResult {
  const [repos, setRepos] = useState<Repo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function fetchRepos() {
      try {
        const res = await fetch(API_URL, {
          headers: { Accept: 'application/vnd.github+json' },
        })
        if (!res.ok) {
          throw new Error(`GitHub API error: ${res.status} ${res.statusText}`)
        }
        const data: Repo[] = await res.json()
        if (!cancelled) {
          setRepos(data.filter((r) => !r.fork && !r.archived))
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unknown error')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void fetchRepos()
    return () => {
      cancelled = true
    }
  }, [])

  return { repos, loading, error }
}
