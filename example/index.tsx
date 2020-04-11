import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Letter } from '../';

const App = () => {
  return (
    <div>
      <Letter html={'<p>Your message.</p>'} />
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
