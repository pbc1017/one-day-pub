#!/bin/bash
# SSL certificate renewal script
cd /home/one-day-pub/one-day-pub-dev/deploy

echo "[$(date)] Starting SSL certificate renewal..."

# Run certbot renewal with webroot mode  
docker-compose -f docker-compose-nginx.yml run --rm certbot-renew

# Check if renewal was successful and reload nginx
if [ $? -eq 0 ]; then
    docker exec one-day-pub-nginx nginx -s reload
    echo "[$(date)] SSL certificate renewal completed"
else
    echo "[$(date)] SSL certificate renewal failed"
fi
