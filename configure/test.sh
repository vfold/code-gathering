if [ $(grep "CodeGathering" %gconf.xml) ]
then
echo "CodeGathering Profile already exists"
return
fi
