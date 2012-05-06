/********************************************
 * Loop through arguments and check options
 ********************************************/

function checkArguments(args, options) {
    var i;
    for (i = 0; i < args.length; i++) {
        var arg = args[i];
        if (arg.indexOf("-") == 0) {
            var option = arg.substr(1);
            if (options.hasOwnProperty(option)) {
                if (args[i++].indexOf("-") == -1) {
                    options[option](args[i++]);
                }
            }
        }
    }
}