describe('CVE Search Flow', () => {
  it('looks up a CVE and gets a response', () => {
    cy.visit('/cves');
    
    // Look for the input to type in a CVE product name
    cy.get('input[placeholder*="react"], input[placeholder*="wordpress"]').type('react{enter}');
    
    // Wait for the response and assert that we get a response loaded 
    // Either a card representing a CVE with an ID, a message that it's empty, or an error message
    cy.get('.cve-card, .cve-empty-state, .cve-error-message', { timeout: 20000 }).should('be.visible');
  });
});
