import * as React from 'react'

interface IHooksComponentState {
  [nu: number]: any
}

interface IHooksComponentEffect {
  [nu: number]: [(() => void) | null, any[] | null]
}

interface IHooksComponentExtension {
  state: IHooksComponentState
  effect: IHooksComponentEffect
  effectDelayed: Array<() => void>
}

type IHooksComponent = React.Component<any, IHooksComponentState> & IHooksComponentExtension

interface IHooksContext {
  component: IHooksComponent
  useStateNu: number

  useEffectNu: number
}

const hooksContextStack: IHooksContext[] = []

function hooksContextNew(component: IHooksComponent): IHooksContext {
  return {component, useEffectNu: 0, useStateNu: 0}
}

function hooksContextPush(component: IHooksComponent): void {
  hooksContextStack.push(hooksContextNew(component))
}

function hooksContextPop(): void {
  hooksContextStack.pop()
}

function hooksContextTop(): IHooksContext {
  return hooksContextStack[hooksContextStack.length - 1]
}

export function useState<T>(defaultValue: T): [T, (value: T, callback?: () => void) => void] {
  const context = hooksContextTop()
  const component = context.component
  const useStateNu = context.useStateNu++
  const setState = (value: T, callback?: () => void) => component.setState({[useStateNu]: value}, callback)

  const state = component.state
  if (state.hasOwnProperty(useStateNu)) {
    return [state[useStateNu], setState]
  } else {
    state[useStateNu] = defaultValue
    return [defaultValue, setState]
  }
}

function isDependenciesChange(dependencies: any[] | null | undefined, lastDependencies: any[] | null | undefined) {
  if (!dependencies || !lastDependencies) {
    return true
  }
  for (let i = 0, l = Math.max(dependencies.length, lastDependencies.length); i < l; i++) {
    if (dependencies[i] !== lastDependencies[i]) {
      return true
    }
  }
  return false
}

export function useEffect(effectFunc: () => ((() => void) | void), dependencies?: any[]): void {
  const context = hooksContextTop()
  const useEffectNu = context.useEffectNu++

  const {effect, effectDelayed} = context.component

  function runEffect() {
    const cleanup = effectFunc()
    effect[useEffectNu] = [cleanup || null, dependencies || null]
  }

  if (effect.hasOwnProperty(useEffectNu)) {
    const [cleanup, lastDependencies] = effect[useEffectNu]
    if (isDependenciesChange(dependencies, lastDependencies)) {
      effectDelayed.push(() => {
        if (cleanup) {
          cleanup()
        }
        runEffect()
      })
    }
  } else {
    effectDelayed.push(runEffect)
  }
}


export function withHooks<Props>(renderFunc: (props: Props) => React.ReactNode): React.FunctionComponent<Props> {

  const componentClass = class extends React.Component<Props, IHooksComponentState> implements IHooksComponentExtension {
    public state: IHooksComponentState = {}
    public effect: IHooksComponentEffect = {}
    public effectDelayed: Array<() => void> = []

    public runEffect() {
      for (const effectFunc of this.effectDelayed) {
        effectFunc()
      }
      this.effectDelayed = []
    }

    public cleanupEffect() {
      for (const useEffectNu of Object.getOwnPropertyNames(this.effect)) {
        const [cleanup] = this.effect[useEffectNu]
        if (cleanup) {
          cleanup()
        }
      }
      this.effect = {}
    }

    public componentDidUpdate() {
      this.runEffect()
    }

    public componentDidMount() {
      this.runEffect()
    }

    public componentWillUnmount() {
      this.cleanupEffect()
    }

    public render() {
      hooksContextPush(this)
      const renderResult = renderFunc(this.props)
      hooksContextPop()
      return renderResult
    }

  }

  Object.defineProperty(componentClass, 'name', {get: () => renderFunc.name})
  return componentClass as any
}
