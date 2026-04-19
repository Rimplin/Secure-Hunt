describe('Routing and Navigation Suite', () => {
  const routes = [
    '/',
    '/browser',
    '/cves',
    '/login',
    '/signup',
    '/report',
    '/rate-reports',
    '/recommendations',
    '/forum',
    '/create',
    '/profile'
  ];

  it('visits all main routes without getting a 404 or throwing unhandled errors', () => {
    routes.forEach(route => {
      cy.visit(route);
      // Basic check to ensure the page loaded and we aren't completely blank or broken
      cy.get('body').should('be.visible');
      // Assert that an arbitrary "Not Found" message is generally absent if we can
      cy.contains(/404|not found/i).should('not.exist');
    });
  });
});
