import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import App from './App';
import { BearerDid, Exchange, Message, getExchange } from '@tbdex/sdk';

// Mock all external dependencies
jest.mock('axios');
jest.mock('@tbdex/sdk', () => ({
  BearerDid: {
    fromPortableDID: jest.fn(() => ({
      did: { uri: 'mock-wallet-did-uri' },
      sign: jest.fn(),
    })),
  },
  Rfq: {
    create: jest.fn(() => ({
      metadata: { exchangeId: 'mock-exchange-id' },
      sign: jest.fn(),
      verify: jest.fn(),
      toJSONString: jest.fn(() => JSON.stringify({ mockRfq: true })),
    })),
  },
  Order: {
    create: jest.fn(() => ({
      metadata: { id: 'mock-order-id' },
      sign: jest.fn(),
      verify: jest.fn(),
      toJSONString: jest.fn(() => JSON.stringify({ mockOrder: true })),
    })),
  },
  getOfferings: jest.fn(() => Promise.resolve([
    { metadata: { id: 'mock-offering-id' } }
  ])),
  getExchange: jest.fn(),
}));

describe('Happy Path Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('completes full happy path flow successfully', async () => {
    // Mock API responses for different stages of the flow
    const mockedAxios = axios as jest.Mocked<typeof axios>;
    
    // Mock create exchange response
    mockedAxios.post.mockResolvedValueOnce({ data: { exchangeId: 'mock-exchange-id' } });
    
    // Mock submit order response
    mockedAxios.put.mockResolvedValueOnce({ data: { success: true } });

    // Setup exchange state progression
    const exchangeStates = [
      // Initial state with quote
      {
        quote: {
          metadata: { id: 'mock-quote-id' },
          data: { expiresAt: '2024-12-31T23:59:59Z' }
        }
      },
      // State with order instructions
      {
        quote: {
          metadata: { id: 'mock-quote-id' },
          data: { expiresAt: '2024-12-31T23:59:59Z' }
        },
        orderInstructions: {
          metadata: { id: 'mock-order-instructions-id' },
          data: { instructions: 'Test instructions' }
        }
      },
      // State with payout settled
      {
        quote: {
          metadata: { id: 'mock-quote-id' },
          data: { expiresAt: '2024-12-31T23:59:59Z' }
        },
        orderInstructions: {
          metadata: { id: 'mock-order-instructions-id' },
          data: { instructions: 'Test instructions' }
        },
        orderStatuses: [
          {
            metadata: { id: 'mock-status-id' },
            data: { status: 'PAYOUT_SETTLED' }
          }
        ]
      },
      // Final state with close
      {
        quote: {
          metadata: { id: 'mock-quote-id' },
          data: { expiresAt: '2024-12-31T23:59:59Z' }
        },
        orderInstructions: {
          metadata: { id: 'mock-order-instructions-id' },
          data: { instructions: 'Test instructions' }
        },
        orderStatuses: [
          {
            metadata: { id: 'mock-status-id' },
            data: { status: 'PAYOUT_SETTLED' }
          }
        ],
        close: {
          metadata: { id: 'mock-close-id' },
          data: { success: true }
        }
      }
    ];

    let currentStateIndex = 0;
    (getExchange as jest.Mock).mockImplementation(() => {
      return Promise.resolve(exchangeStates[currentStateIndex]);
    });

    // Render the component
    render(<App />);

    // Verify initial render
    expect(screen.getByText('Happy Path Flow')).toBeInTheDocument();
    expect(screen.getByText('Execute Happy Path Flow')).toBeInTheDocument();

    // Start the flow
    fireEvent.click(screen.getByText('Execute Happy Path Flow'));

    // Verify progress messages appear in sequence
    await waitFor(() => {
      expect(screen.getByText('~ Running Happy Path Flow ~')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('1. Fetching offerings...')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText(/Successfully fetched offering ID: mock-offering-id/)).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('2. Creating exchange...')).toBeInTheDocument();
    });

    // Increment state for quote
    currentStateIndex++;
    await waitFor(() => {
      expect(screen.getByText(/Received quote with ID: mock-quote-id/)).toBeInTheDocument();
    });

    // Increment state for order instructions
    currentStateIndex++;
    await waitFor(() => {
      expect(screen.getByText(/Received order instructions with ID: mock-order-instructions-id/)).toBeInTheDocument();
    });

    // Increment state for payout settled
    currentStateIndex++;
    await waitFor(() => {
      expect(screen.getByText('Order status PAYOUT_SETTLED confirmed.')).toBeInTheDocument();
    });

    // Verify all expected API calls were made
    expect(mockedAxios.post).toHaveBeenCalledWith(
      'http://localhost:8082/exchanges',
      expect.any(Object)
    );
    expect(mockedAxios.put).toHaveBeenCalledWith(
      'http://localhost:8082/exchanges/mock-exchange-id',
      expect.any(Object)
    );
  }, 30000);
});