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
  let isoTime =
    new Date(queueItem.start_time).toISOString().split(".")[0] + "Z";

  if (session.season_id === queueItem.season_id) {
    if (
      session.season_id === queueItem.season_id &&
      session.event_type === 5 &&
      session.start_time === isoTime &&
      session.session_id > 0
    ) {
      log(
        `📝 Race session for series ${queueItem.season_id}, start ${isoTime} found in data.`
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

  let selectedCar = JSON.parse(
    localStorage.getItem(`selected_car_season_${sessionProps.contentId}`)
  );

  if (!selectedCar && !$(".alice-carousel")) {
    const singleCarEl = $(".css-m35ghn > .css-0");

    const reactPropsKey = Object.keys(singleCarEl).find((key) =>
      key.startsWith("__reactProps")
    );

    if (reactPropsKey) {
      selectedCar = {
        car_id: singleCarEl[reactPropsKey].children.props.cars[0].car_id,
        car_class_id: singleCarEl[reactPropsKey].children.props.carClassIds[0],
      };
    }
  }

  console.log(selectedCar);

  if (!selectedCar) {
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
    car_id: selectedCar.car_id,
    car_class_id: selectedCar.car_class_id,
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
