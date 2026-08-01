#!/bin/bash
set -e

cd /var/www/Jamshid.bilan-Personal-Website

git pull origin main
npm ci --prefer-offline
npm run build
pm2 restart jamshidbilan
