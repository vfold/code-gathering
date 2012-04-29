#!/bin/bash

tools=https://raw.github.com/rvaronos/code-gathering/master/terminal/tools/

bash <(curl -s ${tools}pre-init)
bash <(curl -s ${tools}string)
bash <(curl -s ${tools}profile)

updateProfile CodeGathering

bash <(curl -s ${tools}github)

setupGihub

cd ~/.cache/code-gathering

wget -N ${cache}profile.xml

 #*************************************************
 # Installing packages
 #*************************************************

 while read line
 do

 		if [ '$line' = *\[* ]
 		then
 	echo $line
 fi

 done < packages

 ask "Do you have a github account [y/n]?"

 if [ $reply ]
 	then
 	setupGithub;
 else
 	read -n 1 -s;

 	sleep 3;
 	google -chrome "https://github.com/signup/free"
 	read -n 1 -s;
 	setupGithub;
 fi

 #*************************************************
 # Setup Code Gathering Projects
 #*************************************************

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
 setupSublime() {

 	npm install -g compiler-js
 	cd ~/"Library/Application Support/Sublime Text 2/Packages/"
 }
