import { getFeatureID } from '../helpers/feature-helpers.js';
import features from '../feature-manager.js';
import './no-sidebars.css';

const id = getFeatureID(import.meta.url);

const selector = '#rightbar';

const bodyClass = 'iref-' + id;

features.add(id, true, selector, bodyClass);
