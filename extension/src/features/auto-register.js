import { getFeatureID } from "../helpers/feature-helpers.js";
import { log } from "./logger.js";
import features from "../feature-manager.js";
import { findProps, findState } from "../helpers/react-resolver.js";
import { $, $$ } from "select-dom";
import ws from "../helpers/websockets.js";
import "./auto-register.css";

const selector = 'a.active[href*="go-racing"]';
let persistInterval = 0;

let watchQueue = [];

function checkSession(session, queueItem) {
  if (session.season_id === queueItem.season_id) {
    if (
      session.season_id === queueItem.season_id &&
      session.event_type === 5 &&
      session.start_time === queueItem.start_time &&
      session.session_id > 0
    ) {
      log(
        `📝 Race session for series ${queueItem.season_id}, start ${queueItem.start_time} found in data.`
      );
      watchQueue = watchQueue.filter(
        (item) => item.start_time !== queueItem.start_time
      );

      ws.withdraw();

      setTimeout(() => {
        ws.register(
          queueItem.car_id,
          queueItem.car_class_id,
          session.session_id
        );
      }, 5000);
    }
  }
}

const wsCallback = (data) => {
  // loop watchQueue
  watchQueue.forEach((queueItem) => {
    try {
      data.data.delta.INSERT.forEach((session) => {
        checkSession(session, queueItem);
      });
    } catch {}

    try {
      data.data.delta.REGISTRATION.forEach((session) => {
        checkSession(session, queueItem);
      });
    } catch {}
  });
};

ws.callbacks.push(wsCallback);

function addToQueue(e) {
  const sessionProps = findProps(e.target);

  const timestamp = sessionProps.session.start_time;

  if (!sessionProps.preselectedCarId) {
    log(`🚫 No car selected.`);
    e.target.innerHTML = "Select Car";
    setTimeout(() => {
      e.target.innerHTML = "Queue";
    }, 3000);

    return;
  }

  // check if session is already in queue
  if (watchQueue.find((session) => session.session_start === timestamp)) {
    log(`📝 Session ${timestamp} already in queue.`);
    return;
  }

  watchQueue.push({
    start_time: timestamp,
    season_id: sessionProps.contentId,
    car_id: sessionProps.preselectedCarId,
    car_class_id: 0, // fix me
  });

  log(
    `📝 Added session ${timestamp} for series ${sessionProps.contentId} to queue.`
  );

  e.target.classList.add("disabled");
}

async function init(activate = true) {
  if (!activate) {
    clearInterval(persistInterval);
    return;
  }

  persistInterval = setInterval(() => {
    let buttons = $$("a.btn-success.disabled");

    if (!buttons) {
      return;
    }

    buttons.forEach((button) => {
      button.classList.add("iref-queue-btn");
      button.classList.remove("disabled", "btn-success");
      button.innerHTML = "Queue";
      button.addEventListener("click", addToQueue);
    });
  }, 300);
}

const id = getFeatureID(import.meta.url);
const bodyClass = "iref-" + id;

features.add(id, true, selector, bodyClass, init);
