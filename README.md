# atf README

This is the README of the extension "atf".

## Development workflow

After cloning the repository, enter this directory and install the dependencies
with the command

```
nmp install
```

Then you can compile, package, and install the extension with

```
npm run compile
npm run package
code --install-extension atf-0.0.1.vsix
```

If you open this directory in Visual Studio Code, you should be able to run the
compile and package commands from the list of "npm scripts" in the sidebar on
the left.  (Re)start Visual Studio Code to make the changes take effect:

```
code
```

### Debugging tips

To debug the syntax highlighting (currently implemented as a [Textmate
grammar](https://code.visualstudio.com/api/language-extensions/syntax-highlight-guide))
trigger the [scope
inspector](https://code.visualstudio.com/api/language-extensions/syntax-highlight-guide#scope-inspector)
from the Command Palette (`Ctrl+Shift+P`) with the `Developer: Inspect Editor
Tokens and Scopes` command.
