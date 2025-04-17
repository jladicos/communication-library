/**
 * Example Slack Usage for MessagingUtils Library
 * 
 * This file demonstrates how to use the Slack features of the MessagingUtils library.
 */

/**
 * Initialize the Slack integration
 */
function initializeSlack() {
  // Initialize with API token (preferred for getting message links)
  MsgUtils.slack.initialize({
	apiToken: 'xoxb-your-bot-token-here', // Replace with your actual token
	defaultChannel: '#general',
	defaultUsername: 'GAS Bot',
	defaultIconEmoji: ':robot_face:',
	debugMode: true
  });
  
  // Alternatively, initialize with webhook URL (simpler but no message links)
  // MsgUtils.slack.initialize({
  //   webhookUrl: 'https://hooks.slack.com/services/YOUR/WEBHOOK/URL',
  //   defaultChannel: '#general',
  //   defaultUsername: 'GAS Bot',
  //   defaultIconEmoji: ':robot_face:',
  //   debugMode: true
  // });
}

/**
 * Example of sending a simple message to a channel
 */
function sendSimpleChannelMessage() {
  // Make sure Slack is initialized first
  initializeSlack();
  
  // Send a message to a channel
  const result = MsgUtils.slack.sendMessage(
	'#announcements', 
	'Hello team! This is a test message from Google Apps Script.'
  );
  
  if (result.success) {
	Logger.log('Message sent successfully!');
	
	// If you're using the API token method, you can get the message link
	if (result.messageInfo && result.messageInfo.messageLink) {
	  Logger.log('Message link: ' + result.messageInfo.messageLink);
	  
	  // Save the message info for replying later
	  PropertiesService.getScriptProperties().setProperty(
		'lastMessageInfo', 
		JSON.stringify({
		  channelId: result.messageInfo.channelId,
		  timestamp: result.messageInfo.timestamp
		})
	  );
	}
  } else {
	Logger.log('Error sending message: ' + result.error);
  }
}

/**
 * Example of sending a direct message to a user
 */
function sendDirectMessage() {
  // Make sure Slack is initialized first
  initializeSlack();
  
  // Send a DM to a user (by handle)
  const result = SlackUtils.sendDirectMessage(
	'johndoe', 
	'Hello John! This is a private message from the automation script.'
  );
  
  if (result.success) {
	Logger.log('DM sent successfully!');
	if (result.messageInfo && result.messageInfo.messageLink) {
	  Logger.log('Message link: ' + result.messageInfo.messageLink);
	}
  } else {
	Logger.log('Error sending DM: ' + result.error);
  }
}

/**
 * Example of replying to a previous message
 */
function replyToMessage() {
  // Make sure Slack is initialized first
  initializeSlack();
  
  // Get the stored message info from a previous message
  const storedInfo = PropertiesService.getScriptProperties().getProperty('lastMessageInfo');
  
  if (!storedInfo) {
	Logger.log('No previous message found. Send a message first.');
	return;
  }
  
  const messageInfo = JSON.parse(storedInfo);
  
  // Reply to the previous message
  const result = SlackUtils.replyToMessage(
	messageInfo.channelId,
	messageInfo.timestamp,
	'This is a follow-up to my previous message!'
  );
  
  if (result.success) {
	Logger.log('Reply sent successfully!');
	if (result.messageInfo && result.messageInfo.messageLink) {
	  Logger.log('Reply link: ' + result.messageInfo.messageLink);
	}
  } else {
	Logger.log('Error sending reply: ' + result.error);
  }
}

/**
 * Example of using templates with Slack
 */
function sendTemplatedSlackMessage() {
  // Make sure Slack is initialized first
  initializeSlack();
  
  // Create a template
  const template = SlackUtils.createSlackTemplate(
	'Hello {{name}}! The project "{{project}}" has been {{status}}. {{#if details}}Details: {{details}}{{/if}}'
  );
  
  // Use the template to send a message
  const result = template.send(
	'#project-updates',
	{
	  name: 'team',
	  project: 'Website Redesign',
	  status: 'completed',
	  details: 'Launch scheduled for next Monday.'
	},
	{ 
	  iconEmoji: ':tada:' // Override the default emoji for this celebratory message
	}
  );
  
  if (result.success) {
	Logger.log('Templated message sent successfully!');
  } else {
	Logger.log('Error sending templated message: ' + result.error);
  }
}

/**
 * Example of sending a message with attachments
 */
function sendMessageWithAttachments() {
  // Make sure Slack is initialized first
  initializeSlack();
  
  // Create attachments (rich message format)
  const attachments = [
	{
	  color: '#36a64f', // Green
	  pretext: 'Project Update',
	  title: 'Website Redesign',
	  title_link: 'https://example.com/project',
	  text: 'The website redesign project is now 75% complete.',
	  fields: [
		{
		  title: 'Priority',
		  value: 'High',
		  short: true
		},
		{
		  title: 'Status',
		  value: 'On Track',
		  short: true
		}
	  ],
	  footer: 'Project Management System',
	  ts: Math.floor(Date.now() / 1000) // Current timestamp
	}
  ];
  
  // Send message with attachments
  const result = SlackUtils.sendMessage(
	'#project-updates',
	'Project Status Update', // Main message text
	{
	  attachments: attachments
	}
  );
  
  if (result.success) {
	Logger.log('Message with attachments sent successfully!');
  } else {
	Logger.log('Error sending message with attachments: ' + result.error);
  }
}

/**
 * Example of a workflow that combines email and Slack
 */
function combinedWorkflow() {
  // Initialize Slack
  initializeSlack();
  
  // Step 1: Send an email notification
  const emailResult = MsgUtils.sendEmail(
	'team@example.com',
	'Project Milestone Reached',
	'The project has reached the 75% completion milestone. See Slack for details.'
  );
  
  // Step 2: Post detailed update to Slack
  if (emailResult.success) {
	const slackResult = SlackUtils.sendMessage(
	  '#project-updates',
	  'The project has reached the 75% completion milestone! :tada:\n\nNext steps have been emailed to the team.'
	);
	
	Logger.log('Workflow completed. Email: ' + emailResult.success + ', Slack: ' + slackResult.success);
  }
}