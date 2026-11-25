
# Use Ubuntu as the base image
FROM ubuntu:latest

# Update packages and install Apache
RUN apt-get update && apt-get install -y apache2

COPY ./docker-frontend-app/ /var/www/html/
# Expose Apache's default port
EXPOSE 80

# Start Apache when the container runs
CMD ["apachectl", "-D", "FOREGROUND"] 
