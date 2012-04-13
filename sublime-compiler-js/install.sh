 #!/bin/bash

##########################################
# Fetch plugin from github
##########################################

if 
	dpkg-query -W git
then 
	sudo apt-get install git
fi

cd ~/"/.cache/"
if [ -d "code-gathering" ]
then
	cd ./code-gathering
	git pull
else
	git clone https://github.com/rvaronos/code-gathering.git
fi

##########################################
# Install plugin
##########################################

cd ~/"/.config/sublime-text-2/Packages/"

if [ -d "Compiler-JS" ]
then
	rm -rf Compiler-JS
fi

cp -r ~/"/.cache/code-gathering/sublime-compiler-js" ./
mv sublime-compiler-js Compiler-JS

