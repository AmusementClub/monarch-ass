// Create your own language definition here
// You can safely look at other samples without losing modifications.
// Modifications are not saved on browser refresh/close though -- copy often!
const tokenize = {
  // Set defaultToken to invalid to see what you do not tokenize yet
  //defaultToken: 'invalid',
  brackets: [
    ["{", "}", "delimiter.curly"],
    ["[", "]", "delimiter.square"],
    ["(", ")", "delimiter.parenthesis"],
    ["<", ">", "delimiter.angle"],
  ],

  metaParts: ["Script Info"],

  errParts: ["Aegisub Project Garbage"],

  stylePart: ["V4+ Styles"],

  eventPart: ["Events"],

  metaKey: [
    "Title",
    "ScriptType",
    "WrapStyle",
    "ScaledBorderAndShadow",
    "PlayResX",
    "PlayResY",
    "YCbCr Matrix",
    "PlayDepth",
  ],

  styleKey: ["Format", "Style"],

  effectTag: [
    "i",
    "b",
    "bord",
    "board",
    "fn",
    "fs",
    "fr",
    "frz",
    "fax",
    "fay",
    "fscx",
    "fscy",
    "c",
    "1c",
    "2c",
    "3c",
    "4c",
    "alpha",
    "1a",
    "2a",
    "3a",
    "4a",
    "an",
    "pos",
    "move",
    "org",
    "fad",
    "fade",
    "clip",
  ],

  // The main tokenizer for our languages
  tokenizer: {
    root: [
      //Meta part
      [
        /^\[(.*)\]/,
        {
          cases: {
            "$1@metaParts": "namespace",
            "$1@errParts": { token: "invalid", next: "@garbage" },
            "$1@stylePart": { token: "namespace", next: "@style" },
            "$1@eventPart": { token: "namespace", next: "@events" },
          },
        },
      ],

      //Comment part
      [/;.+/, { token: "comment.block" }],

      [
        /([a-zA-Z|\s]+):/,
        {
          cases: {
            "$1@metaKey": { token: "keyword", next: "@value" },
          },
        },
      ],
    ],

    garbage: [
      [/\[(.*)\]/, { token: "@rematch", next: "@pop" }],
      [/.*/, { token: "invalid" }],
    ],

    value: [
      [/([a-zA-Z|\s]+):/, { token: "@rematch", next: "@pop" }],
      [/\[(.*)\]/, { token: "@rematch", next: "@pop" }],
      [/.*/, { token: "string" }],
    ],

    style: [
      [/\[(.*)\]/, { token: "@rematch", next: "@pop" }],
      [/(Format):.*/, { token: "keyword" }],
      [
        /(Style:\s?)([^,]+)(,)([^,]+)(,)(\d+\.?\d?)(.*)/,
        [
          "keyword",
          "type",
          "string",
          "predefined",
          "string",
          "number.octal",
          "string",
        ],
      ],
    ],

    events: [
      [/^(Format):.*$/, { token: "keyword" }],
      [/^Comment:.*$/, "comment.block"],
      [/^Dialogue:/, { token: "keyword", next: "@dialogue" }],
      [/^.*$/, "invalid"],
    ],

    dialogue: [
      [/\\(N|n|h)/, "constant"],
      [
        /(\d)(,)(\d:\d\d:\d\d\.\d\d)(,)(\d:\d\d:\d\d\.\d\d)(,)([^,]+)(,[^,]?)(,[^,]+)(,[^,]+)(,[^,]+)(,[^,]?)(,)/,
        [
          "number.binary",
          "constant",
          "number.float",
          "constant",
          "number.float",
          "constant",
          "type",
          "tag",
          "tag",
          "tag",
          "tag",
          "tag",
          { token: "tag", next: "@text" },
        ],
      ],
      [/^(\w+):\s/, { token: "@rematch", next: "@pop" }],
    ],

    text: [
      [/^(\w+):\s/, { token: "@rematch", next: "@pop" }],
      [/{/, { token: "@brackets", next: "@effect" }],
      [/\\(N|h)/, "tag"],
      [/\\n/, "invalid"],
      [/./, { token: "string" }],
    ],

    effect: [
      [/}/, { token: "@brackets", next: "@pop" }],
      [
        /\\([1-4]?[A-Za-z]+)/,
        {
          cases: {
            "$1@effectTag": "type",
            "@default": "invalid",
          },
        },
      ],
      [/&[0-9A-H]{3,7}&/, "number"],
      [/[0-9]+([.]{1}[0-9]+){0,1}/, "number"],
      [/@/, "keyword"],
    ],
  },
};

