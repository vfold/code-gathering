 #!/bin/bash

 ps1_old="$PS1"
 PS1="\$"
 user=$1

 red=1
 green=2
 yellow=3
 blue=4
 magenta=5
 cyan=6
 white=7
 norm=9


 #*************************************************
 # Helper Functions
 #*************************************************

 readInput(){
 	tput bold
 	tput setaf $green;
 	echo -n "${1}: "
 	tput setaf $norm;
 	tput sgr0
 	read reply
 }
 pause(){
 	tput bold
 	tput setaf $magenta;
 	echo -n "[continue]"
 	tput invis
 	OLDCONFIG=`stty -g`
 	stty -icanon -echo min 1 time 0
 	dd count=1 2>/dev/null
 	stty $OLDCONFIG
 	tput sgr0
 	tput setaf $norm;
 }
 step(){
 	tput bold
 	tput setaf $yellow
 	echo "${1}"
 	tput sgr0
 	tput setaf $norm;
 }
 info(){
 	tput bold
 	tput setaf $blue
 	echo "${1}"
 	tput sgr0
 	tput setaf $norm;
 }
 ask(){
 	echo -n "${1}"
 	read -s -n1 ans
 	if [$ans = y -o $ans = Y]
 		then
 		reply=true
 		return
 	elif [$ans = n -o $ans = N]
 		then 
 		reply=false
 		return
 	fi
 	ask $1
 }
variable=$(
  RS=""
  while read line; do
    printf "%s%s" "$RS" "$line"
    RS='%0D%0A'
  done < root.sh
)

 #*************************************************
 # Startup Information and settings
 #*************************************************

 info "When you see [continue], press any key after you have followed instructions"
 step "Try it now to start the configuration :)"
 pause;
 

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

 setupGithub() {
 	cd ~/.ssh 

 	if [ ! -d "key_backup" ]
 		then
    # makes a subdirectory called "key_backup" in the current directory
    mkdir key_backup 
fi

     	# Copies the id_rsa and id_rsa.pub files into key_backup
     	cp id_rsa* key_backup
     	rm id_rsa*

     	readInput "Enter your email, followed by [ENTER]" 
     	email=$reply

     	generateKey(){

     		step "Press [ENTER] when asked to save the key"
	#pause;
 	# Creates a new ssh key using the provided email
 	ssh-keygen -t rsa -C $email

 	if [ ! -f "id_rsa" ]
 		then
     	# Copies the id_rsa and id_rsa.pub files into key_backup
     	info "There was a problem. Trying again"
     	generateKey;
     fi
 }
 generateKey;

 step "Copy the entire text ..."
 sleep .5;
 sublime-text-2 ~/.ssh/id_rsa.pub
 pause;

 step "Add SSH key ..."
 google-chrome "https://github.com/settings/ssh"
 pause;

 info "Testing github ..."
 sleep .5;
 step "Type “yes” when prompted";
 ssh -T git@github.com

 info "Setting up your github account...";
 sleep 0.5;
 readInput "Enter First and Last name, followed by [ENTER]"
 fullname=$reply

 git config--global user.name $fullname
 git config--global user.email $email

 readInput "Enter github username, followed by [ENTER]";
 github_user=$reply;

 step "Copy API token..."
 sleep 2;
 google-chrome "https://github.com/settings/admin"
 pause;

 readInput "Paste API token [CONTROL+SHIFT+V], followed by [ENTER]";
 token=$reply;

 git config--global github.user $username
 git config--global github.token $token

 info "*Note* If you ever change your GitHub password, a new token will be created and will need to be updated..."
 pause;
}

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

 setupGithub() {
 	cd ~/
mkdir -p .ssh
cd .ssh 

 	if [ ! -d "key_backup" ]
 		then
    # makes a subdirectory called "key_backup" in the current directory
    mkdir key_backup 
fi

     	# Copies the id_rsa and id_rsa.pub files into key_back
     	cp id_rsa* key_backup
     	rm id_rsa

     	readInput "Enter your email, followed by [ENTER]" 
     	email=$reply

     	generateKey(){

     		step "Press [ENTER] when asked to save the key"
	#pause;
 	# Creates a new ssh key using the provided email
 	ssh-keygen -t rsa -C $email

 	if [ ! -f "id_rsa" ]
 		then
     	# Copies the id_rsa and id_rsa.pub files into key_backup
     	info "There was a problem. Trying again"
     	generateKey;
     fi
 }
 generateKey;

 step "Copy the entire text ..."
 sleep .5;
 sublime-text-2 ~/.ssh/id_rsa.pub
 pause;

 step "Add SSH key ..."
 google-chrome "https://github.com/settings/ssh"
 pause;

 info "Testing github ..."
 sleep .5;
 step "Type “yes” when prompted";
 ssh -T git@github.com

 info "Setting up your github account...";
 sleep 0.5;
 readInput "Enter First and Last name, followed by [ENTER]"
 fullname=$reply

 git config--global user.name $fullname
 git config--global user.email $email

 readInput "Enter github username, followed by [ENTER]";
 github_user=$reply;

 step "Copy API token..."
 sleep 2;
 google-chrome "https://github.com/settings/admin"
 pause;

 git config--global github.user $username

 info "Have fun with github!"
 pause;
}



