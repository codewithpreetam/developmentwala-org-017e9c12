# Hostinger VPS deployment for developmentwala.org

## 1) Prepare the VPS
```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg docker.io docker-compose-plugin
sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker $USER
```

## 2) Clone the repo
```bash
cd /opt
sudo git clone https://github.com/codewithpreetam/developmentwala-org-017e9c12.git developmentwala
cd /opt/developmentwala
```

## 3) Create production environment file
Create `.env` with the real Supabase and app values.

## 4) Start the app with Nginx
```bash
docker compose -f docker-compose.nginx.yml pull
docker compose -f docker-compose.nginx.yml up -d
```

## 5) Domain DNS
Point these records to the VPS IP:
- A record: developmentwala.org -> VPS_IP
- A record: www.developmentwala.org -> VPS_IP

## 6) SSL
After DNS propagates, install Certbot or use Hostinger SSL if available.
