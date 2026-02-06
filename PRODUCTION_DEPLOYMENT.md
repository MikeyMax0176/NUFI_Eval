# Guardian Fusion - Production Deployment Guide

This guide covers deploying Guardian Fusion as a production application with user authentication and permanent API keys.

## 🔒 Security Features Implemented

### ✅ Authentication & Authorization
- **Session-based authentication** with express-session
- **Password hashing** using bcryptjs
- **User management** via environment variables
- **Protected API routes** requiring authentication

### ✅ Security Headers
- **Helmet.js** for security headers (XSS, clickjacking protection)
- **CORS configuration** with allowed origins
- **Secure cookies** (HTTPS only in production)

### ✅ Rate Limiting
- **100 requests per 15 minutes** per IP in production
- Protects against abuse and DDoS

### ✅ API Key Protection
- API keys stored server-side only (never exposed to client)
- Proxy architecture prevents client access to credentials
- Environment variable configuration

---

## 📋 Pre-Deployment Checklist

### 1. **Configure Environment Variables**

Edit your `.env` file on the production server:

```bash
# NUFI API Configuration
NUFI_API_KEY=your_permanent_api_key_here
NUFI_API_BASE_URL=https://nufi.azure-api.net
NUFI_DEMO_MODE=false

# Server Configuration
PORT=3005
NODE_ENV=production

# Session Secret (CRITICAL!)
# Generate strong secret: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
SESSION_SECRET=YOUR_GENERATED_SECRET_HERE

# User Authentication
# Format: username:password:fullname:role,user2:pass2:name2:role
# IMPORTANT: Use strong passwords!
AUTHORIZED_USERS=admin:StrongPassword123!:Admin User:admin,john:SecurePass456!:John Doe:user

# CORS - Your Production Domain
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### 2. **Generate Strong Credentials**

**Session Secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**User Passwords:**
- Minimum 12 characters
- Mix of uppercase, lowercase, numbers, symbols
- Use a password manager to generate

### 3. **Configure Users**

Add users to `AUTHORIZED_USERS`:
```env
AUTHORIZED_USERS=admin:Pass123!:Admin User:admin,analyst:Pass456!:Data Analyst:user
```

Format: `username:password:display_name:role`

**Roles:**
- `admin` - Full access
- `user` - Standard access

---

## 🚀 Deployment Options

### Option 1: Traditional Server (VPS/Dedicated)

#### **Requirements:**
- Ubuntu 20.04+ or similar Linux distribution
- Node.js 18+ and npm
- Nginx (recommended) or Apache
- SSL certificate (Let's Encrypt recommended)
- Domain name

#### **Setup Steps:**

1. **Clone Repository**
```bash
git clone https://github.com/MikeyMax0176/NUFI_Eval.git
cd NUFI_Eval
```

2. **Install Dependencies**
```bash
npm run install-all
```

3. **Configure Environment**
```bash
cp .env.example .env
nano .env  # Edit with your production values
```

4. **Build Client**
```bash
cd client && npm run build
```

5. **Setup Nginx Reverse Proxy**

Create `/etc/nginx/sites-available/guardian-fusion`:
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    # SSL Configuration (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    
    # Serve React Build
    root /path/to/NUFI_Eval/client/build;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Proxy API requests to Node.js
    location /api {
        proxy_pass http://localhost:3005;
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

6. **Enable Site**
```bash
sudo ln -s /etc/nginx/sites-available/guardian-fusion /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

7. **Setup PM2 for Process Management**
```bash
npm install -g pm2
cd /path/to/NUFI_Eval/server
pm2 start index.js --name guardian-fusion-api
pm2 startup
pm2 save
```

8. **Setup SSL with Let's Encrypt**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

---

### Option 2: Docker Deployment

