# MessagingUtils Library

A Google Apps Script library for unified message handling across different platforms. The library provides a consistent, flexible API for sending notifications via email (with a framework for future expansion to other messaging platforms like Slack).

## Features

- **Unified API**: Common interface for sending messages across different platforms
- **Templating System**: Built-in support for template-based messages with variable substitution
- **Configuration Options**: Adjustable settings for default behaviors
- **Namespaced Design**: Uses the `MsgUtils` namespace to avoid conflicts
- **Debug Mode**: Optional logging for troubleshooting
- **Extensible Design**: Framework for adding support for additional messaging platforms

## Installation

### As a Library

1. Create a new Google Apps Script project at [script.google.com](https://script.google.com)
2. Add the library code to the project
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
5. Set "MsgUtils" as the Identifier
6. Click "Add"

## Basic Usage

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

### Using Templates

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

## Advanced Usage

### Creating Project-Specific Templates

```javascript
// Create a module for your project templates
var ProjectTemplates = (function() {
  // Define templates
  const NOTIFICATION_TEMPLATE = 'Project {{projectName}} status: {{status}}';
  
  // Create helper functions
  function sendStatusNotification(recipient, projectName, status) {
	return MsgUtils.sendTemplatedEmail(
	  recipient,
	  'Project Status Update',
	  NOTIFICATION_TEMPLATE,
	  { projectName: projectName, status: status }
	);
  }
  
  // Return public API
  return {
	sendStatusNotification: sendStatusNotification
  };
})();
```

### Auto-Initialization Wrapper

```javascript
// Create a wrapper with auto-initialization
const ProjectMessaging = (function() {
  let initialized = false;
  
  function ensureInitialized() {
	if (!initialized) {
	  MsgUtils.setConfig({
		defaultSubjectPrefix: '[Project] ',
		useHtmlByDefault: false
	  });
	  initialized = true;
	}
  }
  
  return {
	sendEmail: function(recipient, subject, body, options) {
	  ensureInitialized();
	  return MsgUtils.sendEmail(recipient, subject, body, options);
	}
	// Add more wrapped functions as needed
  };
})();
```

## Debugging

Enable debug mode to see detailed logs:

```javascript
MsgUtils.setConfig({ debugMode: true });
MsgUtils.debug('Testing debug message', { someData: 'value' });
```

## Extending with New Platforms

The library is designed to be extended with additional messaging platforms. 
Future versions may include support for Slack, Microsoft Teams, or other platforms.

## Function Reference

### Configuration

- `setConfig(config)` - Set global configuration options
- `getConfig()` - Get current configuration

### Email

- `sendEmail(recipient, subject, body, options)` - Send an email
- `sendTemplatedEmail(recipient, subject, templateText, templateData, options)` - Send a templated email
- `createTextTemplate(templateText)` - Create a reusable template

### Debugging

- `debug(message, data)` - Log a debug message if debug mode is enabled

## Best Practices

1. **Group related templates**: Keep project-specific templates together in their own module
2. **Use auto-initialization**: Create wrappers that handle initialization automatically
3. **Keep templates simple**: Use the simplest template syntax that meets your needs
4. **Prefer text templates**: Use plain text for system notifications, reserve HTML for formatted newsletters
5. **Test thoroughly**: Use the test functions to verify templates and configuration
6. **Handle errors**: Check the return values from send functions to handle errors gracefully

## Examples

See the `ExampleTemplates.gs` file for complete examples of:
- Plain text notifications
- Formatted reports
- HTML announcements
- Advanced templating techniques

## License

This library is available under the MIT License.