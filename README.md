# Messaging Utils Library

A Google Apps Script library for unified message handling across different platforms. The library provides a consistent, flexible API for sending notifications via email and Slack.

## Features

### Email (MsgUtils)
- **Flexible Email API**: Simple interface for sending emails with various options
- **Templating System**: Built-in support for template-based messages with variable substitution
- **Configuration Options**: Adjustable settings for default behaviors
- **Debug Mode**: Optional logging for troubleshooting

### Slack (SlackUtils)
- **Channel & Direct Messages**: Send messages to channels or directly to users
- **Message Threading**: Create and track conversation threads
- **Message Links**: Get links to posted messages (when using API token)
- **Rich Formatting**: Support for attachments and block formatting
- **Template Support**: Create reusable message templates with variables

## Installation

### As a Library

1. Create a new Google Apps Script project at [script.google.com](https://script.google.com)
2. Add the library code to the project (MsgUtils.gs, SlackUtils.gs, SlackConfig.gs)
3. Deploy the project as a library:
   - Click on "Project Settings" (⚙️ icon)
   - Under "Script ID", copy the ID for future reference
   - Click on "Deployments" > "New Deployment"
   - Select "Library" as deployment type
   - Enter a version name and description
   - Click "Deploy"
   - Note the version number of your deployment

### In Your Projects

1. Open your Google Apps Script project
2. Click on "Libraries" (+ icon in the sidebar)
3. Paste the Script ID from the library project
4. Choose the version you deployed
5. Set an identifier (e.g., "MessagingUtils")
6. Click "Add"

## Email Usage (MsgUtils)

### Configuration

```javascript
// Configure default behavior
MsgUtils.setConfig({
  defaultSender: 'your-email@example.com',
  defaultSubjectPrefix: '[Project] ',
  useHtmlByDefault: false,
  debugMode: true  // Enable for troubleshooting
});
```

### Sending Simple Emails

```javascript
// Send a plain text email
MsgUtils.sendEmail(
  'recipient@example.com',
  'Hello from MessagingUtils',
  'This is a test email sent using the MessagingUtils library.'
);

// Send an HTML email
MsgUtils.sendEmail(
  'recipient@example.com',
  'Formatted Message',
  '<h1>Hello!</h1><p>This is a <strong>formatted</strong> message.</p>',
  { isHtml: true }
);
```

### Using Email Templates

```javascript
// Create a template with variables
const welcomeTemplate = MsgUtils.createTextTemplate(
  'Hello {{name}},\n\nWelcome to {{project}}! Your account has been created.\n\nRegards,\n{{sender}}'
);

// Use the template to send an email
welcomeTemplate.send(
  'newuser@example.com',
  'Welcome to Our Project',
  {
	name: 'John',
	project: 'Project X',
	sender: 'The Admin Team'
  }
);

// Or use sendTemplatedEmail directly
MsgUtils.sendTemplatedEmail(
  'recipient@example.com',
  'Templated Message',
  'Hello {{name}}, today is {{date}}.',
  {
	name: 'Alice',
	date: new Date().toLocaleDateString()
  }
);
```

## Slack Usage (SlackUtils)

### Configuration

First, set up your Slack configuration:

```javascript
// Initialize with API token (recommended for full functionality)
SlackConfig.initialize({
  apiToken: 'xoxb-your-bot-token-here', // Replace with your actual token
  defaultChannel: '#general',
  defaultUsername: 'GAS Bot',
  defaultIconEmoji: ':robot_face:',
  debugMode: true
});

// Alternatively, initialize with webhook URL (simpler but limited functionality)
SlackConfig.initialize({
  webhookUrl: 'https://hooks.slack.com/services/YOUR/WEBHOOK/URL',
  defaultChannel: '#general',
  defaultUsername: 'GAS Bot',
  debugMode: true
});
```

### Sending Slack Messages

```javascript
// Send a message to a channel
SlackUtils.sendMessage('#announcements', 'Hello team!');

// Send a direct message to a user
SlackUtils.sendDirectMessage('username', 'Hello, this is a private message');

// Send a message with attachments
const attachments = [
  {
	color: '#36a64f',
	title: 'Project Update',
	text: 'Project is on track',
	fields: [
	  {
		title: 'Status',
		value: 'Green',
		short: true
	  }
	]
  }
];

SlackUtils.sendMessage('#project', 'Update', { attachments: attachments });
```

### Getting Message Links

When using the API token method, you can retrieve links to posted messages:

```javascript
const result = SlackUtils.sendMessage('#channel', 'Hello world');

if (result.success && result.messageInfo && result.messageInfo.messageLink) {
  const messageLink = result.messageInfo.messageLink;
  Logger.log('Message link: ' + messageLink);
  
  // You can now use this link in other messages or store it
}
```

### Creating Message Threads

You can reply to messages to create threaded conversations:

```javascript
// First, send a message and store its info
const result = SlackUtils.sendMessage('#project', 'Starting a new thread');

if (result.success) {
  // Then reply to create a thread
  SlackUtils.replyToMessage(
	result.messageInfo.channelId,
	result.messageInfo.timestamp,
	'This is a threaded reply'
  );
}
```

### Using Slack Templates

```javascript
// Create a template
const notificationTemplate = SlackUtils.createSlackTemplate(
  'Project {{projectName}} status: {{status}}.\n{{#if details}}Details: {{details}}{{/if}}'
);

// Use the template
notificationTemplate.send(
  '#project-updates',
  {
	projectName: 'Website Redesign',
	status: 'completed',
	details: 'Launch scheduled for next Monday'
  }
);
```

## Advanced Usage

### Combining Email and Slack Notifications

```javascript
function notifyProjectUpdate(projectName, status, details) {
  // Email the project team
  MsgUtils.sendEmail(
	'team@example.com',
	`Project Update: ${projectName}`,
	`The project ${projectName} is now ${status}. ${details}`
  );
  
  // Post in Slack channel
  SlackUtils.sendMessage(
	'#project-updates',
	`*Project Update:* ${projectName} is now ${status}. ${details}`
  );
}
```

### Creating Project-Specific Wrappers

```javascript
// Create a custom notification module
var ProjectNotifications = (function() {
  function initialize() {
	MsgUtils.setConfig({
	  defaultSubjectPrefix: '[Project] ',
	  useHtmlByDefault: false
	});
	
	SlackConfig.initialize({
	  apiToken: 'your-token-here',
	  defaultChannel: '#project-team'
	});
  }
  
  function notifyMilestone(milestoneName, completion) {
	// Email notification
	MsgUtils.sendEmail(
	  'stakeholders@example.com',
	  `Milestone Reached: ${milestoneName}`,
	  `We've reached the ${milestoneName} milestone (${completion}% complete).`
	);
	
	// Slack notification
	SlackUtils.sendMessage(
	  '#project-updates',
	  `:tada: *Milestone Reached*: ${milestoneName} (${completion}% complete)`
	);
  }
  
  return {
	initialize: initialize,
	notifyMilestone: notifyMilestone
  };
})();
```

## Debugging

Enable debug mode to see detailed logs:

```javascript
// For email debugging
MsgUtils.setConfig({ debugMode: true });

