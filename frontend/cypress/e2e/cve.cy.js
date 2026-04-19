describe('CVE Search Flow', () => {
  it('looks up a CVE and gets a response', () => {
    cy.visit('/cves');
    
    // Look for the input to type in a CVE product name
    cy.get('input[placeholder*="react"], input[placeholder*="wordpress"]').type('react{enter}');
    
    // Wait for the response and assert that we get a response loaded 
    // Either a card representing a CVE with an ID, or a message that it's empty
    cy.get('.cve-card, .cve-empty-state', { timeout: 10000 }).should('be.visible');
  });
});
