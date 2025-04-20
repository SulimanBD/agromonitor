describe('Device List Page', () => {
    beforeEach(() => {
      // Mock the useAuth hook to always return true (authenticated state)
      cy.intercept(
        'GET',
        '**/api/devices/', 
        {fixture: 'device-list.json'}
      ).as('getDevices');
  
      cy.visit('/', {
        onBeforeLoad(win) {
          // ✅ Prevent redirect in useAuth hook
          win.__CYPRESS_AUTH__ = true;
          win.localStorage.setItem('access_token', 'mocked-token');
        },
      });
    });
  
    it('logs in, fetches devices, and renders device list', () => {
      // Wait for the mocked device data to be fetched
      cy.wait('@getDevices');
  
      // Assert that the "Your Devices" heading is rendered
      cy.contains('Your Devices').should('exist');
  
      // Assert that the mocked devices are rendered
      cy.contains('greenhouse_hub_1').should('exist');
      cy.contains('garden_hub_2').should('exist');
  
      // Optionally check the device statuses
      cy.contains('active').should('exist');
      cy.contains('inactive').should('exist');

    });

  });
  