1. **Create Dockerfile** (server):
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY server/package*.json ./
RUN npm ci --only=production
COPY server/ ./
EXPOSE 3005
CMD ["node", "index.js"]
```

2. **Create docker-compose.yml**:
```yaml
version: '3.8'
services:
  guardian-fusion-api:
    build: .
    ports:
      - "3005:3005"
    environment:
      - NODE_ENV=production
    env_file:
      - .env
    restart: unless-stopped
```

3. **Deploy**:
```bash
docker-compose up -d
```

---

### Option 3: Cloud Platforms

#### **Heroku**
```bash
heroku create guardian-fusion-api
heroku config:set NUFI_API_KEY=your_key
heroku config:set SESSION_SECRET=$(openssl rand -hex 32)
heroku config:set AUTHORIZED_USERS=admin:pass:Admin:admin
git push heroku main
```

#### **AWS EC2**
- Similar to VPS deployment
- Use ELB for load balancing
- Store .env in AWS Secrets Manager

#### **DigitalOcean App Platform**
- Connect GitHub repository
- Set environment variables in dashboard
- Auto-deploys on git push

---

## 🛡️ Production Security Checklist

### Critical Items:
- [ ] Generated strong SESSION_SECRET (32+ random bytes)
- [ ] Set NODE_ENV=production
- [ ] Configured strong passwords for all users
- [ ] Set ALLOWED_ORIGINS to your domain only
- [ ] SSL/HTTPS enabled
- [ ] .env file is NOT in git (check .gitignore)
- [ ] API keys stored only in .env
- [ ] Firewall configured (only 80/443 open)
- [ ] Server OS and packages up to date
- [ ] Regular backups configured

### Recommended:
- [ ] Enable fail2ban for SSH protection
- [ ] Setup monitoring (UptimeRobot, StatusCake)
- [ ] Configure log rotation
- [ ] Setup automated backups
- [ ] Document recovery procedures
- [ ] Test disaster recovery plan

---

## 👥 User Management

### Adding New Users

Edit `.env` and restart server:
```env
AUTHORIZED_USERS=user1:pass1:Name1:role1,user2:pass2:Name2:role2
```

### Removing Users

Remove from AUTHORIZED_USERS and restart server.

### Changing Passwords

Update password in AUTHORIZED_USERS and restart:
```bash
pm2 restart guardian-fusion-api
```

---

## 📊 Monitoring & Maintenance

### Check Server Status
```bash
pm2 status
pm2 logs guardian-fusion-api
```

### View API Usage
```
https://yourdomain.com/api/stats
```
(Requires authentication)

### Monitor Logs
```bash
pm2 logs guardian-fusion-api --lines 100
```

### Restart Server
```bash
pm2 restart guardian-fusion-api
```

---

## 🔧 Troubleshooting

### "Authentication required" errors
- Check AUTHORIZED_USERS is configured
- Verify password is correct
- Clear browser cookies and try again

### CORS errors
- Verify ALLOWED_ORIGINS includes your domain
- Check protocol (http vs https)
- Ensure credentials: true in CORS config

### Session not persisting
- Check SESSION_SECRET is set
- Verify cookies are enabled in browser
- In production, ensure cookie.secure=true with HTTPS

### API key errors
- Verify NUFI_API_KEY is correct
- Check NUFI_DEMO_MODE setting
- Review server logs for details

---

## 📞 Support & Updates

### Before Going Live
1. Test all API endpoints with authentication
2. Verify rate limiting works
3. Test with multiple users simultaneously
4. Confirm SSL/HTTPS working
5. Check mobile responsiveness

### Post-Deployment
- Monitor server resources (CPU, memory, disk)
- Track API usage against your NUFI quota
- Review logs regularly for errors
- Keep Node.js and dependencies updated

---

## 🎯 Quick Start Commands

**Development Mode (no auth):**
```bash
npm run dev
```

**Production Mode (with auth):**
```bash
NODE_ENV=production npm run production
```

**Build for Production:**
```bash
npm run build
```

---

**Your application is now production-ready with authentication, rate limiting, and security hardening!**
