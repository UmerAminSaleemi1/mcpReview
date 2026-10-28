export type ServerStatus = 'Reviewed' | 'Demo data' | 'Draft';

export type ServerRecord = {
  slug: string;
  name: string;
  summary: string;
  category: string;
  clients: string[];
  verdict: 'Strong pick' | 'Worth a look' | 'Unknown';
  reviewed: string;
  price: string;
  hosting: string;
  tags: string[];
  trustLabel: string;
  demo: boolean;
  capabilities: string[];
  permissions: string[];
  setup: string[];
  refs: string[];
};

export const serverCatalog: ServerRecord[] = [
  {
    slug: 'claude-context',
    name: 'Claude Context',
    summary: 'A focused MCP server for project memory, tool orchestration, and file-grounded prompts.',
    category: 'Productivity',
    clients: ['Claude Desktop', 'Cursor', 'VS Code'],
    verdict: 'Strong pick',
    reviewed: '2026-10-12',
    price: 'Free / Pro',
    hosting: 'Local + cloud bridge',
    tags: ['memory', 'context', 'files'],
    trustLabel: 'Reviewed',
    demo: true,
    capabilities: ['Project memory', 'Workspace indexing', 'Tool routing'],
    permissions: ['Read workspace files', 'Write project notes'],
    setup: ['Install from npm', 'Set API key in local env', 'Point to workspace root'],
    refs: ['Demo review only', 'Synthetic fixture: not production evidence'],
  },
  {
    slug: 'notion-mcp',
    name: 'Notion MCP',
    summary: 'Brings database-backed documentation into assistant workflows with safe read and write controls.',
    category: 'Knowledge',
    clients: ['Claude Desktop', 'ChatGPT'],
    verdict: 'Worth a look',
    reviewed: '2026-09-28',
    price: 'Freemium',
    hosting: 'Hosted',
    tags: ['docs', 'knowledge', 'api'],
    trustLabel: 'Reviewed',
    demo: true,
    capabilities: ['Page search', 'Database sync', 'Content retrieval'],
    permissions: ['Read Notion pages', 'Sync selected databases'],
    setup: ['Add integration key', 'Grant database access', 'Choose page scope'],
    refs: ['Demo review only', 'Synthetic fixture: not production evidence'],
  },
  {
    slug: 'postgres-mcp',
    name: 'Postgres MCP',
    summary: 'A read-first database server for schema exploration, SQL generation, and safe query review.',
    category: 'Data',
    clients: ['VS Code', 'Cursor', 'Claude Desktop'],
    verdict: 'Strong pick',
    reviewed: '2026-10-02',
    price: 'Open source',
    hosting: 'Self-hosted',
    tags: ['sql', 'database', 'postgres'],
    trustLabel: 'Reviewed',
    demo: true,
    capabilities: ['Schema introspection', 'Read-only SQL', 'Query review'],
    permissions: ['Read database schema', 'Execute approved read queries'],
    setup: ['Configure database URL', 'Set allowed tables', 'Use read-only role'],
    refs: ['Demo review only', 'Synthetic fixture: not production evidence'],
  },
  {
    slug: 'browser-mcp',
    name: 'Browser MCP',
    summary: 'Lets an assistant browse, click, and review web pages with explicit permissions and guardrails.',
    category: 'Automation',
    clients: ['Playwright', 'Claude Desktop'],
    verdict: 'Unknown',
    reviewed: '2026-10-18',
    price: 'Free trial',
    hosting: 'Local browser sandbox',
    tags: ['browser', 'automation', 'sandbox'],
    trustLabel: 'Needs more evidence',
    demo: true,
    capabilities: ['Page navigation', 'UI automation', 'Screenshot capture'],
    permissions: ['Read page DOM', 'Trigger browser actions'],
    setup: ['Run local sandbox', 'Provide browser profile', 'Set allowed origins'],
    refs: ['Demo review only', 'Synthetic fixture: not production evidence'],
  },
];

export const categoryCatalog = [
  { slug: 'productivity', label: 'Productivity', description: 'Context and workstream orchestration.' },
  { slug: 'knowledge', label: 'Knowledge', description: 'Docs, wiki, and research tools.' },
  { slug: 'data', label: 'Data', description: 'Databases and analytics access.' },
  { slug: 'automation', label: 'Automation', description: 'Browser and workflow tooling.' },
];

export const reviewCards = [
  {
    title: 'Review process and evidence rules',
    summary: 'We verify compatibility, permissions, hosting, and setup instructions before publication.',
    date: '2026-10-20',
  },
  {
    title: 'How we handle local-only testing',
    summary: 'Demo records stay in local development only and are labeled clearly to avoid mistaken trust.',
    date: '2026-10-18',
  },
  {
    title: 'Claims and tested support are kept separate',
    summary: 'The review page distinguishes what a server claims from what we verified in practice.',
    date: '2026-10-10',
  },
];

export const collections = [
  {
    slug: 'local-workflows',
    title: 'Local workflows',
    description: 'Developer tools built for private, workspace-aware AI assistance.',
  },
  {
    slug: 'research-assistants',
    title: 'Research assistants',
    description: 'Knowledge sources meant for exploration, summarization, and structured recall.',
  },
];

export const guides = [
  { slug: 'choosing-an-mcp-server', title: 'Choosing an MCP server', summary: 'A practical checklist for evaluating permissions, setup, and evidence.' },
  { slug: 'setting-up-claude-desktop', title: 'Setting up Claude Desktop', summary: 'A simple primer for secure local configuration.' },
];

export function getServerBySlug(slug: string) {
  return serverCatalog.find((server) => server.slug === slug) ?? null;
}

export function getCategoryBySlug(slug: string) {
  return categoryCatalog.find((category) => category.slug === slug) ?? null;
}
