import { getFeatureID } from '../helpers/feature-helpers.js';
import features from '../feature-manager.js';
import { findReact } from '../helpers/react-resolver.js';
import './share-hosted-session.css';
import React from 'dom-chef';
import { $ } from 'select-dom';

const selector = '#create-race-modal';

async function initHostedSession(activate = true) {

    if (!activate) {
        return;
    }

    const modalState = findReact($(selector), 1, "state");

    const getJsonUpload = () =>
        new Promise(resolve => {
            const inputFileElement = document.createElement('input')
            inputFileElement.setAttribute('type', 'file')
            inputFileElement.setAttribute('accept', '.json')

            inputFileElement.addEventListener(
                'change',
                async (event) => {
                    const { files } = event.target
                    if (!files) {
                        return
                    }

                    const filePromises = [...files].map(file => file.text())

                    resolve(await Promise.all(filePromises))
                },
                false,
            )
            inputFileElement.click()
        })

    const handleUpload = async () => {
        const json = await getJsonUpload();
        modalState.setState(JSON.parse(json[0]));
    }

    function getJsonDownload(text, name) {
        const a = document.createElement('a');
        const type = name.split(".").pop();
        a.href = URL.createObjectURL(new Blob([text], { type: `text/${type === "txt" ? "plain" : type}` }));
        a.download = name;
        a.click();
    }

    const handleDownload = async () => {
        const sessionVars = {
            session: modalState.state.session
        }

        // Clean up session
        delete sessionVars.session.admins;
        delete sessionVars.session.farm;
        delete sessionVars.session.league_id;
        delete sessionVars.session.league_season_id;
        delete sessionVars.session.order_id;
        delete sessionVars.session.private_session_id;
        delete sessionVars.session.source;

        const date = new Date();
        const dateString = date.toISOString().substring(0, 10);
        getJsonDownload(JSON.stringify(sessionVars), `hosted-session-${dateString}.json`);
    }

    const buttonEl = (
        <div class="iref-hosted-buttons" style={{display: "inline"}}>
            <button id="upload-button" onClick={handleUpload} class="btn btn-sm btn-primary pull-xs-left">
                Upload
            </button>
            <button id="download-button" onClick={handleDownload} class="btn btn-sm btn-primary pull-xs-left">
                Download
            </button>
        </div>
    );

    $(selector).querySelector('.modal-footer .centered-horizontal').prepend(buttonEl);

}

const id = getFeatureID(import.meta.url);
const bodyClass = 'iref-' + id;

features.add(id, true, selector, bodyClass, initHostedSession);
