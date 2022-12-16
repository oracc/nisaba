# Installation for developers

## Development workflow

In a terminal, clone the repository and enter the newly created directory:

```
git clone https://github.com/oracc/nisaba
cd nisaba
```

Install the dependencies with the command

```
npm install
```

Then you can compile, package, and install the extension with

```
npm run compile
npm run package
code --install-extension nisaba-<VERSION>.vsix
```

Replace `<VERSION>` with the version of Nisaba you are compiling (e.g., `1.2.0`).

If you open the top-level directory in Visual Studio Code, you should be able to run the compile and package commands from the list of "npm scripts" in the sidebar on the left.
(Re)start Visual Studio Code to make the changes take effect:

```
code .
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

[Publishing the extension](https://code.visualstudio.com/api/working-with-extensions/publishing-extension) to the VS Code Marketplace requires a [Personal Access Token](https://code.visualstudio.com/api/working-with-extensions/publishing-extension#get-a-personal-access-token) (PAT).
The one we are using is currently saved in RSDG's LastPass, in the Oracc folder.
It will expire in one year (14th December 2023).
Instructions to create a new one are also in the RSDG's LastPass entry.
This PAT is also stored, encrypted, in the Nisaba repository as a [GitHub Actions secret](https://github.com/oracc/nisaba/settings/secrets/actions) called `VSCE_PAT`, to be used in the workflow described above.
When you recreate a new PAT you will also have to update the secret in the repository settings.

In case you want to manually publish the extension, the command to run is `npm run publish`.
You will be prompted for the PAT.
You may want to run `npm audit` before publishing a new release, to make sure there are no known security vulnerabilities in the code you are going to release, this is done automatically by the GitHub Actions workflow.

After submitting it to the VS Code Marketplace to be published, the package will undergo an automated verification process which can take a few minutes.
You can follow the status of the review in the [Visual Studio Marketplace publisher management page](https://marketplace.visualstudio.com/manage/publishers/) after you log in with the shared developer account.
Make sure the submitted version is actually accepted, as it may be rejected if some of the requirements are not met.

### Updating a newly released version

If you make a mistake and want to update your release maintaining the same version number, you can't do it using `vsce` on the command line, you'll have to [log in as `rsd-notifications` and update the release online](https://marketplace.visualstudio.com/manage/publishers/uclresearchsoftwaredevelopmentgroup) (see LastPass for login details).

### Unpublishing the extension

If you want to *completely delete everything about the Nisaba extension from the Marketplace*, including all published versions and usage statistics, you can do so as:

```
vsce unpublish UCLResearchSoftwareDevelopmentGroup.nisaba
```

After that you can publish again as indicated above if you wish.
