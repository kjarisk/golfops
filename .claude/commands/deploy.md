---
description: AI-guided deployment setup
disable-model-invocation: true
---

Walk the user through deployment setup for this project. First, ask which deployment target they want:

1. **GitHub Pages** — free, great for open-source projects
2. **Linode VPS** — full control, custom domain, rsync + SSH + Nginx
3. **Vercel** — optional, zero-config, great for teams

---

## GitHub Pages Deployment

### Step 1 — Ask the user

Ask for:
1. Their GitHub username and repo name (e.g. `username/my-app`)
2. Whether this is a project site (deploys to `username.github.io/repo`) or a custom domain

### Step 2 — Code changes (you do this)

**`vite.config.ts`** — set base to repo name if project site:

```ts
base: '/repo-name/',
```

For custom domain, keep `base: '/'`.

**`.github/workflows/deploy.yml`** — create with:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: npm
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - uses: actions/deploy-pages@v4
        id: deployment
```

### Step 3 — Enable GitHub Pages (user does this)

Tell the user:
1. Go to repo → Settings → Pages
2. Under "Source", select **GitHub Actions**
3. Push to `main` — the Action will deploy automatically

### Step 4 — Custom domain (optional)

If they want a custom domain:
- Add a `CNAME` file in `public/` containing the domain (e.g. `myapp.yourdomain.com`)
- In DNS: add a CNAME record pointing to `username.github.io`
- In GitHub Pages settings: enter the custom domain and enable "Enforce HTTPS"

---

## Linode VPS Deployment

### Step 1 — Gather info (ask the user)

Ask for:
1. The subdomain (e.g. `myapp.yourdomain.com`)
2. Server IP address
3. SSH username (usually `root`)
4. DNS provider (Squarespace, Cloudflare, Namecheap, etc.)

### Step 2 — DNS (user does this)

Add an **A record** in their DNS provider:

- **Host / Name:** subdomain prefix only (e.g. `myapp`)
- **Type:** A
- **Value:** server IP address
- **TTL:** default or 3600

Verify propagation: `dig YOUR_SUBDOMAIN +short` should return the server IP.

### Step 3 — Server setup (user does this over SSH)

```bash
mkdir -p /var/www/YOUR_SUBDOMAIN
nano /etc/nginx/sites-available/YOUR_SUBDOMAIN
```

Paste this Nginx config:

```nginx
server {
    listen 80;
    server_name YOUR_SUBDOMAIN;
    root /var/www/YOUR_SUBDOMAIN;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2?)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Enable and reload:

```bash
ln -s /etc/nginx/sites-available/YOUR_SUBDOMAIN /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
```

### Step 4 — SSH deploy key (user does this on the server)

```bash
ssh-keygen -t ed25519 -C "github-action-deploy" -f /root/.ssh/deploy_key -N ""
cat /root/.ssh/deploy_key.pub >> /root/.ssh/authorized_keys
cat /root/.ssh/deploy_key
```

Copy the private key output.

### Step 5 — GitHub secrets (user does this)

Go to repo → Settings → Secrets and variables → Actions → New repository secret:

| Secret | Value |
|--------|-------|
| `DEPLOY_KEY` | Private key from Step 4 |
| `LINODE_HOST` | Full subdomain (`myapp.yourdomain.com`) |
| `LINODE_USER` | SSH username (`root`) |

### Step 6 — Code changes (you do this)

**`vite.config.ts`:**

```ts
base: '/',
```

**`.github/workflows/deploy.yml`:**

```yaml
name: Deploy to Linode

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: npm
      - run: npm ci
      - run: npm run build
      - name: Deploy via rsync
        env:
          DEPLOY_KEY: ${{ secrets.DEPLOY_KEY }}
          LINODE_HOST: ${{ secrets.LINODE_HOST }}
          LINODE_USER: ${{ secrets.LINODE_USER }}
        run: |
          mkdir -p ~/.ssh
          echo "$DEPLOY_KEY" > ~/.ssh/deploy_key
          chmod 600 ~/.ssh/deploy_key
          ssh-keyscan -H "$LINODE_HOST" >> ~/.ssh/known_hosts
          rsync -avz --delete \
            -e "ssh -i ~/.ssh/deploy_key" \
            dist/ \
            "$LINODE_USER@$LINODE_HOST:/var/www/$LINODE_HOST/"
```

### Step 7 — SSL (after DNS propagates)

```bash
certbot --nginx -d YOUR_SUBDOMAIN
```

---

## Vercel Deployment

### Step 1 — Install Vercel CLI or use the dashboard

**Option A — Dashboard (recommended):**
1. Go to vercel.com → New Project
2. Import the GitHub repo
3. Framework preset: **Vite**
4. Build command: `npm run build`
5. Output directory: `dist`
6. Click Deploy

**Option B — CLI:**

```bash
npm i -g vercel
vercel
```

Follow the prompts. Vercel auto-detects Vite.

### Step 2 — Custom domain (optional)

In Vercel dashboard → Project → Settings → Domains → Add Domain.
Follow Vercel's DNS instructions for your registrar.

### Step 3 — Subsequent deploys

Every push to `main` deploys automatically via Vercel's GitHub integration.

---

See `docs/deploy.md` for the full human-readable reference.
