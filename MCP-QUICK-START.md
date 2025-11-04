# Playwright MCP - Quick Start Guide

## ⚡ TL;DR

1. Edit: `%APPDATA%\Claude\claude_desktop_config.json`
2. Add this config:
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
3. Restart Claude Desktop
4. Ask Claude: "Navigate to http://localhost:19006"

## 📍 Config File Location

**Windows:**
```
C:\Users\chris\AppData\Roaming\Claude\claude_desktop_config.json
```

**Quick access:** Press `Win + R`, type `%APPDATA%\Claude`, press Enter

## 🚀 First Test

1. Start your app:
   ```bash
   npm run web
   ```

2. In Claude Desktop, say:
   ```
   Open http://localhost:19006 in a browser and take a screenshot
   ```

## 💡 Example Prompts for Booth 33

```
Navigate to my Booth 33 app and click through the booking flow
```

```
Test the login screen by entering test@example.com and password
```

```
Take screenshots of all the main screens in my app
```

```
Fill out the booking form with sample data for a music session
```

```
Navigate to the admin portal and test the calendar management
```

## ✅ Verify MCP is Working

After restarting Claude Desktop, ask:
```
Can you navigate to https://example.com using Playwright?
```

If Claude opens a browser and navigates, you're all set! 🎉

## 🔧 Troubleshooting

**Not working?**
- Did you restart Claude Desktop completely? (Quit from system tray)
- Is your JSON valid? (No trailing commas, proper quotes)
- Try running manually: `npm run mcp`

**Browser not opening?**
- Check `PLAYWRIGHT_HEADLESS` is `"false"` (with quotes)
- Run: `npx playwright install`

## 📚 Full Documentation

See `MCP-SETUP.md` for complete details.
