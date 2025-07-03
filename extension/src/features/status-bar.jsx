import { getFeatureID } from "../helpers/feature-helpers.js";
import features from "../feature-manager.js";
import { $ } from "select-dom";
import React from "dom-chef";
import "./status-bar.css";
import logo from "../assets/logo.png";

const selector = "body";

const barContainerEl = (
  <div id="iref-bar">
    <div className="iref-bar-left">
      <div className="iref-logo">
        <img src={logo} />
      </div>
      <div className="iref-queue-items"></div>
    </div>
    <div className="iref-bar-right">
      <div className="iref-status"></div>
    </div>
  </div>
);

function formatCountdown(targetTime) {
  const now = new Date();
  const target = new Date(targetTime);
  const diff = target - now;

  if (diff <= 0) {
    return "Started";
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
}

setInterval(() => {
  const queueItemsContainer = barContainerEl.querySelector(".iref-queue-items");
  queueItemsContainer.innerHTML = "";

  if (window.watchQueue && window.watchQueue.length > 0) {
    const sortedQueue = [...window.watchQueue].sort(
      (a, b) => new Date(a.start_time) - new Date(b.start_time)
    );

    sortedQueue.forEach((item) => {
      const itemEl = (
        <div className="iref-queue-item">
          <button
            className="iref-remove-btn"
            onClick={() => {
              if (window.watchQueue) {
                window.watchQueue = window.watchQueue.filter((q) => q !== item);
              }
            }}
            style={{
              marginRight: "5px",
              color: "var(--iref-bar-highlight)",
            }}
          >
            ×
          </button>
          {item.season_name} - {formatCountdown(item.start_time)}
        </div>
      );
      queueItemsContainer.appendChild(itemEl);
    });
  }
}, 1000);

let appended = false;

async function init(activate = true) {
  if (!appended) {
    document.body.appendChild(barContainerEl);
    appended = true;
  }
}

const id = getFeatureID(import.meta.url);
const bodyClass = "iref-" + id;

features.add(id, true, selector, bodyClass, init);
