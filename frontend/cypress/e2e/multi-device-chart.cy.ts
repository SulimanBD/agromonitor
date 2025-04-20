/// <reference types="cypress" />

describe('ChartPage', () => {
  
    beforeEach(() => {
      // Mock the authentication state
      cy.visit(`/devices/chart`, {
        onBeforeLoad(win) {
            // ✅ Prevent redirect in useAuth hook
            win.__CYPRESS_AUTH__ = true;
            win.localStorage.setItem('access_token', 'mocked-token');
          },
      });

      // Intercept device list
      cy.intercept(
        'GET', 
        '**/api/devices', 
        {fixture: 'device-list.json'}
      ).as('getDevices');
  
      // Mock API response for device data
      cy.intercept(
        'GET', 
        '**/readings/mult_dvcs_sngl_sensor/**',
        { fixture: 'multi-device-chart-data.json' }
      ).as('fetchDeviceData');

    });
  
    it('renders chart page and shows charts for selected devices', () => {

      cy.wait('@fetchDeviceData');

      cy.contains('Sensor Charts').should('be.visible');
      cy.contains('Select Devices:').should('be.visible');
      
      // Select a device and check that the chart updates
      cy.get('select#devices').select('greenhouse_hub_1');
      cy.get('canvas').should('have.length', 1); // Check Chart.js rendered
      // Verify chart data for selected device
      cy.contains('greenhouse_hub_1').should('be.visible');

    });
  
    it('changes time range and updates chart data', () => {
      cy.contains('Select Time Range:').should('be.visible');
      cy.get('select#timeRange').select('week');
      cy.wait('@fetchDeviceData');
      
      // Verify the time range dropdown has updated
      cy.get('select#timeRange').should('have.value', 'week');
      // Check that the chart data is updated
      cy.contains('greenhouse_hub_1').should('be.visible');
    });
  
    it('changes sensor type and updates chart data', () => {
      cy.contains('Select Sensor Type:').should('be.visible');
      cy.get('select#sensorType').select('humidity');
      cy.wait('@fetchDeviceData');
      
      // Verify the sensor type dropdown has updated
      cy.get('select#sensorType').should('have.value', 'humidity');
      // Check that the chart data is updated
      cy.contains('greenhouse_hub_1').should('be.visible');
    });
  
    it('navigates back to devices list page', () => {
      cy.contains('← Back to Devices').click();
      cy.url().should('eq', `${Cypress.config().baseUrl}/`);
    });

});
  