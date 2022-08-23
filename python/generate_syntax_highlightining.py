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

def write_language_json(name, scope_name, filename,
                        keywords=None, support=None, strings=None,
                        comment=None, variable=None):
    # Initialise the dictionaries
    data = {}
    repository = {}

    data["$schema"] = "https://raw.githubusercontent.com/martinring/tmlanguage/master/tmlanguage.json"
    data["name"] = name
    data["patterns"] = []
    data["repository"] = repository
    data["scopeName"] = scope_name

    if keywords:
        data["patterns"].append({"include": "#keywords"})
        repository["keywords"] = keywords
    if support:
        data["patterns"].append({"include": "#support"})
        repository["support"] = support
    if strings:
        data["patterns"].append({"include": "#strings"})
        repository["strings"] = strings
    if comment:
        data["patterns"].append({"include": "#comment"})
        repository["comment"] = comment
    if variable:
        data["patterns"].append({"include": "#variable"})
        repository["variable"] = variable

    with open(filename, "w") as outfile:
        json.dump(data, outfile, indent=4)


## ATF files
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

filename = os.path.join(os.path.dirname(__file__), "..", "syntaxes", "atf.tmLanguage.json")

write_language_json(name="ATF", scope_name="source.atf",
                    filename=filename, keywords=keywords,
                    support=support, strings=strings,
                    comment=comment, variable=variable)

## Glossary files.  References:
## http://oracc.museum.upenn.edu/doc/help/glossaries/index.html
## https://build-oracc.museum.upenn.edu/doc/help/glossaries/cbd2/index.html
keywords = {}
entry_keywords = "alias|parts|bff" # NOTE: bff not documented
more_keywords = "gwl|sensel|discl|notel"
language_keywords = "bases|form|allow|phon|root|stems"
senses_keywords = "sense|(end |)senses"
meta_keywords = ("bib|collo|equiv|inote|isslp|note|oid|pleiades|" +
                 "pl_coord|pl_id|pl_alias|prop|rel")
all_keywords = "|".join([entry_keywords, language_keywords,
                         senses_keywords, meta_keywords])
keywords["patterns"] = [
    {
        "name": "keyword.other.entry.glo",
        "match": "^@(end |)entry\\b",
    },
    {
        "name": "keyword.control.at.glo",
        "match": f"^@({all_keywords})\\b",
    },
]

support = {}
header_keywords = ("project|lang|name|translang|cbd|props|reldel|i18n|" +
                   "proplist|letter|include") # Note: letter not documented
support["patterns"] = [
    {
        "name": "support.class.at.glo",
        "match": f"^@({header_keywords})\\b",
    },
]

comment = {}
comment["patterns"] = [
    {"name": "comment.line.number-sign.glo",
     "match": "^#.*$"},
]

filename = os.path.join(os.path.dirname(__file__), "..", "syntaxes", "glo.tmLanguage.json")

write_language_json(name="Oracc Glossary", scope_name="source.glo",
                    filename=filename, keywords=keywords, support=support, comment=comment)
