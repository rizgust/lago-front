import { makeVar } from '@apollo/client'

import { getItemFromLS } from '../cacheUtils'

export const AUTH_TOKEN_LS_KEY = 'authToken'
export const isAuthenticatedVar = makeVar<boolean>(!!getItemFromLS(AUTH_TOKEN_LS_KEY))

export * from './authTokenVar'
export * from './currentUserInfosVar'
export * from './envGlobalVar'
export * from './internationalizationVar'
export * from './locationHistoryVar'
export * from './overwritePlanVar'
export * from './toastVar'
