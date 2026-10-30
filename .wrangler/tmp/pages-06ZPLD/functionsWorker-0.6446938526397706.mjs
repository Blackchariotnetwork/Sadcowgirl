var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// ../node_modules/unenv/dist/runtime/_internal/utils.mjs
// @__NO_SIDE_EFFECTS__
function createNotImplementedError(name) {
  return new Error(`[unenv] ${name} is not implemented yet!`);
}
__name(createNotImplementedError, "createNotImplementedError");
// @__NO_SIDE_EFFECTS__
function notImplemented(name) {
  const fn = /* @__PURE__ */ __name(() => {
    throw /* @__PURE__ */ createNotImplementedError(name);
  }, "fn");
  return Object.assign(fn, { __unenv__: true });
}
__name(notImplemented, "notImplemented");
// @__NO_SIDE_EFFECTS__
function notImplementedClass(name) {
  return class {
    __unenv__ = true;
    constructor() {
      throw new Error(`[unenv] ${name} is not implemented yet!`);
    }
  };
}
__name(notImplementedClass, "notImplementedClass");

// ../node_modules/unenv/dist/runtime/node/internal/perf_hooks/performance.mjs
var _timeOrigin = globalThis.performance?.timeOrigin ?? Date.now();
var _performanceNow = globalThis.performance?.now ? globalThis.performance.now.bind(globalThis.performance) : () => Date.now() - _timeOrigin;
var nodeTiming = {
  name: "node",
  entryType: "node",
  startTime: 0,
  duration: 0,
  nodeStart: 0,
  v8Start: 0,
  bootstrapComplete: 0,
  environment: 0,
  loopStart: 0,
  loopExit: 0,
  idleTime: 0,
  uvMetricsInfo: {
    loopCount: 0,
    events: 0,
    eventsWaiting: 0
  },
  detail: void 0,
  toJSON() {
    return this;
  }
};
var PerformanceEntry = class {
  static {
    __name(this, "PerformanceEntry");
  }
  __unenv__ = true;
  detail;
  entryType = "event";
  name;
  startTime;
  constructor(name, options) {
    this.name = name;
    this.startTime = options?.startTime || _performanceNow();
    this.detail = options?.detail;
  }
  get duration() {
    return _performanceNow() - this.startTime;
  }
  toJSON() {
    return {
      name: this.name,
      entryType: this.entryType,
      startTime: this.startTime,
      duration: this.duration,
      detail: this.detail
    };
  }
};
var PerformanceMark = class PerformanceMark2 extends PerformanceEntry {
  static {
    __name(this, "PerformanceMark");
  }
  entryType = "mark";
  constructor() {
    super(...arguments);
  }
  get duration() {
    return 0;
  }
};
var PerformanceMeasure = class extends PerformanceEntry {
  static {
    __name(this, "PerformanceMeasure");
  }
  entryType = "measure";
};
var PerformanceResourceTiming = class extends PerformanceEntry {
  static {
    __name(this, "PerformanceResourceTiming");
  }
  entryType = "resource";
  serverTiming = [];
  connectEnd = 0;
  connectStart = 0;
  decodedBodySize = 0;
  domainLookupEnd = 0;
  domainLookupStart = 0;
  encodedBodySize = 0;
  fetchStart = 0;
  initiatorType = "";
  name = "";
  nextHopProtocol = "";
  redirectEnd = 0;
  redirectStart = 0;
  requestStart = 0;
  responseEnd = 0;
  responseStart = 0;
  secureConnectionStart = 0;
  startTime = 0;
  transferSize = 0;
  workerStart = 0;
  responseStatus = 0;
};
var PerformanceObserverEntryList = class {
  static {
    __name(this, "PerformanceObserverEntryList");
  }
  __unenv__ = true;
  getEntries() {
    return [];
  }
  getEntriesByName(_name, _type) {
    return [];
  }
  getEntriesByType(type) {
    return [];
  }
};
var Performance = class {
  static {
    __name(this, "Performance");
  }
  __unenv__ = true;
  timeOrigin = _timeOrigin;
  eventCounts = /* @__PURE__ */ new Map();
  _entries = [];
  _resourceTimingBufferSize = 0;
  navigation = void 0;
  timing = void 0;
  timerify(_fn, _options) {
    throw createNotImplementedError("Performance.timerify");
  }
  get nodeTiming() {
    return nodeTiming;
  }
  eventLoopUtilization() {
    return {};
  }
  markResourceTiming() {
    return new PerformanceResourceTiming("");
  }
  onresourcetimingbufferfull = null;
  now() {
    if (this.timeOrigin === _timeOrigin) {
      return _performanceNow();
    }
    return Date.now() - this.timeOrigin;
  }
  clearMarks(markName) {
    this._entries = markName ? this._entries.filter((e) => e.name !== markName) : this._entries.filter((e) => e.entryType !== "mark");
  }
  clearMeasures(measureName) {
    this._entries = measureName ? this._entries.filter((e) => e.name !== measureName) : this._entries.filter((e) => e.entryType !== "measure");
  }
  clearResourceTimings() {
    this._entries = this._entries.filter((e) => e.entryType !== "resource" || e.entryType !== "navigation");
  }
  getEntries() {
    return this._entries;
  }
  getEntriesByName(name, type) {
    return this._entries.filter((e) => e.name === name && (!type || e.entryType === type));
  }
  getEntriesByType(type) {
    return this._entries.filter((e) => e.entryType === type);
  }
  mark(name, options) {
    const entry = new PerformanceMark(name, options);
    this._entries.push(entry);
    return entry;
  }
  measure(measureName, startOrMeasureOptions, endMark) {
    let start;
    let end;
    if (typeof startOrMeasureOptions === "string") {
      start = this.getEntriesByName(startOrMeasureOptions, "mark")[0]?.startTime;
      end = this.getEntriesByName(endMark, "mark")[0]?.startTime;
    } else {
      start = Number.parseFloat(startOrMeasureOptions?.start) || this.now();
      end = Number.parseFloat(startOrMeasureOptions?.end) || this.now();
    }
    const entry = new PerformanceMeasure(measureName, {
      startTime: start,
      detail: {
        start,
        end
      }
    });
    this._entries.push(entry);
    return entry;
  }
  setResourceTimingBufferSize(maxSize) {
    this._resourceTimingBufferSize = maxSize;
  }
  addEventListener(type, listener, options) {
    throw createNotImplementedError("Performance.addEventListener");
  }
  removeEventListener(type, listener, options) {
    throw createNotImplementedError("Performance.removeEventListener");
  }
  dispatchEvent(event) {
    throw createNotImplementedError("Performance.dispatchEvent");
  }
  toJSON() {
    return this;
  }
};
var PerformanceObserver = class {
  static {
    __name(this, "PerformanceObserver");
  }
  __unenv__ = true;
  static supportedEntryTypes = [];
  _callback = null;
  constructor(callback) {
    this._callback = callback;
  }
  takeRecords() {
    return [];
  }
  disconnect() {
    throw createNotImplementedError("PerformanceObserver.disconnect");
  }
  observe(options) {
    throw createNotImplementedError("PerformanceObserver.observe");
  }
  bind(fn) {
    return fn;
  }
  runInAsyncScope(fn, thisArg, ...args) {
    return fn.call(thisArg, ...args);
  }
  asyncId() {
    return 0;
  }
  triggerAsyncId() {
    return 0;
  }
  emitDestroy() {
    return this;
  }
};
var performance = globalThis.performance && "addEventListener" in globalThis.performance ? globalThis.performance : new Performance();

