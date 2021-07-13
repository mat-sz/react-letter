<h1 align="center">
  <img src="https://raw.githubusercontent.com/mat-sz/react-letter/master/logo.png" alt="react-letter" width="700">
</h1>

<p align="center">
<img alt="workflow" src="https://img.shields.io/github/workflow/status/mat-sz/react-letter/Node.js%20CI%20(yarn)">
<a href="https://npmjs.com/package/react-letter">
<img alt="npm" src="https://img.shields.io/npm/v/react-letter">
<img alt="npm" src="https://img.shields.io/npm/dw/react-letter">
<img alt="NPM" src="https://img.shields.io/npm/l/react-letter">
</a>
</p>

**react-letter** is a React.js component that allows for an easy display of HTML e-mail content with automatic sanitization. Support for features should match what is supported by Gmail.

Features:

- `<style>` support.
- Automatic removal of relative URLs.
- Support for rewriting the link and resource URLs to increase user's privacy and security.
- Prefixing classes and IDs to prevent clashing with page styles.
- Wrapping contents in an iframe (as an option).
- First-class TypeScript support (the entire library is written in TypeScript), along with [a related RFC 822 parser project](https://github.com/mat-sz/letterparser) also written in TypeScript.
- Only one dependency ([lettersanitizer](https://github.com/mat-sz/lettersanitizer)).

The component itself is parser-agnostic, and can be used with any RFC 822 parser as long as it provides HTML or text output. The sanitization is done on the client-side using DOMParser with some security features targeting older browsers (although there's no guarantee of full functionality under browser versions older than 5 years).

**Check other TypeScript e-mail projects:**

| Parser                                                 | Inbound SMTP                                   |
| ------------------------------------------------------ | ---------------------------------------------- |
| [letterparser](https://github.com/mat-sz/letterparser) | [microMTA](https://github.com/mat-sz/microMTA) |

## Installation

**react-letter** is [available on NPM](https://npmjs.com/package/react-letter), and can be installed with either npm or yarn:

```
yarn add react-letter
```

**A Vue.js version is also available: [vue-letter](https://github.com/mat-sz/vue-letter).**

## Usage

See: [Example](https://github.com/mat-sz/react-letter/tree/master/example) or play in the [CodeSandbox](https://codesandbox.io/s/react-letter-basic-example-6lu9i).

react-letter can be used with [letterparser](https://github.com/mat-sz/letterparser) (currently in development, but it's the only RFC 822 parser with browser support as far as I know) or any other parser like this:

```ts
import { Letter } from 'react-letter';
import { extract } from 'letterparser';

const { html, text } = extract(`Date: Wed, 01 Apr 2020 00:00:00 -0000
From: A <a@example.com>
To: B <b@example.com>
Subject: Hello world!
Mime-Version: 1.0
Content-Type: text/html; charset=utf-8

Some message.`);

// No sanitization needs to be performed beforehand,
// react-letter takes care of sanitizing the input.
<Letter html={html} text={text} />;
```

## Configuration

`Letter` supports the following properties:

### useIframe?: boolean;

Should the HTML be wrapped in an iframe. Default: `false`.

### iframeTitle?: string;

Iframe title, usually set to subject of the message.

### rewriteExternalResources?: (url: string) => string;

The result of this function will be used to rewrite the URLs for url(...) in CSS and src attributes in HTML.

### rewriteExternalLinks?: (url: string) => string;

The result of this function will be used to rewrite the URLs for href attributes in HTML.

### allowedSchemas?: string[];

List of allowed URL schemas. Default: `['http', 'https', 'mailto']`.

### preserveCssPriority?: boolean;

Preserves CSS priority (!important), default: `true`.

### className?: string;

Class name of the wrapper div.
