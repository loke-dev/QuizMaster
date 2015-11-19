#!/bin/bash

# With love and cred to https://github.com/Turistforeningen
# Modified from https://github.com/Turistforeningen/node-vagrant-template

# Update & Install
echo "Updating and installing system packages..."
apt-get update
apt-get install -y build-essential git curl language-pack-sv libfontconfig

