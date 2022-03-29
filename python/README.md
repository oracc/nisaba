Generate a virtual environment with, for example,

```bash
$ python -m venv syntax
```

where `syntax` is the name we're giving to the environment.  After creating it,
you can activate this environment with

```bash
$ source syntax/bin/activate
```

Install the dependencies with the command

```
$ pip install -r requirements.txt
```

To regenerate the file syntax files
([`atf.tmLanguage.json`](../syntaxes/atf.tmLanguage.json) and
[`glo.tmLanguage.json`](../syntaxes/glo.tmLanguage.json)), simply run

```
$ python generate_syntax_highlightining.py
```

or

```
$ ./generate_syntax_highlightining.py
```
