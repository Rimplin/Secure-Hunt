describe('Interactive Full Workflow Suite', () => {
  // Prevent Cypress from failing the test on unhandled exceptions (like NetworkErrors from aborted fetches during fast navigation)
  Cypress.on('uncaught:exception', (err, runnable) => {
    return false;
  });

  it('performs the exact workflow requested by the user seamlessly', () => {
    // Increase viewport size so the navbar doesn't collapse into a mobile menu
    cy.viewport(1440, 900);

    // 1. Sign in to administrator
    cy.visit('/login');
    cy.get('input[type="email"]').type('administrator@hotmail.com');
    cy.get('input[type="password"]').type('123456789');
    cy.get('button[type="submit"]').click();

    // We arrive at homepage or profile. Ensure we are logged in.
    cy.contains(/logout/i, { timeout: 10000 }).should('exist');
    cy.wait(1000);

    // 2. Go to browse bounties and choose "Testing"
    cy.visit('/browser');

    // Set up intercept for the security/AI fetches
    cy.intercept('GET', '**/api/security/**').as('securityData');

    cy.get('.proj-card', { timeout: 10000 })
      .filter((index, el) => {
        return el.innerText.includes('Testing') && el.innerText.includes('1000');
      })
      .first()
      .find('button.viewDetails-button')
      .click();

    // Verify Project details loaded and Security/AI reports generated
    cy.contains('Project Details', { matchCase: false }).should('be.visible');

    // Explicitly wait for the two backend calls to finish computing AI/NVD responses
    cy.wait('@securityData', { timeout: 60000 });
    cy.wait('@securityData', { timeout: 60000 });
    cy.wait('@securityData', { timeout: 60000 });
    cy.wait('@securityData', { timeout: 60000 });

    cy.contains(/Security/i).should('be.visible');
    cy.contains(/AI/i).should('be.visible');
    cy.wait(1000);

    // 3. Go to CVE search and check searching works
    cy.visit('/cves');
    cy.get('.cve-search-input').type('react{enter}');
    cy.get('.cve-card', { timeout: 15000 }).should('have.length.greaterThan', 0);
    cy.wait(1000);

    // 4. Go to Forum and create a post
    cy.visit('/forum');
    cy.contains('New Post').click();
    cy.get('.forum-modal input[type="text"]').type('Is the "Testing" bounty still active?');
    cy.get('.forum-modal textarea').type('I want to make sure the $1000 bounty on the "Testing" project is completely active.');
    cy.get('.forum-modal button[type="submit"]').click();
    // Wait for modal to close and post to appear
    cy.contains('Is the "Testing" bounty still active?', { timeout: 8000 }).should('be.visible');
    cy.wait(1000);

    // 5. Go to submit report page and submit a report
    cy.visit('/report');
    cy.get('select#projectId').contains('option', 'Testing').then($option => {
      cy.get('select#projectId').select($option.val());
    });
    cy.get('input#title').type('Found critical bypass in Testing project');
    cy.get('select#severity').select('critical');
    cy.get('textarea#description').type('A reproducible severity exploit giving unauthorized access.');

    // Attach a file to the report
    cy.get('input[type="file"]').selectFile('src/assets/logopic1.png', { force: true });

    cy.intercept('POST', '**/api/reports').as('submitReport');
    cy.get('button.submit-btn').click();
    cy.wait('@submitReport', { timeout: 10000 });

    // Verify success message
    cy.contains(/successfully/i, { timeout: 8000 }).should('be.visible');
    cy.wait(1000);

    // 6. Go to reports page and rate the report
    cy.visit('/rate-reports');
    // Find the report card containing our issue title and click Rate
    cy.contains('.cr-card', 'Found critical bypass in Testing project')
      .find('.cr-rate-btn-new')
      .click();

    cy.intercept('PUT', '**/api/reports/*/rate').as('rateReport');
    // Select the 5-star rating
    cy.contains('.cr-card', 'Found critical bypass in Testing project')
      .find('.cr-rating-picker .star')
      .eq(4) // 5th star
      .click();

    // Wait for the rating logic to resolve successfully
    cy.wait('@rateReport', { timeout: 10000 });
    cy.wait(1000);

    // 7. Go to profile page
    cy.visit('/profile');
    cy.contains(/administrator@hotmail.com/i).should('be.visible');
    cy.wait(1000);

    // 8. Log out
    // Since we have a Navbar with logout, let's click it (force in case of slight layout overlaps)
    cy.contains(/logout/i).click({ force: true });
    cy.contains(/sign in|login/i).should('be.visible');
  });
});