// ../node_modules/@cloudflare/unenv-preset/dist/runtime/polyfill/performance.mjs
if (!("__unenv__" in performance)) {
  const proto = Performance.prototype;
  for (const key of Object.getOwnPropertyNames(proto)) {
    if (key !== "constructor" && !(key in performance)) {
      const desc = Object.getOwnPropertyDescriptor(proto, key);
      if (desc) {
        Object.defineProperty(performance, key, desc);
      }
    }
  }
}
globalThis.performance = performance;
globalThis.Performance = Performance;
globalThis.PerformanceEntry = PerformanceEntry;
globalThis.PerformanceMark = PerformanceMark;
globalThis.PerformanceMeasure = PerformanceMeasure;
globalThis.PerformanceObserver = PerformanceObserver;
globalThis.PerformanceObserverEntryList = PerformanceObserverEntryList;
globalThis.PerformanceResourceTiming = PerformanceResourceTiming;

// ../node_modules/unenv/dist/runtime/node/console.mjs
import { Writable } from "node:stream";

// ../node_modules/unenv/dist/runtime/mock/noop.mjs
var noop_default = Object.assign(() => {
}, { __unenv__: true });

// ../node_modules/unenv/dist/runtime/node/console.mjs
var _console = globalThis.console;
var _ignoreErrors = true;
var _stderr = new Writable();
var _stdout = new Writable();
var log = _console?.log ?? noop_default;
var info = _console?.info ?? log;
var trace = _console?.trace ?? info;
var debug = _console?.debug ?? log;
var table = _console?.table ?? log;
var error = _console?.error ?? log;
var warn = _console?.warn ?? error;
var createTask = _console?.createTask ?? /* @__PURE__ */ notImplemented("console.createTask");
var clear = _console?.clear ?? noop_default;
var count = _console?.count ?? noop_default;
var countReset = _console?.countReset ?? noop_default;
var dir = _console?.dir ?? noop_default;
var dirxml = _console?.dirxml ?? noop_default;
var group = _console?.group ?? noop_default;
var groupEnd = _console?.groupEnd ?? noop_default;
var groupCollapsed = _console?.groupCollapsed ?? noop_default;
var profile = _console?.profile ?? noop_default;
var profileEnd = _console?.profileEnd ?? noop_default;
var time = _console?.time ?? noop_default;
var timeEnd = _console?.timeEnd ?? noop_default;
var timeLog = _console?.timeLog ?? noop_default;
var timeStamp = _console?.timeStamp ?? noop_default;
var Console = _console?.Console ?? /* @__PURE__ */ notImplementedClass("console.Console");
var _times = /* @__PURE__ */ new Map();
var _stdoutErrorHandler = noop_default;
var _stderrErrorHandler = noop_default;

// ../node_modules/@cloudflare/unenv-preset/dist/runtime/node/console.mjs
var workerdConsole = globalThis["console"];
var {
  assert,
  clear: clear2,
  // @ts-expect-error undocumented public API
  context,
  count: count2,
  countReset: countReset2,
  // @ts-expect-error undocumented public API
  createTask: createTask2,
  debug: debug2,
  dir: dir2,
  dirxml: dirxml2,
  error: error2,
  group: group2,
  groupCollapsed: groupCollapsed2,
  groupEnd: groupEnd2,
  info: info2,
  log: log2,
  profile: profile2,
  profileEnd: profileEnd2,
  table: table2,
  time: time2,
  timeEnd: timeEnd2,
  timeLog: timeLog2,
  timeStamp: timeStamp2,
  trace: trace2,
  warn: warn2
} = workerdConsole;
Object.assign(workerdConsole, {
  Console,
  _ignoreErrors,
  _stderr,
  _stderrErrorHandler,
  _stdout,
  _stdoutErrorHandler,
  _times
});
var console_default = workerdConsole;

// ../node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-console
globalThis.console = console_default;

// ../node_modules/unenv/dist/runtime/node/internal/process/hrtime.mjs
var hrtime = /* @__PURE__ */ Object.assign(/* @__PURE__ */ __name(function hrtime2(startTime) {
  const now = Date.now();
  const seconds = Math.trunc(now / 1e3);
  const nanos = now % 1e3 * 1e6;
  if (startTime) {
    let diffSeconds = seconds - startTime[0];
    let diffNanos = nanos - startTime[0];
    if (diffNanos < 0) {
      diffSeconds = diffSeconds - 1;
      diffNanos = 1e9 + diffNanos;
    }
    return [diffSeconds, diffNanos];
  }
  return [seconds, nanos];
}, "hrtime"), { bigint: /* @__PURE__ */ __name(function bigint() {
  return BigInt(Date.now() * 1e6);
}, "bigint") });

// ../node_modules/unenv/dist/runtime/node/internal/process/process.mjs
import { EventEmitter } from "node:events";

// ../node_modules/unenv/dist/runtime/node/internal/tty/read-stream.mjs
var ReadStream = class {
  static {
    __name(this, "ReadStream");
  }
  fd;
  isRaw = false;
  isTTY = false;
  constructor(fd) {
    this.fd = fd;
  }
  setRawMode(mode) {
    this.isRaw = mode;
    return this;
  }
};

// ../node_modules/unenv/dist/runtime/node/internal/tty/write-stream.mjs
var WriteStream = class {
  static {
    __name(this, "WriteStream");
  }
  fd;
  columns = 80;
  rows = 24;
  isTTY = false;
  constructor(fd) {
    this.fd = fd;
  }
  clearLine(dir3, callback) {
    callback && callback();
    return false;
  }
  clearScreenDown(callback) {
    callback && callback();
    return false;
  }
  cursorTo(x, y, callback) {
    callback && typeof callback === "function" && callback();
    return false;
  }
  moveCursor(dx, dy, callback) {
    callback && callback();
    return false;
  }
  getColorDepth(env2) {
    return 1;
  }
  hasColors(count3, env2) {
    return false;
  }
  getWindowSize() {
    return [this.columns, this.rows];
  }
  write(str, encoding, cb) {
    if (str instanceof Uint8Array) {
      str = new TextDecoder().decode(str);
    }
    try {
      console.log(str);
    } catch {
    }
    cb && typeof cb === "function" && cb();
    return false;
  }
};

// ../node_modules/unenv/dist/runtime/node/internal/process/node-version.mjs
var NODE_VERSION = "22.14.0";

