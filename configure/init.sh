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
# Install configurations for the given username
user=$1

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

cd ${conf}$i
index=$(substr $i $(($(indexOf $i $search)+${#search})))

if [ $(grep "CodeGathering" %gconf.xml) ]
then
echo "CodeGathering Profile already exists"
return
fi

if [ $index > $max ] 
then 
max=$index
fi

done;

index=$(( $max + 1 ))

cd ${conf}global

# Check for an existing configuration file
if [ ! -f %gconf.xml ]
then
wget -N ${cache}global.xml
mv global.xml %gconf.xml
fi

line="\n<li type=\"string\">\n<stringvalue>Profile${index}</stringvalue>\n</li>"
lineNum=$(grep -n '<entry name="profile_list"' %gconf.xml | awk -F: '{print $1}')
 
sed "$lineNum a\
> ${line}" %gconf.xml > newfile
mv newfile %gconf.xml


cd ~/.cache
mkdir -p code-gathering
cd code-gathering
wget -N ${cache}packages ${cache}script.sh ${cache}profile.xml

sed -i 's/\${ID}/${index}/g' profile.xml
#gconftool-2 --load profile.xml
#gnome-terminal --window-with-id=${index} -e "sh script.sh $USER"

