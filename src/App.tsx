import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const setupSteps = [
  {
    number: '01',
    command: '/setup',
    title: 'Configure your project',
    description:
      'Define scope, target user, core flows, non-goals, and deployment target. Fills outline.md and plan.md.',
  },
  {
    number: '02',
    command: '/generate-visual-direction',
    title: 'Set visual direction',
    description:
      'docs/moodboard/ — feeling and tone (palettes, typography, abstract refs). docs/screenshots/ — concrete UI patterns (apps, layouts, components). Drop images in both, then run this command to generate a reusable design brief.',
  },
  {
    number: '03',
    command: '/setup-skills',
    title: 'Install design skills',
    description:
      'Install recommended Context7 skills for UI/UX quality: frontend-design, canvas-design, interaction-design.',
  },
  {
    number: '04',
    command: null,
    title: 'Start building',
    description:
      'Ask Claude: "Read docs/outline.md and propose the next single smallest task." Commit after each slice.',
  },
]

const changelog = [
  {
    version: '0.9.0',
    date: '2026-06-08',
    added: [
      'QUICKSTART.md: /fork, /autofix-pr, /goal, /reload-skills, /workflows, /ultraplan, /simplify, /team-onboarding',
      'audit-template Section 7: when_to_use, context:fork, paths, disallowed-tools, model/effort skill checks',
    ],
    changed: [
      'deploy.md CI: Node.js 20 (EOL) → Node.js 22 LTS in GitHub Pages and Linode workflows',
      '/effort docs: xhigh, max, ultracode, auto levels added; /ultrareview noted as alias',
      'CLAUDE.md Rule 9: /fork added as in-session parallel delegation primitive',
      'lucide-react ^1.17.0, tailwind-merge ^3.6.0, zustand ^5.0.14',
    ],
    fixed: [
      'tsconfig.json: redundant baseUrl/paths removed from root coordinator config',
    ],
    removed: [],
  },
  {
    version: '0.8.0',
    date: '2026-05-21',
    added: [
      '/sync-template — diff and pull harness updates from upstream without touching project files',
      '.claude/rules/components.md + api.md — starter path-scoped convention files',
      'supabase option in /setup — wires plan tasks, delegates to /supabase:supabase skill',
      '/setup now stamps template version into docs/decisions.md',
    ],
    changed: [
      'CLAUDE.md §2: Next.js/Redux/alt UI are now "discuss first" instead of hard-blocked',
      'README: React SPA scope declared upfront; duplicate commands tables removed',
    ],
    fixed: [],
    removed: [],
  },
  {
    version: '0.7.0',
    date: '2026-05-09',
    added: [],
    changed: [
      'docs/learning.md and docs/skills.md moved to GitHub wiki — no more per-session token overhead or drift',
      'All repo references updated to wiki links (CLAUDE.md, QUICKSTART.md, README, getting-started.md, commands)',
    ],
    fixed: [
      'Removed fabricated memory layers (Auto Dream, Scoped Memory) from learning reference',
      'Fixed all 403 docs links — now point to code.claude.com/docs/en',
      'Updated hook handler types: added mcp_tool',
      'Effort default note updated: high is now default for Pro/Max subscribers',
      'enableAllProjectMcpServers added to settings.json — no MCP approval dialogs on fresh clone',
    ],
    removed: ['docs/learning.md and docs/skills.md (moved to wiki)'],
  },
  {
    version: '0.6.4',
    date: '2026-04-14',
    added: [],
    changed: [
      'moodboard/ vs screenshots/ distinction now clearly explained — moodboard = feeling/tone, screenshots = concrete UI patterns',
      'Startup page step 02 and /generate-visual-direction updated to reflect the difference',
    ],
    fixed: [],
    removed: [],
  },
  {
    version: '0.6.3',
    date: '2026-04-14',
    added: [],
    changed: [],
    fixed: [
      '"How it works" tab now lists /audit-template, /bump-version, and all docs including CHANGELOG.md',
      'QUICKSTART.md commands table now complete',
    ],
    removed: [],
  },
  {
    version: '0.6.2',
    date: '2026-04-14',
    added: [
      '/audit-template section 11: post-setup cleanliness check — catches any template fingerprints that survived /setup',
    ],
    changed: [],
    fixed: [],
    removed: [],
  },
  {
    version: '0.6.1',
    date: '2026-04-14',
    added: [],
    changed: [],
    fixed: [
      '/setup now replaces README.md, App.test.tsx, and deletes getting-started.md — no template noise left in new projects',
    ],
    removed: [],
  },
  {
    version: '0.6.0',
    date: '2026-04-14',
    added: [
      '/bump-version command — CHANGELOG + App.tsx + package.json + tag + push in one pass',
      'Changelog sync check in /audit-template',
    ],
    changed: [
      '/setup backend/game skills now search live registry instead of hardcoded unverified paths',
    ],
    fixed: ['Unverified skill registry paths removed from /setup'],
    removed: [],
  },
  {
    version: '0.5.0',
    date: '2026-04-14',
    added: [
      '/setup — one-message project bootstrap with domain-aware skill install',
      '/audit-template — 11-category health check, token efficiency + package currency',
      'docs/getting-started.md + docs/CHANGELOG.md',
      'accent-glow CSS variable — gradient animation now visible',
    ],
    changed: [
      'All packages updated to latest majors (vite 8, TypeScript 6, eslint 10)',
      'Startup page redesigned — correct steps, ambient glow, 3-tab layout',
      'Lazy loading strategy — docs read on demand, saves ~300 tokens/session',
    ],
    fixed: [
      'tsconfig baseUrl deprecation (TS 6)',
      'settings.json hook had hardcoded machine path',
    ],
    removed: ['AGENTS.md + opencode.json — wrong tool, migrated to .claude/'],
  },
]

