# Sublime FTP-Sync

This is a plugin for the [Sublime Text 2](http://www.sublimetext.com/) text
editor that allows you to synchronise your local and remote files.

## Installation

The easiest way to install is via the [Sublime Package Control](http://wbond.net/sublime_packages/package_control)
plugin. Just open "Package Control: Install Package" in your Command Palette and search for
"FTP-Sync" (or, if you already have it installed, select "Package Control: Upgrade Package"
to upgrade).

To install it manually in a shell/Terminal (on OS X or Linux), via git:

    cd ~/"Library/Application Support/Sublime Text 2/Packages/"
    git clone https://github.com/rvaronos/sublime-ftp-sync.git

or, if you don't have git installed:

    cd ~/"Library/Application Support/Sublime Text 2/Packages/"
    rm -rf rvaronos-sublime-ftp-sync*  # remove any old versions
    curl -L https://github.com/rvaronos/sublime-ftp-sync/tarball/master | tar xf -

The plugin should be picked up automatically. If not, restart Sublime Text.

## Usage

The first time you run one of the commands, it will ask you for your GitHub
username and password in order to create a GitHub API access token, which gets saved
in the Sublime GitHub user settings file. Your username and password are not
stored anywhere, but if you would rather generate the access token yourself, see
the "Generating Your Own Access Token" section below.

The following commands are available in the Command Palette:

* **FTP-sync: Download & Overwrite**


* **FTP-sync: Download & Skip**


* **FTP-sync: Upload & Overwrite**


* **FTP-sync: Upload & Skip**

## Issues

## Bugs and Feature Requests

<http://github.com/rvaronos/sublime-ftp-sync/issues>

## License

[Open Software License version 3.0](http://www.opensource.org/licenses/osl-3.0.php)
