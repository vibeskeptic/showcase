import { useParams, Link } from 'react-router-dom'
import {
  Container,
  Title,
  Text,
  Tabs,
  Loader,
  Alert,
  Center,
  Stack,
  Group,
  Paper,
  Badge,
  ActionIcon,
  Code,
  Anchor,
} from '@mantine/core'
import { IconAlertCircle, IconArrowLeft, IconRobot, IconUser, IconTool } from '@tabler/icons-react'
import { useState, useMemo } from 'react'
import { useLogIndex, useLogEntries, summarizeTool } from '../hooks/useClaudeLogs'
import type { DisplayEntry } from '../types'

function UserBubble({ entry }: { entry: Extract<DisplayEntry, { kind: 'user' }> }) {
  return (
    <Group justify="flex-end">
      <Paper
        shadow="xs"
        p="sm"
        radius="md"
        bg="blue.6"
        style={{ maxWidth: '75%' }}
      >
        <Group gap="xs" align="flex-start" wrap="nowrap">
          <IconUser size={16} color="white" style={{ flexShrink: 0, marginTop: 2 }} />
          <Text size="sm" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: 'white' }}>
            {entry.text}
          </Text>
        </Group>
      </Paper>
    </Group>
  )
}

function AssistantBubble({ entry }: { entry: Extract<DisplayEntry, { kind: 'assistant' }> }) {
  return (
    <Group justify="flex-start">
      <Paper
        shadow="xs"
        p="sm"
        radius="md"
        withBorder
        style={{ maxWidth: '75%' }}
      >
        <Group gap="xs" align="flex-start" wrap="nowrap">
          <IconRobot size={16} style={{ flexShrink: 0, marginTop: 2, color: 'var(--mantine-color-violet-6)' }} />
          <Text size="sm" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {entry.text}
          </Text>
        </Group>
      </Paper>
    </Group>
  )
}

function ToolBubble({ entry }: { entry: Extract<DisplayEntry, { kind: 'tool' }> }) {
  const summary = summarizeTool(entry.toolName, entry.input)
  return (
    <Group justify="flex-start" pl={4}>
      <Paper shadow="none" p="xs" radius="sm" withBorder style={{ borderStyle: 'dashed', maxWidth: '75%' }}>
        <Group gap="xs" wrap="nowrap">
          <IconTool size={14} style={{ flexShrink: 0, color: 'var(--mantine-color-gray-6)' }} />
          <Badge size="sm" variant="light" color="gray">
            {entry.toolName}
          </Badge>
          {summary && (
            <Code style={{ fontSize: 11, wordBreak: 'break-all' }}>
              {summary}
            </Code>
          )}
        </Group>
      </Paper>
    </Group>
  )
}

function LogViewer({ repoName, file }: { repoName: string; file: string }) {
  const { entries, loading, error } = useLogEntries(repoName, file)

  if (loading) {
    return (
      <Center py="xl">
        <Loader size="md" />
      </Center>
    )
  }

  if (error) {
    return (
      <Alert icon={<IconAlertCircle size={16} />} color="red">
        {error}
      </Alert>
    )
  }

  if (entries.length === 0) {
    return (
      <Center py="xl">
        <Text c="dimmed">No conversation entries found.</Text>
      </Center>
    )
  }

  return (
    <Stack gap="xs" py="md">
      {entries.map((entry, i) => {
        if (entry.kind === 'user') return <UserBubble key={i} entry={entry} />
        if (entry.kind === 'assistant') return <AssistantBubble key={i} entry={entry} />
        if (entry.kind === 'tool') return <ToolBubble key={i} entry={entry} />
        return null
      })}
    </Stack>
  )
}

export function ClaudeLogsPage() {
  const { repoName } = useParams<{ repoName: string }>()
  const name = repoName ?? ''
  const { index, loading, error } = useLogIndex(name)

  const tabs = useMemo(() => {
    if (!index) return []
    return Object.entries(index)
      .sort(([, a], [, b]) => a.order - b.order)
      .map(([title, meta]) => ({ title, ...meta }))
  }, [index])

  const [activeTab, setActiveTab] = useState<string | null>(null)
  const currentTab = activeTab ?? tabs[0]?.title ?? null
  const currentFile = tabs.find((t) => t.title === currentTab)?.file ?? null

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        <Group gap="xs">
          <ActionIcon component={Link} to="/" variant="subtle" color="gray" aria-label="Back">
            <IconArrowLeft size={18} />
          </ActionIcon>
          <Stack gap={0}>
            <Title order={2}>Claude Logs — {name}</Title>
            <Text size="sm" c="dimmed">
              View Claude Code session logs for{' '}
              <Anchor
                href={`https://github.com/vibeskeptic/${name}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {name}
              </Anchor>
            </Text>
          </Stack>
        </Group>

        {loading && (
          <Center py="xl">
            <Loader size="lg" />
          </Center>
        )}

        {error && (
          <Alert icon={<IconAlertCircle size={16} />} color="red" title="Failed to load log index">
            {error}
          </Alert>
        )}

        {!loading && !error && tabs.length === 0 && (
          <Center py="xl">
            <Text c="dimmed">No logs found for this repository.</Text>
          </Center>
        )}

        {!loading && !error && tabs.length > 0 && (
          <Tabs value={currentTab} onChange={setActiveTab}>
            <Tabs.List>
              {tabs.map((tab) => (
                <Tabs.Tab key={tab.title} value={tab.title}>
                  {tab.title}
                </Tabs.Tab>
              ))}
            </Tabs.List>

            {tabs.map((tab) => (
              <Tabs.Panel key={tab.title} value={tab.title}>
                {currentTab === tab.title && currentFile && (
                  <LogViewer repoName={name} file={currentFile} />
                )}
              </Tabs.Panel>
            ))}
          </Tabs>
        )}
      </Stack>
    </Container>
  )
}
