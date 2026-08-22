const routes = [];
let notFoundHandler = () => {};
let guard = null;

export function setGuard(fn) {
  guard = fn;
}

export function addRoute(pattern, handler) {
  const paramNames = [];
  const regexStr = pattern.replace(/:[^/]+/g, (match) => {
    paramNames.push(match.slice(1));
    return '([^/]+)';
  });
  routes.push({ regex: new RegExp('^' + regexStr + '$'), paramNames, handler });
}

export function setNotFound(handler) {
  notFoundHandler = handler;
}

function currentPath() {
  const hash = window.location.hash || '#/';
  const path = hash.slice(1);
  return path === '' ? '/' : path;
}

export function resolve(path) {
  for (const route of routes) {
    const match = path.match(route.regex);
    if (match) {
      const params = {};
      route.paramNames.forEach((name, i) => {
        params[name] = decodeURIComponent(match[i + 1]);
      });
      return { handler: route.handler, params };
    }
  }
  return null;
}

function handle() {
  const path = currentPath();
  if (guard) {
    const redirect = guard(path);
    if (redirect && redirect !== path) {
      navigate(redirect);
      return;
    }
  }
  const matched = resolve(path);
  if (matched) {
    matched.handler(matched.params, path);
  } else {
    notFoundHandler(path);
  }
}

export function start() {
  window.addEventListener('hashchange', handle);
  handle();
}

export function navigate(path) {
  window.location.hash = '#' + path;
}

export function currentRoutePath() {
  return currentPath();
}