// For Slack debugging
SlackConfig.initialize({ debugMode: true });
```

## API Reference

### MsgUtils (Email)

- `setConfig(config)` - Set global configuration
- `getConfig()` - Get current configuration
- `sendEmail(recipient, subject, body, options)` - Send an email
- `sendTemplatedEmail(recipient, subject, templateText, templateData, options)` - Send a templated email
- `createTextTemplate(templateText)` - Create a reusable email template
- `debug(message, data)` - Log a debug message

### SlackUtils (Slack)

- `sendMessage(channelOrUserId, message, options)` - Send a Slack message
- `sendDirectMessage(userId, message, options)` - Send a direct message
- `replyToMessage(channelId, timestamp, message, options)` - Reply to a message
- `sendTemplatedMessage(channelOrUserId, templateText, templateData, options)` - Send a templated message
- `createSlackTemplate(templateText)` - Create a reusable Slack template

### SlackConfig

- `initialize(config)` - Initialize Slack configuration
- `getConfig()` - Get current Slack configuration
- `isConfigured()` - Check if Slack is properly configured
- `debug(message, data)` - Log a debug message

## Best Practices

1. **Initialize early**: Set up your configuration at the start of your script
2. **Error handling**: Always check the `success` property in the result objects
3. **Template organization**: Group related templates together in their own modules
4. **Message links**: Store message links for important notifications that might need follow-ups
5. **Appropriate channel**: Use direct messages for personal notifications, channels for team updates

## License

This library is available under the MIT Lic