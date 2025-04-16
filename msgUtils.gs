/**
 * MessagingUtils Library
 * 
 * A Google Apps Script library for unified message handling across different platforms.
 * Currently supports email, with framework for future expansion to other messaging platforms.
 * 
 * @version 1.0.0
 */

var MsgUtils = (function() {
  // Private configuration object
  var _config = {
	defaultSender: Session.getActiveUser().getEmail(),
	defaultSubjectPrefix: '',
	useHtmlByDefault: false,
	debugMode: false
  };
  
  /**
   * Set global configuration for the messaging library
   * @param {Object} config - Configuration object
   * @param {string} [config.defaultSender] - Default sender email
   * @param {string} [config.defaultSubjectPrefix] - Prefix added to all email subjects
   * @param {boolean} [config.useHtmlByDefault] - Whether to use HTML formatting by default
   * @param {boolean} [config.debugMode] - Whether to log messages to console
   */
  function setConfig(config) {
	if (config.defaultSender !== undefined) _config.defaultSender = config.defaultSender;
	if (config.defaultSubjectPrefix !== undefined) _config.defaultSubjectPrefix = config.defaultSubjectPrefix;
	if (config.useHtmlByDefault !== undefined) _config.useHtmlByDefault = config.useHtmlByDefault;
	if (config.debugMode !== undefined) _config.debugMode = config.debugMode;
	
	if (_config.debugMode) {
	  Logger.log('MessagingUtils: Configuration updated');
	  Logger.log(JSON.stringify(_config));
	}
  }
  
  /**
   * Get current configuration
   * @return {Object} Current configuration object
   */
  function getConfig() {
	return Object.assign({}, _config); // Return a copy, not the original
  }

  /**
   * Send an email message
   * @param {string|string[]} recipient - Email recipient(s)
   * @param {string} subject - Email subject
   * @param {string} body - Email body content
   * @param {Object} [options] - Additional email options
   * @param {string} [options.sender] - Override default sender
   * @param {boolean} [options.isHtml] - Whether the body is HTML
   * @param {Object} [options.attachments] - Email attachments
   * @param {string} [options.name] - Sender name
   * @param {boolean} [options.noPrefix] - Skip adding the subject prefix
   * @return {Object} Result object with success status and any error
   */
  function sendEmail(recipient, subject, body, options) {
	options = options || {};
	const sender = options.sender || _config.defaultSender;
	const isHtml = options.isHtml !== undefined ? options.isHtml : _config.useHtmlByDefault;
	const formattedSubject = options.noPrefix ? subject : _config.defaultSubjectPrefix + subject;
	
	if (_config.debugMode) {
	  Logger.log(`MessagingUtils: Sending email to ${recipient}`);
	  Logger.log(`Subject: ${formattedSubject}`);
	}
	
	try {
	  const emailOptions = {
		name: options.name,
		htmlBody: isHtml ? body : null,
		attachments: options.attachments
	  };
	  
	  if (isHtml) {
		GmailApp.sendEmail(recipient, formattedSubject, '', emailOptions);
	  } else {
		GmailApp.sendEmail(recipient, formattedSubject, body, emailOptions);
	  }
	  
	  return { success: true };
	} catch (error) {
	  if (_config.debugMode) {
		Logger.log(`MessagingUtils: Email error - ${error.message}`);
	  }
	  return { success: false, error: error.message };
	}
  }
  
  /**
   * Send a notification email using a template
   * @param {string|string[]} recipient - Email recipient(s)
   * @param {string} subject - Email subject
   * @param {string} templateId - Template ID or name
   * @param {Object} templateData - Data to populate the template
   * @param {Object} [options] - Additional email options
   * @return {Object} Result object with success status and any error
   */
  function sendTemplatedEmail(recipient, subject, templateText, templateData, options) {
	options = options || {};
	
	// Process template by replacing variables
	let processedBody = templateText;
	for (const key in templateData) {
	  if (templateData.hasOwnProperty(key)) {
		const placeholder = new RegExp('\\{\\{' + key + '\\}\\}', 'g');
		processedBody = processedBody.replace(placeholder, templateData[key]);
	  }
	}
	
	// Send the processed email
	return sendEmail(recipient, subject, processedBody, options);
  }
  
  /**
   * Log a message if debug mode is enabled
   * @param {string} message - Message to log
   * @param {*} [data] - Optional data to log
   */
  function debug(message, data) {
	if (!_config.debugMode) return;
	
	Logger.log(`MessagingUtils: ${message}`);
	if (data !== undefined) {
	  Logger.log(JSON.stringify(data));
	}
  }
  
  /**
   * Create a simple email template from text with placeholders
   * @param {string} templateText - Text with {{variable}} placeholders
   * @return {Object} Template object with methods to use the template
   */
  function createTextTemplate(templateText) {
	return {
	  /**
	   * Apply data to the template and send the email
	   * @param {string|string[]} recipient - Email recipient(s)
	   * @param {string} subject - Email subject
	   * @param {Object} data - Data to populate the template
	   * @param {Object} [options] - Additional options for sendEmail
	   * @return {Object} Result of sendEmail
	   */
	  send: function(recipient, subject, data, options) {
		return sendTemplatedEmail(recipient, subject, templateText, data, options);
	  },
	  
	  /**
	   * Apply data to the template and return the processed text
	   * @param {Object} data - Data to populate the template
	   * @return {string} Processed template text
	   */
	  process: function(data) {
		let processed = templateText;
		for (const key in data) {
		  if (data.hasOwnProperty(key)) {
			const placeholder = new RegExp('\\{\\{' + key + '\\}\\}', 'g');
			processed = processed.replace(placeholder, data[key]);
		  }
		}
		return processed;
	  }
	};
  }
  
  // Slack messaging functionality (placeholder for future implementation)
  const slackUtils = {
	// Future Slack integration methods will go here
	isConfigured: function() {
	  return false; // Not implemented yet
	}
  };
  
  // Return the public API
  return {
	// Configuration
	setConfig: setConfig,
	getConfig: getConfig,
	
	// Email functionality
	sendEmail: sendEmail,
	sendTemplatedEmail: sendTemplatedEmail,
	createTextTemplate: createTextTemplate,
	
	// Debugging
	debug: debug,
	
	// Future platform support (placeholders)
	slack: slackUtils
  };
})();

/**
 * Export for standalone use - when testing the library directly
 */
function testLibrary() {
  MsgUtils.setConfig({
	defaultSubjectPrefix: '[TEST] ',
	debugMode: true
  });
  
  const result = MsgUtils.sendEmail(
	Session.getActiveUser().getEmail(),
	'Library Test',
	'This email was sent from the MessagingUtils library!'
  );
  
  Logger.log('Test completed with result: ' + JSON.stringify(result));
}

/**
 * Helper function to quickly send a simple email
 * @param {string} recipient - Email recipient
 * @param {string} subject - Email subject
 * @param {string} body - Email body
 */
function sendQuickEmail(recipient, subject, body) {
  return MsgUtils.sendEmail(recipient, subject, body);
}

sendQuickEmail('jladicos@acuityinsights.com', 'Hello there', 'This email was sent by an automation');