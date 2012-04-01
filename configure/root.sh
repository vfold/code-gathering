 #!/bin/bash

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