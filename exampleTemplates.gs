/**
 * Example Email Template for MessagingUtils Library
 * 
 * This file demonstrates how to create and use email templates with the MessagingUtils library.
 * It can be included directly in the library or used as a reference for implementing templates
 * in projects that use the library.
 */

var ExampleTemplates = (function() {
  //-------------------------------------------------------------------
  // TEMPLATE DEFINITIONS
  //-------------------------------------------------------------------
  
  // Simple notification template
  const NOTIFICATION_TEMPLATE = `Hello {{name}},

This is a notification about {{subject}}.

Details:
- Event: {{eventName}}
- Date: {{eventDate}}
- Location: {{eventLocation}}

{{#if additionalInfo}}
Additional Information:
{{additionalInfo}}
{{/if}}

Please {{action}} by {{deadline}}.

Thank you,
{{sender}}`;

  // Report template
  const REPORT_TEMPLATE = `## {{reportTitle}} ##

Generated on: {{generatedDate}}
Report type: {{reportType}}
Period: {{startDate}} to {{endDate}}

{{#if summaryStats}}
SUMMARY:
{{summaryStats}}
{{/if}}

DETAILS:
{{reportDetails}}

{{#if notes}}
NOTES:
{{notes}}
{{/if}}

This is an automated report. Please contact {{contactPerson}} if you have any questions.`;

  // HTML announcement template
  const HTML_ANNOUNCEMENT_TEMPLATE = `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
  <h1 style="color: #0066cc; border-bottom: 1px solid #eee; padding-bottom: 10px;">{{title}}</h1>
  
  <p style="font-size: 16px; line-height: 1.5;">Hello {{recipient}},</p>
  
  <p style="font-size: 16px; line-height: 1.5;">{{mainMessage}}</p>
  
  {{#if bulletPoints}}
  <ul style="margin: 15px 0; padding-left: 20px;">
	{{#each bulletPoints}}
	<li style="margin-bottom: 10px;">{{this}}</li>
	{{/each}}
  </ul>
  {{/if}}
  
  {{#if callToAction}}
  <div style="margin: 25px 0; text-align: center;">
	<a href="{{callToActionUrl}}" style="display: inline-block; background-color: #0066cc; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">{{callToAction}}</a>
  </div>
  {{/if}}
  
  <p style="font-size: 16px; line-height: 1.5;">{{closingMessage}}</p>
  
  <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #eee; font-size: 14px; color: #666;">
	<p>{{footerText}}</p>
  </div>
</div>`;

  //-------------------------------------------------------------------
  // HELPER FUNCTIONS
  //-------------------------------------------------------------------
  
  /**
   * Process a template that uses Handlebars-like syntax
   * Much more advanced than the basic templating in MsgUtils
   * 
   * @param {string} template - Template text with Handlebars-like syntax
   * @param {Object} data - Data to populate the template
   * @return {string} Processed template
   */
  function processTemplate(template, data) {
	// Handle simple variable replacements
	let result = template.replace(/\{\{([^#\/][\w\.]*)\}\}/g, function(match, key) {
	  const value = data[key.trim()];
	  return value !== undefined ? value : '';
	});
	
	// Handle #if conditional blocks
	result = result.replace(/\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g, function(match, key, content) {
	  return data[key] ? content : '';
	});
	
	// Handle #each loops (simplified, only works with array values)
	result = result.replace(/\{\{#each\s+(\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g, function(match, key, template) {
	  if (!Array.isArray(data[key])) return '';
	  
	  return data[key].map(item => {
		// Replace {{this}} with the current item
		return template.replace(/\{\{this\}\}/g, item);
	  }).join('');
	});
	
	return result;
  }
  
  /**
   * Send an email using a specific template
   */
  function sendTemplatedEmail(recipient, subject, templateText, templateData, options) {
	// Process the template
	const processedBody = processTemplate(templateText, templateData);
	
	// Send the email
	return MsgUtils.sendEmail(recipient, subject, processedBody, options);
  }
  
  //-------------------------------------------------------------------
  // EXAMPLE USAGE FUNCTIONS
  //-------------------------------------------------------------------
  
  /**
   * Example function to send a notification email
   */
  function sendNotification(recipient, subject, eventDetails, deadline, action) {
	const templateData = {
	  name: recipient.split('@')[0],  // Simple name extraction
	  subject: subject,
	  eventName: eventDetails.name,
	  eventDate: eventDetails.date,
	  eventLocation: eventDetails.location,
	  additionalInfo: eventDetails.additionalInfo,
	  action: action,
	  deadline: deadline,
	  sender: Session.getActiveUser().getEmail()
	};
	
	return sendTemplatedEmail(
	  recipient,
	  `Notification: ${subject}`,
	  NOTIFICATION_TEMPLATE,
	  templateData
	);
  }
  
  /**
   * Example function to send a report email
   */
  function sendReport(recipient, reportData) {
	return sendTemplatedEmail(
	  recipient,
	  `Report: ${reportData.reportTitle}`,
	  REPORT_TEMPLATE,
	  reportData
	);
  }
  
  /**
   * Example function to send an HTML announcement
   */
  function sendAnnouncement(recipient, announcementData) {
	return sendTemplatedEmail(
	  recipient,
	  announcementData.title,
	  HTML_ANNOUNCEMENT_TEMPLATE,
	  announcementData,
	  { isHtml: true }
	);
  }
  
  //-------------------------------------------------------------------
  // TEST FUNCTIONS
  //-------------------------------------------------------------------
  
  /**
   * Test function for notification template
   */
  function testNotification() {
	const recipient = Session.getActiveUser().getEmail();
	
	const eventDetails = {
	  name: "Quarterly Planning Session",
	  date: "May 15, 2025",
	  location: "Conference Room A",
	  additionalInfo: "Please bring your project roadmaps and quarterly OKRs."
	};
	
	sendNotification(
	  recipient,
	  "Upcoming Planning Session",
	  eventDetails,
	  "May 10, 2025",
	  "RSVP"
	);
	
	Logger.log("Test notification sent");
  }
  
  /**
   * Test function for report template
   */
  function testReport() {
	const recipient = Session.getActiveUser().getEmail();
	
	const reportData = {
	  reportTitle: "Q1 Performance Summary",
	  generatedDate: new Date().toLocaleDateString(),
	  reportType: "Quarterly Performance",
	  startDate: "January 1, 2025",
	  endDate: "March 31, 2025",
	  summaryStats: "Total Projects: 12\nCompleted: 10\nDelayed: 2\nSuccess Rate: 83%",
	  reportDetails: "Project A: Completed on time\nProject B: Completed early\nProject C: Delayed by 2 weeks\n...",
	  notes: "Note: Q2 planning should address resource constraints identified in Projects C and H.",
	  contactPerson: "project-office@example.com"
	};
	
	sendReport(recipient, reportData);
	
	Logger.log("Test report sent");
  }
  
  /**
   * Test function for HTML announcement template
   */
  function testAnnouncement() {
	const recipient = Session.getActiveUser().getEmail();
	
	const announcementData = {
	  title: "New System Launch",
	  recipient: Session.getActiveUser().getEmail().split('@')[0],
	  mainMessage: "We're excited to announce the launch of our new project management system on May 1st, 2025.",
	  bulletPoints: [
		"Improved task tracking and dependencies",
		"Integrated time reporting",
		"New dashboard with real-time metrics",
		"Mobile app for on-the-go updates"
	  ],
	  callToAction: "Join Training Session",
	  callToActionUrl: "https://example.com/training",
	  closingMessage: "Please complete the online training by April 25th to ensure a smooth transition.",
	  footerText: "If you have any questions, please contact the IT Support team."
	};
	
	sendAnnouncement(recipient, announcementData);
	
	Logger.log("Test announcement sent");
  }
  
  /**
   * Run all tests
   */
  function testAllTemplates() {
	testNotification();
	testReport();
	testAnnouncement();
	
	Logger.log("All template tests completed");
  }
  
  //-------------------------------------------------------------------
  // PUBLIC API
  //-------------------------------------------------------------------
  
  return {
	// Templates
	NOTIFICATION_TEMPLATE: NOTIFICATION_TEMPLATE,
	REPORT_TEMPLATE: REPORT_TEMPLATE,
	HTML_ANNOUNCEMENT_TEMPLATE: HTML_ANNOUNCEMENT_TEMPLATE,
	
	// Send functions
	sendNotification: sendNotification,
	sendReport: sendReport,
	sendAnnouncement: sendAnnouncement,
	processTemplate: processTemplate,
	
	// Test functions
	testNotification: testNotification,
	testReport: testReport,
	testAnnouncement: testAnnouncement,
	testAllTemplates: testAllTemplates
  };
})();

/**
 * Standalone test function
 */
function testExampleTemplates() {
  ExampleTemplates.testAllTemplates();
}