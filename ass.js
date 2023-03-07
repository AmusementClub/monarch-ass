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
//         "label": "示例",
//         "language": "myLan",
//         "value": "//试试输入IF\n",
//         "editorDidMount": "// editor 是 monaco 实例，monaco 是全局的名称空间\n//语言名称\nmonaco.editor.setTheme('vs-dark');\nconst name = 'myLan'\n// 注册自定义语言\nmonaco.languages.register({ id: name })\n//语言配置\nconst vLang = {\n  // Set defaultToken to invalid to see what you do not tokenize yet\n  // defaultToken: 'invalid',\n  keywords: ['IF', 'THEN', 'END', 'WHILE', 'DO', 'ELSE'],\n  typeKeywords: [],\n  operators: ['=', '>', '<', '==', '<=', '>=', '!=', '<>', '+', '-', '*', '/'],\n  digits: /\\d+(_+\\d+)*/,\n  octaldigits: /[0-7]+(_+[0-7]+)*/, binarydigits: /[0-1]+(_+[0-1]+)*/,\n  hexdigits: /[[0-9a-fA-F]+(_+[0-9a-fA-F]+)*/,\n  // The main tokenizer for our languages\n  tokenizer: {\n    root: [\n      // identifiers and keywords\n      [/[a-z_$][\\w$]*/, {\n        cases: {\n          '@typeKeywords': 'keyword',\n          '@keywords': 'keyword',\n          '@default': 'identifier'\n        }\n      }],\n      [/[A-Z][\\w\\$]*/, 'type.identifier'],  // to show class names nicely\n      // whitespace\n      { include: '@whitespace' },\n      // delimiters and operators\n      [/[{}()\\[\\]]/, '@brackets'],\n      // @ annotations.\n      // As an example, we emit a debugging log message on these tokens.\n      // Note: message are supressed during the first load -- change some lines to see them.\n      // eslint-disable-next-line no-useless-escape\n      [/@\\s*[a-zA-Z_\\$][\\w\\$]*/, { token: 'annotation', log: 'annotation token: $0' }],\n      // numbers\n      [/\\d*\\.\\d+([eE][\\-+]?\\d+)?/, 'number.float'],\n      [/0[xX][0-9a-fA-F]+/, 'number.hex'],\n      [/\\d+/, 'number'],\n      // delimiter: after number because of .\\d floats\n      [/[;,.]/, 'delimiter'],\n      // strings\n      [/\"([^\"\\\\]|\\\\.)*$/, 'string.invalid'],\n      // non-teminated string\n      [/\"/, { token: 'string.quote', bracket: '@open', next: '@string' }],\n      // characters\n      [/'[^\\\\']'/, 'string'],\n      [/'/, 'string.invalid']],\n    comment: [\n      [/[^\\/*]+/, 'comment'],\n      [/\\/\\*/, 'comment', '@push'],\n      // nested comment\n      ['\\\\*/', 'comment', '@pop'],\n      [/[\\/*]/, 'comment']\n    ],\n    string: [\n      [/[^\\\\\"]+/, 'string'],\n      [/\\\\./, 'string.escape.invalid'],\n      [/\"/, { token: 'string.quote', bracket: '@close', next: '@pop' }]\n    ],\n    whitespace: [\n      [/[ \\t\\r\\n]+/, 'white'],\n      [/\\/\\*/, 'comment', '@comment'],\n      [/\\/\\/.*$/, 'comment'],\n    ],\n  },\n}\n\n//联想配置\nconst vCompletion = [\n  /**   * 内置函数   */\n  {\n    label: 'getValue',\n    kind: monaco.languages.CompletionItemKind.Function,\n    insertText: 'getValue(${1:pattern})',\n    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,\n    documentation: '根据pattern描述的正则表达式，从数据项中获取匹配的字符串'\n  }, {\n    label: 'getIniString',\n    kind: monaco.languages.CompletionItemKind.Function,\n    insertText: 'getIniString(${1:sec}, ${2: key})',\n    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,\n    documentation: '从ini类型的数据中，根据section和key，获取key对应的值，作为字符串返回'\n  }, {\n    label: 'getIniInt',\n    kind: monaco.languages.CompletionItemKind.Function,\n    insertText: 'getIniInt(${1:sec}, ${2: key})',\n    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,\n    documentation: '从ini类型的数据中，根据section和key，获取key对应的值,，作为整数返回'\n  }, {\n    label: 'getIniDouble',\n    kind: monaco.languages.CompletionItemKind.Function,\n    insertText: 'getIniDouble(${1:sec}, ${2: key})',\n    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,\n    documentation: '从ini类型的数据中，根据section和key，获取key对应的值，作为浮点数返回'\n  }, {\n    label: 'isEmpty',\n    kind: monaco.languages.CompletionItemKind.Function,\n    insertText: 'isEmpty(${1:str})',\n    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,\n    documentation: '判断str是否为空'\n  }, {\n    label: 'isEqual',\n    kind: monaco.languages.CompletionItemKind.Function,\n    insertText: 'isEqual(${1:str1}, ${2: str2})',\n    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,\n    documentation: '判断str是否为空'\n  }, {\n    label: 'isContain',\n    kind: monaco.languages.CompletionItemKind.Function,\n    insertText: 'isContain(${1:str})',\n    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,\n    documentation: '判断数据项中是否包含str'\n  }, {\n    label: 'getJsonInt',\n    kind: monaco.languages.CompletionItemKind.Function,\n    insertText: 'getJsonInt(${1:path})',\n    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,\n    documentation: '根据path获取JSON数据中作为整数返回的值'\n  }, {\n    label: 'getJsonDouble',\n    kind: monaco.languages.CompletionItemKind.Function,\n    insertText: 'getJsonDouble(${1:path})',\n    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,\n    documentation: '根据path获取JSON数据中作为整数返回的值'\n  }, {\n    label: 'getJsonSize',\n    kind: monaco.languages.CompletionItemKind.Function,\n    insertText: 'getJsonSize(${1:path})',\n    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,\n    documentation: '根据path获取JSON数据中作为数组类型的数据的长度'\n  },\n  /**   * 语句   */\n  {\n    label: 'IF-ELSE',\n    kind: monaco.languages.CompletionItemKind.Snippet,\n    insertText: [\n      'IF ${1:condition} THEN',\n      '\\t$0',\n      'ELSE',\n      '\\t$0',\n      'END'\n    ].join('\\n'),\n    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,\n    documentation: 'If-Else Statement'\n  }, {\n    label: 'WHILE-DO',\n    kind: monaco.languages.CompletionItemKind.Snippet,\n    insertText: [\n      'WHILE ${1:condition} DO',\n      '\\t$0',\n      'END'\n    ].join('\\n'),\n    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,\n    documentation: 'WHILE-DO Statement'\n  }]\n\n// 为该自定义语言基本的Token\nmonaco.languages.setMonarchTokensProvider(name, vLang)\n// 为该语言注册一个语言提示器--联想\nconst dispose = monaco.languages.registerCompletionItemProvider(name, {\n  provideCompletionItems: () => {\n    return {\n      suggestions: vCompletion\n    }\n  }\n})\n\n// 如果返回一个函数，这个函数会在编辑器组件卸载的时候调用，主要用于清理资源\nreturn dispose;"
//       },
//       {
//         "type": "editor",
//         "label": "这是上面的配置",
//         "name": "editor",
//         "value": "// editor 是 monaco 实例，monaco 是全局的名称空间\n//语言名称\nconst name = 'myLan'\n// 注册自定义语言\nmonaco.languages.register({ id: name })\n//语言配置\nconst vLang = {\n  // Set defaultToken to invalid to see what you do not tokenize yet\n  // defaultToken: 'invalid',\n  keywords: ['IF', 'THEN', 'END', 'WHILE', 'DO', 'ELSE'],\n  typeKeywords: [],\n  operators: ['=', '>', '<', '==', '<=', '>=', '!=', '<>', '+', '-', '*', '/'],\n  digits: /\\d+(_+\\d+)*/,\n  octaldigits: /[0-7]+(_+[0-7]+)*/, binarydigits: /[0-1]+(_+[0-1]+)*/,\n  hexdigits: /[[0-9a-fA-F]+(_+[0-9a-fA-F]+)*/,\n  // The main tokenizer for our languages\n  tokenizer: {\n    root: [\n      // identifiers and keywords\n      [/[a-z_$][\\w$]*/, {\n        cases: {\n          '@typeKeywords': 'keyword',\n          '@keywords': 'keyword',\n          '@default': 'identifier'\n        }\n      }],\n      [/[A-Z][\\w\\$]*/, 'type.identifier'],  // to show class names nicely\n      // whitespace\n      { include: '@whitespace' },\n      // delimiters and operators\n      [/[{}()\\[\\]]/, '@brackets'],\n      // @ annotations.\n      // As an example, we emit a debugging log message on these tokens.\n      // Note: message are supressed during the first load -- change some lines to see them.\n      // eslint-disable-next-line no-useless-escape\n      [/@\\s*[a-zA-Z_\\$][\\w\\$]*/, { token: 'annotation', log: 'annotation token: $0' }],\n      // numbers\n      [/\\d*\\.\\d+([eE][\\-+]?\\d+)?/, 'number.float'],\n      [/0[xX][0-9a-fA-F]+/, 'number.hex'],\n      [/\\d+/, 'number'],\n      // delimiter: after number because of .\\d floats\n      [/[;,.]/, 'delimiter'],\n      // strings\n      [/\"([^\"\\\\]|\\\\.)*$/, 'string.invalid'],\n      // non-teminated string\n      [/\"/, { token: 'string.quote', bracket: '@open', next: '@string' }],\n      // characters\n      [/'[^\\\\']'/, 'string'],\n      [/'/, 'string.invalid']],\n    comment: [\n      [/[^\\/*]+/, 'comment'],\n      [/\\/\\*/, 'comment', '@push'],\n      // nested comment\n      ['\\\\*/', 'comment', '@pop'],\n      [/[\\/*]/, 'comment']\n    ],\n    string: [\n      [/[^\\\\\"]+/, 'string'],\n      [/\\\\./, 'string.escape.invalid'],\n      [/\"/, { token: 'string.quote', bracket: '@close', next: '@pop' }]\n    ],\n    whitespace: [\n      [/[ \\t\\r\\n]+/, 'white'],\n      [/\\/\\*/, 'comment', '@comment'],\n      [/\\/\\/.*$/, 'comment'],\n    ],\n  },\n}\n\n//联想配置\nconst vCompletion = [\n  /**   * 内置函数   */\n  {\n    label: 'getValue',\n    kind: monaco.languages.CompletionItemKind.Function,\n    insertText: 'getValue(${1:pattern})',\n    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,\n    documentation: '根据pattern描述的正则表达式，从数据项中获取匹配的字符串'\n  }, {\n    label: 'getIniString',\n    kind: monaco.languages.CompletionItemKind.Function,\n    insertText: 'getIniString(${1:sec}, ${2: key})',\n    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,\n    documentation: '从ini类型的数据中，根据section和key，获取key对应的值，作为字符串返回'\n  }, {\n    label: 'getIniInt',\n    kind: monaco.languages.CompletionItemKind.Function,\n    insertText: 'getIniInt(${1:sec}, ${2: key})',\n    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,\n    documentation: '从ini类型的数据中，根据section和key，获取key对应的值,，作为整数返回'\n  }, {\n    label: 'getIniDouble',\n    kind: monaco.languages.CompletionItemKind.Function,\n    insertText: 'getIniDouble(${1:sec}, ${2: key})',\n    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,\n    documentation: '从ini类型的数据中，根据section和key，获取key对应的值，作为浮点数返回'\n  }, {\n    label: 'isEmpty',\n    kind: monaco.languages.CompletionItemKind.Function,\n    insertText: 'isEmpty(${1:str})',\n    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,\n    documentation: '判断str是否为空'\n  }, {\n    label: 'isEqual',\n    kind: monaco.languages.CompletionItemKind.Function,\n    insertText: 'isEqual(${1:str1}, ${2: str2})',\n    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,\n    documentation: '判断str是否为空'\n  }, {\n    label: 'isContain',\n    kind: monaco.languages.CompletionItemKind.Function,\n    insertText: 'isContain(${1:str})',\n    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,\n    documentation: '判断数据项中是否包含str'\n  }, {\n    label: 'getJsonInt',\n    kind: monaco.languages.CompletionItemKind.Function,\n    insertText: 'getJsonInt(${1:path})',\n    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,\n    documentation: '根据path获取JSON数据中作为整数返回的值'\n  }, {\n    label: 'getJsonDouble',\n    kind: monaco.languages.CompletionItemKind.Function,\n    insertText: 'getJsonDouble(${1:path})',\n    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,\n    documentation: '根据path获取JSON数据中作为整数返回的值'\n  }, {\n    label: 'getJsonSize',\n    kind: monaco.languages.CompletionItemKind.Function,\n    insertText: 'getJsonSize(${1:path})',\n    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,\n    documentation: '根据path获取JSON数据中作为数组类型的数据的长度'\n  },\n  /**   * 语句   */\n  {\n    label: 'IF-ELSE',\n    kind: monaco.languages.CompletionItemKind.Snippet,\n    insertText: [\n      'IF ${1:condition} THEN',\n      '\\t$0',\n      'ELSE',\n      '\\t$0',\n      'END'\n    ].join('\\n'),\n    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,\n    documentation: 'If-Else Statement'\n  }, {\n    label: 'WHILE-DO',\n    kind: monaco.languages.CompletionItemKind.Snippet,\n    insertText: [\n      'WHILE ${1:condition} DO',\n      '\\t$0',\n      'END'\n    ].join('\\n'),\n    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,\n    documentation: 'WHILE-DO Statement'\n  }]\n\n// 为该自定义语言基本的Token\nmonaco.languages.setMonarchTokensProvider(name, vLang)\n// 为该语言注册一个语言提示器--联想\nconst dispose = monaco.languages.registerCompletionItemProvider(name, {\n  provideCompletionItems: () => {\n    return {\n      suggestions: vCompletion\n    }\n  }\n})\n\n// 如果返回一个函数，这个函数会在编辑器组件卸载的时候调用，主要用于清理资源\nreturn dispose;"
//       }
//     ]
//   }
// }
