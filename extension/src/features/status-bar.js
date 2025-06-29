import { getFeatureID } from "../helpers/feature-helpers.js";
import features from "../feature-manager.js";
import { $ } from "select-dom";
import "./status-bar.css";

const selector = "body";

const barContainer = document.createElement("div");
barContainer.id = "iref-bar";

export function statusBar(message) {
  let logLine = document.createElement("div");
  let date = new Date();
  let time = date.toTimeString().split(" ")[0];
  logLine.style.cssText = "margin-bottom: 5px;";
  logLine.innerHTML = "<span>" + time + "</span> - " + message;
  logContainer.appendChild(logLine);
  logContainer.scrollTop = logContainer.scrollHeight;
}

let appended = false;

async function init(activate = true) {
  if (!appended) {
    document.body.appendChild(barContainer);
    appended = true;
  }
}

const id = getFeatureID(import.meta.url);
const bodyClass = "iref-" + id;

features.add(id, true, selector, bodyClass, init);
