#!/bin/bash

cd ~/.cache/code-gathering

wget -N ${cache}profile.xml

gnome-terminal --tab-with-profile=CodeGathering -e "sh script.sh"
