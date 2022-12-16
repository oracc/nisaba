# Working with remote files

Visual Studio Code has support for editing remote files, by using the [Remote - SSH](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-ssh) extension, which uses the SSH protocol and is installed automatically when you install Nisaba.
This can be useful for editing files and projects located on the Oracc server.

In order to access the Oracc server you need to [add a new target](https://code.visualstudio.com/docs/remote/ssh#_connect-to-a-remote-host) with hostname `oracc.museum.upenn.edu`, if you do not have it already in your SSH configuration.

Once you have set up the extension, you can log into the Oracc server by selecting the corresponding target in the Remote Explorer, and clicking on the "Connect to Host in New Window" button.
In the new window, you will be able to browse, open, and edit files on the remote server as if they were on your local system.
Make sure to [install the Nisaba extension on the remote server](./installation.md) as well, because in order to run commands on the server it will need to use local tools on the remote machine.
