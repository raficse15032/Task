# Use official Ubuntu image

FROM ubuntu:24.04

# Install dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends software-properties-common curl zip unzip git && \
    add-apt-repository ppa:ondrej/php && \
    apt-get update && \
    apt-get install -y --no-install-recommends php8.4 php8.4-cli php8.4-fpm php8.4-common php8.4-mbstring php8.4-xml php8.4-zip php8.4-gd php8.4-curl php8.4-mysql php8.4-pgsql php8.4-redis php8.4-tokenizer php8.4-bcmath php8.4-ctype php8.4-fileinfo php8.4-pdo php8.4-imagick php8.4-dev php-pear && \
    apt-get install -y --no-install-recommends libpng-dev libjpeg-dev libfreetype6-dev libzip-dev libonig-dev libxml2-dev libpq-dev postgresql-client nginx

COPY --from=composer:2.8.10 /usr/bin/composer /usr/bin/composer

# Update PATH for Composer global bin
ENV PATH="/root/.config/composer/vendor/bin:${PATH}"

# Install Laravel globally
RUN composer global require laravel/installer

# Test it
RUN which laravel && laravel --version

# Expose port 80 for nginx
EXPOSE 80

# Expose port 9000 for PHP-FPM
EXPOSE 9000

WORKDIR /var/www/html

COPY ./docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
CMD ["/entrypoint.sh"]
