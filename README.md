<h1 align="center">
  <img src="https://raw.githubusercontent.com/mat-sz/react-letter/master/logo.png" alt="react-letter" width="700">
</h1>

**react-letter** is a React.js component that allows for an easy display of HTML e-mail content with automatic sanitization. Support for features should match what is supported by Gmail.

This includes:

- `<style>` support.
- Automatic removal of relative URLs.
- Support for rewriting the link and resource URLs to increase user's privacy and security.
- Prefixing classes and IDs to prevent clashing with page styles.
- Wrapping contents in an iframe (as an option).
- First-class TypeScript support (the entire library is written in TypeScript), along with [a related RFC 822 parser project](https://github.com/mat-sz/letterparser) also written in TypeScript.

The component itself is parser-agnostic, and can be used with any RFC 822 parser as long as it provides HTML or text output. The sanitization is done on the client-side using DOMParser with some security features targeting older browsers (although there's no guarantee of full functionality under browser versions older than 5 years).

## Installation

**react-letter** is [available on NPM](https://npmjs.com/package/react-letter), and can be installed with either npm or yarn:

```
yarn add react-letter
```

## Usage

[Example](https://github.com/mat-sz/react-letter/tree/master/example)

react-letter can be used with [letterparser](https://github.com/mat-sz/letterparser) (currently in development, but it's the only RFC 822 parser with browser support as far as I know) or any other parser like this:

```ts
import { Letter } from 'react-letter';
import { extract } from 'letter-parser';

const mail = extract(`Date: Wed, 01 Apr 2020 00:00:00 -0000
From: A <a@example.com>
To: B <b@example.com>
Subject: Hello world!
Mime-Version: 1.0
Content-Type: text/html; charset=utf-8

Some message.`);

// No sanitization needs to be performed beforehand,
// react-letter takes care of sanitizing the input.
<Letter html={mail.html} text={mail.text} />;
```

## Configuration

`Letter` supports the following properties:

### useIframe?: boolean;

Should the HTML be wrapped in an iframe. Default: false.

### iframeTitle?: string;

Iframe title, usually set to subject of the message.

### rewriteExternalResources?: (url: string) => string;

The result of this function will be used to rewrite the URLs for url(...) in CSS and src attributes in HTML.

### rewriteExternalLinks?: (url: string) => string;

The result of this function will be used to rewrite the URLs for href attributes in HTML.

### className?: string;

Class name of the wrapper div.
