import { getFeatureID } from "../helpers/feature-helpers.js";
import features from "../feature-manager.js";
import { log } from "./logger.js";
import { findProps } from "../helpers/react-resolver.js";

let checkInterval = null;
let isIRacingConnected = false;
let settingsChangeListener = null;
let currentInterval = null; // Track current interval to prevent unnecessary restarts
let isMonitoring = false; // Flag to prevent multiple monitoring instances

// Configuration
const FRIENDS_LIST_SELECTOR = "#friends-wrapper";
const FRIEND_ENTRY_SELECTOR = ".btn-group.btn-block";

function isSimRunning() {
  try {
    // Check for "Registered" banner first - indicates user is already connected to a session
    const registeredBanner = document.querySelector('.chakra-text.css-3bqrha');
    if (registeredBanner && registeredBanner.textContent && registeredBanner.textContent.includes('Registered')) {
      log(`🏁 User is already registered for a session, skipping auto-spot check`);
      return true;
    }
    
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

  // Prevent multiple initializations
  if (isMonitoring) {
    log("🔧 Auto-spot friend already initialized and monitoring - skipping duplicate init");
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
        const newInterval = (newSettings['auto-spot-friend-interval'] || 30) * 1000;
        
        if (!isEnabled && isIRacingConnected) {
          log("🔧 Auto-spot friend disabled by user - stopping monitoring");
          stopMonitoring();
        } else if (isEnabled && isIRacingConnected) {
          // Only restart if not already monitoring or if interval changed
          if (!isMonitoring || currentInterval !== newInterval) {
            log("🔧 Auto-spot friend settings changed - restarting monitoring");
            startMonitoring();
          } else {
            log("🔧 Auto-spot friend enabled but no changes needed");
          }
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
  
  // Check if we're already monitoring at the same interval
  if (isMonitoring && currentInterval === intervalMs) {
    log(`🔍 Already monitoring at ${intervalSeconds}s interval - no restart needed`);
    return;
  }
  
  // Stop existing monitoring before starting new
  if (isMonitoring) {
    log(`🔧 Restarting monitoring with new interval: ${intervalSeconds}s`);
    stopMonitoring();
  }
  
  // Start periodic checking
  checkInterval = setInterval(checkFriendStatus, intervalMs);
  currentInterval = intervalMs;
  isMonitoring = true;
  
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
  
  currentInterval = null;
  isMonitoring = false;
  
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
    
    // INVESTIGATION MODE: Log all available data instead of performing spot action
    log("🔬 INVESTIGATION MODE: Logging all available data from findProps()");
    
    try {
      // COMMENTED OUT: Verbose debugging logs
      /*
      const friendProps = findProps(targetFriend);
      log("🔬 Raw findProps() result type:", typeof friendProps);
      log("🔬 Raw findProps() result:", friendProps);
      */
      
              /*
        if (friendProps) {
          // Log object details
          log("🔬 Object constructor:", friendProps.constructor?.name);
          log("🔬 Object prototype:", Object.getPrototypeOf(friendProps));
          
          // Try different ways to inspect the object
          log("🔬 Object.keys() result:", Object.keys(friendProps));
          log("🔬 Object.getOwnPropertyNames() result:", Object.getOwnPropertyNames(friendProps));
          log("🔬 Object.entries() result:", Object.entries(friendProps));
          
          // Log specific properties that might contain session info
          if (friendProps.session) {
            log("🔬 Session data:", friendProps.session);
          } else {
            log("🔬 No session property found");
          }
          
          if (friendProps.registrationStatus) {
            log("🔬 Registration status:", friendProps.registrationStatus);
          } else {
            log("🔬 No registrationStatus property found");
          }
          
          if (friendProps.contentId) {
            log("🔬 Content ID:", friendProps.contentId);
          } else {
            log("🔬 No contentId property found");
          }
          
          if (friendProps.user) {
            log("🔬 User data:", friendProps.user);
          } else {
            log("🔬 No user property found");
          }
          
          if (friendProps.friend) {
            log("🔬 Friend data:", friendProps.friend);
          } else {
            log("🔬 No friend property found");
          }
          
          // Try to access properties directly by common names
          const commonProps = ['session', 'registrationStatus', 'contentId', 'user', 'friend', 'driver', 'car', 'event', 'series'];
          commonProps.forEach(prop => {
            try {
              if (friendProps[prop] !== undefined) {
                log(`🔬 Property '${prop}' found:`, friendProps[prop]);
              }
            } catch (e) {
              log(`🔬 Error accessing property '${prop}':`, e.message);
            }
          });
          
          // Log any other properties that might be relevant
          Object.keys(friendProps).forEach(key => {
            if (key !== 'session' && key !== 'registrationStatus' && key !== 'contentId' && key !== 'user' && key !== 'friend') {
              try {
                log(`🔬 Property '${key}':`, friendProps[key]);
              } catch (e) {
                log(`🔬 Error logging property '${key}':`, e.message);
              }
            }
          });
        } else {
          log("🔬 findProps() returned null/undefined");
        }
        */
      
              /*
        // Try alternative approaches to find React data
        log("🔬 Trying alternative React data extraction methods...");
        
        // Method 1: Look for React internal properties directly
        const reactKeys = Object.keys(targetFriend).filter(key => key.startsWith('__react'));
        log("🔬 React internal keys found:", reactKeys);
        
        if (reactKeys.length > 0) {
          reactKeys.forEach(key => {
            try {
              const reactData = targetFriend[key];
              log(`🔬 React key '${key}' type:`, typeof reactData);
              log(`🔬 React key '${key}' value:`, reactData);
              
              // Try to traverse the React fiber
              if (reactData && typeof reactData === 'object') {
                if (reactData.stateNode) {
                  log(`🔬 React fiber stateNode:`, reactData.stateNode);
                  if (reactData.stateNode.props) {
                    log(`🔬 React fiber stateNode.props:`, reactData.stateNode.props);
                    
                    // Extract props from this stateNode
                    const props = reactData.stateNode.props;
                    log(`🔬 StateNode props keys:`, Object.keys(props));
                    
                    // Look for session data
                    if (props.session) {
                      log(`🔬 Direct StateNode session:`, props.session);
                    }
                    if (props.registrationStatus) {
                      log(`🔬 Direct StateNode registrationStatus:`, props.registrationStatus);
                    }
                    if (props.contentId) {
                      log(`🔬 Direct StateNode contentId:`, props.contentId);
                    }
                  }
                }
                if (reactData.return) {
                  log(`🔬 React fiber return:`, reactData.return);
                }
              }
            } catch (e) {
              log(`🔬 Error accessing React key '${key}':`, e.message);
            }
          });
        }
        
        // Method 2: Try to find props on the steering wheel icon element specifically
        const steeringWheel = targetFriend.querySelector('.icon-steering-wheel');
        if (steeringWheel) {
          log("🔬 Checking steering wheel element for React props...");
          const steeringProps = findProps(steeringWheel);
          if (steeringProps) {
            log("🔬 Steering wheel props:", steeringProps);
          } else {
            log("🔬 No props found on steering wheel element");
          }
        }
        
        // Method 3: Check if the session info is stored in the data-original-title attribute
        const sessionInfoElement = targetFriend.querySelector('[data-original-title]');
        if (sessionInfoElement) {
          const sessionTitle = sessionInfoElement.getAttribute('data-original-title');
          log("🔬 Session info from data-original-title:", sessionTitle);
          
          // Try to find props on this element
          const titleProps = findProps(sessionInfoElement);
          if (titleProps) {
            log("🔬 Title element props:", titleProps);
          }
        }
        */
      
      /*
      // Method 4: Debug the findProps helper itself - COMMENTED OUT FOR CLEAN LOGGING
      // All the verbose debugging code has been commented out while keeping the data extraction logic
      */
      
            /*
      // Also try to get props from parent elements
      const parentElement = targetFriend.parentElement;
      if (parentElement) {
        log("🔬 Checking parent element for additional data...");
        const parentProps = findProps(parentElement);
        if (parentProps) {
          log("🔬 Parent element props:", parentProps);
        }
      }
      
      // Check for any data attributes
      const dataAttributes = {};
      for (let attr of targetFriend.attributes) {
        if (attr.name.startsWith('data-')) {
          dataAttributes[attr.name] = attr.value;
        }
      }
      if (Object.keys(dataAttributes).length > 0) {
        log("🔬 Data attributes:", dataAttributes);
      }
      
      // Try to find React props on child elements that might have session info
      log("🔬 Checking child elements for React props...");
      const childElements = targetFriend.querySelectorAll('*');
      let foundChildProps = false;
      childElements.forEach((child, index) => {
        if (index < 10) { // Limit to first 10 children to avoid spam
          try {
            const childProps = findProps(child);
            if (childProps && Object.keys(childProps).length > 0) {
              log(`🔬 Child element ${index} props:`, childProps);
              foundChildProps = true;
            }
          } catch (e) {
            // Ignore errors on child elements
          }
        }
      });
      if (!foundChildProps) {
        log("🔬 No child elements with React props found");
      }
      
      // Try to get props from the dropdown menu specifically
      const dropdownMenu = targetFriend.querySelector('.dropdown-menu');
      if (dropdownMenu) {
        log("🔬 Checking dropdown menu for React props...");
        const dropdownProps = findProps(dropdownMenu);
        if (dropdownProps) {
          log("🔬 Dropdown menu props:", dropdownProps);
        }
      }
      
      // Log the actual HTML structure for debugging
      log("🔬 Friend element HTML structure:", targetFriend.outerHTML.substring(0, 500) + "...");
      */
      
    } catch (propsError) {
      log(`🔬 Error getting props: ${propsError.message}`);
    }
    
    // SUMMARY: Log all the critical session data we discovered
    log("🔬 ========================================");
    log("🔬 INVESTIGATION SUMMARY - SESSION DATA FOUND");
    log("🔬 ========================================");
    
    try {
      // Extract the session data from the React component
      const reactFiberKey = Object.keys(targetFriend).find(key => key.startsWith('__reactFiber'));
      if (reactFiberKey) {
        const fiber = targetFriend[reactFiberKey];
        let sessionData = null;
        
        // Look for session data in the fiber tree
        let currentFiber = fiber;
        let depth = 0;
        const maxDepth = 5;
        
        while (currentFiber && depth < maxDepth && !sessionData) {
          if (currentFiber.stateNode && currentFiber.stateNode.props && currentFiber.stateNode.props.friend) {
            sessionData = currentFiber.stateNode.props.friend;
            break;
          }
          if (currentFiber.memoizedProps && currentFiber.memoizedProps.friend) {
            sessionData = currentFiber.memoizedProps.friend;
            break;
          }
          currentFiber = currentFiber.return;
          depth++;
        }
        
        if (sessionData && sessionData.official_session) {
          const session = sessionData.official_session;
          
          log("🔬 FRIEND IDENTIFICATION:");
          log(`🔬   Customer ID: ${sessionData.cust_id}`);
          log(`🔬   Display Name: ${sessionData.display_name}`);
          
          log("🔬 SESSION IDENTIFIERS:");
          log(`🔬   Session ID: ${session.session_id}`);
          log(`🔬   Subsession ID: ${session.subsession_id}`);
          log(`🔬   Season ID: ${session.season_id}`);
          log(`🔬   Series ID: ${session.series_id}`);
          
          log("🔬 CAR SELECTION:");
          log(`🔬   Car ID: ${session.car_id}`);
          log(`🔬   Car Class ID: ${session.car_class_id}`);
          log(`🔬   Available Cars: ${session.all_car_ids ? session.all_car_ids.length : 0} cars`);
          
          log("🔬 SESSION DETAILS:");
          log(`🔬   Event Type: ${session.event_type} (${session.event_type_name})`);
          log(`🔬   Start Time: ${session.start_time}`);
          log(`🔬   Track ID: ${session.track_id}`);
          log(`🔬   User Role: ${session.user_role}`);
          
          log("🔬 PERMISSIONS:");
          log(`🔬   Can Join: ${session.can_join}`);
          log(`🔬   Can Spot: ${session.can_spot}`);
          log(`🔬   Can Watch: ${session.can_watch}`);
          log(`🔬   Trusted Spotter: ${session.trusted_spotter}`);
          
          log("🎯 WEBSOCKET REGISTRATION PARAMETERS:");
          log(`🎯   ws.register("${session.name || 'Unknown Series'}", ${session.car_id}, ${session.car_class_id}, ${session.session_id}, ${session.subsession_id}, 'crew', ${sessionData.cust_id})`);
          
          log("🎯 ========================================");
          log("🎯 Attempting direct websocket spotter registration!");
          log("🎯 ========================================");
          
          // Check if we can spot for this friend
          if (session.can_spot) {
            log("🎯 Auto-spotting for friend via websocket...");
            try {
              // Register as crew (spotter) for the specific friend
              if (window.ws) {
                window.ws.register(
                  session.name || 'Unknown Series',
                  session.car_id,
                  session.car_class_id,
                  session.session_id,
                  session.subsession_id,
                  'crew',  // Use 'crew' instead of 'spotter' based on your payload
                  sessionData.cust_id  // This is the spot_for_custid
                );
                log(`✅ Spotter registration sent for ${friendName} (Customer ID: ${sessionData.cust_id})`);
                log("🎯 Auto-spot action completed via websocket!");
                return; // Exit early since we've successfully registered
              } else {
                log(`❌ Websocket helper not available`);
              }
            } catch (error) {
              log(`❌ Error registering as spotter: ${error.message}`);
            }
          } else {
            log(`⚠️ Cannot spot for ${friendName} - permission denied (can_spot: ${session.can_spot})`);
          }
          
        } else {
          log("🔬 ❌ No official session data found in React component");
        }
      } else {
        log("🔬 ❌ No React fiber found for session data extraction");
      }
      
    } catch (summaryError) {
      log(`🔬 ❌ Error creating summary: ${summaryError.message}`);
    }
    
    log("🎯 Websocket registration attempt completed");
    
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