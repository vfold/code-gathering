 #!/bin/bash

 echo "When you see [continue], press any key after you have followed instructions";
 sleep 2;
 echo "Try it now to start the configuration :)"
 sleep 1;
 pause;

 user = $USER

 sudo -s

 wget -q -O -https: //dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add -
 sh -c 'echo "deb http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list'

 echo 'deb http://download.opensuse.org/repositories/home:heimdall78/xUbuntu_11.10/ /' >> /etc/apt/sources.list

 add-apt-repository ppa:richarvey/nodejs
 add-apt-repository ppa:webupd8team/sublime-text-2
 add-apt-repository ppa:kazam-team/unstable-series

 apt-get update


 # User interface
 apt-get install gnome -panel docky nautilus -gksu
  # Graphics
 apt-get install mypaint inkscape gimp 
 # Development
 apt-get install nodejs npm sublime-text-2-beta git-core git-gui git-doc 
 # Web
 apt-get install google -chrome -stable firefox opera mysql -server phpmyadmin 
 # Screencasting and video editing
 apt-get install kazam 
 # Internet
 apt-get install skype 
 # Helper tools
 apt-get install geogebra

 # Run back as default user to get the right privileges for yout files

-su $user

echo "Do you have a github account [y/n]?"
read -s -n 1 ans

if [ $ans = y -o $ans = Y ]
then
setupGithub;
else
 read -n 1 -s;

 sleep 3;
 google -chrome "https://github.com/signup/free"
 read -n 1 -s;
 setupGithub;
fi

 setupProjects() {

 	cd ~
 	mkdir development
 	cd development
 	mkdir github
 	cd github

echo "Fork my project!"
sleep 2;
google-chrome "https://github.com/rvaronos/code-gathering"
pause;

git clone git@github.com:$username/code-gathering.git
cd code-gathering
git remote add upstream git://github.com/rvaronos/code-gathering.git
git fetch upstream
 }

 pause(){
 	echo "[continue]"
 	read -n 1 -s;
 }
 setupSublime() {

 	npm install -g compiler-js
 }

 setupGithub() {

 	cd ~/.ssh 
 	# makes a subdirectory called "key_backup" in the current directory
 	mkdir key_backup 
 	# Copies the id_rsa and id_rsa.pub files into key_backup
 	cp id_rsa * key_backup
 	rm id_rsa *

 	echo 'Enter your email, followed by [ENTER]: '
 	read email 
 	# Creates a new ssh key using the provided email
 	ssh -keygen -t rsa -C $email

 	echo "Copy the entire text ..."
 	sleep 2;
 	gedit~ / .ssh / id_rsa.pub
 	pause;

 	echo "Add SSH key ..."
 	sleep 2;
 	google-chrome "https://github.com/settings/ssh"
 	pause;

 	echo "Testing github ..."
 	sleep 1;
 	ssh -T git@github.com
 	echo "Don’t worry, this is supposed to happen. Type “yes”";

 	echo "Setting up your github account...";
 	sleep 1;
 	echo "Enter First and Last name, followed by [ENTER]";
 	read fullname

 	git config--global user.name $fullname
 	git config--global user.email $email

 	echo "Copy API token..."
 	sleep 2;
 	google-chrome "https://github.com/settings/admin"
 	pause;

 	echo "Enter github username, followed by [ENTER]";
 	read github_user;
 	echo "Paste API token [CONTROL+SHIFT+v], followed by [ENTER]";
 	read token;

 	git config--global github.user $username
 	git config--global github.token $token

 	echo "*Note* If you ever change your GitHub password, a new token will be created and will need to be updated..."
 	sleep 3;
 }
