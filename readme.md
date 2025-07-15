# Appraisal Firewall MCP Server

A Model Context Protocol (MCP) server that provides integration with the Appraisal Firewall API. This server allows Claude and other MCP clients to create appraisal orders, send messages, and retrieve order details.

## Features

- **Create Residential Appraisal Orders**: Submit residential property appraisal requests
- **Create Commercial Appraisal Orders**: Submit commercial property appraisal requests  
- **Send Messages**: Communicate with appraisers through the system
- **Get Order Details**: Retrieve order information and status

## Quick Start

### Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd appraisal-firewall-mcp-server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   APPRAISAL_FIREWALL_BASE_URL=https://your-appraisal-firewall-api.com
   APPRAISAL_FIREWALL_API_KEY=your_api_key
   APPRAISAL_FIREWALL_API_SECRET=your_api_secret
   ```

4. **Build and run**
   ```bash
   npm run build
   npm start
   ```

   For development with auto-reload:
   ```bash
   npm run dev
   ```

### Railway Deployment

1. **Connect your GitHub repository to Railway**
   - Go to [Railway](https://railway.app)
   - Create a new project
   - Connect your GitHub repository

2. **Set environment variables in Railway**
   In your Railway project dashboard, go to Variables and add:
   - `APPRAISAL_FIREWALL_BASE_URL`
   - `APPRAISAL_FIREWALL_API_KEY` 
   - `APPRAISAL_FIREWALL_API_SECRET`

3. **Deploy**
   Railway will automatically deploy when you push to your main branch.

## Usage with Claude Desktop

Add this to your Claude Desktop configuration file:

### For local usage:
```json
{
  "mcpServers": {
    "appraisal-firewall": {
      "command": "node",
      "args": ["/path/to/your/project/dist/index.js"],
      "env": {
        "APPRAISAL_FIREWALL_BASE_URL": "https://your-api-url.com",
        "APPRAISAL_FIREWALL_API_KEY": "your_key",
        "APPRAISAL_FIREWALL_API_SECRET": "your_secret"
      }
    }
  }
}
```

### For Railway deployment:
If you want to use the Railway-deployed version, you'll need to set up a different transport mechanism since Railway doesn't support stdio directly for MCP. Consider using the local version for Claude Desktop.

## Usage with Cursor

1. Install the MCP extension for Cursor
2. Configure the server in your Cursor settings:
   ```json
   {
     "mcp.servers": [
       {
         "name": "appraisal-firewall",
         "command": "node",
         "args": ["/path/to/project/dist/index.js"],
         "env": {
           "APPRAISAL_FIREWALL_BASE_URL": "https://your-api-url.com",
           "APPRAISAL_FIREWALL_API_KEY": "your_key", 
           "APPRAISAL_FIREWALL_API_SECRET": "your_secret"
         }
       }
     ]
   }
   ```

## Available Tools

### `create_residential_appraisal_order`
Creates a new residential appraisal order.

**Required Parameters:**
- `originatorEmail`: Email of the loan originator
- `webhookUrl`: URL to receive status updates
- `losUniqueId`: Unique identifier from your LOS
- `property`: Property details (street, city, zip, state)
- `borrower`: Borrower information (firstName, lastName, email)

**Optional Parameters:**
- `coBorrower`: Co-borrower information
- `entryContact`: Property contact information
- `classification`: Property classification flags
- `specialInstructions`: Additional instructions
- `salePrice`: Property sale price
- Date fields, loan information, etc.

### `create_commercial_appraisal_order`
Creates a new commercial appraisal order.

**Required Parameters:**
- `originatorEmail`: Email of the loan originator
- `webhookUrl`: URL to receive status updates
- `losUniqueId`: Unique identifier from your LOS
- `borrower`: Borrower information
- `property`: Property details

**Optional Parameters:**
- `coBorrower`: Co-borrower information
- `entryContact`: Property contact information
- `attachments`: File attachments (base64 encoded)
- `commercialData`: Commercial-specific data
- `replyWithBidBy`: Bid deadline

### `send_message`
Sends a message to the appraiser.

**Parameters:**
- `losUniqueId`: Order identifier
- `message`: Message text
- `attachment`: Optional file attachment

### `get_order_details`
Retrieves order details and access URL.

**Parameters:**
- `losUniqueId`: Order identifier

## API Documentation Reference

This MCP server implements the following Appraisal Firewall API endpoints:

- `POST /create` - Order creation
- `POST /message` - Send message
- `GET /order/<losUniqueId>` - Get order details

The server also handles webhook payloads for order updates, though webhook receiving functionality would need to be implemented separately if required.

## Error Handling

The server includes comprehensive error handling:
- Validates required configuration on startup
- Handles API errors gracefully
- Provides detailed error messages for debugging

## Development

### Project Structure
```
src/
  index.ts          # Main server implementation
dist/               # Compiled JavaScript (generated)
package.json        # Dependencies and scripts
tsconfig.json       # TypeScript configuration
README.md          # This file
```

### Building
```bash
npm run build
```

### Running in Development
```bash
npm run dev
```

## License

MIT

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

For issues with the MCP server, please create an issue in this repository.
For issues with the Appraisal Firewall API itself, contact their support team.