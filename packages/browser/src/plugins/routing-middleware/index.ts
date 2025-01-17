import * as tsub from '@segment/tsub'
import { Rule } from '@segment/tsub/dist/store'
import { DestinationMiddlewareFunction } from '../middleware'

export type RoutingRule = Rule

export const tsubMiddleware =
  (rules: RoutingRule[]): DestinationMiddlewareFunction =>
  ({ payload, integration, next }): void => {
    const store = new tsub.Store(rules)
    const rulesToApply = store.getRulesByDestinationName(integration)

    rulesToApply.forEach((rule) => {
      const { matchers, transformers } = rule

      for (let i = 0; i < matchers.length; i++) {
        if (tsub.matches(payload.obj, matchers[i])) {
          payload.obj = tsub.transform(payload.obj, transformers[i])

          if (payload.obj === null) {
            return next(null)
          }
        }
      }
    })

    next(payload)
  }
