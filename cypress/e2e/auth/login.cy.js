// cypress/e2e/auth/login.cy.js

// Przygotowujemy dane testowe
const validUser = {
    email: 'test@example.com',
    password: 'securePassword123'
  };
  
  describe('Login Flow', () => {
    beforeEach(() => {
      // Przechodzimy na stronę logowania przed każdym testem
      cy.visit('/login');
      
      // Czekamy na załadowanie formularza
      cy.get('form').should('be.visible');
    });
  
    it('displays the login form correctly', () => {
      // Sprawdzamy, czy wszystkie elementy formularza są widoczne
      cy.contains('h3', 'Zaloguj się').should('be.visible');
      cy.get('input[name="email"]').should('be.visible');
      cy.get('input[name="password"]').should('be.visible');
      cy.contains('button', 'Zaloguj się').should('be.visible');
      cy.contains('a', 'Zarejestruj się').should('be.visible');
      cy.contains('button', 'Zapomniałeś hasła').should('be.visible');
    });
  
    it('validates empty fields', () => {
      // Klikamy przycisk logowania bez wypełniania pól
      cy.contains('button', 'Zaloguj się').click();
      
      // Sprawdzamy, czy pojawiły się komunikaty o błędach
      cy.contains('Nieprawidłowy adres email').should('be.visible');
      
      // Powinno pozostać na tej samej stronie
      cy.url().should('include', '/login');
    });
  
    it('validates invalid email format', () => {
      // Wpisujemy nieprawidłowy adres email
      cy.get('input[name="email"]').type('invalid-email');
      cy.get('input[name="password"]').type('securePassword123');
      
      // Klikamy przycisk logowania
      cy.contains('button', 'Zaloguj się').click();
      
      // Sprawdzamy, czy pojawił się komunikat o błędzie
      cy.contains('Nieprawidłowy adres email').should('be.visible');
      
      // Powinno pozostać na tej samej stronie
      cy.url().should('include', '/login');
    });
  
    it('intercepts login request and simulates successful login', () => {
      // Mockujemy żądanie logowania
      cy.intercept('POST', '**/auth/v1/token*', {
        statusCode: 200,
        body: {
          access_token: 'fake-token',
          token_type: 'bearer',
          expires_in: 3600,
          refresh_token: 'fake-refresh-token',
          user: {
            id: 'user-123',
            email: validUser.email
          }
        }
      }).as('loginRequest');
      
      // Wypełniamy formularz poprawnymi danymi
      cy.get('input[name="email"]').type(validUser.email);
      cy.get('input[name="password"]').type(validUser.password);
      
      // Klikamy przycisk logowania
      cy.contains('button', 'Zaloguj się').click();
      
      // Czekamy na żądanie
      cy.wait('@loginRequest');
      
      // Sprawdzamy, czy pojawił się komunikat o sukcesie
      cy.contains('Zalogowano pomyślnie').should('be.visible');
      
      // Powinno przekierować do dashboardu
      cy.url().should('include', '/dashboard');
    });
  
    it('intercepts login request and simulates failed login', () => {
      // Mockujemy żądanie logowania
      cy.intercept('POST', '**/auth/v1/token*', {
        statusCode: 400,
        body: {
          error: 'Invalid login credentials',
          error_description: 'Nieprawidłowy email lub hasło'
        }
      }).as('loginRequest');
      
      // Wypełniamy formularz
      cy.get('input[name="email"]').type(validUser.email);
      cy.get('input[name="password"]').type('wrongPassword');
      
      // Klikamy przycisk logowania
      cy.contains('button', 'Zaloguj się').click();
      
      // Czekamy na żądanie
      cy.wait('@loginRequest');
      
      // Sprawdzamy, czy pojawił się komunikat o błędzie
      cy.contains('Błąd logowania').should('be.visible');
      cy.contains('Nieprawidłowy email lub hasło').should('be.visible');
      
      // Powinno pozostać na tej samej stronie
      cy.url().should('include', '/login');
    });
  
    it('tests password visibility toggle', () => {
      // Sprawdzamy, czy hasło jest początkowo ukryte
      cy.get('input[name="password"]').should('have.attr', 'type', 'password');
      
      // Klikamy przycisk widoczności hasła
      cy.get('button[aria-label="Pokaż hasło"]').click();
      
      // Sprawdzamy, czy hasło jest teraz widoczne
      cy.get('input[name="password"]').should('have.attr', 'type', 'text');
      
      // Klikamy ponownie, aby ukryć hasło
      cy.get('button[aria-label="Ukryj hasło"]').click();
      
      // Sprawdzamy, czy hasło jest znowu ukryte
      cy.get('input[name="password"]').should('have.attr', 'type', 'password');
    });
  
    it('navigates to registration page', () => {
      // Klikamy link do rejestracji
      cy.contains('a', 'Zarejestruj się').click();
      
      // Sprawdzamy, czy przekierowało na stronę rejestracji
      cy.url().should('include', '/register');
      cy.contains('h3', 'Zarejestruj się').should('be.visible');
    });
  
    it('tests password reset functionality', () => {
      // Mockujemy żądanie resetowania hasła
      cy.intercept('POST', '**/auth/v1/recover*', {
        statusCode: 200,
        body: {}
      }).as('resetRequest');
      
      // Wpisujemy adres email
      cy.get('input[name="email"]').type(validUser.email);
      
      // Klikamy przycisk resetowania hasła
      cy.contains('button', 'Zapomniałeś hasła').click();
      
      // Czekamy na żądanie
      cy.wait('@resetRequest');
      
      // Sprawdzamy, czy pojawił się komunikat o sukcesie
      cy.contains('Link do resetowania hasła wysłany').should('be.visible');
    });
  });