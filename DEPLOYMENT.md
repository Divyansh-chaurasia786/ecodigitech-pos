# EcoDigiTech Billing Software - Production Deployment Guide (Docker / Containerized)

This guide provides step-by-step instructions for deploying the **EcoDigiTech Multi-Tenant Retail & Repair POS SaaS** platform using Docker and Docker Compose on any VPS (DigitalOcean, Hetzner, AWS EC2, Linode) or containerized cloud host (Railway, Render, Fly.io).

---

## Architecture Overview

```
                      [ Incoming Web Traffic ]
                                 │
                   ┌─────────────┴─────────────┐
                   ▼                           ▼
       *.ecodigitech.com (Subdomains)   ecodigitech.com (Apex)
                   │                           │
                   └─────────────┬─────────────┘
                                 ▼
                    Reverse Proxy (Nginx / Caddy)
                      SSL Termination (Certbot)
                                 │
                                 ▼
                     Docker Host (Port 3000)
             ┌───────────────────────────────────────┐
             │ `web` Container (Next.js Standalone)  │
             │ `db` Container  (PostgreSQL 16)       │
             └───────────────────────────────────────┘
```

---

## Prerequisites

1. **Server Setup:** Ubuntu 22.04 LTS / 24.04 LTS VPS with at least 2GB RAM.
2. **Domain & DNS Setup:**
   - `A` Record: `@` -> Server Public IP (`ecodigitech.com`)
   - `A` Record: `*` -> Server Public IP (`*.ecodigitech.com`)
3. **Software Installed on Server:**
   - Docker & Docker Compose (`sudo apt install docker.io docker-compose-v2 -y`)
   - Nginx (`sudo apt install nginx certbot python3-certbot-nginx -y`)

---

## Deployment Steps

### 1. Clone & Environment Configuration

Clone the repository to `/var/www/ecodigitech-pos` or your deployment directory:

```bash
cd /var/www
git clone <your-repo-url> ecodigitech-pos
cd ecodigitech-pos
```

Create production environment variables in `.env`:

```env
DATABASE_URL="postgresql://ecodigi_admin:YOUR_SECURE_PASSWORD@db:5432/ecodigitech_pos_db?schema=public"
JWT_SECRET="YOUR_RAILS_OR_CRYPTO_RANDOM_SECRET_64_CHARS"
ENCRYPTION_KEY="32_CHARACTER_HEX_ENCRYPTION_KEY_STRING"
NEXT_PUBLIC_APP_DOMAIN="ecodigitech.com"
PORT=3000
```

---

### 2. Build & Launch Docker Containers

Run Docker Compose to build the multi-stage image and launch PostgreSQL + Next.js:

```bash
docker compose up -d --build
```

Verify running containers:

```bash
docker compose ps
```

Push initial database schema to the PostgreSQL container:

```bash
docker compose exec web npx prisma db push
```

*(Optional)* Run superadmin password reset script:

```bash
docker compose exec web npx tsx scripts/reset-superadmin.ts admin@ecodigitech.com MasterPass@2026
```

---

### 3. Nginx Reverse Proxy & Wildcard SSL Setup

Create Nginx site configuration at `/etc/nginx/sites-available/ecodigitech`:

```nginx
server {
    server_name ecodigitech.com pos.ecodigitech.com admin.ecodigitech.com *.ecodigitech.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the configuration & obtain Let's Encrypt SSL certificate:

```bash
sudo ln -s /etc/nginx/sites-available/ecodigitech /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Obtain Wildcard SSL via Certbot DNS challenge
sudo certbot --nginx -d ecodigitech.com -d *.ecodigitech.com
```

---

## Container Lifecycle Commands

- **View Live Logs:**
  ```bash
  docker compose logs -f web
  ```
- **Restart Application:**
  ```bash
  docker compose restart web
  ```
- **Database Backup:**
  ```bash
  docker compose exec db pg_dump -U ecodigi_admin ecodigitech_pos_db > backup_$(date +%Y%m%d).sql
  ```
- **Database Restore:**
  ```bash
  cat backup.sql | docker compose exec -T db psql -U ecodigi_admin -d ecodigitech_pos_db
  ```
