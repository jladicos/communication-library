/**
 * Slack Configuration for MessagingUtils
 * 
 * Separate configuration file for Slack-related settings and credentials.
 * This helps keep sensitive information separate from the main library code.
 */

var SlackConfig = (function() {
  // Default configuration values
  var _config = {
	// Slack API credentials
	apiToken: '', // Your Slack API token
	
	// Default settings
	defaultChannel: '#general',
	defaultUsername: 'GAS Bot',
	defaultIconEmoji: ':robot_face:',
	
	// Optional webhook URL (alternative to API token)
	webhookUrl: '',
	
	// Debugging
	debugMode: false
  };
  
  /**
   * Initialize the Slack configuration with your settings
   * @param {Object} config - Configuration object
   */
  function initialize(config) {
	if (config.apiToken !== undefined) _config.apiToken = config.apiToken;
	if (config.webhookUrl !== undefined) _config.webhookUrl = config.webhookUrl;
	if (config.defaultChannel !== undefined) _config.defaultChannel = config.defaultChannel;
	if (config.defaultUsername !== undefined) _config.defaultUsername = config.defaultUsername;
	if (config.defaultIconEmoji !== undefined) _config.defaultIconEmoji = config.defaultIconEmoji;
	if (config.debugMode !== undefined) _config.debugMode = config.debugMode;
	
	// Validate configuration
	if (!_config.apiToken && !_config.webhookUrl) {
	  Logger.log('Warning: No Slack API token or webhook URL configured. Slack messaging will not work.');
	  return false;
	}
	
	return true;
  }
  
  /**
   * Get the current Slack configuration
   * @return {Object} Current configuration (copy)
   */
  function getConfig() {
	return Object.assign({}, _config); // Return a copy, not the original
  }
  
  /**
   * Check if Slack is properly configured
   * @return {boolean} Whether Slack is configured
   */
  function isConfigured() {
	return Boolean(_config.apiToken || _config.webhookUrl);
  }
  
  /**
   * Log a debug message if debug mode is enabled
   * @param {string} message - Message to log
   * @param {*} [data] - Optional data to log
   */
  function debug(message, data) {
	if (!_config.debugMode) return;
	
	Logger.log(`SlackConfig: ${message}`);
	if (data !== undefined) {
	  Logger.log(JSON.stringify(data));
	}
  }
  
  // Return public API
  return {
	initialize: initialize,
	getConfig: getConfig,
	isConfigured: isConfigured,
	debug: debug
  };
})();