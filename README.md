# react-letter

Display e-mail messages in your React projects.

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
