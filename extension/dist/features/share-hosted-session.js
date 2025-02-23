import { getFeatureID as g } from "../helpers/feature-helpers.js";
import w from "../feature-manager.js";
import { findState as S } from "../helpers/react-resolver.js";
/* empty css                         */
import o from "../node_modules/dom-chef/index.js";
import { $ as l } from "../node_modules/select-dom/index.js";
const i = "#create-race-modal";
async function E(c = !0) {
  if (!c)
    return;
  const a = S(l(i), 1), d = () => new Promise((e) => {
    const t = document.createElement("input");
    t.setAttribute("type", "file"), t.setAttribute("accept", ".json"), t.addEventListener(
      "change",
      async (s) => {
        const { files: n } = s.target;
        if (!n)
          return;
        const b = [...n].map((y) => y.text());
        e(await Promise.all(b));
      },
      !1
    ), t.click();
  }), m = async () => {
    const e = await d();
    a.setState(JSON.parse(e[0]));
  };
  function p(e, t) {
    const s = document.createElement("a"), n = t.split(".").pop();
    s.href = URL.createObjectURL(new Blob([e], { type: `text/${n === "txt" ? "plain" : n}` })), s.download = t, s.click();
  }
  const u = async () => {
    const e = {
      session: a.state.session
    };
    delete e.session.admins, delete e.session.farm, delete e.session.league_id, delete e.session.league_season_id, delete e.session.order_id, delete e.session.private_session_id, delete e.session.source;
    const s = (/* @__PURE__ */ new Date()).toISOString().substring(0, 10);
    p(JSON.stringify(e), `hosted-session-${s}.json`);
  }, f = /* @__PURE__ */ o.createElement("div", { class: "iref-hosted-buttons", style: { display: "inline" } }, /* @__PURE__ */ o.createElement("button", { id: "upload-button", onClick: m, class: "btn btn-sm btn-primary pull-xs-left" }, "Upload"), /* @__PURE__ */ o.createElement("button", { id: "download-button", onClick: u, class: "btn btn-sm btn-primary pull-xs-left" }, "Download"));
  l(i).querySelector(".modal-footer .centered-horizontal").prepend(f);
}
const r = g(import.meta.url), h = "iref-" + r;
w.add(r, !0, i, h, E);
//# sourceMappingURL=share-hosted-session.js.map
