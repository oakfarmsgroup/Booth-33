# Playwright MCP Server Setup

This guide will help you set up the Playwright MCP (Model Context Protocol) server to allow Claude to interact with your Booth 33 application through browser automation.

## What is Playwright MCP?

The Playwright MCP server allows Claude to:
- Navigate to URLs in a browser
- Click buttons and interact with elements
- Fill out forms
- Take screenshots
- Run automated browser tests
- Interact with your web application in real-time

## Installation

✅ **Already Completed** - The `@playwright/mcp` package has been installed in this project.

## Configuration for Claude Desktop

To enable Playwright MCP in Claude Desktop, you need to add it to your MCP configuration file.

### Windows Configuration Path

Edit your Claude Desktop configuration file at:
```
%APPDATA%\Claude\claude_desktop_config.json
```

Full path:
```
C:\Users\chris\AppData\Roaming\Claude\claude_desktop_config.json
```

### macOS Configuration Path

```
~/Library/Application Support/Claude/claude_desktop_config.json
```

### Configuration Contents

Add the following to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["-y", "@playwright/mcp"],
      "env": {
        "PLAYWRIGHT_HEADLESS": "false"
      }
    }
  }
}
```

**Note:** If you already have other MCP servers configured, just add the `playwright` entry to the existing `mcpServers` object.

### Configuration Options

- **`PLAYWRIGHT_HEADLESS: "false"`** - Shows the browser window (useful for debugging)
- **`PLAYWRIGHT_HEADLESS: "true"`** - Runs browser in background (faster, but you can't see what's happening)

## Using Playwright MCP with Claude

After configuring and restarting Claude Desktop, you can ask Claude to:

### Example Prompts

1. **Navigate and test:**
   ```
   Open http://localhost:19006 in a browser and click the "Book" button
   ```

2. **Fill out forms:**
   ```
   Go to my app's booking page and fill out a sample booking form
   ```

3. **Take screenshots:**
   ```
   Navigate to my app and take a screenshot of the home screen
   ```

4. **Test functionality:**
   ```
   Test the login flow on my app by filling in test credentials
   ```

5. **Automated testing:**
   ```
   Run through the complete booking flow and verify all steps work
   ```

## Setup Steps

1. **Install Playwright browsers** (if not already done):
   ```bash
   npx playwright install
   ```

2. **Edit Claude Desktop configuration:**
   - Open `%APPDATA%\Claude\claude_desktop_config.json`
   - Add the Playwright MCP configuration (see above)
   - Save the file

3. **Restart Claude Desktop completely**:
   - Close all Claude windows
   - Quit Claude from the system tray (right-click → Quit)
   - Reopen Claude Desktop

4. **Verify it's working:**
   - In Claude Desktop, look for a small "connection" or "tools" indicator
   - Or simply ask: "Can you open a browser and navigate to google.com?"

## Using with Booth 33

To test your Booth 33 application:

1. **Start the web server:**
   ```bash
   npm run web
   ```

2. **In Claude Desktop, ask:**
   ```
   Navigate to http://localhost:19006 and interact with the Booth 33 app
   ```

3. **Examples of what you can do:**
   - Test the booking flow
   - Verify forms work correctly
   - Take screenshots of different screens
   - Test navigation between tabs
   - Fill out sample data
   - Test the admin portal

## Troubleshooting

### MCP Server Not Showing Up

- Make sure you restarted Claude Desktop **completely** (quit from system tray)
- Check that the configuration file has valid JSON syntax
- Verify the path to `claude_desktop_config.json` is correct

### "Command not found" or "npx not found"

- Make sure Node.js and npm are installed globally
- Try using the full path to npx in the config:
  ```json
  "command": "C:\\Program Files\\nodejs\\npx.exe"
  ```

### Browser doesn't open

- Check that `PLAYWRIGHT_HEADLESS` is set to `"false"` (not `false` without quotes)
- Make sure Playwright browsers are installed: `npx playwright install`

### Permission Issues

- Run Claude Desktop as administrator (Windows)
- Or ensure your user has permissions to run npx commands

## Testing MCP Connection

In Claude Desktop, try this simple test:

```
Use Playwright to navigate to https://example.com and tell me what you see on the page
```

If Claude can describe the page contents or take a screenshot, your MCP server is working!

## Local Configuration File

A sample configuration has been created in this project at:
```
mcp-config.json
```

This is for reference only - the actual configuration must be in Claude Desktop's config file.

## Resources

- [Playwright MCP Documentation](https://github.com/microsoft/playwright-mcp)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Claude Desktop MCP Guide](https://docs.anthropic.com/claude/docs/model-context-protocol)

## Security Note

The Playwright MCP server can control a browser and interact with any website. Only use it with trusted applications and be cautious about:
- Entering real credentials
- Accessing sensitive data
- Interacting with production systems

For testing Booth 33, use test credentials and local development environments only.