// {
//   "type": "page",
//   "body": {
//     "type": "form",
//     "api": "/api/mock2/form/saveForm",
//     "body": [
//       {
//         "type": "editor",
//         "name": "example",
//         "label": "??????",
//         "language": "myLan",
//         "value": "//????????????IF\n",
//         "editorDidMount": "// editor ??? monaco ?????????monaco ????????????????????????\n//????????????\nmonaco.editor.setTheme('vs-dark');\nconst name = 'myLan'\n// ?????????????????????\nmonaco.languages.register({ id: name })\n//????????????\nconst vLang = {\n  // Set defaultToken to invalid to see what you do not tokenize yet\n  // defaultToken: 'invalid',\n  keywords: ['IF', 'THEN', 'END', 'WHILE', 'DO', 'ELSE'],\n  typeKeywords: [],\n  operators: ['=', '>', '<', '==', '<=', '>=', '!=', '<>', '+', '-', '*', '/'],\n  digits: /\\d+(_+\\d+)*/,\n  octaldigits: /[0-7]+(_+[0-7]+)*/, binarydigits: /[0-1]+(_+[0-1]+)*/,\n  hexdigits: /[[0-9a-fA-F]+(_+[0-9a-fA-F]+)*/,\n  // The main tokenizer for our languages\n  tokenizer: {\n    root: [\n      // identifiers and keywords\n      [/[a-z_$][\\w$]*/, {\n        cases: {\n          '@typeKeywords': 'keyword',\n          '@keywords': 'keyword',\n          '@default': 'identifier'\n        }\n      }],\n      [/[A-Z][\\w\\$]*/, 'type.identifier'],  // to show class names nicely\n      // whitespace\n      { include: '@whitespace' },\n      // delimiters and operators\n      [/[{}()\\[\\]]/, '@brackets'],\n      // @ annotations.\n      // As an example, we emit a debugging log message on these tokens.\n      // Note: message are supressed during the first load -- change some lines to see them.\n      // eslint-disable-next-line no-useless-escape\n      [/@\\s*[a-zA-Z_\\$][\\w\\$]*/, { token: 'annotation', log: 'annotation token: $0' }],\n      // numbers\n      [/\\d*\\.\\d+([eE][\\-+]?\\d+)?/, 'number.float'],\n      [/0[xX][0-9a-fA-F]+/, 'number.hex'],\n      [/\\d+/, 'number'],\n      // delimiter: after number because of .\\d floats\n      [/[;,.]/, 'delimiter'],\n      // strings\n      [/\"([^\"\\\\]|\\\\.)*$/, 'string.invalid'],\n      // non-teminated string\n      [/\"/, { token: 'string.quote', bracket: '@open', next: '@string' }],\n      // characters\n      [/'[^\\\\']'/, 'string'],\n      [/'/, 'string.invalid']],\n    comment: [\n      [/[^\\/*]+/, 'comment'],\n      [/\\/\\*/, 'comment', '@push'],\n      // nested comment\n      ['\\\\*/', 'comment', '@pop'],\n      [/[\\/*]/, 'comment']\n    ],\n    string: [\n      [/[^\\\\\"]+/, 'string'],\n      [/\\\\./, 'string.escape.invalid'],\n      [/\"/, { token: 'string.quote', bracket: '@close', next: '@pop' }]\n    ],\n    whitespace: [\n      [/[ \\t\\r\\n]+/, 'white'],\n      [/\\/\\*/, 'comment', '@comment'],\n      [/\\/\\/.*$/, 'comment'],\n    ],\n  },\n}\n\n//????????????\nconst vCompletion = [\n  /**   * ????????????   */\n  {\n    label: 'getValue',\n    kind: monaco.languages.CompletionItemKind.Function,\n    insertText: 'getValue(${1:pattern})',\n    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,\n    documentation: '??????pattern??????????????????????????????????????????????????????????????????'\n  }, {\n    label: 'getIniString',\n    kind: monaco.languages.CompletionItemKind.Function,\n    insertText: 'getIniString(${1:sec}, ${2: key})',\n    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,\n    documentation: '???ini???????????????????????????section???key?????????key????????????????????????????????????'\n  }, {\n    label: 'getIniInt',\n    kind: monaco.languages.CompletionItemKind.Function,\n    insertText: 'getIniInt(${1:sec}, ${2: key})',\n    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,\n    documentation: '???ini???????????????????????????section???key?????????key????????????,?????????????????????'\n  }, {\n    label: 'getIniDouble',\n    kind: monaco.languages.CompletionItemKind.Function,\n    insertText: 'getIniDouble(${1:sec}, ${2: key})',\n    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,\n    documentation: '???ini???????????????????????????section???key?????????key????????????????????????????????????'\n  }, {\n    label: 'isEmpty',\n    kind: monaco.languages.CompletionItemKind.Function,\n    insertText: 'isEmpty(${1:str})',\n    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,\n    documentation: '??????str????????????'\n  }, {\n    label: 'isEqual',\n    kind: monaco.languages.CompletionItemKind.Function,\n    insertText: 'isEqual(${1:str1}, ${2: str2})',\n    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,\n    documentation: '??????str????????????'\n  }, {\n    label: 'isContain',\n    kind: monaco.languages.CompletionItemKind.Function,\n    insertText: 'isContain(${1:str})',\n    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,\n    documentation: '??????????????????????????????str'\n  }, {\n    label: 'getJsonInt',\n    kind: monaco.languages.CompletionItemKind.Function,\n    insertText: 'getJsonInt(${1:path})',\n    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,\n    documentation: '??????path??????JSON?????????????????????????????????'\n  }, {\n    label: 'getJsonDouble',\n    kind: monaco.languages.CompletionItemKind.Function,\n    insertText: 'getJsonDouble(${1:path})',\n    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,\n    documentation: '??????path??????JSON?????????????????????????????????'\n  }, {\n    label: 'getJsonSize',\n    kind: monaco.languages.CompletionItemKind.Function,\n    insertText: 'getJsonSize(${1:path})',\n    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,\n    documentation: '??????path??????JSON?????????????????????????????????????????????'\n  },\n  /**   * ??????   */\n  {\n    label: 'IF-ELSE',\n    kind: monaco.languages.CompletionItemKind.Snippet,\n    insertText: [\n      'IF ${1:condition} THEN',\n      '\\t$0',\n      'ELSE',\n      '\\t$0',\n      'END'\n    ].join('\\n'),\n    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,\n    documentation: 'If-Else Statement'\n  }, {\n    label: 'WHILE-DO',\n    kind: monaco.languages.CompletionItemKind.Snippet,\n    insertText: [\n      'WHILE ${1:condition} DO',\n      '\\t$0',\n      'END'\n    ].join('\\n'),\n    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,\n    documentation: 'WHILE-DO Statement'\n  }]\n\n// ??????????????????????????????Token\nmonaco.languages.setMonarchTokensProvider(name, vLang)\n// ???????????????????????????????????????--??????\nconst dispose = monaco.languages.registerCompletionItemProvider(name, {\n  provideCompletionItems: () => {\n    return {\n      suggestions: vCompletion\n    }\n  }\n})\n\n// ????????????????????????????????????????????????????????????????????????????????????????????????????????????\nreturn dispose;"
//       },
//       {
//         "type": "editor",
//         "label": "?????????????????????",
//         "name": "editor",
//         "value": "// editor ??? monaco ?????????monaco ????????????????????????\n//????????????\nconst name = 'myLan'\n// ?????????????????????\nmonaco.languages.register({ id: name })\n//????????????\nconst vLang = {\n  // Set defaultToken to invalid to see what you do not tokenize yet\n  // defaultToken: 'invalid',\n  keywords: ['IF', 'THEN', 'END', 'WHILE', 'DO', 'ELSE'],\n  typeKeywords: [],\n  operators: ['=', '>', '<', '==', '<=', '>=', '!=', '<>', '+', '-', '*', '/'],\n  digits: /\\d+(_+\\d+)*/,\n  octaldigits: /[0-7]+(_+[0-7]+)*/, binarydigits: /[0-1]+(_+[0-1]+)*/,\n  hexdigits: /[[0-9a-fA-F]+(_+[0-9a-fA-F]+)*/,\n  // The main tokenizer for our languages\n  tokenizer: {\n    root: [\n      // identifiers and keywords\n      [/[a-z_$][\\w$]*/, {\n        cases: {\n          '@typeKeywords': 'keyword',\n          '@keywords': 'keyword',\n          '@default': 'identifier'\n        }\n      }],\n      [/[A-Z][\\w\\$]*/, 'type.identifier'],  // to show class names nicely\n      // whitespace\n      { include: '@whitespace' },\n      // delimiters and operators\n      [/[{}()\\[\\]]/, '@brackets'],\n      // @ annotations.\n      // As an example, we emit a debugging log message on these tokens.\n      // Note: message are supressed during the first load -- change some lines to see them.\n      // eslint-disable-next-line no-useless-escape\n      [/@\\s*[a-zA-Z_\\$][\\w\\$]*/, { token: 'annotation', log: 'annotation token: $0' }],\n      // numbers\n      [/\\d*\\.\\d+([eE][\\-+]?\\d+)?/, 'number.float'],\n      [/0[xX][0-9a-fA-F]+/, 'number.hex'],\n      [/\\d+/, 'number'],\n      // delimiter: after number because of .\\d floats\n      [/[;,.]/, 'delimiter'],\n      // strings\n      [/\"([^\"\\\\]|\\\\.)*$/, 'string.invalid'],\n      // non-teminated string\n      [/\"/, { token: 'string.quote', bracket: '@open', next: '@string' }],\n      // characters\n      [/'[^\\\\']'/, 'string'],\n      [/'/, 'string.invalid']],\n    comment: [\n      [/[^\\/*]+/, 'comment'],\n      [/\\/\\*/, 'comment', '@push'],\n      // nested comment\n      ['\\\\*/', 'comment', '@pop'],\n      [/[\\/*]/, 'comment']\n    ],\n    string: [\n      [/[^\\\\\"]+/, 'string'],\n      [/\\\\./, 'string.escape.invalid'],\n      [/\"/, { token: 'string.quote', bracket: '@close', next: '@pop' }]\n    ],\n    whitespace: [\n      [/[ \\t\\r\\n]+/, 'white'],\n      [/\\/\\*/, 'comment', '@comment'],\n      [/\\/\\/.*$/, 'comment'],\n    ],\n  },\n}\n\n//????????????\nconst vCompletion = [\n  /**   * ????????????   */\n  {\n    label: 'getValue',\n    kind: monaco.languages.CompletionItemKind.Function,\n    insertText: 'getValue(${1:pattern})',\n    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,\n    documentation: '??????pattern??????????????????????????????????????????????????????????????????'\n  }, {\n    label: 'getIniString',\n    kind: monaco.languages.CompletionItemKind.Function,\n    insertText: 'getIniString(${1:sec}, ${2: key})',\n    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,\n    documentation: '???ini???????????????????????????section???key?????????key????????????????????????????????????'\n  }, {\n    label: 'getIniInt',\n    kind: monaco.languages.CompletionItemKind.Function,\n    insertText: 'getIniInt(${1:sec}, ${2: key})',\n    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,\n    documentation: '???ini???????????????????????????section???key?????????key????????????,?????????????????????'\n  }, {\n    label: 'getIniDouble',\n    kind: monaco.languages.CompletionItemKind.Function,\n    insertText: 'getIniDouble(${1:sec}, ${2: key})',\n    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,\n    documentation: '???ini???????????????????????????section???key?????????key????????????????????????????????????'\n  }, {\n    label: 'isEmpty',\n    kind: monaco.languages.CompletionItemKind.Function,\n    insertText: 'isEmpty(${1:str})',\n    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,\n    documentation: '??????str????????????'\n  }, {\n    label: 'isEqual',\n    kind: monaco.languages.CompletionItemKind.Function,\n    insertText: 'isEqual(${1:str1}, ${2: str2})',\n    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,\n    documentation: '??????str????????????'\n  }, {\n    label: 'isContain',\n    kind: monaco.languages.CompletionItemKind.Function,\n    insertText: 'isContain(${1:str})',\n    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,\n    documentation: '??????????????????????????????str'\n  }, {\n    label: 'getJsonInt',\n    kind: monaco.languages.CompletionItemKind.Function,\n    insertText: 'getJsonInt(${1:path})',\n    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,\n    documentation: '??????path??????JSON?????????????????????????????????'\n  }, {\n    label: 'getJsonDouble',\n    kind: monaco.languages.CompletionItemKind.Function,\n    insertText: 'getJsonDouble(${1:path})',\n    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,\n    documentation: '??????path??????JSON?????????????????????????????????'\n  }, {\n    label: 'getJsonSize',\n    kind: monaco.languages.CompletionItemKind.Function,\n    insertText: 'getJsonSize(${1:path})',\n    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,\n    documentation: '??????path??????JSON?????????????????????????????????????????????'\n  },\n  /**   * ??????   */\n  {\n    label: 'IF-ELSE',\n    kind: monaco.languages.CompletionItemKind.Snippet,\n    insertText: [\n      'IF ${1:condition} THEN',\n      '\\t$0',\n      'ELSE',\n      '\\t$0',\n      'END'\n    ].join('\\n'),\n    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,\n    documentation: 'If-Else Statement'\n  }, {\n    label: 'WHILE-DO',\n    kind: monaco.languages.CompletionItemKind.Snippet,\n    insertText: [\n      'WHILE ${1:condition} DO',\n      '\\t$0',\n      'END'\n    ].join('\\n'),\n    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,\n    documentation: 'WHILE-DO Statement'\n  }]\n\n// ??????????????????????????????Token\nmonaco.languages.setMonarchTokensProvider(name, vLang)\n// ???????????????????????????????????????--??????\nconst dispose = monaco.languages.registerCompletionItemProvider(name, {\n  provideCompletionItems: () => {\n    return {\n      suggestions: vCompletion\n    }\n  }\n})\n\n// ????????????????????????????????????????????????????????????????????????????????????????????????????????????\nreturn dispose;"
//       }
//     ]
//   }
// }
