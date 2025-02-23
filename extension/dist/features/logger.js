import { getFeatureID as s } from "../helpers/feature-helpers.js";
import d from "../feature-manager.js";
import { $ as i } from "../node_modules/select-dom/index.js";
/* empty css           */
const a = "body", e = document.createElement("div");
e.id = "iref-log";
e.style.display = "none";
function b(t) {
  let o = document.createElement("div"), r = (/* @__PURE__ */ new Date()).toTimeString().split(" ")[0];
  o.style.cssText = "margin-bottom: 5px;", o.innerHTML = "<span>" + r + "</span> - " + t, e.appendChild(o), e.scrollTop = e.scrollHeight;
}
let n = !1;
async function p(t = !0) {
  if (!t) {
    i("#iref-log").style.display = "none";
    return;
  }
  n || (document.body.appendChild(e), n = !0), i("#iref-log").style.display = "block";
}
const l = s(import.meta.url), m = "iref-" + l;
d.add(l, !0, a, m, p);
export {
  b as log
};
//# sourceMappingURL=logger.js.map
