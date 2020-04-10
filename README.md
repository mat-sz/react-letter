# react-letter

Display e-mail messages in your React projects. The HTML content is automatically sanitized, including all CSS inside. Supported tags should match what's possible with Gmail.

## Installation

**react-letter** is [available on NPM](https://npmjs.org/package/react-letter), and can be installed with either npm or yarn:

```
yarn add react-letter
```

## Usage

[Example](https://github.com/mat-sz/react-letter/tree/master/example)

### With [letterparser](https://github.com/mat-sz/letterparser):

This is currently not recommended since letterparser is not fully functional yet, but is provided for future use:

```ts
import { Letter } from 'react-letter';

// ...
<Letter
  message={`Date: Wed, 01 Apr 2020 00:00:00 -0000
From: A <a@example.com>
To: B <b@example.com>
Subject: Hello world!
Mime-Version: 1.0
Content-Type: text/html; charset=utf-8

Some message.`}
/>;
```

### With any other parser:

```ts
import { RawLetter } from 'react-letter';
import { parse } from 'other-email-parser';

// ...
<RawLetter html={parse(message)} />;
```

## Configuration

Both `Letter` and `RawLetter` support those properties:

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
