function e(t, n = 0, s = "props") {
  if (!t)
    return null;
  const i = Object.keys(t).find((a) => a.startsWith("__reactInternalInstance"));
  t = t[i];
  let r = [];
  for (; r.length <= n && ("stateNode" in t && t.stateNode && s in t.stateNode && r.push(t.stateNode), "return" in t && t.return); )
    t = t.return;
  return r[n] || null;
}
function u(t, n = 0) {
  return e(t, n, "state").state;
}
function o(t, n = 0) {
  return e(t, n).props;
}
export {
  o as findProps,
  e as findReact,
  u as findState
};
//# sourceMappingURL=react-resolver.js.map
