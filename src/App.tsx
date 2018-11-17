// tslint:disable
import {createContext} from 'react'
import * as React from 'react'
import './App.css'
import {useContext, useEffect, useState, withHooks} from './hooks'

import logo from './logo.svg'

const helloContext = createContext({ message: 'default' })
const testContext = createContext({ test: 'test' })

const Counter2 = withHooks(function CounterC() {
  const [lCount, setLCount] = useState(0)

  useEffect(() => {
    console.log('effect')
    return () => {
      console.log('cleanup')
    }
  }, [lCount])

  const {message}  = useContext(helloContext)
  const {test} = useContext(testContext)

  return (
    <div>
      <h1>{message} | {test}</h1>
      <button onClick={() => setLCount(lCount - 1)}>-</button>
      <input type="number" onChange={(e) => setLCount(e.target && parseInt(e.target.value, 10) || 0)} value={lCount}/>
      <button onClick={() => setLCount(lCount + 1)}>+</button>
    </div>
  )
})

const Counter = withHooks(function CounterC() {
  const [lCount, setLCount] = useState(0)
  const [rCount, setRCount] = useState(0)
  const [isShow, setIsShow] = useState(true)

  const [message, setMessage] = useState('hello')

  return (
    <div>

      <button onClick={() => setLCount(lCount - 1)}>-</button>
      <input type="number" onChange={(e) => setLCount(e.target && parseInt(e.target.value, 10) || 0)} value={lCount}/>
      <button onClick={() => setLCount(lCount + 1)}>+</button>

      <helloContext.Provider value={{message}}>
        <testContext.Provider value={{test: 'fuck'}}>
          <hr onClick={() => setIsShow(!isShow)}/>
          { isShow ? <Counter2/> : null}
          <hr/>
        </testContext.Provider>
      </helloContext.Provider>
      <button onClick={() => setMessage('fuck')}>fuck</button>

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
          <img src={logo} className="App-logo" alt="logo"/>
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <p className="App-intro">
          To get started, edit <code>src/App.tsx</code> and save to reload.
        </p>
        <Counter/>
      </div>
    )
  }
}

export default App
