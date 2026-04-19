describe('Authentication Flow', () => {
  it('allows a user to sign in and log out', () => {
    cy.visit('/login');
    
    // Check if form loads
    cy.get('input[type="email"]').should('be.visible');
    cy.get('input[type="password"]').should('be.visible');
    
    // Perform login with the provided test credentials
    cy.get('input[type="email"]').type('administrator@hotmail.com');
    cy.get('input[type="password"]').type('123456789');
    
    // Submit the form
    cy.get('button[type="submit"]').first().click();
    
    // We should either be redirected to homepage or profile
    cy.url().should('not.include', '/login');
    
    // Check for logout functionality
    // Assuming there might be a "Logout" or "Sign Out" button in the Navbar or profile
    cy.contains(/logout|sign out/i).click();
    
    // Ensure we are logged out by checking if we return to login or home, and login exists
    cy.contains(/login|sign in/i).should('be.visible');
  });
});