// ../node_modules/unenv/dist/runtime/node/internal/process/process.mjs
var Process = class _Process extends EventEmitter {
  static {
    __name(this, "Process");
  }
  env;
  hrtime;
  nextTick;
  constructor(impl) {
    super();
    this.env = impl.env;
    this.hrtime = impl.hrtime;
    this.nextTick = impl.nextTick;
    for (const prop of [...Object.getOwnPropertyNames(_Process.prototype), ...Object.getOwnPropertyNames(EventEmitter.prototype)]) {
      const value = this[prop];
      if (typeof value === "function") {
        this[prop] = value.bind(this);
      }
    }
  }
  // --- event emitter ---
  emitWarning(warning, type, code) {
    console.warn(`${code ? `[${code}] ` : ""}${type ? `${type}: ` : ""}${warning}`);
  }
  emit(...args) {
    return super.emit(...args);
  }
  listeners(eventName) {
    return super.listeners(eventName);
  }
  // --- stdio (lazy initializers) ---
  #stdin;
  #stdout;
  #stderr;
  get stdin() {
    return this.#stdin ??= new ReadStream(0);
  }
  get stdout() {
    return this.#stdout ??= new WriteStream(1);
  }
  get stderr() {
    return this.#stderr ??= new WriteStream(2);
  }
  // --- cwd ---
  #cwd = "/";
  chdir(cwd2) {
    this.#cwd = cwd2;
  }
  cwd() {
    return this.#cwd;
  }
  // --- dummy props and getters ---
  arch = "";
  platform = "";
  argv = [];
  argv0 = "";
  execArgv = [];
  execPath = "";
  title = "";
  pid = 200;
  ppid = 100;
  get version() {
    return `v${NODE_VERSION}`;
  }
  get versions() {
    return { node: NODE_VERSION };
  }
  get allowedNodeEnvironmentFlags() {
    return /* @__PURE__ */ new Set();
  }
  get sourceMapsEnabled() {
    return false;
  }
  get debugPort() {
    return 0;
  }
  get throwDeprecation() {
    return false;
  }
  get traceDeprecation() {
    return false;
  }
  get features() {
    return {};
  }
  get release() {
    return {};
  }
  get connected() {
    return false;
  }
  get config() {
    return {};
  }
  get moduleLoadList() {
    return [];
  }
  constrainedMemory() {
    return 0;
  }
  availableMemory() {
    return 0;
  }
  uptime() {
    return 0;
  }
  resourceUsage() {
    return {};
  }
  // --- noop methods ---
  ref() {
  }
  unref() {
  }
  // --- unimplemented methods ---
  umask() {
    throw createNotImplementedError("process.umask");
  }
  getBuiltinModule() {
    return void 0;
  }
  getActiveResourcesInfo() {
    throw createNotImplementedError("process.getActiveResourcesInfo");
  }
  exit() {
    throw createNotImplementedError("process.exit");
  }
  reallyExit() {
    throw createNotImplementedError("process.reallyExit");
  }
  kill() {
    throw createNotImplementedError("process.kill");
  }
  abort() {
    throw createNotImplementedError("process.abort");
  }
  dlopen() {
    throw createNotImplementedError("process.dlopen");
  }
  setSourceMapsEnabled() {
    throw createNotImplementedError("process.setSourceMapsEnabled");
  }
  loadEnvFile() {
    throw createNotImplementedError("process.loadEnvFile");
  }
  disconnect() {
    throw createNotImplementedError("process.disconnect");
  }
  cpuUsage() {
    throw createNotImplementedError("process.cpuUsage");
  }
  setUncaughtExceptionCaptureCallback() {
    throw createNotImplementedError("process.setUncaughtExceptionCaptureCallback");
  }
  hasUncaughtExceptionCaptureCallback() {
    throw createNotImplementedError("process.hasUncaughtExceptionCaptureCallback");
  }
  initgroups() {
    throw createNotImplementedError("process.initgroups");
  }
  openStdin() {
    throw createNotImplementedError("process.openStdin");
  }
  assert() {
    throw createNotImplementedError("process.assert");
  }
  binding() {
    throw createNotImplementedError("process.binding");
  }
  // --- attached interfaces ---
  permission = { has: /* @__PURE__ */ notImplemented("process.permission.has") };
  report = {
    directory: "",
    filename: "",
    signal: "SIGUSR2",
    compact: false,
    reportOnFatalError: false,
    reportOnSignal: false,
    reportOnUncaughtException: false,
    getReport: /* @__PURE__ */ notImplemented("process.report.getReport"),
    writeReport: /* @__PURE__ */ notImplemented("process.report.writeReport")
  };
  finalization = {
    register: /* @__PURE__ */ notImplemented("process.finalization.register"),
    unregister: /* @__PURE__ */ notImplemented("process.finalization.unregister"),
    registerBeforeExit: /* @__PURE__ */ notImplemented("process.finalization.registerBeforeExit")
  };
  memoryUsage = Object.assign(() => ({
    arrayBuffers: 0,
    rss: 0,
    external: 0,
    heapTotal: 0,
    heapUsed: 0
  }), { rss: /* @__PURE__ */ __name(() => 0, "rss") });
  // --- undefined props ---
  mainModule = void 0;
  domain = void 0;
  // optional
  send = void 0;
  exitCode = void 0;
  channel = void 0;
  getegid = void 0;
  geteuid = void 0;
  getgid = void 0;
  getgroups = void 0;
  getuid = void 0;
  setegid = void 0;
  seteuid = void 0;
  setgid = void 0;
  setgroups = void 0;
  setuid = void 0;
  // internals
  _events = void 0;
  _eventsCount = void 0;
  _exiting = void 0;
  _maxListeners = void 0;
  _debugEnd = void 0;
  _debugProcess = void 0;
  _fatalException = void 0;
  _getActiveHandles = void 0;
  _getActiveRequests = void 0;
  _kill = void 0;
  _preload_modules = void 0;
  _rawDebug = void 0;
  _startProfilerIdleNotifier = void 0;
  _stopProfilerIdleNotifier = void 0;
  _tickCallback = void 0;
  _disconnect = void 0;
  _handleQueue = void 0;
  _pendingMessage = void 0;
  _channel = void 0;
  _send = void 0;
  _linkedBinding = void 0;
};

// ../node_modules/@cloudflare/unenv-preset/dist/runtime/node/process.mjs
var globalProcess = globalThis["process"];
var getBuiltinModule = globalProcess.getBuiltinModule;
var workerdProcess = getBuiltinModule("node:process");
var unenvProcess = new Process({
  env: globalProcess.env,
  hrtime,
  // `nextTick` is available from workerd process v1
  nextTick: workerdProcess.nextTick
});
var { exit, features, platform } = workerdProcess;
var {
  _channel,
  _debugEnd,
  _debugProcess,
  _disconnect,
  _events,
  _eventsCount,
  _exiting,
  _fatalException,
  _getActiveHandles,
  _getActiveRequests,
  _handleQueue,
  _kill,
  _linkedBinding,
  _maxListeners,
  _pendingMessage,
  _preload_modules,
  _rawDebug,
  _send,
  _startProfilerIdleNotifier,
  _stopProfilerIdleNotifier,
  _tickCallback,
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  arch,
  argv,
  argv0,
  assert: assert2,
  availableMemory,
  binding,
  channel,
  chdir,
  config,
  connected,
  constrainedMemory,
  cpuUsage,
  cwd,
  debugPort,
  disconnect,
  dlopen,
  domain,
  emit,
  emitWarning,
  env,
  eventNames,
  execArgv,
  execPath,
  exitCode,
  finalization,
  getActiveResourcesInfo,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getMaxListeners,
  getuid,
  hasUncaughtExceptionCaptureCallback,
  hrtime: hrtime3,
  initgroups,
  kill,
  listenerCount,
  listeners,
  loadEnvFile,
  mainModule,
  memoryUsage,
  moduleLoadList,
  nextTick,
  off,
  on,
  once,
  openStdin,
  permission,
  pid,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  reallyExit,
  ref,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  send,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setMaxListeners,
  setSourceMapsEnabled,
  setuid,
  setUncaughtExceptionCaptureCallback,
  sourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  throwDeprecation,
  title,
  traceDeprecation,
  umask,
  unref,
  uptime,
  version,
  versions
} = unenvProcess;
var _process = {
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  hasUncaughtExceptionCaptureCallback,
  setUncaughtExceptionCaptureCallback,
  loadEnvFile,
  sourceMapsEnabled,
  arch,
  argv,
  argv0,
  chdir,
  config,
  connected,
  constrainedMemory,
  availableMemory,
  cpuUsage,
  cwd,
  debugPort,
  dlopen,
  disconnect,
  emit,
  emitWarning,
  env,
  eventNames,
  execArgv,
  execPath,
  exit,
  finalization,
  features,
  getBuiltinModule,
  getActiveResourcesInfo,
  getMaxListeners,
  hrtime: hrtime3,
  kill,
  listeners,
  listenerCount,
  memoryUsage,
  nextTick,
  on,
  off,
  once,
  pid,
  platform,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  setMaxListeners,
  setSourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  title,
  throwDeprecation,
  traceDeprecation,
  umask,
  uptime,
  version,
  versions,
  // @ts-expect-error old API
  domain,
  initgroups,
  moduleLoadList,
  reallyExit,
  openStdin,
  assert: assert2,
  binding,
  send,
  exitCode,
  channel,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getuid,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setuid,
  permission,
  mainModule,
  _events,
  _eventsCount,
  _exiting,
  _maxListeners,
  _debugEnd,
  _debugProcess,
  _fatalException,
  _getActiveHandles,
  _getActiveRequests,
  _kill,
  _preload_modules,
  _rawDebug,
  _startProfilerIdleNotifier,
  _stopProfilerIdleNotifier,
  _tickCallback,
  _disconnect,
  _handleQueue,
  _pendingMessage,
  _channel,
  _send,
  _linkedBinding
};
var process_default = _process;

