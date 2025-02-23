import { getFeatureID as f } from "../helpers/feature-helpers.js";
import { log as i } from "./logger.js";
import _ from "../feature-manager.js";
import { findProps as m, findState as u } from "../helpers/react-resolver.js";
import { $$ as p, $ as h } from "../node_modules/select-dom/index.js";
import o from "../helpers/websockets.js";
/* empty css                  */
const g = "#season-modal-sessions";
let c = 0, r = [];
function n(t, s) {
  let e = new Date(t.start_time).toISOString().split(".")[0] + "Z";
  t.season_id === s.season_id && t.season_id === s.season_id && t.event_type === 5 && t.start_time === e && t.session_id > 0 && (i(`📝 Race session for series ${s.season_id}, start ${e} found in data.`), r = r.filter((a) => a.start_time !== s.start_time), o.withdraw(), setTimeout(() => {
    o.register(s.car_id, s.car_class_id, t.session_id);
  }, 5e3));
}
const T = (t) => {
  r.forEach((s) => {
    try {
      t.data.delta.INSERT.forEach((e) => {
        n(e, s);
      });
    } catch {
    }
    try {
      t.data.delta.REGISTRATION.forEach((e) => {
        n(e, s);
      });
    } catch {
    }
  });
};
o.callbacks.push(T);
function S(t) {
  const s = parseInt(t.target.id.replace(/[^0-9]/g, "")), e = m(t.target), a = u(h("#season-modal"), 1);
  if (!a.carClassId || !a.selectedCar.car_id) {
    i("🚫 No car selected."), t.target.innerHTML = "Select Car", setTimeout(() => {
      t.target.innerHTML = "Queue";
    }, 3e3);
    return;
  }
  if (r.find((l) => l.session_start === s)) {
    i(`📝 Session ${s} already in queue.`);
    return;
  }
  r.push({ start_time: s, season_id: e.contentId, car_id: a.selectedCar.car_id, car_class_id: a.carClassId }), i(`📝 Added session ${s} for series ${e.contentId} to queue.`), t.target.classList.add("disabled");
}
async function $(t = !0) {
  if (!t) {
    clearInterval(c);
    return;
  }
  c = setInterval(() => {
    let s = p("a.btn-success.disabled");
    s && s.forEach((e) => {
      e.classList.add("iref-queue-btn"), e.classList.remove("disabled", "btn-success"), e.innerHTML = "Queue", e.addEventListener("click", S);
    });
  }, 300);
}
const d = f(import.meta.url), b = "iref-" + d;
_.add(d, !0, g, b, $);
//# sourceMappingURL=auto-register.js.map
