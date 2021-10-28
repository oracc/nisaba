## Installation for developers

## Development workflow

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

## Running tests

After having installed all dependencies with `npm install` and compiled the
package with `npm run compile`, you can run the tests for the package with

```
npm run test
```

## Debugging tips

To debug the syntax highlighting (currently implemented as a [Textmate
grammar](https://code.visualstudio.com/api/language-extensions/syntax-highlight-guide))
trigger the [scope
inspector](https://code.visualstudio.com/api/language-extensions/syntax-highlight-guide#scope-inspector)
from the Command Palette (`Ctrl+Shift+P`) with the `Developer: Inspect Editor
Tokens and Scopes` command.

## Publishing the extension in VS Code Marketplace

The publisher ID we are using is "UCLResearchSoftwareDevelopmentGroup", and it's linked to RSDG's notifications email account. You can see login details for it in RSDG's shared passwords list in LastPass.

Then, update Nisaba's version number in `package.json` for the new release.

Once that's done, you can locally run:

```
npm run publish
```

which will package and publish the extension in the Marketplace.

Please note you'll be prompted to enter a Personal Account Token (PAT) when publishing the extension. The one we are using is currently saved in LastPass. It will expire in one year (27th October 2022). Instructions to create a new one are also in the LastPass entry.