// ../node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-process
globalThis.process = process_default;

// api/comments.js
function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { "content-type": "application/json" } });
}
__name(json, "json");
async function sha256(s) {
  const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("");
}
__name(sha256, "sha256");
var NAME_RE = /^[^<>{}]{1,32}$/;
async function onRequestGet({ request, env: env2 }) {
  if (!env2.DB) return json({ error: "no-db" }, 500);
  const url = new URL(request.url);
  const video = (url.searchParams.get("video") || "").slice(0, 64);
  if (!video) return json({ error: "missing video" }, 400);
  const rows = (await env2.DB.prepare(
    "SELECT id, name, text, likes, ts FROM comments WHERE video_id = ? ORDER BY id DESC LIMIT 50"
  ).bind(video).all()).results;
  return json({ comments: rows });
}
__name(onRequestGet, "onRequestGet");
async function onRequestPost({ request, env: env2 }) {
  if (!env2.DB) return json({ error: "no-db" }, 500);
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "bad json" }, 400);
  }
  const videoId = String(body.videoId || "").slice(0, 64);
  const name = String(body.name || "").trim() || "Anonymous Rancher";
  const text = String(body.text || "").trim();
  if (!videoId) return json({ error: "missing videoId" }, 400);
  if (!NAME_RE.test(name)) return json({ error: "invalid name" }, 400);
  if (text.length < 2 || text.length > 500) return json({ error: "comment must be 2-500 chars" }, 400);
  const ip = request.headers.get("CF-Connecting-IP") || "x";
  const ua = request.headers.get("User-Agent") || "";
  const visitor = (await sha256(ip + "|" + ua)).slice(0, 32);
  const recent = await env2.DB.prepare(
    "SELECT COUNT(*) c FROM comments WHERE ip_hash = ? AND ts >= datetime('now', '-1 minute')"
  ).bind(visitor).first();
  if (recent?.c > 0) return json({ error: "Slow down, cowboy \u2014 one comment per minute." }, 429);
  const r = await env2.DB.prepare(
    "INSERT INTO comments (video_id, name, text, ip_hash) VALUES (?, ?, ?, ?)"
  ).bind(videoId, name, text, visitor).run();
  return json({ ok: true, id: r.meta?.last_row_id, name, text, likes: 0, ts: (/* @__PURE__ */ new Date()).toISOString() });
}
__name(onRequestPost, "onRequestPost");
async function onRequestDelete({ request, env: env2 }) {
  const url = new URL(request.url);
  if (!env2.ADMIN_KEY || url.searchParams.get("key") !== env2.ADMIN_KEY) return json({ error: "unauthorized" }, 401);
  const id = parseInt(url.searchParams.get("id") || "0", 10);
  if (!id) return json({ error: "missing id" }, 400);
  await env2.DB.prepare("DELETE FROM comments WHERE id = ?").bind(id).run();
  return json({ ok: true });
}
__name(onRequestDelete, "onRequestDelete");

// api/stats.js
var DAYS_ALLOWED = [1, 7, 30, 90];
function json2(obj, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { "content-type": "application/json" } });
}
__name(json2, "json");
async function onRequestGet2({ request, env: env2 }) {
  const url = new URL(request.url);
  const key = url.searchParams.get("key") || "";
  if (!env2.ADMIN_KEY || key !== env2.ADMIN_KEY) return json2({ error: "unauthorized" }, 401);
  if (!env2.DB) return json2({ error: "no-db" }, 500);
  const days = DAYS_ALLOWED.includes(Number(url.searchParams.get("days"))) ? Number(url.searchParams.get("days")) : 7;
  const w = `WHERE ts >= datetime('now', '-${days} day')`;
  const db = env2.DB;
  const q = /* @__PURE__ */ __name(async (sql) => (await db.prepare(sql).all()).results, "q");
  const q1 = /* @__PURE__ */ __name(async (sql) => await db.prepare(sql).first(), "q1");
  const [visitsToday, pageviews, uniques, bestDay, countriesSeen, series, topCountries, topPages, topVideos, topCategories, referrers, devices, browsers, live] = await Promise.all([
    q1(`SELECT COUNT(*) c FROM visits WHERE ts >= datetime('now', '-1 day')`),
    q1(`SELECT COUNT(*) c FROM visits ${w}`),
    q1(`SELECT COUNT(DISTINCT visitor) c FROM visits ${w} AND visitor != ''`),
    q1(`SELECT date(ts) dd, COUNT(*) n FROM visits ${w} GROUP BY dd ORDER BY n DESC LIMIT 1`),
    q1(`SELECT COUNT(DISTINCT country) c FROM visits ${w} AND country != ''`),
    q(`SELECT date(ts) AS day, COUNT(*) n FROM visits ${w} GROUP BY day ORDER BY day`),
    q(`SELECT country AS code, COUNT(*) n FROM visits ${w} AND country != '' GROUP BY country ORDER BY n DESC LIMIT 10`),
    q(`SELECT path, COUNT(*) n FROM visits ${w} GROUP BY path ORDER BY n DESC LIMIT 10`),
    q(`SELECT video_id AS id, COUNT(*) n FROM visits ${w} AND video_id IS NOT NULL GROUP BY video_id ORDER BY n DESC LIMIT 12`),
    q(`SELECT path, COUNT(*) n FROM visits ${w} AND kind = 'category' GROUP BY path ORDER BY n DESC LIMIT 10`),
    q(`SELECT CASE WHEN referrer = '' THEN '(direct)' ELSE referrer END AS src, COUNT(*) n FROM visits ${w} GROUP BY src ORDER BY n DESC LIMIT 10`),
    q(`SELECT device, COUNT(*) n FROM visits ${w} GROUP BY device ORDER BY n DESC`),
    q(`SELECT browser, COUNT(*) n FROM visits ${w} GROUP BY browser ORDER BY n DESC`),
    q(`SELECT ts, path, kind, country, device, referrer FROM visits WHERE ts >= datetime('now', '-15 minutes') ORDER BY ts DESC, id DESC LIMIT 20`)
  ]);
  return json2({
    days,
    visits_today: visitsToday?.c ?? 0,
    pageviews: pageviews?.c ?? 0,
    uniques: uniques?.c ?? 0,
    best_day: bestDay?.n ?? 0,
    countries_seen: countriesSeen?.c ?? 0,
    series,
    top_countries: topCountries,
    top_pages: topPages,
    top_videos: topVideos,
    top_categories: topCategories,
    referrers,
    devices,
    browsers,
    live
  });
}
__name(onRequestGet2, "onRequestGet");

