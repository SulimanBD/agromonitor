class MockWebSocket {
  static instance: any;

  onopen: ((event: any) => void) | null = null;
  onmessage: ((event: any) => void) | null = null;
  onerror: ((event: any) => void) | null = null;
  onclose: ((event: any) => void) | null = null;

  constructor(url: string) {
    console.log('[MockWebSocket] Created for:', url);
    if (url.includes('/ws/sensor_readings/GreenhouseHub1')) {
      MockWebSocket.instance = this;
      setTimeout(() => this.onopen?.({ type: 'open' }), 100); // allow listeners to attach
    } else {
      // Check if the real WebSocket is available and use it for other URLs
      if (window._RealWebSocket) {
        return new (window._RealWebSocket as typeof WebSocket)(url);
      } else {
        throw new Error('Real WebSocket is not available');
      }
    }
  }

  // Mock WebSocket properties
  get readyState(): number {
    return WebSocket.OPEN; // You can return a valid WebSocket readyState
  }

  send(data: any) {
    console.log('[MockWebSocket] Sent:', data);
  }

  close() {
    console.log('[MockWebSocket] Closed');
    this.onclose?.({ type: 'close' });
  }

  // Mock other WebSocket properties
  binaryType: BinaryType = "blob"; // Correct type for binaryType
  bufferedAmount: number = 0;
  extensions: string = "";
  protocol: string = "wss";
  // Add other missing properties as needed
}

describe('Device Real Time page', () => {
  beforeEach(() => {

    // Step 1: Mock the useAuth hook to always return true (authenticated state)
    cy.visit('/devices/GreenhouseHub1', {
      onBeforeLoad(win) {
        // ✅ Prevent redirect in useAuth hook
        win.__CYPRESS_AUTH__ = true;
        win.localStorage.setItem('access_token', 'mocked-token');
        
        // Backup real WebSocket before overriding
        win._RealWebSocket = win.WebSocket;
      },
    });
  });

  it('displays sensor data received via WebSocket after page load', () => {

    // Step 2: Inject WebSocket mock AFTER page has loaded
    cy.window().then((win) => {
      class MockWebSocket {
        static instance: any;

        onopen: ((event: any) => void) | null = null;
        onmessage: ((event: any) => void) | null = null;
        onerror: ((event: any) => void) | null = null;
        onclose: ((event: any) => void) | null = null;

        constructor(url: string) {
          console.log('[MockWebSocket] Created for:', url);
          if (url.includes('/ws/sensor_readings/GreenhouseHub1')) {
            MockWebSocket.instance = this;
            setTimeout(() => this.onopen?.({ type: 'open' }), 100); // allow listeners to attach
          } else {
            if (win._RealWebSocket) {
              return new (win._RealWebSocket as typeof WebSocket)(url);
            } else {
              throw new Error('Real WebSocket is not available');
            }
          }
        }

        // Mock WebSocket properties
        get readyState(): number {
          return WebSocket.OPEN;
        }

        send(data: any) {
          console.log('[MockWebSocket] Sent:', data);
        }

        close() {
          console.log('[MockWebSocket] Closed');
          this.onclose?.({ type: 'close' });
        }

        // Mock other WebSocket properties
        binaryType: BinaryType = "blob";
        bufferedAmount: number = 0;
        extensions: string = "";
        protocol: string = "wss";
      }

      // Override with mock
      win.WebSocket = MockWebSocket as any;

      // Add helper to send mock message
      win.__sendMessage = () => {
        const socket = MockWebSocket.instance;
        if (!socket || !socket.onmessage) return;

        socket.onmessage({
          data: JSON.stringify({
            type: 'send_sensor_data',
            data: {
              device_id: 'GreenhouseHub1',
              timestamp: new Date().toISOString(),
              temperature: 26.4,
              humidity: 55,
              light: 800,
              air_quality: 250,
              soil_moisture: 35,
            },
          }),
        } as MessageEvent);
      };
    });

    // Step 3: Wait briefly for WebSocket to be "connected"
    cy.wait(500);

    // Step 4: Trigger the mock message to simulate real-time sensor update
    cy.window().then((win) => {
      win.__sendMessage?.(); // Call __sendMessage only if it exists
    });

    // Step 5: Validate page shows correct info
    cy.contains('Device: GreenhouseHub1').should('exist');
    cy.get('h3').contains('26.4 °C').should('exist');
    cy.get('h3').contains('55 %').should('exist');
    cy.get('h3').contains('800 lux').should('exist');
    cy.get('h3').contains('250 ppm').should('exist');
    cy.get('h3').contains('35 %').should('exist');
  });


  it('navigates back to device list and to historical data', () => {

    cy.contains('← Back to Devices List').click();
    cy.url().should('eq', `${Cypress.config().baseUrl}/`);

    cy.visit('/devices/GreenhouseHub1', {
      onBeforeLoad(win) {
        // ✅ Prevent redirect in useAuth hook
        win.__CYPRESS_AUTH__ = true;
        win.localStorage.setItem('access_token', 'mocked-token');
      },
    }); // go back
    cy.contains('View Historical Data →').click();
    cy.url().should('include', '/devices/GreenhouseHub1/chart');

  });

});

  
