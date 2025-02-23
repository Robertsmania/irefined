import { log as f } from "./features/logger.js";
import u from "./helpers/dom-observer.js";
let r = [];
async function a(e, t, o, l, s = null) {
  r.push({ id: e, observer: t, selector: o, bodyClass: l, callback: s });
  const i = JSON.parse(localStorage.getItem("iref_settings"));
  let n = !1;
  i && i[e] === !0 || e === "settings-panel" ? (f(`✅ Enabled feature: ${e}`), n = !0) : f(`❌ Disabled feature: ${e}`), t ? u(e, o, l, s, n) : s && s(n);
}
async function p() {
  r.forEach((e) => {
    r = r.filter((t) => t.id !== e.id), a(e.id, e.observer, e.selector, e.bodyClass, e.callback);
  });
}
const m = {
  add: a,
  rerunAll: p
};
export {
  m as default
};
//# sourceMappingURL=feature-manager.js.map