// api/track.js
var ALLOWED_KINDS = /* @__PURE__ */ new Set(["view", "watch", "category", "model", "search", "legal"]);
function sha2562(s) {
  return crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)).then(
    (b) => [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("")
  );
}
__name(sha2562, "sha256");
function deviceOf(ua) {
  if (/mobile|iphone|android/i.test(ua)) return "Mobile";
  if (/ipad|tablet/i.test(ua)) return "Tablet";
  return "Desktop";
}
__name(deviceOf, "deviceOf");
function browserOf(ua) {
  return /edg\//i.test(ua) ? "Edge" : /opr\//i.test(ua) || /opera/i.test(ua) ? "Opera" : /chrome|crios/i.test(ua) ? "Chrome" : /firefox|fxios/i.test(ua) ? "Firefox" : /safari/i.test(ua) ? "Safari" : "Other";
}
__name(browserOf, "browserOf");
async function onRequestPost2({ request, env: env2 }) {
  try {
    if (!env2.DB) return json3({ ok: false, error: "no-db" }, 500);
    const body = await request.json().catch(() => ({}));
    const rawPath = typeof body.path === "string" ? body.path.slice(0, 300) : "/";
    const path = rawPath.startsWith("/") ? rawPath : "/" + rawPath;
    const kind = ALLOWED_KINDS.has(body.kind) ? body.kind : "view";
    const videoId = typeof body.videoId === "string" ? body.videoId.slice(0, 64) : null;
    let referrer = typeof body.referrer === "string" ? body.referrer.slice(0, 300) : "";
    try {
      if (referrer) referrer = new URL(referrer).hostname;
    } catch {
      referrer = "";
    }
    const ua = request.headers.get("User-Agent") || "";
    const country = request.headers.get("CF-IPCountry") || "";
    const ip = request.headers.get("CF-Connecting-IP") || "";
    const visitor = ip ? (await sha2562(ip + "|" + ua)).slice(0, 32) : "";
    await env2.DB.prepare(
      `INSERT INTO visits (ts, path, video_id, kind, referrer, country, device, browser, visitor)
       VALUES (datetime('now'), ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(path, videoId, kind, referrer, country, deviceOf(ua), browserOf(ua), visitor).run();
    return json3({ ok: true });
  } catch (e) {
    return json3({ ok: false, error: String(e).slice(0, 200) }, 500);
  }
}
__name(onRequestPost2, "onRequestPost");
function onRequestOptions() {
  return new Response(null, { status: 204, headers: { "Access-Control-Allow-Origin": "*" } });
}
__name(onRequestOptions, "onRequestOptions");
function json3(obj, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { "content-type": "application/json" } });
}
__name(json3, "json");

// media/[[path]].js
async function onRequestGet3({ request, env: env2 }) {
  const url = new URL(request.url);
  const key = decodeURIComponent(url.pathname.replace(/^\/media\//, ""));
  if (!key || key.includes("..")) return new Response("not found", { status: 404 });
  if (!env2.MEDIA) {
    return new Response("r2 not bound", { status: 404 });
  }
  const obj = await env2.MEDIA.get(key);
  if (!obj) return new Response("not found", { status: 404 });
  const headers = new Headers();
  obj.writeHttpMetadata(headers);
  headers.set("etag", obj.httpEtag);
  headers.set("cache-control", "public, max-age=31536000, immutable");
  headers.set("access-control-allow-origin", "*");
  return new Response(obj.body, { status: 200, headers });
}
__name(onRequestGet3, "onRequestGet");

// [[path]].js
var SITE = "sadcowgirl.fun";
var BOT_RE = /bot|crawl|spider|slurp|facebookexternalhit|twitterbot|discordbot|telegrambot|whatsapp|curl|wget|headless/i;
var esc = /* @__PURE__ */ __name((s) => String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"), "esc");
function fmtViews(n) {
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${Math.round(n / 1e3)}K`;
  return String(n);
}
__name(fmtViews, "fmtViews");
function shell(title2, desc, canonical, body, extraHead = "") {
  return `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title2)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="robots" content="index,follow,max-image-preview:large">
<link rel="canonical" href="${esc(canonical)}">
<meta property="og:site_name" content="${SITE}">
<meta property="og:title" content="${esc(title2)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:type" content="website">
<meta property="og:url" content="${esc(canonical)}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" type="image/png" href="/assets/aistudio/Crying_cowgirl_logo_with_transparent_background_1d4c6f13.png">
${extraHead}
<style>
body{margin:0;background:#080C14;color:#F3F4F6;font-family:system-ui,sans-serif}
a{color:inherit;text-decoration:none}
header{border-bottom:1px solid #1E293B;padding:14px 24px;display:flex;gap:24px;align-items:center}
header .brand{font-weight:800;letter-spacing:.06em}
header nav a{color:#cbd5e1;font-size:13px;margin-right:16px}
main{max-width:1440px;margin:0 auto;padding:24px}
h1{font-size:24px;margin:0 0 6px}
.sub{color:#94a3b8;font-size:12px;margin-bottom:20px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:14px}
.card{background:#101726;border:1px solid #1E293B;border-radius:10px;overflow:hidden}
.card img{width:100%;aspect-ratio:16/9;object-fit:cover;display:block}
.card .t{padding:10px;font-size:13px;font-weight:600;line-height:1.35}
.card .m{padding:0 10px 10px;color:#94a3b8;font-size:11px}
footer{border-top:1px solid #1E293B;padding:20px 24px;color:#64748b;font-size:11px}
footer nav a{margin-right:14px;color:#94a3b8}
</style></head><body>
<header><span class="brand">sadcowgirl<span style="color:#E07A5F">.fun</span></span>
<nav><a href="/">Home</a><a href="/cowgirl">Cowgirl</a><a href="/categories">Categories</a><a href="/models">Models</a></nav></header>
<main>${body}</main>
<footer>\xA9 ${(/* @__PURE__ */ new Date()).getFullYear()} ${SITE} \xB7 18+ only \xB7
<a href="/legal/terms">Terms</a><a href="/legal/privacy">Privacy</a><a href="/legal/dmca">DMCA</a><a href="/legal/2257">2257</a></footer>
</body></html>`;
}
__name(shell, "shell");
function videoGrid(videos, base) {
  return `<div class="grid">${videos.map((v) => `<a class="card" href="${base}/watch/${esc(v.id)}">
${v.thumbUrl ? `<img src="${esc(v.thumbUrl)}" alt="${esc(v.title)}" loading="lazy">` : ""}
<div class="t">${esc(v.title)}</div>
<div class="m">${esc(v.models?.[0] || "Unknown")} \xB7 ${fmtViews(v.views)} views \xB7 ${Math.floor(v.duration / 60)}:${String(v.duration % 60).padStart(2, "0")}</div>
</a>`).join("\n")}</div>`;
}
__name(videoGrid, "videoGrid");
async function onRequestGet4({ request, env: env2 }) {
  try {
    const asset = await env2.ASSETS.fetch(request);
    const ctype = asset.headers.get("content-type") || "";
    if (asset.status !== 404 && !ctype.includes("text/html")) return asset;
  } catch {
  }
  const HTML_NO_CACHE2 = { "cache-control": "no-store, must-revalidate" };
  try {
    return await render(request, env2);
  } catch (e) {
    try {
      const spa = await env2.ASSETS.fetch(new Request(new URL(request.url).origin + "/index.html"));
      if (spa.status !== 404) return spa;
    } catch {
    }
    return new Response("error", { status: 500 });
  }
}
__name(onRequestGet4, "onRequestGet");
async function render(request, env2) {
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/+$/, "") || "/";
  const canonical = `${url.origin}${path === "/" ? "/" : path}`;
  const isBot = BOT_RE.test(request.headers.get("User-Agent") || "");
  const fetchJson = /* @__PURE__ */ __name(async (name) => {
    try {
      const r = await env2.ASSETS.fetch(new Request(`${url.origin}/data/${name}`));
      if (!r.ok) return null;
      return await r.json();
    } catch {
      return null;
    }
  }, "fetchJson");
  let title2 = "sadcowgirl.fun \u2014 The Wildest Cowgirl Tube on the Range";
  let desc = "Thousands of HD videos across dozens of categories \u2014 fresh amateurs, legendary riders, and everything in between. 18+ only.";
  let body = "";
  let extraHead = "";
  if (path === "/") {
    if (isBot) {
      const videos = await fetchJson("videos.json") || [];
      const cats = await fetchJson("categories.json") || [];
      const top = videos.slice(0, 60);
      body = `<h1>sadcowgirl.fun \u2014 free HD videos, updated daily</h1>
<p class="sub">${fmtViews(videos.reduce((s, v) => s + (v.views || 0), 0))} aggregate views \xB7 ${cats.length} categories \xB7 ${videos.length} videos</p>
<div class="grid">${cats.map((c) => `<a class="card" href="/c/${esc(c.slug)}"><div class="t">${esc(c.name)}</div><div class="m">${c.videoCount}+ clips</div></a>`).join("\n")}</div>
<h1 style="margin-top:28px">Most viewed this week</h1>
${videoGrid(top)}`;
    }
  } else if (path === "/categories" || path === "/cowgirl" || path === "/models") {
    const label = path === "/categories" ? "All Categories" : path === "/cowgirl" ? "The Cowgirl Corral" : "The Corral \u2014 Models";
    title2 = `${label} \u2014 ${SITE}`;
    desc = `Browse ${label.toLowerCase()} on sadcowgirl.fun. Thousands of HD videos, 18+.`;
    if (isBot) {
      if (path === "/models") {
        const models = await fetchJson("models.json") || [];
        body = `<h1>${label}</h1><p class="sub">${models.length} riders</p>
<div class="grid">${models.map((m) => `<a class="card" href="/m/${esc(m.slug)}">
${m.photo ? `<img src="${esc(m.photo)}" alt="${esc(m.name)}" loading="lazy">` : ""}
<div class="t">${esc(m.name)}</div><div class="m">${m.videoIds.length} clips \xB7 ${fmtViews(m.totalViews)} views</div></a>`).join("\n")}</div>`;
      } else {
        const videos = await fetchJson("videos.json") || [];
        const cats = await fetchJson("categories.json") || [];
        const pool = path === "/cowgirl" ? videos.filter((v) => v.cowgirl) : videos;
        body = path === "/categories" ? `<h1>${label}</h1><p class="sub">${cats.length} categories</p>
<div class="grid">${cats.map((c) => `<a class="card" href="/c/${esc(c.slug)}"><div class="t">${esc(c.name)}</div><div class="m">${c.videoCount}+ clips \xB7 ${fmtViews(c.totalViews)} views</div></a>`).join("\n")}</div>` : `<h1>${label}</h1><p class="sub">${pool.length} clips</p>${videoGrid(pool.slice(0, 60))}`;
      }
    }
  } else if (path.startsWith("/c/")) {
    const slug = decodeURIComponent(path.slice(3));
    const cats = await fetchJson("categories.json") || [];
    const cat = cats.find((c) => c.slug === slug);
    const videos = await fetchJson("videos.json") || [];
    const pool = videos.filter((v) => v.category === (cat?.name || slug)).slice(0, 60);
    title2 = cat ? `${cat.name} Porn Videos \u2014 ${SITE}` : `${slug} \u2014 ${SITE}`;
    desc = `Watch the best ${cat?.name || slug} videos on sadcowgirl.fun. ${cat?.videoCount || pool.length}+ HD clips, sorted by views. 18+ only.`;
    extraHead = `<meta property="og:image" content="${url.origin}${esc(pool[0]?.thumbUrl || "")}">`;
    if (isBot) {
      body = `<h1>${esc(cat?.name || slug)} videos</h1><p class="sub">${cat?.videoCount || pool.length}+ clips</p>${videoGrid(pool)}`;
    }
  } else if (path.startsWith("/m/")) {
    const slug = decodeURIComponent(path.slice(3));
    const models = await fetchJson("models.json") || [];
    const videos = await fetchJson("videos.json") || [];
    const model = models.find((m) => m.slug === slug);
    const pool = model ? videos.filter((v) => model.videoIds.includes(v.id)).slice(0, 60) : [];
    title2 = model ? `${model.name} \u2014 Videos & Photos \u2014 ${SITE}` : `${slug} \u2014 ${SITE}`;
    desc = model ? `Watch ${model.name}'s videos on sadcowgirl.fun. ${model.videoIds.length} HD clips and photo galleries. 18+ only.` : `Model profile on ${SITE}.`;
    extraHead = model?.photo ? `<meta property="og:image" content="${url.origin}${esc(model.photo)}">` : "";
    if (isBot) {
      body = `<h1>${esc(model?.name || slug)}</h1><p class="sub">${model?.videoIds.length || 0} clips</p>${videoGrid(pool)}`;
    }
  } else if (path.startsWith("/watch/")) {
    const id = decodeURIComponent(path.slice(7));
    const videos = await fetchJson("videos.json") || [];
    const v = videos.find((x) => x.id === id);
    if (v) {
      title2 = `${v.title} \u2014 ${SITE}`;
      desc = `Watch ${v.title} on sadcowgirl.fun. Featuring ${v.models.join(", ") || "unknown"}. ${v.tags.join(", ")}. 18+ only.`;
      extraHead = v.thumbUrl ? `<meta property="og:image" content="${url.origin}${esc(v.thumbUrl)}">
<link rel="video_src" href="${esc(v.embed)}">` : "";
      if (isBot) {
        const ld = {
          "@context": "https://schema.org",
          "@type": "VideoObject",
          name: v.title,
          description: desc,
          thumbnailUrl: v.thumbUrl ? `${url.origin}${v.thumbUrl}` : void 0,
          embedUrl: v.embed,
          uploadDate: v.upload || void 0,
          interactionStatistic: { "@type": "InteractionCounter", interactionType: "https://schema.org/WatchAction", userInteractionCount: v.views }
        };
        extraHead += `<script type="application/ld+json">${JSON.stringify(ld)}<\/script>`;
        body = `<h1>${esc(v.title)}</h1><p class="sub">${esc(v.models.join(", "))} \xB7 ${fmtViews(v.views)} views \xB7 ${esc(v.upload || "")}</p>
${v.thumbUrl ? `<img src="${esc(v.thumbUrl)}" alt="${esc(v.title)}" style="max-width:640px;width:100%;border-radius:10px">` : ""}
<p style="max-width:640px">This video plays on sadcowgirl.fun. Browse <a href="/c/${esc(esc((v.categories[0] || "").toLowerCase().replace(/[^a-z0-9]+/g, "-")))}">more ${esc(v.categories[0] || "")} videos</a>.</p>
<h1 style="margin-top:24px">More like this</h1>${videoGrid(videos.filter((x) => x.category === v.category && x.id !== v.id).slice(0, 24))}`;
      }
    }
  } else if (path.startsWith("/legal/")) {
    const slug = path.slice(7);
    const names = { terms: "Terms of Service", privacy: "Privacy Policy", dmca: "DMCA / Copyright", "2257": "18 U.S.C. 2257 Statement" };
    title2 = `${names[slug] || slug} \u2014 ${SITE}`;
    desc = `${names[slug] || "Legal information"} for sadcowgirl.fun.`;
  }
  const spa = await env2.ASSETS.fetch(new Request(`${url.origin}/index.html`));
  if (!isBot) {
    let html = await spa.text();
    html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${esc(title2)}</title>`).replace(/<meta name="description" content="[^"]*" \/>/i, `<meta name="description" content="${esc(desc)}">`).replace(/<meta property="og:description" content="[^"]*" \/>/i, `<meta property="og:description" content="${esc(desc)}">`).replace(/<meta property="og:title" content="[^"]*" \/>/i, `<meta property="og:title" content="${esc(title2)}">`).replace(/<\/head>/i, `<link rel="canonical" href="${esc(canonical)}">${extraHead}</head>`);
    return new Response(html, { headers: { "content-type": "text/html; charset=utf-8", ...HTML_NO_CACHE } });
  }
  return new Response(shell(title2, desc, canonical, body, extraHead), {
    headers: { "content-type": "text/html; charset=utf-8", ...HTML_NO_CACHE }
  });
}
__name(render, "render");

// ../.wrangler/tmp/pages-06ZPLD/functionsRoutes-0.7242226451066451.mjs
var routes = [
  {
    routePath: "/api/comments",
    mountPath: "/api",
    method: "DELETE",
    middlewares: [],
    modules: [onRequestDelete]
  },
  {
    routePath: "/api/comments",
    mountPath: "/api",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet]
  },
  {
    routePath: "/api/comments",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost]
  },
  {
    routePath: "/api/stats",
    mountPath: "/api",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet2]
  },
  {
    routePath: "/api/track",
    mountPath: "/api",
    method: "OPTIONS",
    middlewares: [],
    modules: [onRequestOptions]
  },
  {
    routePath: "/api/track",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost2]
  },
  {
    routePath: "/media/:path*",
    mountPath: "/media",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet3]
  },
  {
    routePath: "/:path*",
    mountPath: "/",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet4]
  }
];

// ../node_modules/wrangler/node_modules/path-to-regexp/dist.es2015/index.js
function lexer(str) {
  var tokens = [];
  var i = 0;
  while (i < str.length) {
    var char = str[i];
    if (char === "*" || char === "+" || char === "?") {
      tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
      continue;
    }
    if (char === "\\") {
      tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
      continue;
    }
    if (char === "{") {
      tokens.push({ type: "OPEN", index: i, value: str[i++] });
      continue;
    }
    if (char === "}") {
      tokens.push({ type: "CLOSE", index: i, value: str[i++] });
      continue;
    }
    if (char === ":") {
      var name = "";
      var j = i + 1;
      while (j < str.length) {
        var code = str.charCodeAt(j);
        if (
          // `0-9`
          code >= 48 && code <= 57 || // `A-Z`
          code >= 65 && code <= 90 || // `a-z`
          code >= 97 && code <= 122 || // `_`
          code === 95
        ) {
          name += str[j++];
          continue;
        }
        break;
      }
      if (!name)
        throw new TypeError("Missing parameter name at ".concat(i));
      tokens.push({ type: "NAME", index: i, value: name });
      i = j;
      continue;
    }
    if (char === "(") {
      var count3 = 1;
      var pattern = "";
      var j = i + 1;
      if (str[j] === "?") {
        throw new TypeError('Pattern cannot start with "?" at '.concat(j));
      }
      while (j < str.length) {
        if (str[j] === "\\") {
          pattern += str[j++] + str[j++];
          continue;
        }
        if (str[j] === ")") {
          count3--;
          if (count3 === 0) {
            j++;
            break;
          }
        } else if (str[j] === "(") {
          count3++;
          if (str[j + 1] !== "?") {
            throw new TypeError("Capturing groups are not allowed at ".concat(j));
          }
        }
        pattern += str[j++];
      }
      if (count3)
        throw new TypeError("Unbalanced pattern at ".concat(i));
      if (!pattern)
        throw new TypeError("Missing pattern at ".concat(i));
      tokens.push({ type: "PATTERN", index: i, value: pattern });
      i = j;
      continue;
    }
    tokens.push({ type: "CHAR", index: i, value: str[i++] });
  }
  tokens.push({ type: "END", index: i, value: "" });
  return tokens;
}
__name(lexer, "lexer");
function parse(str, options) {
  if (options === void 0) {
    options = {};
  }
  var tokens = lexer(str);
  var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a, _b = options.delimiter, delimiter = _b === void 0 ? "/#?" : _b;
  var result = [];
  var key = 0;
  var i = 0;
  var path = "";
  var tryConsume = /* @__PURE__ */ __name(function(type) {
    if (i < tokens.length && tokens[i].type === type)
      return tokens[i++].value;
  }, "tryConsume");
  var mustConsume = /* @__PURE__ */ __name(function(type) {
    var value2 = tryConsume(type);
    if (value2 !== void 0)
      return value2;
    var _a2 = tokens[i], nextType = _a2.type, index = _a2.index;
    throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
  }, "mustConsume");
  var consumeText = /* @__PURE__ */ __name(function() {
    var result2 = "";
    var value2;
    while (value2 = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
      result2 += value2;
    }
    return result2;
  }, "consumeText");
  var isSafe = /* @__PURE__ */ __name(function(value2) {
    for (var _i = 0, delimiter_1 = delimiter; _i < delimiter_1.length; _i++) {
      var char2 = delimiter_1[_i];
      if (value2.indexOf(char2) > -1)
        return true;
    }
    return false;
  }, "isSafe");
  var safePattern = /* @__PURE__ */ __name(function(prefix2) {
    var prev = result[result.length - 1];
    var prevText = prefix2 || (prev && typeof prev === "string" ? prev : "");
    if (prev && !prevText) {
      throw new TypeError('Must have text between two parameters, missing text after "'.concat(prev.name, '"'));
    }
    if (!prevText || isSafe(prevText))
      return "[^".concat(escapeString(delimiter), "]+?");
    return "(?:(?!".concat(escapeString(prevText), ")[^").concat(escapeString(delimiter), "])+?");
  }, "safePattern");
  while (i < tokens.length) {
    var char = tryConsume("CHAR");
    var name = tryConsume("NAME");
    var pattern = tryConsume("PATTERN");
    if (name || pattern) {
      var prefix = char || "";
      if (prefixes.indexOf(prefix) === -1) {
        path += prefix;
        prefix = "";
      }
      if (path) {
        result.push(path);
        path = "";
      }
      result.push({
        name: name || key++,
        prefix,
        suffix: "",
        pattern: pattern || safePattern(prefix),
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    var value = char || tryConsume("ESCAPED_CHAR");
    if (value) {
      path += value;
      continue;
    }
    if (path) {
      result.push(path);
      path = "";
    }
    var open = tryConsume("OPEN");
    if (open) {
      var prefix = consumeText();
      var name_1 = tryConsume("NAME") || "";
      var pattern_1 = tryConsume("PATTERN") || "";
      var suffix = consumeText();
      mustConsume("CLOSE");
      result.push({
        name: name_1 || (pattern_1 ? key++ : ""),
        pattern: name_1 && !pattern_1 ? safePattern(prefix) : pattern_1,
        prefix,
        suffix,
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    mustConsume("END");
  }
  return result;
}
__name(parse, "parse");
function match(str, options) {
  var keys = [];
  var re = pathToRegexp(str, keys, options);
  return regexpToFunction(re, keys, options);
}
__name(match, "match");
function regexpToFunction(re, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.decode, decode = _a === void 0 ? function(x) {
    return x;
  } : _a;
  return function(pathname) {
    var m = re.exec(pathname);
    if (!m)
      return false;
    var path = m[0], index = m.index;
    var params = /* @__PURE__ */ Object.create(null);
    var _loop_1 = /* @__PURE__ */ __name(function(i2) {
      if (m[i2] === void 0)
        return "continue";
      var key = keys[i2 - 1];
      if (key.modifier === "*" || key.modifier === "+") {
        params[key.name] = m[i2].split(key.prefix + key.suffix).map(function(value) {
          return decode(value, key);
        });
      } else {
        params[key.name] = decode(m[i2], key);
      }
    }, "_loop_1");
    for (var i = 1; i < m.length; i++) {
      _loop_1(i);
    }
    return { path, index, params };
  };
}
__name(regexpToFunction, "regexpToFunction");
function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
__name(escapeString, "escapeString");
function flags(options) {
  return options && options.sensitive ? "" : "i";
}
__name(flags, "flags");
function regexpToRegexp(path, keys) {
  if (!keys)
    return path;
  var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
  var index = 0;
  var execResult = groupsRegex.exec(path.source);
  while (execResult) {
    keys.push({
      // Use parenthesized substring match if available, index otherwise
      name: execResult[1] || index++,
      prefix: "",
      suffix: "",
      modifier: "",
      pattern: ""
    });
    execResult = groupsRegex.exec(path.source);
  }
  return path;
}
__name(regexpToRegexp, "regexpToRegexp");
function arrayToRegexp(paths, keys, options) {
  var parts = paths.map(function(path) {
    return pathToRegexp(path, keys, options).source;
  });
  return new RegExp("(?:".concat(parts.join("|"), ")"), flags(options));
}
__name(arrayToRegexp, "arrayToRegexp");
function stringToRegexp(path, keys, options) {
  return tokensToRegexp(parse(path, options), keys, options);
}
__name(stringToRegexp, "stringToRegexp");
function tokensToRegexp(tokens, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.strict, strict = _a === void 0 ? false : _a, _b = options.start, start = _b === void 0 ? true : _b, _c = options.end, end = _c === void 0 ? true : _c, _d = options.encode, encode = _d === void 0 ? function(x) {
    return x;
  } : _d, _e = options.delimiter, delimiter = _e === void 0 ? "/#?" : _e, _f = options.endsWith, endsWith = _f === void 0 ? "" : _f;
  var endsWithRe = "[".concat(escapeString(endsWith), "]|$");
  var delimiterRe = "[".concat(escapeString(delimiter), "]");
  var route = start ? "^" : "";
  for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
    var token = tokens_1[_i];
    if (typeof token === "string") {
      route += escapeString(encode(token));
    } else {
      var prefix = escapeString(encode(token.prefix));
      var suffix = escapeString(encode(token.suffix));
      if (token.pattern) {
        if (keys)
          keys.push(token);
        if (prefix || suffix) {
          if (token.modifier === "+" || token.modifier === "*") {
            var mod = token.modifier === "*" ? "?" : "";
            route += "(?:".concat(prefix, "((?:").concat(token.pattern, ")(?:").concat(suffix).concat(prefix, "(?:").concat(token.pattern, "))*)").concat(suffix, ")").concat(mod);
          } else {
            route += "(?:".concat(prefix, "(").concat(token.pattern, ")").concat(suffix, ")").concat(token.modifier);
          }
        } else {
          if (token.modifier === "+" || token.modifier === "*") {
            throw new TypeError('Can not repeat "'.concat(token.name, '" without a prefix and suffix'));
          }
          route += "(".concat(token.pattern, ")").concat(token.modifier);
        }
      } else {
        route += "(?:".concat(prefix).concat(suffix, ")").concat(token.modifier);
      }
    }
  }
  if (end) {
    if (!strict)
      route += "".concat(delimiterRe, "?");
    route += !options.endsWith ? "$" : "(?=".concat(endsWithRe, ")");
  } else {
    var endToken = tokens[tokens.length - 1];
    var isEndDelimited = typeof endToken === "string" ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1 : endToken === void 0;
    if (!strict) {
      route += "(?:".concat(delimiterRe, "(?=").concat(endsWithRe, "))?");
    }
    if (!isEndDelimited) {
      route += "(?=".concat(delimiterRe, "|").concat(endsWithRe, ")");
    }
  }
  return new RegExp(route, flags(options));
}
__name(tokensToRegexp, "tokensToRegexp");
function pathToRegexp(path, keys, options) {
  if (path instanceof RegExp)
    return regexpToRegexp(path, keys);
  if (Array.isArray(path))
    return arrayToRegexp(path, keys, options);
  return stringToRegexp(path, keys, options);
}
__name(pathToRegexp, "pathToRegexp");

// ../node_modules/wrangler/templates/pages-template-worker.ts
var escapeRegex = /[.+?^${}()|[\]\\]/g;
function* executeRequest(request) {
  const requestPath = new URL(request.url).pathname;
  for (const route of [...routes].reverse()) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult) {
      for (const handler of route.middlewares.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: mountMatchResult.path
        };
      }
    }
  }
  for (const route of routes) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: true
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult && route.modules.length) {
      for (const handler of route.modules.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: matchResult.path
        };
      }
      break;
    }
  }
}
__name(executeRequest, "executeRequest");
var pages_template_worker_default = {
  async fetch(originalRequest, env2, workerContext) {
    let request = originalRequest;
    const handlerIterator = executeRequest(request);
    let data = {};
    let isFailOpen = false;
    const next = /* @__PURE__ */ __name(async (input, init) => {
      if (input !== void 0) {
        let url = input;
        if (typeof input === "string") {
          url = new URL(input, request.url).toString();
        }
        request = new Request(url, init);
      }
      const result = handlerIterator.next();
      if (result.done === false) {
        const { handler, params, path } = result.value;
        const context2 = {
          request: new Request(request.clone()),
          functionPath: path,
          next,
          params,
          get data() {
            return data;
          },
          set data(value) {
            if (typeof value !== "object" || value === null) {
              throw new Error("context.data must be an object");
            }
            data = value;
          },
          env: env2,
          waitUntil: workerContext.waitUntil.bind(workerContext),
          passThroughOnException: /* @__PURE__ */ __name(() => {
            isFailOpen = true;
          }, "passThroughOnException")
        };
        const response = await handler(context2);
        if (!(response instanceof Response)) {
          throw new Error("Your Pages function should return a Response");
        }
        return cloneResponse(response);
      } else if ("ASSETS") {
        const response = await env2["ASSETS"].fetch(request);
        return cloneResponse(response);
      } else {
        const response = await fetch(request);
        return cloneResponse(response);
      }
    }, "next");
    try {
      return await next();
    } catch (error3) {
      if (isFailOpen) {
        const response = await env2["ASSETS"].fetch(request);
        return cloneResponse(response);
      }
      throw error3;
    }
  }
};
var cloneResponse = /* @__PURE__ */ __name((response) => (
  // https://fetch.spec.whatwg.org/#null-body-status
  new Response(
    [101, 204, 205, 304].includes(response.status) ? null : response.body,
    response
  )
), "cloneResponse");

// ../node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env2, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env2);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// ../node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env2, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env2);
  } catch (e) {
    const error3 = reduceError(e);
    const body = JSON.stringify(error3);
    const headers = {
      "Content-Type": "application/json",
      "MF-Experimental-Error-Stack": "true"
    };
    const encoded = encodeURIComponent(body);
    if (encoded.length <= 8192) {
      headers["MF-Experimental-Error-Stack-Payload"] = encoded;
    }
    return new Response(body, { status: 500, headers });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// ../.wrangler/tmp/bundle-N3SCEu/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = pages_template_worker_default;

// ../node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env2, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env2, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env2, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env2, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// ../.wrangler/tmp/bundle-N3SCEu/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env2, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env2, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env2, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env2, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env2, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env2, ctx) => {
      this.env = env2;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=functionsWorker-0.6446938526397706.mjs.map
