import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';

// Configuration from environment variables
const BASE_URL = process.env.APPRAISAL_FIREWALL_BASE_URL || '';
const API_KEY = process.env.APPRAISAL_FIREWALL_API_KEY || '';
const API_SECRET = process.env.APPRAISAL_FIREWALL_API_SECRET || '';

interface AppraisalFirewallConfig {
  baseUrl: string;
  apiKey: string;
  apiSecret: string;
}

class AppraisalFirewallMCPServer {
  private server: Server;
  private config: AppraisalFirewallConfig;

  constructor() {
    this.config = {
      baseUrl: BASE_URL,
      apiKey: API_KEY,
      apiSecret: API_SECRET,
    };

    this.server = new Server(
      {
        name: 'appraisal-firewall-mcp-server',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    this.setupErrorHandling();
  }

  private setupErrorHandling(): void {
    this.server.onerror = (error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private setupToolHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'create_residential_appraisal_order',
          description: 'Create a residential appraisal order in Appraisal Firewall',
          inputSchema: {
            type: 'object',
            properties: {
              originatorEmail: {
                type: 'string',
                description: 'Email of the originator',
              },
              webhookUrl: {
                type: 'string',
                description: 'Webhook URL for order updates',
              },
              losUniqueId: {
                type: 'string',
                description: 'Unique identifier from LOS',
              },
              property: {
                type: 'object',
                properties: {
                  street: { type: 'string' },
                  city: { type: 'string' },
                  zip: { type: 'string' },
                  state: { type: 'string' },
                  county: { type: 'string' },
                  propertyDescription: { type: 'string' },
                  parcelNumber: { type: 'string' },
                },
                required: ['street', 'city', 'zip', 'state'],
              },
              borrower: {
                type: 'object',
                properties: {
                  firstName: { type: 'string' },
                  lastName: { type: 'string' },
                  email: { type: 'string' },
                },
                required: ['firstName', 'lastName', 'email'],
              },
              coBorrower: {
                type: 'object',
                properties: {
                  firstName: { type: 'string' },
                  lastName: { type: 'string' },
                  email: { type: 'string' },
                },
              },
              entryContact: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  contactIs: { type: 'string', enum: ['owner', 'realtor'] },
                  phone: { type: 'string' },
                  cell: { type: 'string' },
                  email: { type: 'string' },
                },
                required: ['name', 'contactIs'],
              },
              classification: {
                type: 'object',
                properties: {
                  waterfront: { type: 'boolean', default: false },
                  manufactured: { type: 'boolean', default: false },
                  oversized: { type: 'boolean', default: false },
                  singleFamily: { type: 'boolean', default: true },
                  acreage: { type: 'boolean', default: false },
                  rural: { type: 'boolean', default: false },
                  construction: { type: 'boolean', default: false },
                  nonOwner: { type: 'boolean', default: false },
                  condo: { type: 'boolean', default: false },
                  twoFour: { type: 'boolean', default: false },
                  fha: { type: 'boolean', default: false },
                  usda: { type: 'boolean', default: false },
                  jumbo: { type: 'boolean', default: false },
                  va: { type: 'boolean', default: false },
                  certified: { type: 'boolean', default: false },
                  complex: { type: 'boolean', default: false },
                  complexProp: { type: 'boolean', default: false },
                  rush: { type: 'boolean', default: false },
                  requireBid: { type: 'boolean', default: false },
                  pud: { type: 'boolean', default: false },
                  twoZeroThreeK: { type: 'boolean', default: false },
                  fhaFlip: { type: 'boolean', default: false },
                  renovation: { type: 'boolean', default: false },
                  frt: { type: 'boolean', default: false },
                },
              },
              specialInstructions: { type: 'string' },
              salePrice: { type: 'number' },
              dateIntentToProceed: { type: 'string' },
              dateEstimatedClosing: { type: 'string' },
              dateRequired: { type: 'string' },
              loanNumber: { type: 'string' },
              loanType: {
                type: 'string',
                enum: ['Refinance', 'Purchase', 'Construction', 'Equity', 'Other'],
              },
              lpaKey: { type: 'string' },
              duCaseFileId: { type: 'string' },
              investor: { type: 'string' },
              fha: { type: 'boolean', default: false },
              fhaNumber: { type: 'string' },
            },
            required: ['originatorEmail', 'webhookUrl', 'losUniqueId', 'property', 'borrower'],
          },
        },
        {
          name: 'create_commercial_appraisal_order',
          description: 'Create a commercial appraisal order in Appraisal Firewall',
          inputSchema: {
            type: 'object',
            properties: {
              originatorEmail: { type: 'string' },
              webhookUrl: { type: 'string' },
              losUniqueId: { type: 'string' },
              borrower: {
                type: 'object',
                properties: {
                  firstName: { type: 'string' },
                  lastName: { type: 'string' },
                  email: { type: 'string' },
                },
                required: ['firstName', 'lastName', 'email'],
              },
              coBorrower: {
                type: 'object',
                properties: {
                  firstName: { type: 'string' },
                  lastName: { type: 'string' },
                  email: { type: 'string' },
                },
              },
              loanNumber: { type: 'string' },
              salesPrice: { type: 'string' },
              property: {
                type: 'object',
                properties: {
                  street: { type: 'string' },
                  city: { type: 'string' },
                  state: { type: 'string' },
                  zip: { type: 'string' },
                  county: { type: 'string' },
                  parcelNumber: { type: 'string' },
                  propertyDescription: { type: 'string' },
                },
                required: ['street', 'city', 'state', 'zip'],
              },
              entryContact: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  contactIs: { type: 'string', enum: ['owner', 'realtor'] },
                  phone: { type: 'string' },
                  cell: { type: 'string' },
                  email: { type: 'string' },
                },
                required: ['name', 'contactIs'],
              },
              attachments: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    filename: { type: 'string' },
                    data: { type: 'string', description: 'Base64 encoded data' },
                  },
                  required: ['filename', 'data'],
                },
              },
              commercialData: {
                type: 'object',
                properties: {
                  ownerName: { type: 'string' },
                  propertyType: { type: 'string' },
                  size: { type: 'string' },
                  reportType: { type: 'string', default: 'Summary' },
                  valueApproachCost: { type: 'boolean', default: true },
                  valueApproachIncome: { type: 'boolean', default: false },
                  valueApproachSales: { type: 'boolean', default: true },
                  propertyInterest: { type: 'string', default: 'Fee Simple' },
                },
              },
              replyWithBidBy: { type: 'string' },
            },
            required: ['originatorEmail', 'webhookUrl', 'losUniqueId', 'borrower', 'property'],
          },
        },
        {
          name: 'send_message',
          description: 'Send a message to the appraiser through Appraisal Firewall',
          inputSchema: {
            type: 'object',
            properties: {
              losUniqueId: {
                type: 'string',
                description: 'Unique identifier from LOS',
              },
              message: {
                type: 'string',
                description: 'Message to send to the appraiser',
              },
              attachment: {
                type: 'object',
                properties: {
                  filename: { type: 'string' },
                  url: { type: 'string' },
                },
              },
            },
            required: ['losUniqueId', 'message'],
          },
        },
        {
          name: 'get_order_details',
          description: 'Get order details and link from Appraisal Firewall',
          inputSchema: {
            type: 'object',
            properties: {
              losUniqueId: {
                type: 'string',
                description: 'Unique identifier from LOS',
              },
            },
            required: ['losUniqueId'],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'create_residential_appraisal_order':
            return await this.createResidentialAppraisalOrder(args);
          case 'create_commercial_appraisal_order':
            return await this.createCommercialAppraisalOrder(args);
          case 'send_message':
            return await this.sendMessage(args);
          case 'get_order_details':
            return await this.getOrderDetails(args);
          default:
            throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
        }
      } catch (error) {
        if (error instanceof McpError) {
          throw error;
        }
        throw new McpError(
          ErrorCode.InternalError,
          `Error executing tool ${name}: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    });
  }

  private async createResidentialAppraisalOrder(args: any) {
    this.validateConfig();

    const payload = {
      apikey: this.config.apiKey,
      apisecret: this.config.apiSecret,
      originatoremail: args.originatorEmail,
      webhookurl: args.webhookUrl,
      losuniqueid: args.losUniqueId,
      property: {
        street: args.property.street,
        city: args.property.city,
        zip: args.property.zip,
        state: args.property.state,
        county: args.property.county,
        propertydescription: args.property.propertyDescription,
        parcelnumber: args.property.parcelNumber,
      },
      investor: args.investor,
      classification: args.classification ? {
        waterfront: args.classification.waterfront || false,
        manufactured: args.classification.manufactured || false,
        oversized: args.classification.oversized || false,
        singlefamily: args.classification.singleFamily || true,
        acreage: args.classification.acreage || false,
        rural: args.classification.rural || false,
        construction: args.classification.construction || false,
        nonowner: args.classification.nonOwner || false,
        condo: args.classification.condo || false,
        twofour: args.classification.twoFour || false,
        fha: args.classification.fha || false,
        usda: args.classification.usda || false,
        jumbo: args.classification.jumbo || false,
        va: args.classification.va || false,
        certified: args.classification.certified || false,
        complex: args.classification.complex || false,
        complexprop: args.classification.complexProp || false,
        rush: args.classification.rush || false,
        requirebid: args.classification.requireBid || false,
        pud: args.classification.pud || false,
        twozerothreek: args.classification.twoZeroThreeK || false,
        fhaflip: args.classification.fhaFlip || false,
        renovation: args.classification.renovation || false,
        frt: args.classification.frt || false,
      } : {},
      fha: args.fha || false,
      fhanumber: args.fhaNumber || '',
      borrower: {
        firstname: args.borrower.firstName,
        lastname: args.borrower.lastName,
        email: args.borrower.email,
      },
      coborrower: args.coBorrower ? {
        firstname: args.coBorrower.firstName,
        lastname: args.coBorrower.lastName,
        email: args.coBorrower.email,
      } : {},
      entrycontact: args.entryContact ? {
        name: args.entryContact.name,
        contactis: args.entryContact.contactIs,
        phone: args.entryContact.phone,
        cell: args.entryContact.cell,
        email: args.entryContact.email,
      } : {},
      specialinstructions: args.specialInstructions || '',
      saleprice: args.salePrice,
      dateintenttoproceed: args.dateIntentToProceed,
      dateestimatedclosing: args.dateEstimatedClosing,
      daterequired: args.dateRequired,
      loannumber: args.loanNumber,
      loantype: args.loanType,
      lpakey: args.lpaKey,
      ducasefileid: args.duCaseFileId,
    };

    const response = await axios.post(`${this.config.baseUrl}/create`, payload);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(response.data, null, 2),
        },
      ],
    };
  }

  private async createCommercialAppraisalOrder(args: any) {
    this.validateConfig();

    const payload = {
      apikey: this.config.apiKey,
      apisecret: this.config.apiSecret,
      originatoremail: args.originatorEmail,
      webhookurl: args.webhookUrl,
      losuniqueid: args.losUniqueId,
      productcode: 'COMM',
      product: 'Commercial',
      borrower: {
        firstname: args.borrower.firstName,
        lastname: args.borrower.lastName,
        email: args.borrower.email,
      },
      coborrower: args.coBorrower ? {
        firstname: args.coBorrower.firstName,
        lastname: args.coBorrower.lastName,
        email: args.coBorrower.email,
      } : {},
      loannumber: args.loanNumber,
      salesprice: args.salesPrice,
      property: {
        street: args.property.street,
        city: args.property.city,
        state: args.property.state,
        zip: args.property.zip,
        county: args.property.county,
        parcelnumber: args.property.parcelNumber || '',
        propertydescription: args.property.propertyDescription || '',
      },
      entrycontact: args.entryContact ? {
        name: args.entryContact.name,
        contactis: args.entryContact.contactIs,
        phone: args.entryContact.phone,
        cell: args.entryContact.cell,
        email: args.entryContact.email,
      } : {},
      attachments: args.attachments || [],
      commercialdata: args.commercialData ? {
        ownername: args.commercialData.ownerName || '',
        propertytype: args.commercialData.propertyType || '',
        size: args.commercialData.size || '',
        reporttype: args.commercialData.reportType || 'Summary',
        valueapproachcost: args.commercialData.valueApproachCost !== false,
        valueapproachincome: args.commercialData.valueApproachIncome === true,
        valueapproachsales: args.commercialData.valueApproachSales !== false,
        propertyinterest: args.commercialData.propertyInterest || 'Fee Simple',
      } : {},
      replywithbidby: args.replyWithBidBy,
    };

    const response = await axios.post(`${this.config.baseUrl}/create`, payload);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(response.data, null, 2),
        },
      ],
    };
  }

  private async sendMessage(args: any) {
    this.validateConfig();

    const payload = {
      losuniqueid: args.losUniqueId,
      message: args.message,
      attachment: args.attachment || {},
    };

    const response = await axios.post(`${this.config.baseUrl}/message`, payload);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(response.data, null, 2),
        },
      ],
    };
  }

  private async getOrderDetails(args: any) {
    this.validateConfig();

    const response = await axios.get(`${this.config.baseUrl}/order/${args.losUniqueId}`);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(response.data, null, 2),
        },
      ],
    };
  }

  private validateConfig(): void {
    if (!this.config.baseUrl || !this.config.apiKey || !this.config.apiSecret) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        'Missing required configuration. Please set APPRAISAL_FIREWALL_BASE_URL, APPRAISAL_FIREWALL_API_KEY, and APPRAISAL_FIREWALL_API_SECRET environment variables.'
      );
    }
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Appraisal Firewall MCP server running on stdio');
  }
}

const server = new AppraisalFirewallMCPServer();
server.run().catch(console.error);