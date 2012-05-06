require("ftp-sync").init([
// Host [Change to your host name here]
"-h", "ftp.codegathering.com",
// Port
"-p", "21",
// Username [Insert authentication properies in the run config]
"-U",ARGS[2]||null,
// Password [Same applies here]
"-P",ARGS[3]||null,
// Action command [tell FTP client what to do]
"-a",ARGS[4]||"dk",
// Local Path
"-l","./",
// Remote Path
"-r","./"
]);