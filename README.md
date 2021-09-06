# Nisaba: The new text editor for Oracc

1. [User Guide](./README.md#user-guide)
    * [About Nisaba](./README.md#about-nisaba)
        * [What is Oracc?](./README.md#what-is-oracc)
        * [What is Nisaba?](./README.md#what-is-nisaba)
    * [Installing Nisaba](./README.md#installing-nisaba)
    * [Work with ATF files](./README.md#work-with-atf-file)
        * [Lemmatise an ATF](./README.md#lemmatise-an-atf)
        * [Validate an ATF](./README.md#validate-an-atf)
        * [Right-to-left languages (e.g. Arabic, Farsi, Kurdish, Syriac...)](./README.md#right-to-left-languages-e-g-Arabic-Farsi-Kurdish-Syriac)
    * [Troubleshooting](./README.md#troubleshooting)
    * [Asking for help](./README.md#asking-for-help)
1. [Development](./README.md#development)
    * [Installation for developers](./README.md#installation-for-developers)
    * [Development workflow](./README.md#development-workflow)
    * [Running tests](./README.md#running-tests)
    * [Debugging tips](./README.md#debugging-tips)

## User Guide

### About Nisaba

#### What is Oracc?
Oracc is the [Open Richly Annotated Cuneiform Corpus](http://oracc.org).
It provides open-access, standards-based publication platforms, research tools
and teaching resources for Assyriology and ancient Near Eastern History,
hosting around 40 academic research projects worldwide.

Oracc has become established as one of the core online resources in the world
of ancient Near Eastern studies. It originated in an AHRC-funded research project
[Prof. Eleanor Robson](https://www.ucl.ac.uk/history/people/academic-staff/eleanor-robson)
ran at the University of Cambridge several years ago and is now continuing to
run from University College London in collaboration with University of
Pennsylvania (Philadelphia).

#### What is Nisaba?

Nisaba is the new text editor that enables Oracc content creators to view, edit and validate documents recording the content of cunneiform tablets from
various ancient Mesopotamian cultures, translated and formatted for the modern reader. These documents are text files in the 
[ASCII Transliteration Format](http://oracc.museum.upenn.edu/doc/help/editinginatf/index.html)
(ATF), originally developed for the Oracc project. Nisaba is being developed as an extenstion to [Visual Studio Code](https://visualstudio.microsoft.com/), a text editor developed by Microsoft.

Nisaba's precursor is [Nammu](https://github.com/oracc/nammu) which was developed as a cross-platform stand-alone tool, and has now reached the end of its active development life. It will remain accessible but with very limited maintenance. Nisaba is now the official tool for ATF edition. 

Nisaba has been funded by Oracc and [Nahrein](https://www.ucl.ac.uk/nahrein/), and as such aims to cover the needs of both initiatives, including making ATF edition more user friendly for Arabic- and Farsi-speaking content creators.

Oracc content creators originally used an Emacs plugin for edition,
validation and lemmatisation of ATF files. This plugin can only be installed as
part of [Emacs](http://oracc.museum.upenn.edu/doc/help/usingemacs/emacssetup/index.html),
which can have a steep learning curve.

With Nisaba, as well as with Nammu in the past, we intend to make a user friendly tool that would replace the use
of the [Oracc Emacs plugin](http://oracc.museum.upenn.edu/doc/help/nammuandemacs/emacssetup/index.html). This will help lower the access barriers to the use
of Oracc, enabling more projects to adopt it.

Nisaba is currently being developed by the
[UCL Research Software Development Group](https://www.ucl.ac.uk/research-it-services/about/research-software-development).

<img src="PLACEHOLDER" align="center" width="90%">

### Installing Nisaba
### Working with ATF files

After installing the extension, in order to utilise it you will need to open an ATF file in VS Studio, or start typing and save your file with an `atf` extension (e.g. "my_file.atf".
You can also fine numerous ATF files freely available on the 
[ORACC site archive](http://oracc.museum.upenn.edu/doc/search/index.html).
Once you have an ATF file to load, simple locate the File option on the menu bar at the top left of the window, and choose the Open File option from the drop down menu. This will bring up a window allowing you to locate the ATF file. Once located, select it and choose open.

#### Lemmatise an ATF
#### Validate an ATF
#### Right-to-left languages (e.g. Arabic, Farsi, Kurdish, Syriac...)
### Troubleshooting
### Asking for help

## Development 
### Development workflow

After cloning the repository, enter this directory and install the dependencies
with the command

```
npm install
```

Then you can compile, package, and install the extension with

```
npm run compile
npm run package
code --install-extension nisaba-0.0.1.vsix
```

If you open this directory in Visual Studio Code, you should be able to run the
compile and package commands from the list of "npm scripts" in the sidebar on
the left.  (Re)start Visual Studio Code to make the changes take effect:

```
code
```

### Running tests

After having installed all dependencies with `npm install` and compiled the
package with `npm run compile`, you can run the tests for the package with

```
npm run test
```

### Debugging tips

To debug the syntax highlighting (currently implemented as a [Textmate
grammar](https://code.visualstudio.com/api/language-extensions/syntax-highlight-guide))
trigger the [scope
inspector](https://code.visualstudio.com/api/language-extensions/syntax-highlight-guide#scope-inspector)
from the Command Palette (`Ctrl+Shift+P`) with the `Developer: Inspect Editor
Tokens and Scopes` command.

## User Guide 



One key feature is the ability to display text in multiple different languages, and features viewing panels that can display the text from right-to-left (eg: Arabic).

Once an ATF file has been loaded, you should have two extra icons on the top right.

The first of these in the Show Arabic Preview button, which brings up a secondary panel displaying the correct orientation of the Arabic text (right to left). 

The next icon along is the Validate ATF button, which when pressed will send the contents of the file over to the Oracc server in order to check if the ATF is valid. If there are errors, those will be displayed in the console.

Once you are done viewing or editing the ATF file, simply save and close it and the extension will close with it. To save the file, choose the File option on the menu bar, and choose the Save option. Under the menu bar, there should be a tab with the same name as the ATF file opened earlier. Hovering over this tab will reveal an X, which if clicked will close the file and the extension along with it.
