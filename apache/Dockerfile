FROM httpd:2.4.32-alpine
MAINTAINER Giampiero Lai <giampiero.lai@gmail.com>

RUN apk update \ 
    && apk add --no-cache openssh-client unzip curl bison git openssl \
    && apk upgrade

# Copy apache vhost file to proxy php requests to php-fpm container
RUN mkdir /usr/local/apache2/conf/ssl
RUN mkdir -p /logs/
RUN openssl req -new -x509 -nodes -out /usr/local/apache2/conf/ssl/server.pem -keyout /usr/local/apache2/conf/ssl/server.key -days 3650 -subj '/CN=localhost'

COPY ./apache.conf /usr/local/apache2/conf/apache.conf

# ENV SERVERNAME localhost

RUN echo "Include /usr/local/apache2/conf/apache.conf" >> /usr/local/apache2/conf/httpd.conf

EXPOSE 8080
EXPOSE 4430

# Default env vars for httpd. You can override these at runtime if you want to
ENV SERVERNAME localhost
ENV ADMINEMAIL root@localhost