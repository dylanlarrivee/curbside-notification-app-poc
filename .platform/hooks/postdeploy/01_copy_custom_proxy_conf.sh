#!/usr/bin/env bash
sudo mv -f /home/ec2-user/custom-nginx.conf /etc/nginx/nginx.conf
sudo service nginx restart
