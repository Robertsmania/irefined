import { getFeatureID as c } from "../helpers/feature-helpers.js";
import { log as s } from "./logger.js";
import u from "../feature-manager.js";
import { findProps as l } from "../helpers/react-resolver.js";
import { $ as i } from "../node_modules/select-dom/index.js";
const o = ".css-77mr2t .btn-success";
let t;
async function f(a = !0) {
  if (!a)
    return;
  let r = JSON.parse(localStorage.getItem("iref_settings"))["auto-join-type"] || "race";
  const e = l(i(o));
  e.registrationStatus.subsession_id !== t ? (t = e.registrationStatus.subsession_id, r !== "race" || r === "race" && e.registrationStatus.event_type === 5 && e.registrationStatus.will_be_scored ? (s(`🏁 Auto joined session: ${t}`), i(o).click()) : s(`⛔ Not joining non-race session: ${t}`)) : s(`⛔ Already processed auto join for: ${t}`);
}
const n = c(import.meta.url), m = "iref-" + n;
u.add(n, !0, o, m, f);
//# sourceMappingURL=auto-join.js.map
