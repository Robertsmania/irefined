import { getFeatureID as c } from "../helpers/feature-helpers.js";
import f from "../feature-manager.js";
import { findProps as u } from "../helpers/react-resolver.js";
import { $ as m } from "../node_modules/select-dom/index.js";
/* empty css                       */
const n = ".css-77mr2t .btn-success";
let i = 0;
const o = {
  0: "Race",
  2: "👀 Spectate",
  4: "📣 Spot"
};
async function p(l = !0) {
  if (!l) {
    clearInterval(i);
    return;
  }
  i = setInterval(() => {
    let t = m(n);
    if (t.classList.contains("iref-seen"))
      return;
    t.classList.add("iref-seen");
    const e = u(t);
    let r = "", s = "";
    e.registrationStatus.user_role !== 0 ? o[e.registrationStatus.user_role] !== void 0 && (r = o[e.registrationStatus.user_role]) : (e.registrationStatus.event_type === 5 ? s = " Race" : s = " Practice", e.registrationStatus.will_be_scored ? r = "Official" : r = "Unofficial"), t.innerHTML = (s ? "✨ Join " : "") + r + s;
  }, 300);
}
const a = c(import.meta.url), d = "iref-" + a;
f.add(a, !0, n, d, p);
//# sourceMappingURL=better-join-button.js.map
