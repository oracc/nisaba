Generate a virtual environment with, for example,

```
$ mkvirtualenv syntax
```

where `syntax` is the name we're giving to the environment.  After creating it,
you can activate this environment with

```
$ workon syntax
```

Install the dependencies with the command

```
$ pip install -r requirements.txt
```

To regenerate the file [`atf.tmLanguage.json`](../syntaxes/atf.tmLanguage.json),
simply run

```
$ python generate_syntax_highlightining.py
```

or

```
$ ./generate_syntax_highlightining.py
```
