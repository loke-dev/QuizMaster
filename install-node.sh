# Reading Environment Varaibles
echo "Reading environment variables..."

# Check if env/ directory exists
if [ -d /vagrant/env/ ]; then
  for path in /vagrant/env/*; do
    name=${path##*/}
    # Do not include dotfiles or empty directory (*)
    if [[ "$name" != "*" ]] && [[ ${name:0:1} != "." ]]; then
      echo "$name=$(cat $path)"
      echo "export $name=$(cat $path)" >> /home/vagrant/.bashrc
    fi
  done
fi

# Setting Environment Varaibles
echo "Setting environment variables..."
echo "export NODE_ENV=development" >> /home/vagrant/.bashrc
echo "cd /vagrant/examination" >> /home/vagrant/.bashrc

# Installing nvm
echo "Installing nvm..."
export HOME=/home/vagrant
curl https://raw.githubusercontent.com/creationix/nvm/master/install.sh | bash
echo "source ~/.nvm/nvm.sh" >> /home/vagrant/.bashrc
source /home/vagrant/.nvm/nvm.sh

# Installing Node.JS
echo "Installing Node.JS..."
nvm install stable
chown -R vagrant:vagrant /home/vagrant/.nvm
export HOME=/home/root

# Installing NPM packages
echo "PATH=$PATH:/vagrant/node_modules/.bin" >> /home/vagrant/.bashrc
PATH=$PATH:/vagrant/node_modules/.bin

echo "Installing npm packages"
sudo npm install -g browserify
sudo npm install -g watchify
sudo npm install -g http-server
sudo npm install -g npm-run-all
sudo npm install -g nodemon
