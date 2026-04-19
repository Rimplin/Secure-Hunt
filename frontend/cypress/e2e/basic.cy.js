describe('Basic E2E Suite', () => {
  it('loads the homepage and verifies title', () => {
    cy.visit('/');
    cy.contains(/secure/i).should('be.visible'); // Matches "Secure Hunt" loosely
  });

  it('can navigate to CVE Search page', () => {
    cy.visit('/cves'); // Updated based on route in App.jsx
    cy.get('h1').contains(/Vulnerability Scanner/i).should('be.visible');
  });
});
