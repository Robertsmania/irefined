import { io } from "socket.io-client";
import { v4 } from "uuid";
import { log } from "../features/logger.js";

let wsInitCheck = setInterval(() => {
  if (SENTRY_RELEASE) {
    clearInterval(wsInitCheck);
    initWS();
  }
}, 1000);

let clientSocket;
let callbacks = [];

function initWS() {
  const irVersion = SENTRY_RELEASE.id.substring(
    0,
    SENTRY_RELEASE.id.indexOf("-")
  );

  const authSocket = io("https://members-ng.iracing.com", {
    reconnectionAttempts: 100,
    auth: {
      clientVersion: irVersion,
    },
    transports: ["websocket"],
  });

  clientSocket = io("https://members-ng.iracing.com/client.io", {
    reconnectionAttempts: 100,
    auth: {
      clientVersion: irVersion,
    },
    transports: ["websocket"],
  });

  authSocket.on("connect", () => {
    log("⚡ Connected to iRacing WS");
  });

  authSocket.on("disconnect", () => {
    log("⛓️‍💥 Disconnected from iRacing WS");
  });

  clientSocket.on("initialized", (data) => {
    authSocket.emit("now");

    clientSocket.emit("data_services", {
      refid: v4(),
      service: "season",
      method: "popular_sessions",
      args: {
        include_empty_practice: false,
        subscribe: true,
      },
    });
  });

  authSocket.on("heartbeat", (data) => {
    return data();
  });

  clientSocket.on("data_services_push", (data) => {
    callbacks.forEach((callback) => {
      callback(data);
    });
  });
}

function send(event, data) {
  data.refid = v4();
  clientSocket.emit(event, data);
}

function withdraw() {
  log("🚫 Withdrawing from current session");
  send("data_services", {
    service: "registration",
    method: "withdraw",
    args: {},
  });
}

function register(
  session_name,
  car_id,
  car_class_id,
  session_id,
  subsession_id = null
) {
  log(`📝 Registering for ${session_name}`);

  const data = {
    service: "registration",
    method: "register",
    args: {
      register_as: "driver",
      car_id: car_id,
      car_class_id: car_class_id,
      session_id: session_id,
    },
  };

  if (subsession_id) {
    data.args.subsession_id = subsession_id;
  }

  send("data_services", data);
}

const ws = {
  send,
  register,
  withdraw,
  callbacks,
};

export default ws;
