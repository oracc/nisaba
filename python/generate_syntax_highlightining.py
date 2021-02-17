#!/usr/bin/env python

import json
import os

from pyoracc.atf.common.atflex import AtfLexer

# In many cases we want to match both the lower-case "token" and the title-case
# "Token".  This helper function creates a match for both options.
def match_all_variants(token_names):
    return "|".join(
        [token.lower() for token in token_names]
        + [token.title() for token in token_names]
    )

# Initialise the dictionary
data = {}

data["$schema"] = "https://raw.githubusercontent.com/martinring/tmlanguage/master/tmlanguage.json"
data["name"] = "ATF"
data["patterns"] = [
    {"include": "#keywords"},
    {"include": "#support"},
    {"include": "#strings"},
    {"include": "#comment"},
    {"include": "#variable"},
]

keywords = {}
structures = match_all_variants(AtfLexer.structures)
keywords["patterns"] = [
    {"name": "keyword.control.at.atf",
     "match": f"^@({structures})\\b"},
    {"name": "keyword.other.ampersand.atf",
     # For the sake of simplicity (and consistency with
     # Nammu), highlight the entire &-line, whatever it is
     # in there.
     "match": "^&.*$"},
]

support = {}
protocols = match_all_variants(AtfLexer.protocols)
protocol_keywords = match_all_variants(AtfLexer.protocol_keywords)
dollar_keywords = match_all_variants(AtfLexer.dollar_keywords)
support["patterns"] = [
    {"name": "support.class.hash.atf",
     # Interlinear translations (`tr`) need to be treaded
     # specially, because they're the only protocol allowed
     # to be followed by something else (the specification
     # of the language `.<LANG>`) before the colon.
     "match": f"^#([Tt]r\\.[[:alpha:]]+|{protocols})\\b:[ \t]*({protocol_keywords})?"},
    {"name": "support.variable.dollar.atf",
     # We highlight the entire line starting with `$`, but we capture the known
     # keywords.
     "begin": "^\\$",
     "end": "\\n",
     "patterns": [
         {
             # At the moment we don't do anything special about these keywords,
             # they're highlighted like the rest of the line, but we can
             # capture them and give them a different name.
             "name": "support.variable.dollar-keyword.atf",
             "match": f"\\b({dollar_keywords})\\b",
         }
     ],
     },
    # Linkage lines.
    # TODO: use a different colour for this class of lines.
    {"name": "support.class.linkage.atf",
     "match": "^(>>|<<|\\|\\|).*"},
]

strings = {}
strings["name"] = "string.quoted.double.atf"
strings["begin"] = "\""
strings["end"] = "\""
strings["patterns"] = [
    {"name": "constant.character.escape.atf", "match": "\\\\."},
]

comment = {}
comment["patterns"] = [
    {"name": "comment.line.number-sign.atf",
     # TODO: make sure comments have lower precedence than
     # the #-lines
     "match": "^#.*$"},
]

variable = {}
variable["patterns"] = [
    {"name": "variable.language.text.atf",
     "match": "^\\S+\\."},
]

repository = {}
repository["keywords"] = keywords
repository["support"] = support
repository["strings"] = strings
repository["comment"] = comment
repository["variable"] = variable

data["repository"] = repository
data["scopeName"] = "source.atf"

filename = os.path.join(os.path.dirname(__file__), "..", "syntaxes", "atf.tmLanguage.json")

with open(filename, "w") as outfile:
    json.dump(data, outfile, indent=4)
