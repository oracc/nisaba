# Installation for developers

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

The publisher ID we are using is "UCLResearchSoftwareDevelopmentGroup", and it's linked to RSDG's notifications email account (`rsd-notifications`). You can see login details for it in RSDG's shared passwords list in LastPass.

Then, update Nisaba's version number in `package.json` for the new release.  After pushing a commit to the `main` branch, you can automatically create a tag with the version number set in `package.json` by heading to https://github.com/oracc/nisaba/actions/workflows/tag.yml and clicking on the "Run workflow" button.  You can check a box if the tag to create is a prerelease, in which case the version will ***not*** be published to the VS Code Marketplace.  This is useful in case we want to let some users test it, without updating the published extension for everybody.  In either case, this workflow will create a git tag and a GitHub release for the given version number, and then automatically trigger a CI job. This runs the tests again and, if successful, will publish the extension to the VS Code Marketplace (only if current GitHub release is not a prerelease) and upload the built `*.vsix` package as an artifact to the GitHub release page.

Publishing the extension to the VS Code Marketplace requires a Personal Account Token (PAT). The one we are using is currently saved in RSDG's LastPass. It will expire in one year (27th October 2022). Instructions to create a new one are also in the LastPass entry.

### Updating a newly released version

If you make a mistake and want to update your release maintaining the same version number, you can't do it using `vsce` on the command line, you'll have to [log in as `rsd-notifications` and update the release online](https://marketplace.visualstudio.com/manage/publishers/uclresearchsoftwaredevelopmentgroup) (see LastPass for login details).

### Unpublishing the extension

If you want to *completely delete everything about the Nisaba extension from the Marketplace*, including all published versions and usage statistics, you can do so as:

```
vsce unpublish UCLResearchSoftwareDevelopmentGroup.nisaba
```

After that you can publish again as indicated above if you wish.
