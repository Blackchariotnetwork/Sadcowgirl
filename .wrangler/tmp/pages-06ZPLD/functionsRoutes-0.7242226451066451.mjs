import { onRequestDelete as __api_comments_js_onRequestDelete } from "C:\\Users\\email\\.lmstudio\\apps\\bionic\\projects\\856087b0-f1a8-44e9-aeb8-55116a6d23de\\workspace\\Sadcowgirl\\functions\\api\\comments.js"
import { onRequestGet as __api_comments_js_onRequestGet } from "C:\\Users\\email\\.lmstudio\\apps\\bionic\\projects\\856087b0-f1a8-44e9-aeb8-55116a6d23de\\workspace\\Sadcowgirl\\functions\\api\\comments.js"
import { onRequestPost as __api_comments_js_onRequestPost } from "C:\\Users\\email\\.lmstudio\\apps\\bionic\\projects\\856087b0-f1a8-44e9-aeb8-55116a6d23de\\workspace\\Sadcowgirl\\functions\\api\\comments.js"
import { onRequestGet as __api_stats_js_onRequestGet } from "C:\\Users\\email\\.lmstudio\\apps\\bionic\\projects\\856087b0-f1a8-44e9-aeb8-55116a6d23de\\workspace\\Sadcowgirl\\functions\\api\\stats.js"
import { onRequestOptions as __api_track_js_onRequestOptions } from "C:\\Users\\email\\.lmstudio\\apps\\bionic\\projects\\856087b0-f1a8-44e9-aeb8-55116a6d23de\\workspace\\Sadcowgirl\\functions\\api\\track.js"
import { onRequestPost as __api_track_js_onRequestPost } from "C:\\Users\\email\\.lmstudio\\apps\\bionic\\projects\\856087b0-f1a8-44e9-aeb8-55116a6d23de\\workspace\\Sadcowgirl\\functions\\api\\track.js"
import { onRequestGet as __media___path___js_onRequestGet } from "C:\\Users\\email\\.lmstudio\\apps\\bionic\\projects\\856087b0-f1a8-44e9-aeb8-55116a6d23de\\workspace\\Sadcowgirl\\functions\\media\\[[path]].js"
import { onRequestGet as ____path___js_onRequestGet } from "C:\\Users\\email\\.lmstudio\\apps\\bionic\\projects\\856087b0-f1a8-44e9-aeb8-55116a6d23de\\workspace\\Sadcowgirl\\functions\\[[path]].js"

export const routes = [
    {
      routePath: "/api/comments",
      mountPath: "/api",
      method: "DELETE",
      middlewares: [],
      modules: [__api_comments_js_onRequestDelete],
    },
  {
      routePath: "/api/comments",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_comments_js_onRequestGet],
    },
  {
      routePath: "/api/comments",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_comments_js_onRequestPost],
    },
  {
      routePath: "/api/stats",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_stats_js_onRequestGet],
    },
  {
      routePath: "/api/track",
      mountPath: "/api",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_track_js_onRequestOptions],
    },
  {
      routePath: "/api/track",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_track_js_onRequestPost],
    },
  {
      routePath: "/media/:path*",
      mountPath: "/media",
      method: "GET",
      middlewares: [],
      modules: [__media___path___js_onRequestGet],
    },
  {
      routePath: "/:path*",
      mountPath: "/",
      method: "GET",
      middlewares: [],
      modules: [____path___js_onRequestGet],
    },
  ]