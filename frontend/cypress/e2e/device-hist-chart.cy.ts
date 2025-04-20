/// <reference types="cypress" />

describe('ChartPage', () => {
    const deviceId = 'greenhouse_hub_1';
  
    beforeEach(() => {
      // Mock the useAuth hook to always return true (authenticated state)
      cy.visit(`/devices/${deviceId}/chart`, {
        onBeforeLoad(win) {
            // ✅ Prevent redirect in useAuth hook
            win.__CYPRESS_AUTH__ = true;
            win.localStorage.setItem('access_token', 'mocked-token');
            },
        });
  
      // Mock device chart data
      cy.intercept(
        'GET',
        '**/readings/sngl_dvc_mult_sensor/**',
        { fixture: 'device-hist-chart-data.json' }
      ).as('fetchDeviceData');
      
    });
  
    it('renders chart page and shows charts for all available sensors', () => {
      cy.contains(`Charts for ${deviceId}`).should('be.visible');
  
      // Wait for data to load
      cy.wait('@fetchDeviceData');
  
      // Check dropdown
      cy.get('select#timeRange').should('exist').and('have.value', 'hour');
  
      // Check some chart headings
      cy.contains('TEMPERATURE').should('exist');
      cy.contains('HUMIDITY').should('exist');
      cy.get('canvas').should('have.length.at.least', 1); // Check Chart.js rendered
    });
  
    it('changes time range and updates chart data', () => {
      cy.get('select#timeRange').select('week');
      cy.wait('@fetchDeviceData');
      cy.get('select#timeRange').should('have.value', 'week');
    });
  
    it('navigates back to real-time data page', () => {
      cy.contains('← Back to Real Time Data').click();
      cy.url().should('include', `/devices/${deviceId}`);
    });
  
    it('navigates back to device list page', () => {
      cy.contains('☰ Back to Devices List').click();
      cy.url().should('eq', `${Cypress.config().baseUrl}/`);
    });
    
});
  