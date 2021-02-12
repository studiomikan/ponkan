FROM ubuntu:18.04

ARG CURRENT_UID

ENV DEBIAN_FRONTEND=noninteractive
ENV LANG ja_JP.UTF-8

RUN apt-get update \
  && apt-get install -y \
    apt-utils \
    sudo \
    git \
    language-pack-ja \
    vim \
    xserver-xorg \
    x11-apps \
    openssh-server \
    curl \
    zip \
	  fonts-noto-cjk \
  	gdebi \
  	gnupg2

# install chrome
RUN curl -sSL https://dl.google.com/linux/linux_signing_key.pub | apt-key add - \
	&& echo "deb https://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list \
	&& apt-get update \
  && apt-get install -y google-chrome-stable

# Add Chrome as a user
RUN groupadd -r chrome && useradd -r -g chrome -G audio,video chrome \
	&& mkdir -p /home/chrome && chown -R chrome:chrome /home/chrome
RUN mkdir -p /app/node_modules \
  && chown -R chrome:chrome /app \
  && chmod 777 -R /app

# install nodejs 12
RUN curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -
RUN apt-get install -y nodejs

# Add host user (to run as non-root)
RUN groupadd -g `echo $CURRENT_UID | awk -F'[:]' '{print $1}'` host_group \
  && useradd -g host_group -G chrome,audio,video host_user \
	&& mkdir -p /home/host_user \
  && chown -R host_user:host_group /home/host_user

# USER chrome
# WORKDIR /app
# COPY . /app/

