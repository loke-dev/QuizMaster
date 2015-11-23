# Examination-2

This is the repo for the examination 2 in the course. The virtual machine (hashicorp/precise32) will have the following (relevant) packages installed:

From start:
* node.js (Latest stable)
* npm
* git
* browserify (watchify)
* http-server
* nodemon

## Install
Make sure you have the following installed on your system:
* Virtual Box [https://www.virtualbox.org/](https://www.virtualbox.org/)
* Vagrant [https://www.vagrantup.com/](https://www.vagrantup.com/)

Now, do:

1. Pull (`git pull https://github.com/1dv022/examination-2.git`) into your existing examination-2 repo. Make sure you are in the root of your repo.

2. Start the virtual machine using `vagrant up` (May take 5-10 minutes this first time. (Ignore red command line statements and warnings.)

3. `vagrant ssh` to connect to the machine.

## In the vagrant terminal (after `vagrant ssh`)
1. Make sure you are located in the folder `/vagrant/examination/` at all times.
2. Do `npm run debug`. The following will happen:
  * A process will start watching files in the folder `source/` for changes. When a change is detected the file will be copied to the debug-folder as follows:
    * `source/image/` -> `debug/image` .jpeg, .jpg, .png, .gif, .svg are copied
    * `source/js/app.js` -> `debug/javascript/build.js` app.js and it dependencies are browserified to build.js
    * `source/*.html` -> `debug/*.html` .html-files are copied
    * `source/css/*.css` -> `debug/*.css` .css-files are copied
  * A webserver is started and if you browse to `http://localhost:4000` you will see the html-page `debug/index.html`. 

## In the Git-bash or terminal on your local computer
You should have multiple terminals open at the same time. One running the `npm run debug`  in the vagrant-terminal, and one terminal not ssh:ed to vagrant. In the terminal on your local machine you could to tasks like committing and pushing to GitHub. 

## Local IDE
1. Start up your IDE (WebStorm) and open a new project pointing to the folder "examination"
2. Start editing your site in the `source`-folder. **(NEVER EDIT FILES IN THE DEBUG FOLDER.)** When you save a change look at the "vagrant terminal". You should see that the files are rebuilt. 
3. Refresh the webpage `localhost:4000` and this should reflect your changes.
4. When you debug your application you should to this in the browser, not in the IDE. A simple method is to write `debugger;` in your js-source code where you want to stop the debugger and refresh the browser.

## Intructions for the examination assignment
The instructions are in the README-file in the examination/client-folder
