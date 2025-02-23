import { getFeatureID as m } from "../helpers/feature-helpers.js";
import { log as t } from "./logger.js";
import a from "../feature-manager.js";
import { findProps as s } from "../helpers/react-resolver.js";
import g from "../helpers/websockets.js";
import { $ as n } from "../node_modules/select-dom/index.js";
const r = ".css-77mr2t .btn-danger";
let o;
async function p(u = !0) {
  if (!u)
    return;
  let e = JSON.parse(localStorage.getItem("iref_settings"))["auto-forfeit-m"] || 13;
  o = s(n(r)).registrationStatus.subsession_id, t(`🛑 Forfeit button seen, beginning ${e} minute countdown.`), setTimeout(() => {
    const i = s(n(r));
    if (!i) {
      t("🛑 Forfeit button not available.");
      return;
    }
    if (i.simStatus.status !== "Sim Running") {
      t("🛑 Sim not running, skipping forfeit.");
      return;
    }
    if (o !== i.registrationStatus.subsession_id) {
      t("🛑 Session changed, skipping forfeit.");
      return;
    }
    t(`🛑 Forfeiting session ${o}`), g.withdraw();
  }, e * 1e3 * 60);
}
const f = m(import.meta.url), c = "iref-" + f;
a.add(f, !0, r, c, p);
//# sourceMappingURL=auto-forfeit.js.map
