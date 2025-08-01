import { getFeatureID } from "../helpers/feature-helpers.js";
import { log } from "./logger.js";
import features from "../feature-manager.js";
import ws from "../helpers/websockets.js";

const CLIENT_ID = "RIG_PC";
const RECONNECT_DELAY = 5000; // 5 seconds

function getServerUrl() {
  try {
    const settings = JSON.parse(localStorage.getItem("iref_settings")) || {};
    return settings["voice-attack-server-url"] || "wss://localhost.robertsmania.com:7895/iRacingUI";
  } catch (error) {
    log(`❌ Failed to read VoiceAttack server URL from settings: ${error.message}`);
    return "wss://localhost.robertsmania.com:7895/iRacingUI";
  }
}

let socket = null;
let reconnectAttempts = 0;
let reconnectTimer = null;
let isConnected = false;

function sendResult(success, message) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    const result = {
      success: success,
      message: message
    };
    socket.send(JSON.stringify(result));
  }
}

function handleCommand(command, params = {}) {
  log(`🎤 VoiceAttack command received: ${command}`);
  log(`🎤 Command type: ${typeof command}, length: ${command.length}`);
  log(`🎤 Command bytes: ${Array.from(command).map(c => c.charCodeAt(0))}`);
  
  switch (command) {
    case "forfeit":
      try {
        log("🚫 Executing forfeit command via iRefined");
        ws.withdraw();
        sendResult(true, "Successfully executed forfeit command");
      } catch (error) {
        log(`❌ Forfeit command failed: ${error.message}`);
        sendResult(false, `Forfeit command failed: ${error.message}`);
      }
      break;
      
    case "register":
      try {
        log("📝 Executing register command via iRefined");
        
        // Validate required parameters
        const { season_id, car_id, car_class_id, session_id, subsession_id } = params;
        
        if (!season_id || !car_id || !car_class_id || !session_id) {
          const errorMsg = "Missing required parameters: season_id, car_id, car_class_id, and session_id are required";
          log(`❌ Register command failed: ${errorMsg}`);
          sendResult(false, errorMsg);
          return;
        }
        
        // Get season name from irefIndex if available
        const seasonName = window.irefIndex && window.irefIndex[season_id] 
          ? window.irefIndex[season_id] 
          : `Series ${season_id}`;
        
        log(`📝 Registering for ${seasonName} with car_id: ${car_id}, car_class_id: ${car_class_id}, session_id: ${session_id}`);
        
        // Call the registration function
        ws.register(
          seasonName,
          parseInt(car_id),
          parseInt(car_class_id),
          parseInt(session_id),
          subsession_id ? parseInt(subsession_id) : null
        );
        
        sendResult(true, `Successfully registered for ${seasonName}`);
      } catch (error) {
        log(`❌ Register command failed: ${error.message}`);
        sendResult(false, `Register command failed: ${error.message}`);
      }
      break;
      
    default:
      log(`❌ Unknown command: ${command}`);
      sendResult(false, `Unknown command: ${command}`);
      break;
  }
}

function connect() {
  try {
    const serverUrl = getServerUrl();
    log(`🔌 Connecting to VoiceAttack server at ${serverUrl}`);
    
    socket = new WebSocket(serverUrl);
    
    socket.onopen = function(event) {
      log("✅ Connected to VoiceAttack server");
      isConnected = true;
      reconnectAttempts = 0;
      
      // Send client identification
      socket.send(CLIENT_ID);
    };
    
    socket.onmessage = function(event) {
      try {
        log(`🎤 Raw message received: ${event.data}`);
        const data = JSON.parse(event.data);
        log(`🎤 Parsed data: ${JSON.stringify(data)}`);
        if (data.command) {
          // Handle both simple command format and command with parameters
          const params = data.parameters || {};
          handleCommand(data.command, params);
        } else {
          log(`❌ Invalid message format: ${event.data}`);
        }
      } catch (error) {
        log(`❌ Failed to parse message: ${error.message}`);
      }
    };
    
    socket.onclose = function(event) {
      log("🔌 Disconnected from VoiceAttack server");
      isConnected = false;
      
      // Attempt to reconnect indefinitely
      reconnectAttempts++;
      log(`🔄 Reconnecting in ${RECONNECT_DELAY/1000} seconds (attempt ${reconnectAttempts})`);
      reconnectTimer = setTimeout(connect, RECONNECT_DELAY);
    };
    
    socket.onerror = function(error) {
      log(`❌ WebSocket error: ${error.message || 'Unknown error'}`);
    };
    
  } catch (error) {
    log(`❌ Failed to create WebSocket connection: ${error.message}`);
    isConnected = false;
  }
}

function disconnect() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  
  if (socket) {
    socket.close();
    socket = null;
  }
  
  isConnected = false;
  reconnectAttempts = 0;
}

async function init(activate = true) {
  console.log(`🎤 VoiceAttack client init called with activate=${activate}`);
  
  // Log to iRefined's logging system
  log(`🎤 VoiceAttack client initialized - Status: ${activate ? 'ENABLED' : 'DISABLED'}`);
  
  if (!activate) {
    console.log("🎤 VoiceAttack client init: feature disabled, disconnecting");
    disconnect();
    return;
  }
  
  console.log("🎤 VoiceAttack client init: feature enabled, initializing");
  log("🎤 VoiceAttack client feature initialized");
  connect();
}

const id = getFeatureID(import.meta.url);
const bodyClass = "iref-" + id;

console.log("🎤 VoiceAttack client module loaded - feature ID:", id);
console.log("🎤 VoiceAttack client module - about to register with feature manager");

features.add(id, false, null, bodyClass, init);

console.log("🎤 VoiceAttack client module - registered with feature manager"); 