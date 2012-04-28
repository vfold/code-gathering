#!/bin/bash 

cache=https://raw.github.com/rvaronos/code-gathering/master/configure/
conf=~/.gconf/apps/gnome-terminal/
search=Profile
max=-1

indexOf(){
return | awk -v a="$1" -v b="$2" 'BEGIN{print index(a,b)}'
}
substr(){
return | awk -v s="$1" -v a="$2" 'BEGIN{print substr(s,a)}'
}
substrl(){
return | awk -v s="$1" -v a="$2" -v b="$3" 'BEGIN{print substr(s,a,b)}'
}
replace(){
return | awk -v  -v regex="$2" replacement="$3" target="$3" 'BEGIN{print sub(regex,replacement,target)}'
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

gconftool-2 --shutdown

search=Profile${index}
list=$(gconftool-2 --get "/apps/gnome-terminal/global/profile_list")
i=$(indexOf $list $search)

if [ $i = 0 ]
then
	list=[${search},$( substr $list 2 ) 
fi

gconftool-2 -s /apps/gnome-terminal/global/profile_list -t list --list-type string $list

gconftool-2 --spawn

cd ~/.cache
mkdir -p code-gathering
cd code-gathering
wget -N ${cache}packages ${cache}script.sh ${cache}profile.xml

sed -i "s/\${ID}/${index}/g" profile.xml
gconftool-2 --load profile.xml

gconftool-2 --spawn

gnome-terminal --window-with-profile=CodeGathering -e "sh script.sh $USER"
exit

