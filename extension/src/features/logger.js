import { getFeatureID } from '../helpers/feature-helpers.js';
import features from '../feature-manager.js';
import { $ } from 'select-dom';
import './logger.css'

const selector = 'body';

const logContainer = document.createElement('div');
logContainer.id = 'iref-log';
logContainer.style.display = 'none';

export function log(message) {

    let logLine = document.createElement('div');
    let date = new Date();
    let time = date.toTimeString().split(' ')[0];
    logLine.style.cssText = 'margin-bottom: 5px;';
    logLine.innerHTML = '<span>' + time + '</span> - ' + message;
    logContainer.appendChild(logLine);
    logContainer.scrollTop = logContainer.scrollHeight;

}

let appended = false;

async function init(activate = true) {

    if (!activate) {
        $('#iref-log').style.display = 'none';
        return;
    }

    if (!appended) {
        document.body.appendChild(logContainer);
        appended = true;
    }

    $('#iref-log').style.display = 'block';

}

const id = getFeatureID(import.meta.url);
const bodyClass = 'iref-' + id;

features.add(id, true, selector, bodyClass, init);
