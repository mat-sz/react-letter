import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Letter } from '../';

const STORAGE_KEY = 'react-letter-html';

const App = () => {
  const [html, setHtml] = React.useState<string>(() => {
     return localStorage.getItem(STORAGE_KEY) || '<p>Your message.</p>';
  });
  React.useEffect(() => {
    localStorage.setItem(STORAGE_KEY, html);
  }, [html]);
  const inputRef = React.useRef<HTMLTextAreaElement>(null);
  return (
    <div>
      <textarea ref={inputRef} rows={12} style={{width:'100%'}} defaultValue={html} />
      <button onClick={() => setHtml(inputRef.current!.value)}>View</button>
      <Letter html={html} />
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
