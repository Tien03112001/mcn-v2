/*
|--------------------------------------------------------------------------
| Define HTTP limiters
|--------------------------------------------------------------------------
|
| The "limiter.define" method creates an HTTP middleware to apply rate
| limits on a route or a group of routes.
|
*/

import limiter from '@adonisjs/limiter/services/main'

/**
 * Login: 5 attempts/minute per (IP + email) to slow down brute-force
 * credential guessing without punishing unrelated users on the same IP.
 */
export const loginThrottle = limiter.define('login', (ctx) => {
  const email = String(ctx.request.input('email', 'unknown')).toLowerCase()
  return limiter
    .allowRequests(5)
    .every('1 minute')
    .usingKey(`login_${ctx.request.ip()}_${email}`)
})

/**
 * Exam submit: 3 attempts/minute per (student, attempt) to absorb
 * double-click/race conditions without blocking legitimate retries
 * after a transient network error.
 */
export const submitThrottle = limiter.define('submit', (ctx) => {
  const attemptId = ctx.params.attemptId ?? ctx.params.id ?? 'unknown'
  return limiter
    .allowRequests(3)
    .every('1 minute')
    .usingKey(`submit_${ctx.authUser?.id}_${attemptId}`)
})
