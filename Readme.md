# Welcome to markdown-docs generator!

## Getting Started

First install the package
```
npm i simple-markdown-docs
```

Then initialize the default documentation structure
```
npx init-docs
```

## Overview

It is very simple to get started. First we need to have a `docs` folder. It will contain all the documentation, by groups.

Each group is represented by a folder. That can contain as many documents as you want. Each group can have a `config.json` file, which can contain some settings for each group. In the `docs` directory you need to have a `config.json` file, which contains the settings for the whole documentation.

An example directory structure maybe.
```
docs
├── group1
│   ├── Doc1.md
│   ├── Doc2.md
│   ├── Doc3.md
│   └── config.json (optional)
├── group2
│   ├── Doc1.md
│   ├── Doc2.md
├── config.json (required)
```

## Global Configuration

Under the `docs` folder there is a `config.json` file, which contains the settings for the documentation. The default configuration is as follows:

```json
{
    "name": "Markdown Docs",
    "version": "1.0.0",
    "description": "Markdown Docs",
    "groupOrder": [
        "Introduction"
    ],
    "outputPath": "./docs/dist/",
    "autoGenerate": true,
    "generateOnRequest": false,
}
```

| Property | Description | type | Required |
| -------- | ----------- | ----------- | ----------- |
| `name` | The title of the documentation. | string | **Yes** |
| `version` | The version of the documentation. | string | No |
| `description` | The description of the documentation. | string | No |
| `groupOrder` | The order of the groups. (names must match directory structure) | array of strings | No |
| `outputPath` | The output path of the documentation. | string | No |
| `autoGenerate` | If `true` the documentation will be generated automatically on server start. | boolean | No |
| `generateOnRequest` | If `true` the documentation will be generated automatically when requested. | boolean | No |

If you specify a `generateOnRequest` property, you will need to add a route to your server. See the [integrating with express](#integrating-with-express) documentation for more information.

If you specify the `groupOrder` property in the `config.json` file, the groups will be rendered in the order specified. Any files that are not in the `groupOrder` array will be rendered at the end of the documentation alphabetically. For example lets say we had the following directory structure:

```
docs
├── A
├── B
├── C
├── config.json (required)
```

and we set our group order to be
```json
{
    "groupOrder": [
        "C"
    ]
}
```

Our output will be ordered as follows:
```
C
A
B
```
---

## Group Configuration
Under any/all of your groups you can specify a `config.json` file, which contains the settings for the group. The default configuration is as follows:

```json
{
    "groupName": "Example Documents",
    "groupDescription": "Example documents for testing",
    "order": [
        "ApiRoute2.md",
        "ApiRoute1.md"
    ],
    "rename": {
        "ApiRoute1.md": "Example #1",
        "ApiRoute2.md": "Example #2"
    }
}
```

| Property | Description | type | Required |
| -------- | ----------- | ----------- | ----------- |
| `groupName` | The name of the group. | string | No |
| `groupDescription` | The description of the group. | string | No |
| `order` | The order of the documents. (names must match file names `.md` optional) | array of strings | No |
| `rename` | A map of old names to new names. | object | No |

If you specify the `order` property in the `config.json` file, the documents will be rendered in the order specified. Any files that are not in the `groupOrder` array will be rendered at the end of the documentation alphabetically. See the notes about the `groupOrder` property for more information and an example.

If you specify the `rename` property in the `config.json` file, the documents will be renamed as specified. For example lets say we had the following directory structure:
```
docs
├── group1
│   ├── Doc1.md
│   ├── Doc2.md
│   ├── Doc3.md
│   └── config.json (optional)
```

and we set our rename property to be
```json
{
    "rename": {
        "Doc1.md": "Example #1",
        "Doc2.md": "Example #2"
    }
}
```
Our documentation structure will be as follows:
```
Example #1
Example #2
Doc3
```
---

## Integrating with Express

```js
const app = require('express');
const route = require('simple-markdown-docs').express.route;
// Docs will be added to your routes by going to `/docs`
app.use(route(
    //Optionally specify the top level configuration
    {
        name: "Markdown Docs",
        version: "1.0.0",
        description: "Markdown Docs",
        groupOrder: [
            "Introduction"
        ],
        outputPath: "./docs/dist/",
        autoGenerate: false,
        generateOnRequest: true
    }
));
```
---
## Customizing the Documentation Template

We use the [handlebars](https://handlebarsjs.com/) templating engine to render the documentation. The default template is located in the `/docs` directory. You can customize the template by replacing the `template.handlebars`.

The following template variables are the default:
- Documentation Name
  - `{{config.name}}`
- Navigation Links HTML
  - `{{{nav}}}`
- Body HTML
  - `{{{content}}}`

The template variables available to you are:

### config
```
{{config}}
```
All the properties from the top-level configuration file.

| Property | Description | type | Required |
| -------- | ----------- | ----------- | ----------- |
| `groupName` | The name of the group. | string | No |
| `groupDescription` | The description of the group. | string | No |
| `order` | The order of the documents. (names must match file names `.md` optional) | array of strings | No |
| `rename` | A map of old names to new names. | object | No |

### content
```
{{{content}}}
```
The body of the documentation, as HTML.


### nav
```
{{nav}}
```
The navigation links for the documentation, formatted as HTML.

```html
<li><a href="#group-Introduction">Introduction</a></li>
<li><a href="#Index" class="sub">Index</a></li>
```

### navLinks
```
{{navLinks}}
```
The navigation links for the documentation, as an object.

```json
[
  {
    "id": "group-Introduction",
    "name": "Introduction",
    "sub": [
      {
        "name": "Index",
        "id": "Index"
      }
    ]
  },
  {
    "id": "group-Example",
    "name": "Example Documents",
    "sub": [
      {
        "name": "Example #2",
        "id": "ApiRoute2"
      },
      {
        "name": "Example #1",
        "id": "ApiRoute1"
      }
    ]
  }
]
```

### structure

```
{{structure}}
```

The structure of the documentation, as an object.

```json
{
  "Example": {
    "_files": [
      "./docs/groups/Example/ApiRoute1.md",
      "./docs/groups/Example/ApiRoute2.md"
    ],
    "_ids": [
      "ApiRoute1",
      "ApiRoute2"
    ],
    "ApiRoute1": "<div class=\"markdown-body\" id=\"ApiRoute1\"><h2 class=\"md-h2\"  id=\"first-example-of-a-markdown-file\">First example of a markdown file</h2></div>",
    "_config": {
      "groupName": "Example Documents",
      "groupDescription": "Example documents for testing",
      "order": [
        "ApiRoute2.md",
        "ApiRoute1.md"
      ],
      "rename": {
        "ApiRoute1": "Example #1",
        "ApiRoute2": "Example #2"
      }
    },
    "ApiRoute2": "<div class=\"markdown-body\" id=\"ApiRoute2\"><h2 class=\"md-h2\"  id=\"second-example\">Second Example</h2></div>"
  },
  "Introduction": {
    "_files": [
      "./docs/groups/Introduction/Index.md"
    ],
    "_ids": [
      "Index"
    ],
    "Index": "<div class=\"markdown-body\" id=\"Index\"><h2 class=\"md-h2\"  id=\"introduction\">Introduction</h2></div>"
  }
}
```



## Plans for the future
- [ ] Add support for custom markdown
- [ ] Add support for auto-generating documentation for express
- [ ] Improve template