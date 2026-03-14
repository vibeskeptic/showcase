import {
  Card,
  Text,
  Title,
  Badge,
  Group,
  Stack,
  ActionIcon,
  Tooltip,
} from '@mantine/core'
import {
  IconStar,
  IconGitFork,
  IconAlertCircle,
  IconExternalLink,
  IconBrandGithub,
  IconNews,
} from '@tabler/icons-react'
import type { Repo } from '../types'

interface RepoCardProps {
  repo: Repo
}

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: 'blue',
  JavaScript: 'yellow',
  Python: 'green',
  Rust: 'orange',
  Go: 'cyan',
  Ruby: 'red',
  Java: 'grape',
  'C#': 'violet',
  'C++': 'pink',
  Shell: 'gray',
}

const SUBSTACK_PREFIX = 'substack-'
const SUBSTACK_BASE = 'https://vibeskeptic.substack.com/p/'

export function RepoCard({ repo }: RepoCardProps) {
  const langColor = repo.language ? (LANGUAGE_COLORS[repo.language] ?? 'gray') : undefined
  const substackSlug = repo.topics.find((t) => t.startsWith(SUBSTACK_PREFIX))?.slice(SUBSTACK_PREFIX.length)
  const substackUrl = substackSlug ? `${SUBSTACK_BASE}${substackSlug}` : null
  const visibleTopics = repo.topics.filter((t) => !t.startsWith(SUBSTACK_PREFIX))

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder h="100%" style={{ display: 'flex', flexDirection: 'column' }}>
      <Stack gap="sm" style={{ flex: 1 }}>
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <Title order={3} size="h4" style={{ wordBreak: 'break-word' }}>
            {repo.name}
          </Title>
          <Group gap={4} wrap="nowrap">
            {substackUrl && (
              <Tooltip label="Read on Substack">
                <ActionIcon
                  component="a"
                  href={substackUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="subtle"
                  color="orange"
                  aria-label="Substack article"
                >
                  <IconNews size={16} />
                </ActionIcon>
              </Tooltip>
            )}
            {repo.homepage && (
              <Tooltip label="Visit homepage">
                <ActionIcon
                  component="a"
                  href={repo.homepage}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="subtle"
                  color="blue"
                  aria-label="Homepage"
                >
                  <IconExternalLink size={16} />
                </ActionIcon>
              </Tooltip>
            )}
            <Tooltip label="View on GitHub">
              <ActionIcon
                component="a"
                href={repo.html_url}
                target="_blank"
                rel="noopener noreferrer"
                variant="subtle"
                color="gray"
                aria-label="GitHub"
              >
                <IconBrandGithub size={16} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>

        <Text size="sm" c="dimmed" style={{ flex: 1 }}>
          {repo.description ?? 'No description provided.'}
        </Text>

        {visibleTopics.length > 0 && (
          <Group gap={4}>
            {visibleTopics.slice(0, 5).map((topic) => (
              <Badge key={topic} size="xs" variant="light" color="blue">
                {topic}
              </Badge>
            ))}
          </Group>
        )}

        <Group gap="xs" mt="auto">
          {repo.language && (
            <Badge size="sm" variant="dot" color={langColor}>
              {repo.language}
            </Badge>
          )}
          <Group gap={4}>
            <IconStar size={14} />
            <Text size="xs">{repo.stargazers_count.toLocaleString()}</Text>
          </Group>
          <Group gap={4}>
            <IconGitFork size={14} />
            <Text size="xs">{repo.forks_count.toLocaleString()}</Text>
          </Group>
          {repo.open_issues_count > 0 && (
            <Group gap={4}>
              <IconAlertCircle size={14} />
              <Text size="xs">{repo.open_issues_count.toLocaleString()}</Text>
            </Group>
          )}
        </Group>
      </Stack>
    </Card>
  )
}
