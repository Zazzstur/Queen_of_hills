import { onRequest as __api_status_js_onRequest } from "C:\\Users\\MSI\\Desktop\\website darjeeling\\functions\\api\\status.js"
import { onRequest as ___middleware_js_onRequest } from "C:\\Users\\MSI\\Desktop\\website darjeeling\\functions\\_middleware.js"

export const routes = [
    {
      routePath: "/api/status",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_status_js_onRequest],
    },
  {
      routePath: "/",
      mountPath: "/",
      method: "",
      middlewares: [___middleware_js_onRequest],
      modules: [],
    },
  ]