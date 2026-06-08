# Cloudflare Tunnel + Access Setup

Exposes GolfOps at golf.kjarisk.com through a Cloudflare Tunnel and locks it down with Cloudflare Access.

## Step 1 — Create the tunnel

1. Go to Cloudflare Zero Trust → Networks → Tunnels
2. Click **Create a tunnel** → choose **Cloudflared**
3. Name the tunnel: `golfops-mac-mini`
4. Copy the tunnel token — add it to `.env` as `CLOUDFLARE_TUNNEL_TOKEN`

## Step 2 — Add a public hostname

In the tunnel configuration:
- **Subdomain:** `golf`
- **Domain:** `kjarisk.com`
- **Service:** `http://golfops-web:80`

If cloudflared is outside the Docker network, point to `http://localhost:8080` instead.

## Step 3 — Protect with Cloudflare Access

1. Go to Access → Applications → **Add an application** → Self-hosted
2. Application domain: `golf.kjarisk.com`
3. Create an **Allow** policy
4. Add condition: **Emails** → `kjarisk@gmail.com`
5. Test in a private browser window — you should see a Cloudflare login prompt before the app loads

## Restart the stack

```bash
docker compose up -d
```

Verify cloudflared is connected:

```bash
docker logs golfops-cloudflared
```
