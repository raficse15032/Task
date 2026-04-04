# Use official Ubuntu image

FROM ubuntu:24.04

# Install curl and Node.js 24
RUN apt-get update && apt-get install -y curl ca-certificates \
    && curl -fsSL https://deb.nodesource.com/setup_24.x | bash - \
    && apt-get install -y nodejs && npm install -g npm@11.6.0

WORKDIR /var/www/html

COPY ./codes .

WORKDIR /var/www/html

COPY ./docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
CMD ["/entrypoint.sh"]
