 #!/bin/bash

 user=$USER
 clear

 ps1_old="$PS1"
 PS1="\$"

 red=1
 green=2
 yellow=3
 blue=4
 magenta=5
 cyan=6
 white=7
 norm=9

 tput setab 0

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

su root -c $variable
 
 #*************************************************************************
 # Run back as default user to get the right privileges for yout files
 #*************************************************************************

#su -p -c $(<user.sh) $user


