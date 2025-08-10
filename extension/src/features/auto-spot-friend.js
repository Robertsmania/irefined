import { getFeatureID } from "../helpers/feature-helpers.js";
import features from "../feature-manager.js";
import { log } from "./logger.js";
import { findProps } from "../helpers/react-resolver.js";

let checkInterval = null;
let isIRacingConnected = false;
let settingsChangeListener = null;

// Configuration
const FRIENDS_LIST_SELECTOR = "#friends-wrapper";
const FRIEND_ENTRY_SELECTOR = ".btn-group.btn-block";

function isSimRunning() {
  try {
    const regBar = document.querySelector("#scroll > .css-c980m3");
    if (!regBar) {
      return false;
    }
    
    const regBarProps = findProps(regBar);
    if (!regBarProps?.simStatus?.status) {
      return false;
    }
    
    const status = regBarProps.simStatus.status;
    const isActive = status === "Sim Running" || status.startsWith("Sim Loading");
    
    if (isActive) {
      log(`🏁 Sim is ${status === "Sim Running" ? "running" : "loading"}, skipping auto-spot check`);
    }
    
    return isActive;
  } catch (error) {
    log(`⚠️ Error checking sim status: ${error.message}`);
    return false;
  }
}

async function init(activate = true) {
  if (!activate) {
    cleanup();
    return;
  }

  log("👀 Auto-spot friend feature initialized");
  setupIRacingConnectionListener();
  setupSettingsChangeListener();
}

function setupSettingsChangeListener() {
  // Remove existing listener if any
  if (settingsChangeListener) {
    window.removeEventListener('storage', settingsChangeListener);
  }
  
  // Create new listener for settings changes
  settingsChangeListener = (event) => {
    if (event.key === 'iref_settings') {
      try {
        const newSettings = JSON.parse(event.newValue || '{}');
        const isEnabled = newSettings['auto-spot-friend'];
        
        if (!isEnabled && isIRacingConnected) {
          log("🔧 Auto-spot friend disabled by user - stopping monitoring");
          stopMonitoring();
        } else if (isEnabled && isIRacingConnected && !checkInterval) {
          log("🔧 Auto-spot friend enabled by user - starting monitoring");
          startMonitoring();
        }
      } catch (error) {
        log(`⚠️ Error processing settings change: ${error.message}`);
      }
    }
  };
  
  window.addEventListener('storage', settingsChangeListener);
}

function startMonitoring() {
  if (!isIRacingConnected) {
    log("⏳ Waiting for iRacing connection before starting monitoring...");
    return;
  }
  
  // Check if feature is still enabled before starting
  const settings = JSON.parse(localStorage.getItem('iref_settings') || '{}');
  if (!settings['auto-spot-friend']) {
    log("🔧 Feature disabled - not starting monitoring");
    return;
  }
  
  // Get interval from settings
  const intervalSeconds = settings['auto-spot-friend-interval'] || 30;
  const intervalMs = intervalSeconds * 1000;
  
  // Start periodic checking
  checkInterval = setInterval(checkFriendStatus, intervalMs);
  
  log(`🔍 Started monitoring friend status for auto-spot every ${intervalSeconds} seconds`);
  
  // Run initial check after page settles
  setTimeout(() => {
    log("🔍 Running initial check after page load...");
    checkFriendStatus();
  }, 2000);
}

function onIRacingConnected() {
  log("✅ iRacing connected - starting friend monitoring");
  isIRacingConnected = true;
  startMonitoring();
}

function setupIRacingConnectionListener() {
  window.addEventListener('irefined-racing-connected', onIRacingConnected);
  
  // Check if already connected
  if (document.querySelector('#friends-wrapper')) {
    log("✅ iRacing already connected - starting monitoring immediately");
    onIRacingConnected();
  }
}

function stopMonitoring() {
  if (checkInterval) {
    clearInterval(checkInterval);
    checkInterval = null;
  }
  
  log("⏹️ Stopped monitoring friend status");
}

function cleanup() {
  stopMonitoring();
  
  // Remove event listeners
  if (settingsChangeListener) {
    window.removeEventListener('storage', settingsChangeListener);
    settingsChangeListener = null;
  }
  
  window.removeEventListener('irefined-racing-connected', onIRacingConnected);
  
  isIRacingConnected = false;
  
  log("🧹 Auto-spot friend feature cleaned up");
}

