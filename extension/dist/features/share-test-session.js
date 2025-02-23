import { getFeatureID as g } from "../helpers/feature-helpers.js";
import w from "../feature-manager.js";
import { findState as S } from "../helpers/react-resolver.js";
import s from "../node_modules/dom-chef/index.js";
import { $ as i } from "../node_modules/select-dom/index.js";
const r = "#test-drive-modal";
async function h(l = !0) {
  if (!l)
    return;
  const t = S(i(r), 1), d = () => new Promise((a) => {
    const e = document.createElement("input");
    e.setAttribute("type", "file"), e.setAttribute("accept", ".json"), e.addEventListener(
      "change",
      async (n) => {
        const { files: o } = n.target;
        if (!o)
          return;
        const b = [...o].map((y) => y.text());
        a(await Promise.all(b));
      },
      !1
    ), e.click();
  }), m = async () => {
    const a = await d();
    t.setState(JSON.parse(a[0]));
  };
  function p(a, e) {
    const n = document.createElement("a"), o = e.split(".").pop();
    n.href = URL.createObjectURL(new Blob([a], { type: `text/${o === "txt" ? "plain" : o}` })), n.download = e, n.click();
  }
  const u = async () => {
    const a = {
      carId: t.state.carId,
      carClassId: t.state.carClassId,
      climateChange: t.state.climateChange,
      damageModel: t.state.damageModel,
      timeOfDay: t.state.timeOfDay,
      trackId: t.state.trackId,
      trackState: t.state.trackState,
      weather: t.state.weather
    }, n = (/* @__PURE__ */ new Date()).toISOString().substring(0, 10);
    p(JSON.stringify(a), `testing-conditions-${n}.json`);
  }, f = /* @__PURE__ */ s.createElement("div", { style: { display: "inline" } }, /* @__PURE__ */ s.createElement("button", { id: "upload-button", onClick: m, class: "btn btn-sm btn-primary pull-xs-left" }, "Upload"), /* @__PURE__ */ s.createElement("button", { id: "download-button", onClick: u, class: "btn btn-sm btn-primary pull-xs-left" }, "Download"));
  i(r).querySelector(".modal-footer > .centered-horizontal").prepend(f);
}
const c = g(import.meta.url), k = "iref-" + c;
w.add(c, !0, r, k, h);
//# sourceMappingURL=share-test-session.js.map