const stack = [
  { label: 'React 19', note: 'ref as prop, use(), useOptimistic()' },
  { label: 'Vite 8', note: 'dev server + production build' },
  { label: 'TypeScript 6', note: 'strict mode, erasableSyntaxOnly' },
  { label: 'Tailwind CSS v4', note: 'CSS variables, no config file' },
  { label: 'shadcn/ui', note: 'new-york style, composable primitives' },
  { label: 'TanStack Query v5', note: 'server state: fetch, cache, mutations' },
  { label: 'Zustand v5', note: 'UI state: dialogs, filters, selections' },
  { label: 'Vitest 4', note: 'unit + integration tests' },
]

const customCommands = [
  { cmd: '/setup', desc: 'Interactive project bootstrap' },
  { cmd: '/audit-template', desc: '12-category health check + scored report' },
  { cmd: '/bump-version', desc: 'Changelog + tag + push in one pass' },
  { cmd: '/sync-template', desc: 'Pull harness updates from upstream' },
  { cmd: '/new-feature', desc: 'Scaffold feature slice' },
  { cmd: '/build', desc: 'Type-check + production build' },
  { cmd: '/lint', desc: 'ESLint auto-fix' },
  { cmd: '/test', desc: 'Tests with coverage' },
  { cmd: '/review', desc: 'Code quality + scope check' },
  { cmd: '/deploy', desc: 'Guided deployment setup' },
  { cmd: '/setup-skills', desc: 'Install Context7 design skills' },
  {
    cmd: '/generate-visual-direction',
    desc: 'Extract design brief from images',
  },
]

const builtinCommands = [
  { cmd: '/compact', desc: 'Summarize conversation, free context' },
  { cmd: '/rewind', desc: 'Roll back conversation + code' },
  { cmd: '/branch', desc: 'Explore alternative approach' },
  { cmd: '/model haiku', desc: 'Switch to fast model for simple tasks' },
  { cmd: '/effort high', desc: 'Extended reasoning for hard problems' },
]

const docs = [
  { file: 'CLAUDE.md', purpose: 'Agent rules — loaded every session' },
  { file: 'docs/outline.md', purpose: 'Scope lock — what to build' },
  { file: 'docs/plan.md', purpose: 'Phased implementation plan' },
  { file: 'docs/decisions.md', purpose: 'Architecture decision log' },
  { file: 'docs/CHANGELOG.md', purpose: 'Version history + release notes' },
  { file: 'docs/visual-direction.md', purpose: 'Generated design brief' },
  { file: 'docs/deploy.md', purpose: 'Deployment guide (3 options)' },
  {
    file: 'docs/getting-started.md',
    purpose: 'First-day walkthrough (deleted by /setup)',
  },
  { file: 'wiki/Learning →', purpose: 'Claude Code features reference' },
  { file: 'wiki/Skills →', purpose: 'Skills system + install commands' },
]

