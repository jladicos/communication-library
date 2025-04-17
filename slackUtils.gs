/**
 * SlackUtils for MessagingUtils Library
 * 
 * Adds Slack messaging capabilities to the MessagingUtils library.
 * Requires the SlackConfig.gs file for configuration.
 * 
 * @version 1.0.0
 */

var SlackUtils = (function() {
  /**
   * Send a message to a Slack channel
   * @param {string} channelOrUserId - Channel name (with #) or user ID (with @)
   * @param {string} message - Message text (can include markdown)
   * @param {Object} [options] - Additional message options
   * @param {string} [options.username] - Override default username
   * @param {string} [options.iconEmoji] - Override default icon emoji
   * @param {Object[]} [options.attachments] - Slack message attachments
   * @param {Object[]} [options.blocks] - Slack blocks for advanced formatting
   * @param {boolean} [options.unfurlLinks] - Whether to unfurl links
   * @return {Object} Result object with success status and message info
   */
  function sendMessage(channelOrUserId, message, options) {
	// Check if Slack is configured
	if (!SlackConfig.isConfigured()) {
	  return { 
		success: false, 
		error: 'Slack is not properly configured. Set up SlackConfig first.' 
	  };
	}
	
	options = options || {};
	const config = SlackConfig.getConfig();
	
	// Determine if this is a channel or direct message
	let target = channelOrUserId || config.defaultChannel;
	const isDM = target.startsWith('@');
	
	// If it's a direct message and doesn't start with @, add it
	if (isDM && !target.startsWith('@')) {
	  target = '@' + target;
	}
	
	// If it's a channel and doesn't start with #, add it
	if (!isDM && !target.startsWith('#')) {
	  target = '#' + target;
	}
	
	SlackConfig.debug('Sending message to ' + target);
	
	try {
	  // Prepare the message payload
	  const payload = {
		channel: target,
		text: message,
		username: options.username || config.defaultUsername,
		icon_emoji: options.iconEmoji || config.defaultIconEmoji,
		unfurl_links: options.unfurlLinks,
		attachments: options.attachments,
		blocks: options.blocks
	  };
	  
	  let response;
	  
	  // Send via webhook if configured
	  if (config.webhookUrl) {
		response = sendViaWebhook(payload, config.webhookUrl);
		// Webhook doesn't return a message ID/link
		return { 
		  success: true, 
		  messageInfo: { sent: true }
		};
	  } 
	  // Otherwise send via API
	  else if (config.apiToken) {
		response = sendViaApi(payload, config.apiToken);
		
		// Parse the response to get message info
		const responseData = JSON.parse(response.getContentText());
		
		if (responseData.ok) {
		  // Construct the message link if possible (requires channel ID and timestamp)
		  let messageLink = null;
		  if (responseData.channel && responseData.ts) {
			// The format is: https://workspace.slack.com/archives/CHANNEL_ID/p{TIMESTAMP_WITHOUT_DOT}{MICROSECONDS}
			// We need to transform the timestamp
			const tsWithoutDot = responseData.ts.replace('.', '');
			messageLink = `https://slack.com/archives/${responseData.channel}/p${tsWithoutDot}`;
		  }
		  
		  return {
			success: true,
			messageInfo: {
			  channelId: responseData.channel,
			  timestamp: responseData.ts,
			  messageLink: messageLink
			}
		  };
		} else {
		  return { 
			success: false, 
			error: responseData.error || 'Unknown error from Slack API'
		  };
		}
	  }
	  
	  return { success: false, error: 'No webhook URL or API token configured' };
	} catch (error) {
	  SlackConfig.debug('Error sending Slack message', error);
	  return { 
		success: false, 
		error: error.message || 'Unknown error sending Slack message' 
	  };
	}
  }
  
  /**
   * Send a message via Slack webhook
   * @param {Object} payload - Message payload
   * @param {string} webhookUrl - Slack webhook URL
   * @return {HTTPResponse} Response from the API
   * @private
   */
  function sendViaWebhook(payload, webhookUrl) {
	const options = {
	  method: 'post',
	  contentType: 'application/json',
	  payload: JSON.stringify(payload)
	};
	
	return UrlFetchApp.fetch(webhookUrl, options);
  }
  
  /**
   * Send a message via Slack API
   * @param {Object} payload - Message payload
   * @param {string} apiToken - Slack API token
   * @return {HTTPResponse} Response from the API
   * @private
   */
  function sendViaApi(payload, apiToken) {
	const options = {
	  method: 'post',
	  contentType: 'application/json',
	  headers: {
		'Authorization': 'Bearer ' + apiToken
	  },
	  payload: JSON.stringify(payload)
	};
	
	return UrlFetchApp.fetch('https://slack.com/api/chat.postMessage', options);
  }
  
  /**
   * Send a direct message to a user
   * @param {string} userId - User ID or handle (with or without @)
   * @param {string} message - Message text
   * @param {Object} [options] - Additional message options
   * @return {Object} Result object with success status and message info
   */
  function sendDirectMessage(userId, message, options) {
	// Ensure userId starts with @
	if (!userId.startsWith('@')) {
	  userId = '@' + userId;
	}
	
	return sendMessage(userId, message, options);
  }
  
  /**
   * Send a templated message to Slack
   * @param {string} channelOrUserId - Channel or user to send to
   * @param {string} templateText - Template text with {{variable}} placeholders
   * @param {Object} templateData - Data to populate the template
   * @param {Object} [options] - Additional message options
   * @return {Object} Result of sendMessage
   */
  function sendTemplatedMessage(channelOrUserId, templateText, templateData, options) {
	// Process template
	let processedMessage = templateText;
	for (const key in templateData) {
	  if (templateData.hasOwnProperty(key)) {
		const placeholder = new RegExp('\\{\\{' + key + '\\}\\}', 'g');
		processedMessage = processedMessage.replace(placeholder, templateData[key]);
	  }
	}
	
	// Send the processed message
	return sendMessage(channelOrUserId, processedMessage, options);
  }
  
  /**
   * Reply to a specific Slack message (creates a thread)
   * @param {string} channelId - Channel ID where the original message is
   * @param {string} timestamp - Timestamp of the message to reply to
   * @param {string} message - Reply message text
   * @param {Object} [options] - Additional message options
   * @return {Object} Result object with success status and any error
   */
  function replyToMessage(channelId, timestamp, message, options) {
	if (!SlackConfig.isConfigured() || !SlackConfig.getConfig().apiToken) {
	  return { 
		success: false, 
		error: 'Slack API token is required for replying to messages' 
	  };
	}
	
	options = options || {};
	const config = SlackConfig.getConfig();
	
	try {
	  // Prepare the payload
	  const payload = {
		channel: channelId,
		thread_ts: timestamp,
		text: message,
		username: options.username || config.defaultUsername,
		icon_emoji: options.iconEmoji || config.defaultIconEmoji
	  };
	  
	  // Send via API
	  const response = sendViaApi(payload, config.apiToken);
	  const responseData = JSON.parse(response.getContentText());
	  
	  if (responseData.ok) {
		// Construct the message link if possible
		let messageLink = null;
		if (responseData.channel && responseData.ts) {
		  const tsWithoutDot = responseData.ts.replace('.', '');
		  messageLink = `https://slack.com/archives/${responseData.channel}/p${tsWithoutDot}`;
		}
		
		return {
		  success: true,
		  messageInfo: {
			channelId: responseData.channel,
			timestamp: responseData.ts,
			threadTimestamp: responseData.thread_ts,
			messageLink: messageLink
		  }
		};
	  } else {
		return { 
		  success: false, 
		  error: responseData.error || 'Unknown error from Slack API'
		};
	  }
	} catch (error) {
	  SlackConfig.debug('Error replying to Slack message', error);
	  return { 
		success: false, 
		error: error.message || 'Unknown error replying to Slack message' 
	  };
	}
  }
  
  /**
   * Create a simple Slack template from text with placeholders
   * @param {string} templateText - Text with {{variable}} placeholders
   * @return {Object} Template object with methods to use the template
   */
  function createSlackTemplate(templateText) {
	return {
	  /**
	   * Apply data to the template and send to Slack
	   * @param {string} channelOrUserId - Channel or user to send to
	   * @param {Object} data - Data to populate the template
	   * @param {Object} [options] - Additional options for sendMessage
	   * @return {Object} Result of sendMessage
	   */
	  send: function(channelOrUserId, data, options) {
		return sendTemplatedMessage(channelOrUserId, templateText, data, options);
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
  
  // Return the public API
  return {
	// Basic messaging
	sendMessage: sendMessage,
	sendDirectMessage: sendDirectMessage,
	
	// Template-based messaging
	sendTemplatedMessage: sendTemplatedMessage,
	createSlackTemplate: createSlackTemplate,
	
	// Advanced features
	replyToMessage: replyToMessage
  };
})();