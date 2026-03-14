import {
  Container,
  Grid,
  Title,
  Text,
  Group,
  Loader,
  Alert,
  Stack,
  Anchor,
  TextInput,
  Center,
} from '@mantine/core'
import { IconAlertCircle, IconBrandGithub, IconSearch } from '@tabler/icons-react'
import { useState } from 'react'
import { useRepos } from './hooks/useRepos'
import { RepoCard } from './components/RepoCard'

export default function App() {
  const { repos, loading, error } = useRepos()
  const [query, setQuery] = useState('')

  const filtered = repos.filter((r) => {
    const q = query.toLowerCase()
    return (
      r.name.toLowerCase().includes(q) ||
      (r.description ?? '').toLowerCase().includes(q) ||
      r.topics.some((t) => t.toLowerCase().includes(q))
    )
  })

  return (
    <>
      <Container size="xl" py="xl">
        <Stack gap="xl">
          <Stack gap="xs">
            <Group gap="sm" align="center">
              <IconBrandGithub size={32} />
              <Title order={1}>Vibe Skeptic</Title>
            </Group>
            <Text c="dimmed" size="lg">
              Open-source projects by{' '}
              <Anchor href="https://github.com/vibeskeptic" target="_blank" rel="noopener noreferrer">
                @vibe-skeptic
              </Anchor>
            </Text>
          </Stack>

          <TextInput
            leftSection={<IconSearch size={16} />}
            placeholder="Search projects by name, description, or topic…"
            value={query}
            onChange={(e) => setQuery(e.currentTarget.value)}
            size="md"
          />

          {loading && (
            <Center py="xl">
              <Loader size="lg" />
            </Center>
          )}

          {error && (
            <Alert icon={<IconAlertCircle size={16} />} color="red" title="Failed to load repositories">
              {error}
            </Alert>
          )}

          {!loading && !error && filtered.length === 0 && (
            <Center py="xl">
              <Text c="dimmed">No projects found{query ? ` for "${query}"` : ''}.</Text>
            </Center>
          )}

          {!loading && !error && filtered.length > 0 && (
            <>
              <Text size="sm" c="dimmed">
                Showing {filtered.length} of {repos.length} project{repos.length !== 1 ? 's' : ''}
              </Text>
              <Grid>
                {filtered.map((repo) => (
                  <Grid.Col key={repo.id} span={{ base: 12, sm: 6, lg: 4 }}>
                    <RepoCard repo={repo} />
                  </Grid.Col>
                ))}
              </Grid>
            </>
          )}
        </Stack>
      </Container>
    </>
  )
}
