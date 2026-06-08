# Deploy Guide

This template supports three deployment targets. Choose the one that fits your project.

| Option | Best for | Cost | Complexity |
|--------|----------|------|------------|
| **GitHub Pages** | Open-source, portfolios | Free | Low |
| **Vercel** | Teams, quick iteration | Free tier | Very low |
| **Linode VPS** | Full control, custom setup | ~$5/mo | Medium |

For AI-guided deployment, run `/deploy` in Claude Code.

---

## GitHub Pages

Free static hosting, perfect for open-source projects and portfolios.

### One-time setup

**1. `vite.config.ts`** — set `base` to your repo name if using a project site (not a custom domain):

```ts
base: '/repo-name/',
```

For a custom domain, keep `base: '/'`.

**2. `.github/workflows/deploy.yml`** — create this file:

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
          node-version: 20
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

**3. Enable GitHub Pages in repo settings:**
- Go to your repo → Settings → Pages
- Under "Source", select **GitHub Actions**

**4. Push to `main`** — the Action deploys automatically.

### Custom domain (optional)

1. Add a `CNAME` file in `public/` containing your domain (e.g. `myapp.yourdomain.com`)
2. In DNS: add a CNAME record pointing to `username.github.io`
3. In GitHub Pages settings: enter the custom domain, enable "Enforce HTTPS"

### Subsequent deploys

Just push to `main`. GitHub Actions handles the rest.

---

## Vercel

Zero-config deployment with the best developer experience.

### Option A — Dashboard (recommended)

1. Go to [vercel.com](https://vercel.com) → New Project
2. Import your GitHub repository
3. Framework preset: **Vite** (auto-detected)
4. Build command: `npm run build`
5. Output directory: `dist`
6. Click **Deploy**

`vite.config.ts` needs `base: '/'` (default).

### Option B — CLI

```bash
npm i -g vercel
vercel
```

Follow the prompts. Vercel auto-detects Vite and configures everything.

### Custom domain

Vercel dashboard → Project → Settings → Domains → Add Domain.

### Subsequent deploys

Every push to `main` deploys automatically via Vercel's GitHub integration. Preview deployments are created for every PR.

---

## Linode VPS (rsync over SSH + Nginx)

Full control deployment to your own Linux server.

### Overview

1. GitHub Actions builds the app (`npm run build`)
2. rsync copies `dist/` to the server over SSH
3. Nginx serves the static files
4. Certbot handles SSL

No Node.js process, no PM2, no Docker — just static files behind Nginx.

### One-time setup

#### 1. DNS — add an A record

In your DNS provider (Squarespace, Cloudflare, Namecheap, etc.):

| Field | Value |
|-------|-------|
| Type | A |
| Host / Name | subdomain prefix only (e.g. `myapp`) |
| Value / Points to | your server IP address |
| TTL | default or 3600 |

Verify propagation (can take 15–60 min):

```bash
dig myapp.yourdomain.com +short
# should return your server IP
```

#### 2. Server — Nginx config

SSH into your server:

```bash
mkdir -p /var/www/myapp.yourdomain.com
nano /etc/nginx/sites-available/myapp.yourdomain.com
```

Paste (replace the subdomain):

```nginx
server {
    listen 80;
    server_name myapp.yourdomain.com;
    root /var/www/myapp.yourdomain.com;
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
ln -s /etc/nginx/sites-available/myapp.yourdomain.com /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
```

#### 3. SSH deploy key

Generate a dedicated key for GitHub Actions (on the server):

```bash
ssh-keygen -t ed25519 -C "github-action-deploy" -f /root/.ssh/deploy_key -N ""
cat /root/.ssh/deploy_key.pub >> /root/.ssh/authorized_keys
cat /root/.ssh/deploy_key
```

Copy the entire private key output.

#### 4. GitHub secrets

Go to repo → Settings → Secrets and variables → Actions → New repository secret:

| Secret | Value |
|--------|-------|
| `DEPLOY_KEY` | Private key from step 3 |
| `LINODE_HOST` | Full subdomain: `myapp.yourdomain.com` |
| `LINODE_USER` | SSH username (e.g. `root`) |

#### 5. Code changes

**`vite.config.ts`** — set `base: '/'`:

```ts
base: '/',
```

**`.github/workflows/deploy.yml`**:

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
          node-version: 20
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

Commit and push to `main`. The Action runs automatically.

#### 6. SSL — Certbot (after DNS propagates)

```bash
certbot --nginx -d myapp.yourdomain.com
```

Certbot updates the Nginx config and sets up auto-renewal.

### Subsequent deploys

Just push to `main`. The Action builds and deploys within ~1 minute.

### Troubleshooting

**`DNS_PROBE_FINISHED_NXDOMAIN`** — DNS hasn't propagated. Run `dig myapp.yourdomain.com +short` and wait.

**GitHub Action fails at rsync** — Check the three secrets are set, the public key is in `authorized_keys`, and the web root directory exists.

**Nginx 404 after deploy** — Run `ls /var/www/myapp.yourdomain.com/` to confirm files deployed. Check `nginx -t`.

**SSL cert fails** — DNS must resolve before Certbot can issue a cert.
