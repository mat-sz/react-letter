import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Letter } from '../.';

const App = () => {
  return (
    <div>
      <Letter
        message={`Date: Wed, 01 Apr 2020 00:00:00 -0000
From: A <a@example.com>
To: B <b@example.com>
Subject: Hello world!
Mime-Version: 1.0
Content-Type: text/html; charset=utf-8

Some message.`}
      />
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
