Install all imported packages using npm install <package-name> --save
ensure that you have node installed
and accessible in you codes directory

save the .sql file in mysql/bin directory 
example "C:/XAMPP/mysql/bin/exports/", create export dir, if not exists
start mysql running environment like XAMPP
import the file in mysql : 
mysql -u <username> <any-database-name> < "C:/XAMPP/mysql/bin/exports/shorturls.sql"

then fullfill the config.js file
with the login data to mysql database 

start the local server:
node NODE.js

open you browser:
localhost:<port-number>/

Test the working of the repo codes.
start the repo if usefull.

Happy coding!
