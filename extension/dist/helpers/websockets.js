import { io as a } from "../node_modules/socket.io-client/build/esm/index.js";
import { log as n } from "../features/logger.js";
import d from "../node_modules/uuid/dist/esm-browser/v4.js";
let l = setInterval(() => {
  SENTRY_RELEASE && (clearInterval(l), g());
}, 1e3), s, m = [];
function g() {
  const t = SENTRY_RELEASE.id.substring(0, SENTRY_RELEASE.id.indexOf("-")), e = a("https://members-ng.iracing.com", {
    reconnectionAttempts: 100,
    auth: {
      clientVersion: t
    },
    transports: ["websocket"]
  });
  s = a("https://members-ng.iracing.com/client.io", {
    reconnectionAttempts: 100,
    auth: {
      clientVersion: t
    },
    transports: ["websocket"]
  }), e.on("connect", () => {
    n("⚡ Connected to iRacing WS");
  }), e.on("disconnect", () => {
    n("⛓️‍💥 Disconnected from iRacing WS");
  }), s.on("initialized", (i) => {
    e.emit("now"), s.emit(
      "data_services",
      {
        refid: d(),
        service: "season",
        method: "popular_sessions",
        args: {
          include_empty_practice: !1,
          subscribe: !0
        }
      }
    );
  }), e.on("heartbeat", (i) => i()), s.on("data_services_push", (i) => {
    m.forEach((r) => {
      r(i);
    });
  });
}
function o(t, e) {
  e.refid = d(), s.emit(t, e);
}
function f() {
  n("🚫 Withdrawing from session if registered."), o(
    "data_services",
    {
      service: "registration",
      method: "withdraw",
      args: {}
    }
  );
}
function u(t, e, i, r = null) {
  n(`📝 Registering for session ${i} as driver with car ${t}`);
  const c = {
    service: "registration",
    method: "register",
    args: {
      register_as: "driver",
      car_id: t,
      car_class_id: e,
      session_id: i
    }
  };
  r && (c.args.subsession_id = r), o("data_services", c);
}
const E = {
  send: o,
  register: u,
  withdraw: f,
  callbacks: m
};
export {
  E as default
};
//# sourceMappingURL=websockets.js.map
