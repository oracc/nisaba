# Nisaba: The new text editor for Oracc

1. [User Guide](./README.md#user-guide)
    * [About Nisaba](./README.md#about-nisaba)
        * [What is Oracc?](./README.md#what-is-oracc)
        * [What is Nisaba?](./README.md#what-is-nisaba)
    * [Installing Nisaba](./README.md#installing-nisaba)
    * [Work with ATF files](./README.md#work-with-atf-file)
        * [Lemmatise an ATF](./README.md#lemmatise-an-atf)
        * [Validate an ATF](./README.md#validate-an-atf)
        * [Right-to-left languages (e.g. Arabic, Farsi, Kurdish, Syriac...)](./README.md#right-to-left-languages-eg-arabic-farsi-kurdish-syriac)
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

<img src="media/generalUI.png" align="center">

### Installing Nisaba

### Working with ATF files

In order to enable the Nisaba extension, you will need to open an ATF file in Visual Studio Code. In order to do this, find the "File" option on the menu bar on the top left of the window, then choose "Open File". This will prompt a new window where you can navigate to an existent ATF file in your system, then click on "Open". 

Alternatively, you can create a new file and save it with an ".atf" extenstion, e.g. "my_file.atf". 

Please note you can find numerous ATF files freely available on the 
[Oracc site archive](http://oracc.museum.upenn.edu/doc/search/index.html).

Once Visual Studio has detected you have opened a file with the "atf" extension, it will show the Nisaba extension buttons on the top right of the window, which allow you to lemmatise and validate your ATF file, as well as preview an right-to-left translation with its correct orientation or ask for help:

<img src="media/buttons.png" align="center">

All the Nisaba buttons have tooltips, so you can hover over them and see which action corresponds to which button.

The Nisaba extension will also apply text highlighting to the ATF text in order to help Oracc editors identify potential validation problems as they type.

Once you are done viewing or editing an ATF file, simply save and close it and the extension will close with it. To save the file, choose the "File" option on the menu bar, and choose the "Save" option. Under the menu bar, there should be a tab with the same name as the ATF file opened earlier. Hovering over this tab will reveal an X, which if clicked will close the file and the Nisaba extension along with it.

#### Validate an ATF

You can validate an ATF file by clicking on the validate button on the top right. It will send the contents of the ATF file to the Oracc server for validation. If the file is valid, the console will display a message saying so. Otherwise, a list of errors appears in the console and the errored lines appear highlighted in the edition panel, as shown in the image below

<img src="media/validateATF.png" align="center">

#### Lemmatise an ATF

You can lemmatise an ATF file by clicking on the lemmatise button on the top right. It will send the contents of the ATF file to the Oracc server, which will return a lemmatised file if valid, and reload the edition panel with the lemmatised version of the original ATF.

If the file is not valid, the console will display the error messages found by the server. Once those are fixed, you can attempt to lemmatise the ATF again.

#### Right-to-left languages (e.g. Arabic, Farsi, Kurdish, Syriac...)

One key feature Nisaba has is the ability to display an ATF translation in right-to-left languages, like Arabic. In order to use this feature, you will need to have open an ATF with a translation in Arabic (or other right-to-left language). When you click on the "Show Arabic Preview" button on the top right, you will see a secondary panel to the right of the edition panel that shows the same ATF with the translation section correctly orientated for right-to-left languages.

Please note this feature is not yet available in an "as you type" fashion, so you will have to first type the translation in the main panel first, then use the "Show Arabic Preview" button to check it displays correctly.

<img src="media/arabicpreview.png" align="center">

### Troubleshooting

#### Oracc server not available

#### Problems with Visual Studio?

### Asking for help

You can ask for help, report a bug or request a new feature by [filing an issue in this repository](https://github.com/oracc/nisaba/issues/new).

We will aim to reply as soon as we can within the next few working days.

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

