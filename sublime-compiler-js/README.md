# Sublime Compiler JS
This is a plugin for the [Sublime Text 2](http://www.sublimetext.com/) text
editor that allows you to merge your .js files located in your ./src folder
into one output file in the ./output directory. 

## Installation

This plugin works only with the compiler-js [nodejs](http://nodejs.org/) module. 
Go to the [repository](https://github.com/rvaronos/node-compiler-js) and checkout the Install section.

The easiest way to install is via the [Sublime Package Control](http://wbond.net/sublime_packages/package_control)
plugin. Just open "Package Control: Install Package" in your Command Palette and search for
"Compiler-JS" (or, if you already have it installed, select "Package Control: Upgrade Package"
to upgrade).

To install it manually in a shell/Terminal (on OS X or Linux), via git:

    cd ~/"Library/Application Support/Sublime Text 2/Packages/"
    git clone https://github.com/rvaronos/sublime-compiler-js.git

or, if you don't have git installed:

    cd ~/"Library/Application Support/Sublime Text 2/Packages/"
    rm -rf rvaronos-sublime-compiler-js*  # remove any old versions
    curl -L https://github.com/rvaronos/sublime-compiler-js/tarball/master | tar xf -

The plugin should be picked up automatically. If not, restart Sublime Text.

## Usage


The following commands are available in the Command Palette:

* **Compiler-JS: Run**

## Issues

## Bugs and Feature Requests

<http://github.com/rvaronos/sublime-compiler-js/issues>

## License

[Open Software License version 3.0](http://www.opensource.org/licenses/osl-3.0.php)
