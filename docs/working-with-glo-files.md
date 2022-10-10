# Working with Glossary files

Nisaba supports glossary files using the [CBD2](https://build-oracc.museum.upenn.edu/doc/help/glossaries/cbd2/index.html) format.
Glossary files can either be located locally on your machine or on the Oracc server.

In order to open a local glossary file, find the "File" option on the menu bar on the top left of the window, then choose "Open File".
This will prompt a new window where you can navigate to an existent Glossary file in your system, then click on "Open".
Alternatively, you can create a new file and save it with an ".glo" extension, e.g. "my_file.glo".

For editing glossaries and projects on the Oracc server, read the page about [working with remote files](remote-files.md).

## Navigating through a glossary file

You can navigate through the letters and the entries of a glossary file with the [Outline view](https://code.visualstudio.com/docs/getstarted/userinterface#_outline-view), which can be accessed in the [Explorer](https://code.visualstudio.com/docs/getstarted/userinterface#_explorer).
To open the explorer you can either click on the first icon in the [Activity Bar](https://code.visualstudio.com/docs/getstarted/userinterface#_basic-layout) on the left-hand side of the window, or from "View" > "Explorer" in the menu bar.

The explorer panel in the sidebar on the left will have an "Outline" section.
You may have to click on the name of the section to expand it, if not expanded already.
The Outline shows the list of letters and entries within a letter as a tree.
Letters are collapsable, so that you can show and hide the entries within them.
Clicking on a letter or an entry moves the cursor of the document to the corresponding line.

Letters and entries are also shown in the [Breadcrumbs](https://code.visualstudio.com/docs/getstarted/userinterface#_breadcrumbs) under the title area, which provide another way to browse through the glossary file.
Breadcrumbs can be activated/deactivated from the menu "View" > "Show Breadcrumbs".

In addition to using the [standard searching functionality](https://code.visualstudio.com/docs/editor/codebasics#_find-and-replace) in Visual Studio Code, you can specifically search for letters and entries in the currently open glossary with the [Go to Symbol feature](https://code.visualstudio.com/docs/editor/editingevolved#_go-to-symbol), which you can activate with <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>O</kbd> (or <kbd>Cmd</kbd>+<kbd>Shift</kbd>+<kbd>O</kbd> on macOS).
You can search anything which appears in the entry definition line, including the guide words within square brackets, if any.
Note, however, that characters with diacritics have to be input as they are, so in order to search for "hurāṣu" you have to type this word exactly as it is.

The screencast below showcases how to browse letters and entries inside a glossary file:

https://user-images.githubusercontent.com/765740/193861177-fd5cc6e7-d779-47b5-b3f6-624ddd17fcc7.mp4
