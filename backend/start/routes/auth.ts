import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
import { loginThrottle } from '#start/limiter'

const AuthController = () => import('#controllers/auth/auth_controller')

router
  .group(() => {
    router.post('login', [AuthController, 'login']).use(loginThrottle)
    router.post('refresh', [AuthController, 'refresh'])
    router.post('logout', [AuthController, 'logout']).use(middleware.auth())
    router.get('me', [AuthController, 'me']).use(middleware.auth())
  })
  .prefix('/api/v1/auth')
