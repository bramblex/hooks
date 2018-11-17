import * as React from 'react'

interface IHooksState {
  [nu: number]: any
}

interface IHookEffect {
  [nu: number]: [(() => void) | null, any[] | null]
}

export interface IHooks {
  useState<T>(value: T): [T, (value: T) => void]
  useEffect(effect: () => (() => void) | void, dependencies?: any[]): void
  useContext<T>(): T
}

function isChanged(d1: any[] | null | undefined, d2: any[] | null): boolean {
  if (!d1 || !d2) {
    return true
  }
  for (let i = 0, l = Math.max(d1.length, d2.length); i < l; i++) {
    if (d1[i] !== d2[i]) {
      return true
    }
  }
  return false
}

export function withHooks<Props>(renderWithHooks: (hooks: IHooks) => (props: Props) => React.ReactNode, name?: string): React.FunctionComponent<Props> {

  const componentClass = class extends React.Component<Props, IHooksState> {
    public state: IHooksState = {}
    public effect: IHookEffect = {}
    private waitedEffects: { [nu: number]: () => void } = {}
    private renderFunc: ((props: Props) => React.ReactNode) | null = null

    public render() {
      if (this.renderFunc) {
        return this.renderFunc(this.props)
      } else {
        return this.initRenderFunc(this.props)
      }
    }

    public componentWillUnmount() {
      for (const nu of Object.getOwnPropertyNames(this.waitedEffects)) {
        this.waitedEffects[nu]()
      }

      for (const nu of Object.getOwnPropertyNames(this.effect)) {
        const [cleanup] = this.effect[nu]
        if (typeof cleanup === 'function') {
          cleanup()
        }
      }

      this.state = {}
      this.effect = {}
      this.waitedEffects = {}
      this.renderFunc = null
    }

    private initRenderFunc(props: Props) {
      const that = this

      const hooksNu = {
        effectNu: 0,
        stateNu: 0
      }

      function resetHooksContextNu() {
        hooksNu.stateNu = 0
        hooksNu.effectNu = 0
      }

      const hooks: IHooks = {

        useState<T>(value: T) {
          const nu = hooksNu.stateNu++
          const setState = (v: T) => {
            that.setState({[nu]: v})
          }
          if (that.state.hasOwnProperty(nu)) {
            return [that.state[nu], setState]
          } else {
            that.state[nu] = value
            return [value, setState]
          }
        },

        useEffect(effect, dependencies?) {
          const nu = hooksNu.effectNu++
          if (that.effect.hasOwnProperty(nu)) {
            const [cleanup, lastDependencies] = that.effect[nu]
            that.waitedEffects[nu] = (() => {
              if (isChanged(dependencies, lastDependencies)) {
                if (cleanup) {
                  cleanup()
                }
                that.effect[nu] = [effect() || null, dependencies || null]
              }
            })
          } else {
            that.waitedEffects[nu] = (() => {
              that.effect[nu] = [effect() || null, dependencies || null]
            })
          }

          setTimeout(() => {
            for (const effectNu of Object.getOwnPropertyNames(that.waitedEffects)) {
              that.waitedEffects[effectNu]()
            }
            that.waitedEffects = {}
          })
        },

        useContext<T>() {
          return null as any
        }

      }

      const renderFunc = renderWithHooks(hooks)

      this.renderFunc = (renderProps: Props) => {
        resetHooksContextNu()
        return renderFunc(renderProps)
      }

      return this.renderFunc(props)
    }
  }

  Object.defineProperty(
    componentClass,
    'name',
    {get: () => name || renderWithHooks.name}
  )

  return componentClass as any as React.FunctionComponent<Props>
}
