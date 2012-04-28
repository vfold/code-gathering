#!/bin/bash 

if [ $USER != root ]
then
echo "You must run this script with sudo"
return
fi

cache=https://raw.github.com/rvaronos/code-gathering/master/configure/
conf=/root/.gconf/apps/gnome-terminal/
search=Profile
max=0
user=$USER
home=$HOME

indexOf(){
return | awk -v a="$1" -v b="$2" 'BEGIN{print index(a,b)}'
}
substr(){
return | awk -v s="$1" -v a="$2" 'BEGIN{print substr(s,a)}'
}

cd $conf
mkdir -p profiles
mkdir -p global

# Look into directory for subdirectories (-type d) with name strting in 'Profile'
list=$(find profiles -type d -name $search* )

for i in $list
do

cd $i
index=$(substr $i $(($(indexOf $i $search)+${#search})))

if [ $(grep "CodeGathering" %gconf.xml) ]
then
echo "CodeGathering Profile already exists"
#return
fi

if [ $index > $max ] 
then 
max=$index
fi

done;

cd ${conf}global

if [ ! -f %gconf.xml ]
then
echo create
fi
line="<li type=\"string\">\n<stringvalue>Profile${max+1}</stringvalue>\n</li>"
sed "34i ${line}" %gconf.xml > newfile

cd ~/.cache
mkdir -p code-gathering
cd code-gathering
wget -N ${cache}packages ${cache}script.sh ${cache}profile.xml

cp profile.xml ${profile}%gconf.xml
gnome-terminal --window-with-profile=CodeGathering -e "sh script.sh $USER"
