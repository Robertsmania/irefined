import { getFeatureID as c } from "../helpers/feature-helpers.js";
import { log as s } from "./logger.js";
import u from "../feature-manager.js";
import { findProps as f } from "../helpers/react-resolver.js";
import { $ as r } from "../node_modules/select-dom/index.js";
const o = ".css-77mr2t .btn-success";
let t;
async function l(a = !0) {
  if (!a)
    return;
  let i = JSON.parse(localStorage.getItem("iref_settings"))["auto-join-type"] || "race";
  const e = f(r(o));
  e.registrationStatus.subsession_id !== t ? (t = e.registrationStatus.subsession_id, i !== "race" || i === "race" && e.registrationStatus.event_type === 5 && e.registrationStatus.will_be_scored ? (s(`🏁 Auto joined session: ${t}`), r(o).click()) : s(`⛔ Not joining unofficial session: ${t}`)) : s(`⛔ Already processed auto join for: ${t}`);
}
const n = c(import.meta.url), m = "iref-" + n;
u.add(n, !0, o, m, l);
//# sourceMappingURL=auto-join.js.map
