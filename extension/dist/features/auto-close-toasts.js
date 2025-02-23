import { getFeatureID as n } from "../helpers/feature-helpers.js";
import l from "../feature-manager.js";
import { $ as c } from "../node_modules/select-dom/index.js";
import { log as m } from "./logger.js";
const o = '.chakra-toast button[aria-label="Close"]:not(.iref-seen)';
async function f(s = !0) {
  if (!s)
    return;
  let e = JSON.parse(localStorage.getItem("iref_settings"))["toast-timeout-s"] || 5, t = c(o);
  t.classList.add("iref-seen"), m("✖️ Closing toast after " + e + " seconds"), setTimeout(() => {
    let a = Object.keys(t).find((i) => i.startsWith("__reactEventHandlers"));
    t[a].onClick();
  }, e * 1e3);
}
const r = n(import.meta.url), u = "iref-" + r;
l.add(r, !0, o, u, f);
//# sourceMappingURL=auto-close-toasts.js.map
