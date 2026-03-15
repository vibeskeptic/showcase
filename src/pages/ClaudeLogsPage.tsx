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
import { IconAlertCircle, IconArrowLeft, IconRobot, IconUser, IconTool, IconGitCommit } from '@tabler/icons-react'
import { useState, useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import type { Components } from 'react-markdown'
import { useLogIndex, useLogEntries, summarizeTool } from '../hooks/useClaudeLogs'
import type { DisplayEntry } from '../types'

const COMMIT_HASH_RE = /^\s*`\{\s*"commitHash"\s*:\s*"([a-f0-9]+)"\s*\}`\s*/

function makeComponents(invert: boolean): Components {
  const color = invert ? 'white' : undefined
  const dimColor = invert ? 'rgba(255,255,255,0.75)' : undefined

  return {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    p: ({ node: _node, ...props }) => (
      <Text size="sm" mb={4} style={{ color, wordBreak: 'break-word' }} {...props} />
    ),
    h1: ({ node: _node, ...props }) => <Title order={3} mb={4} style={{ color }} {...props} />,
    h2: ({ node: _node, ...props }) => <Title order={4} mb={4} style={{ color }} {...props} />,
    h3: ({ node: _node, ...props }) => <Title order={5} mb={4} style={{ color }} {...props} />,
    h4: ({ node: _node, ...props }) => <Title order={6} mb={4} style={{ color }} {...props} />,
    h5: ({ node: _node, ...props }) => <Title order={6} mb={4} style={{ color }} {...props} />,
    h6: ({ node: _node, ...props }) => <Title order={6} mb={4} style={{ color }} {...props} />,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    code: ({ node: _node, className, children }) => {
      const isBlock = className?.startsWith('language-')
      return isBlock ? (
        <Code block style={{ fontSize: 12, marginBottom: 4 }}>
          {children}
        </Code>
      ) : (
        <Code style={{ fontSize: 12, color: invert ? 'white' : undefined, background: invert ? 'rgba(0,0,0,0.2)' : undefined }}>
          {children}
        </Code>
      )
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    pre: ({ node: _node, children }) => <>{children}</>,
    a: ({ node: _node, href, children, ...props }: React.ComponentPropsWithoutRef<'a'> & { node?: unknown }) => (
      <Anchor href={href} target="_blank" rel="noopener noreferrer" size="sm" style={{ color: invert ? 'white' : undefined, textDecorationColor: invert ? 'rgba(255,255,255,0.6)' : undefined }} {...props}>
        {children}
      </Anchor>
    ),
    ul: ({ node: _node, ...props }) => (
      <ul style={{ paddingLeft: 20, marginTop: 4, marginBottom: 4, color }} {...props} />
    ),
    ol: ({ node: _node, ...props }) => (
      <ol style={{ paddingLeft: 20, marginTop: 4, marginBottom: 4, color }} {...props} />
    ),
    li: ({ node: _node, ...props }) => (
      <li style={{ fontSize: 14, marginBottom: 2, color }} {...props} />
    ),
    blockquote: ({ node: _node, ...props }) => (
      <blockquote
        style={{
          borderLeft: `3px solid ${invert ? 'rgba(255,255,255,0.4)' : 'var(--mantine-color-gray-4)'}`,
          paddingLeft: 12,
          margin: '4px 0',
          color: dimColor ?? 'var(--mantine-color-dimmed)',
        }}
        {...props}
      />
    ),
    hr: ({ node: _node }) => (
      <hr style={{ border: 'none', borderTop: `1px solid ${invert ? 'rgba(255,255,255,0.3)' : 'var(--mantine-color-gray-3)'}`, margin: '8px 0' }} />
    ),
    strong: ({ node: _node, ...props }) => <strong style={{ color }} {...props} />,
    em: ({ node: _node, ...props }) => <em style={{ color }} {...props} />,
  }
}

const ASSISTANT_COMPONENTS = makeComponents(false)
const USER_COMPONENTS = makeComponents(true)

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
          <div style={{ minWidth: 0 }}>
            <ReactMarkdown skipHtml components={USER_COMPONENTS}>
              {entry.text}
            </ReactMarkdown>
          </div>
        </Group>
      </Paper>
    </Group>
  )
}

function AssistantBubble({ entry, repoName }: { entry: Extract<DisplayEntry, { kind: 'assistant' }>; repoName: string }) {
  const match = COMMIT_HASH_RE.exec(entry.text)
  const commitHash = match?.[1] ?? null
  const bodyText = commitHash ? entry.text.slice(match![0].length) : entry.text

  return (
    <Group justify="flex-start">
      <Paper
        shadow="xs"
        p="sm"
        radius="md"
        withBorder
        style={{ maxWidth: '75%' }}
      >
        <Stack gap={4}>
          <Group justify="space-between" align="center" gap="xs">
            <IconRobot size={16} style={{ color: 'var(--mantine-color-violet-6)' }} />
            {commitHash && (
              <Anchor
                href={`https://github.com/vibeskeptic/${repoName}/commit/${commitHash}`}
                target="_blank"
                rel="noopener noreferrer"
                size="xs"
                c="dimmed"
              >
                <Group gap={4} align="center">
                  <IconGitCommit size={12} />
                  {commitHash.slice(0, 7)}
                </Group>
              </Anchor>
            )}
          </Group>
          <ReactMarkdown skipHtml components={ASSISTANT_COMPONENTS}>
            {bodyText}
          </ReactMarkdown>
        </Stack>
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
        if (entry.kind === 'assistant') return <AssistantBubble key={i} entry={entry} repoName={repoName} />
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