function checkFriendStatus() {
  try {
    log("🔍 Starting friend status check...");
    
    const settings = JSON.parse(localStorage.getItem('iref_settings') || '{}');
    const isEnabled = settings['auto-spot-friend'];
    const friendName = settings['auto-spot-friend-name'];
    
    if (!isEnabled || !friendName) {
      log("🔍 Feature disabled or no friend name - stopping");
      return;
    }
    
    // Check if sim is already running - if so, skip auto-spot
    if (isSimRunning()) {
      return;
    }
    
    log(`🔍 Checking status for friend: ${friendName}`);
    
    // Find friends list
    const friendsList = document.querySelector(FRIENDS_LIST_SELECTOR);
    if (!friendsList) {
      log("📋 Friends list not visible - auto-spot requires manual expansion");
      return;
    }
    
    // Find target friend
    const targetFriend = findTargetFriend(friendsList, friendName);
    if (!targetFriend) {
      log("👤 Target friend not found in visible friends list");
      return;
    }
    
    log("✅ Target friend found");
    
    // Check if friend is in session (has steering wheel icon)
    const isInSession = checkIfFriendInSession(targetFriend);
    if (!isInSession) {
      log("🏁 Friend not in session yet");
      return;
    }
    
    log("✅ Friend is in session");
    
    // Check spot availability and perform action
    const canSpot = checkSpotAvailability(targetFriend);
    if (!canSpot) {
      log("🎧 Spot option not yet available for friend");
      return;
    }
    
    log("✅ Spot option available");
    
    // All conditions met - auto-spot ready!
    log(`🎯 Auto-spot ready for friend ${friendName}!`);
    
    // Attempt to perform the spot action
    const spotResult = performSpotAction(targetFriend, friendName);
    if (spotResult) {
      log(`🎯 Auto-spot action completed for ${friendName}!`);
    } else {
      log(`⚠️ Auto-spot action failed for ${friendName}`);
    }
    
    log("🔍 Friend status check completed");
    
  } catch (error) {
    log(`❌ Error in checkFriendStatus: ${error.message}`);
  }
}

function findTargetFriend(friendsList, friendName) {
  const friendEntries = friendsList.querySelectorAll(FRIEND_ENTRY_SELECTOR);
  
  log(`🔍 Found ${friendEntries.length} friend entries to check`);
  
  for (const entry of friendEntries) {
    const extractedName = extractFriendName(entry);
    
    if (extractedName === friendName) {
      log(`✅ Found target friend: "${extractedName}"`);
      return entry;
    }
  }
  
  log(`❌ Target friend "${friendName}" not found in visible list`);
  return null;
}

function extractFriendName(friendElement) {
  // Look for the friend name button first
  const nameButton = friendElement.querySelector('button.btn.btn-link.btn-xs');
  if (nameButton) {
    return nameButton.textContent.trim();
  }
  
  // Fallback: look for any text content that might be the name
  const textContent = friendElement.textContent;
  const lines = textContent.split('\n').map(line => line.trim()).filter(line => line);
  for (const line of lines) {
    if (line && !line.match(/^\d+$/) && !line.match(/^(Join|Spot|Watch|In an official session)$/)) {
      return line;
    }
  }
  
  return 'Unknown Friend';
}

function checkIfFriendInSession(friendElement) {
  // Look for steering wheel icon indicating friend is in session
  const steeringWheel = friendElement.querySelector('.icon-steering-wheel');
  if (steeringWheel) {
    // Get session details from the parent span's data-original-title
    const dropdownSpan = steeringWheel.closest('span.dropdown');
    if (dropdownSpan) {
      const sessionInfo = dropdownSpan.getAttribute('data-original-title');
      if (sessionInfo) {
        log(`🏁 Friend in session: ${sessionInfo}`);
      }
    }
    return true;
  }
  return false;
}

function checkSpotAvailability(friendElement) {
  // Check if spot option is available in the dropdown
  const dropdownMenu = friendElement.querySelector('.dropdown-menu');
  if (!dropdownMenu) {
    return false;
  }
  
  // Look for any element containing "Spot" text
  const spotOption = Array.from(dropdownMenu.querySelectorAll('*')).find(element => 
    element.textContent && element.textContent.includes('Spot')
  );
  
  return !!spotOption;
}

function performSpotAction(friendElement, friendName) {
  try {
    log(`🎯 Attempting to perform spot action for ${friendName}...`);
    
    // Find the dropdown menu and spot option
    const dropdownMenu = friendElement.querySelector('.dropdown-menu');
    if (!dropdownMenu) {
      log(`❌ Dropdown menu not found for ${friendName}`);
      return false;
    }
    
    // Look for the spot option element
    const spotOption = Array.from(dropdownMenu.querySelectorAll('*')).find(element => 
      element.textContent && element.textContent.includes('Spot')
    );
    
    if (!spotOption) {
      log(`❌ Spot option element not found for ${friendName}`);
      return false;
    }
    
    // Try to click the spot option
    if (spotOption.tagName === 'A' || spotOption.tagName === 'BUTTON') {
      log(`🎯 Clicking spot option for ${friendName}...`);
      spotOption.click();
      return true;
    } else {
      // If it's not a clickable element, try to find a parent that is
      const clickableParent = spotOption.closest('a, button');
      if (clickableParent) {
        log(`🎯 Clicking parent element for ${friendName}...`);
        clickableParent.click();
        return true;
      } else {
        log(`❌ No clickable element found for spot option of ${friendName}`);
        return false;
      }
    }
    
  } catch (error) {
    log(`❌ Error performing spot action for ${friendName}: ${error.message}`);
    return false;
  }
}

const id = getFeatureID(import.meta.url);
const bodyClass = "iref-" + id;

features.add(id, false, null, bodyClass, init);