function App() {
  return (
    <div className="relative min-h-svh overflow-hidden bg-background px-4 py-16">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-150 w-150 -translate-x-1/2 -translate-y-1/4 rounded-full bg-[radial-gradient(circle,var(--color-accent-glow)/18%,transparent_70%)] blur-3xl" />
        <div className="absolute bottom-0 right-0 h-100 w-100 rounded-full bg-[radial-gradient(circle,var(--color-accent-glow)/8%,transparent_70%)] blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-10 flex flex-col gap-3">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border/50 bg-muted/40 px-3 py-1 text-[11px] font-medium tracking-widest text-muted-foreground uppercase">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-(--color-accent-glow)" />
            Vibecoding Template
          </div>
          <h1 className="animate-gradient bg-linear-to-r from-foreground via-(--color-accent-glow) to-foreground bg-size-[200%_auto] bg-clip-text text-5xl font-bold tracking-tight text-transparent sm:text-6xl">
            Ready to build.
          </h1>
          <p className="max-w-md text-base text-muted-foreground leading-relaxed">
            A guardrailed React starter for AI-assisted development. Scope lock,
            vertical slices, design skills, and one-command deployment.
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="start">
          <TabsList className="mb-6 h-9 w-full rounded-lg bg-muted/60 p-1">
            <TabsTrigger
              value="start"
              className="flex-1 text-xs font-medium tracking-wide"
            >
              Get started
            </TabsTrigger>
            <TabsTrigger
              value="guide"
              className="flex-1 text-xs font-medium tracking-wide"
            >
              How it works
            </TabsTrigger>
            <TabsTrigger
              value="changelog"
              className="flex-1 text-xs font-medium tracking-wide"
            >
              What&apos;s new
            </TabsTrigger>
          </TabsList>

          {/* ── Tab 1: Get started ── */}
          <TabsContent value="start" className="mt-0">
            <div className="flex flex-col gap-2">
              {setupSteps.map((step) => (
                <div
                  key={step.number}
                  className="group flex gap-4 rounded-xl border border-border/50 bg-card/60 px-5 py-4 backdrop-blur-sm transition-colors hover:border-border hover:bg-card/80"
                >
                  <div className="mt-0.5 w-7 shrink-0 font-mono text-xs font-semibold text-muted-foreground/50 tabular-nums">
                    {step.number}
                  </div>
                  <div className="flex min-w-0 flex-col gap-1">
                    <div className="flex items-center gap-2.5">
                      <p className="text-sm font-semibold leading-none text-foreground">
                        {step.title}
                      </p>
                      {step.command && (
                        <code className="rounded-md bg-accent-glow/10 px-1.5 py-0.5 font-mono text-[11px] font-medium text-(--color-accent-glow)">
                          {step.command}
                        </code>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-6 text-center text-xs text-muted-foreground/50 tracking-wide">
              This page is the template placeholder — replace it when you start
              building.
            </p>
          </TabsContent>

          {/* ── Tab 3: What's new ── */}
          <TabsContent value="changelog" className="mt-0 flex flex-col gap-4">
            {changelog.map((release) => (
              <div key={release.version} className="flex flex-col gap-4">
                <div className="flex items-baseline gap-3">
                  <span className="font-mono text-sm font-bold text-foreground">
                    v{release.version}
                  </span>
                  <span className="font-mono text-[11px] text-muted-foreground">
                    {release.date}
                  </span>
                </div>

                {release.added.length > 0 && (
                  <div>
                    <p className="mb-1.5 text-[10px] font-semibold tracking-widest text-emerald-500 uppercase">
                      Added
                    </p>
                    <ul className="flex flex-col gap-1">
                      {release.added.map((item) => (
                        <li
                          key={item}
                          className="flex gap-2 text-xs text-muted-foreground"
                        >
                          <span className="mt-0.5 shrink-0 text-emerald-500">
                            +
                          </span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {release.changed.length > 0 && (
                  <div>
                    <p className="mb-1.5 text-[10px] font-semibold tracking-widest text-(--color-accent-glow) uppercase">
                      Changed
                    </p>
                    <ul className="flex flex-col gap-1">
                      {release.changed.map((item) => (
                        <li
                          key={item}
                          className="flex gap-2 text-xs text-muted-foreground"
                        >
                          <span className="mt-0.5 shrink-0 text-(--color-accent-glow)">
                            ~
                          </span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {release.fixed.length > 0 && (
                  <div>
                    <p className="mb-1.5 text-[10px] font-semibold tracking-widest text-amber-500 uppercase">
                      Fixed
                    </p>
                    <ul className="flex flex-col gap-1">
                      {release.fixed.map((item) => (
                        <li
                          key={item}
                          className="flex gap-2 text-xs text-muted-foreground"
                        >
                          <span className="mt-0.5 shrink-0 text-amber-500">
                            ↳
                          </span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {release.removed.length > 0 && (
                  <div>
                    <p className="mb-1.5 text-[10px] font-semibold tracking-widest text-red-500 uppercase">
                      Removed
                    </p>
                    <ul className="flex flex-col gap-1">
                      {release.removed.map((item) => (
                        <li
                          key={item}
                          className="flex gap-2 text-xs text-muted-foreground"
                        >
                          <span className="mt-0.5 shrink-0 text-red-500">
                            −
                          </span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
            <p className="mt-2 text-[11px] text-muted-foreground/50">
              Full history in{' '}
              <code className="font-mono">docs/CHANGELOG.md</code>
            </p>
          </TabsContent>

          {/* ── Tab 2: How it works ── */}
          <TabsContent value="guide" className="mt-0 flex flex-col gap-6">
            {/* Stack */}
            <section>
              <h2 className="mb-3 text-[11px] font-semibold tracking-widest text-muted-foreground uppercase">
                Stack
              </h2>
              <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                {stack.map((item) => (
                  <div
                    key={item.label}
                    className="flex flex-col gap-0.5 rounded-lg border border-border/40 bg-muted/30 px-3.5 py-2.5"
                  >
                    <span className="text-xs font-semibold text-foreground">
                      {item.label}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {item.note}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* Commands */}
            <section>
              <h2 className="mb-3 text-[11px] font-semibold tracking-widest text-muted-foreground uppercase">
                Custom Commands
              </h2>
              <div className="rounded-xl border border-border/40 bg-card/40 divide-y divide-border/30">
                {customCommands.map((item) => (
                  <div
                    key={item.cmd}
                    className="flex items-center gap-3 px-4 py-2.5"
                  >
                    <code className="w-52 shrink-0 font-mono text-[11px] font-medium text-(--color-accent-glow)">
                      {item.cmd}
                    </code>
                    <span className="text-xs text-muted-foreground">
                      {item.desc}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* Built-ins */}
            <section>
              <h2 className="mb-3 text-[11px] font-semibold tracking-widest text-muted-foreground uppercase">
                Key Built-in Commands
              </h2>
              <div className="rounded-xl border border-border/40 bg-card/40 divide-y divide-border/30">
                {builtinCommands.map((item) => (
                  <div
                    key={item.cmd}
                    className="flex items-center gap-3 px-4 py-2.5"
                  >
                    <code className="w-52 shrink-0 font-mono text-[11px] font-medium text-muted-foreground">
                      {item.cmd}
                    </code>
                    <span className="text-xs text-muted-foreground">
                      {item.desc}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* Docs map */}
            <section>
              <h2 className="mb-3 text-[11px] font-semibold tracking-widest text-muted-foreground uppercase">
                Docs Map
              </h2>
              <div className="rounded-xl border border-border/40 bg-card/40 divide-y divide-border/30">
                {docs.map((item) => (
                  <div
                    key={item.file}
                    className="flex items-center gap-3 px-4 py-2.5"
                  >
                    <code className="w-52 shrink-0 font-mono text-[11px] text-foreground/70">
                      {item.file}
                    </code>
                    <span className="text-xs text-muted-foreground">
                      {item.purpose}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <p className="mt-10 text-center font-mono text-[10px] text-muted-foreground/40 tracking-widest uppercase">
          React 19 · Vite 8 · Tailwind v4 · shadcn/ui · TanStack Query · Zustand
        </p>
      </div>
    </div>
  )
}

export default App
