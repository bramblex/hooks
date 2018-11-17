import * as React from 'react';
import './App.css';
import {withHooks} from './hooks'

import logo from './logo.svg';

const Counter = withHooks(({useState}) => () => {
  const [lCount, setLCount] = useState(0)
  const [rCount, setRCount] = useState(0)
  return (
    <div>

      <button onClick={() => setLCount(lCount - 1)}>-</button>
      <input type="number" onChange={(e) => setLCount(e.target && parseInt(e.target.value, 10) || 0)} value={lCount}/>
      <button onClick={() => setLCount(lCount + 1)}>+</button>

      <span>+</span>

      <button onClick={() => setRCount(rCount - 1)}>-</button>
      <input type="number" onChange={(e) => setRCount(e.target && parseInt(e.target.value, 10) || 0)} value={rCount}/>
      <button onClick={() => setRCount(rCount + 1)}>+</button>

      <span>=</span>

      {lCount + rCount}
    </div>
  )
})

class App extends React.Component {
  public render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <p className="App-intro">
          To get started, edit <code>src/App.tsx</code> and save to reload.
        </p>
        <Counter/>
      </div>
    );
  }
}

export default App;
