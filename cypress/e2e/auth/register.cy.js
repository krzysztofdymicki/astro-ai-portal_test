// cypress/e2e/auth/register.cy.js

// Przygotowujemy dane testowe
const newUser = {
    email: `test-${Date.now()}@example.com`,
    password: 'securePassword123'
  };
  
  describe('Registration Flow', () => {
    beforeEach(() => {
      // Przechodzimy na stronę rejestracji przed każdym testem
      cy.visit('/register');
      
      // Czekamy na załadowanie formularza
      cy.get('form').should('be.visible');
    });
  
    it('displays the registration form correctly', () => {
      // Sprawdzamy, czy wszystkie elementy formularza są widoczne
      cy.contains('h3', 'Zarejestruj się').should('be.visible');
      cy.get('input[name="email"]').should('be.visible');
      cy.get('input[name="password"]').should('be.visible');
      cy.get('input[name="confirmPassword"]').should('be.visible');
      cy.contains('button', 'Zarejestruj się').should('be.visible');
      cy.contains('a', 'Zaloguj się').should('be.visible');
    });
  
    it('validates empty fields', () => {
      // Klikamy przycisk rejestracji bez wypełniania pól
      cy.contains('button', 'Zarejestruj się').click();
      
      // Sprawdzamy, czy pojawiły się komunikaty o błędach
      cy.contains('Nieprawidłowy adres email').should('be.visible');
      
      // Powinno pozostać na tej samej stronie
      cy.url().should('include', '/register');
    });
  
    it('validates password length', () => {
      // Wpisujemy prawidłowy email, ale zbyt krótkie hasło
      cy.get('input[name="email"]').type(newUser.email);
      cy.get('input[name="password"]').type('short');
      cy.get('input[name="confirmPassword"]').type('short');
      
      // Klikamy przycisk rejestracji
      cy.contains('button', 'Zarejestruj się').click();
      
      // Sprawdzamy, czy pojawił się komunikat o błędzie
      cy.contains('Hasło musi zawierać co najmniej 6 znaków').should('be.visible');
      
      // Powinno pozostać na tej samej stronie
      cy.url().should('include', '/register');
    });
  
    it('validates password confirmation', () => {
      // Wpisujemy prawidłowy email i hasło, ale różne potwierdzenie
      cy.get('input[name="email"]').type(newUser.email);
      cy.get('input[name="password"]').type(newUser.password);
      cy.get('input[name="confirmPassword"]').type(newUser.password + '123');
      
      // Klikamy przycisk rejestracji
      cy.contains('button', 'Zarejestruj się').click();
      
      // Sprawdzamy, czy pojawił się komunikat o błędzie
      cy.contains('Hasła nie są identyczne').should('be.visible');
      
      // Powinno pozostać na tej samej stronie
      cy.url().should('include', '/register');
    });
  
    it('intercepts registration request and simulates successful registration', () => {
      // Mockujemy żądanie rejestracji
      cy.intercept('POST', '**/auth/v1/signup*', {
        statusCode: 200,
        body: {
          id: 'user-123',
          email: newUser.email
        }
      }).as('registerRequest');
      
      // Wypełniamy formularz
      cy.get('input[name="email"]').type(newUser.email);
      cy.get('input[name="password"]').type(newUser.password);
      cy.get('input[name="confirmPassword"]').type(newUser.password);
      
      // Klikamy przycisk rejestracji
      cy.contains('button', 'Zarejestruj się').click();
      
      // Czekamy na żądanie
      cy.wait('@registerRequest');
      
      // Sprawdzamy, czy pojawił się komunikat o sukcesie
      cy.contains('Rejestracja pomyślna').should('be.visible');
      
      // Sprawdzamy czy pojawił się ekran potwierdzenia
      cy.contains('Rejestracja zakończona').should('be.visible');
      cy.contains('Wyślij ponownie link aktywacyjny').should('be.visible');
      cy.contains('Przejdź do logowania').should('be.visible');
    });
  
    it('intercepts registration request and simulates error for existing email', () => {
      // Mockujemy żądanie rejestracji z błędem
      cy.intercept('POST', '**/auth/v1/signup*', {
        statusCode: 400,
        body: {
          error: 'User already registered',
          error_description: 'Użytkownik o podanym adresie email już istnieje'
        }
      }).as('registerRequest');
      
      // Wypełniamy formularz
      cy.get('input[name="email"]').type('existing@example.com');
      cy.get('input[name="password"]').type(newUser.password);
      cy.get('input[name="confirmPassword"]').type(newUser.password);
      
      // Klikamy przycisk rejestracji
      cy.contains('button', 'Zarejestruj się').click();
      
      // Czekamy na żądanie
      cy.wait('@registerRequest');
      
      // Sprawdzamy, czy pojawił się komunikat o błędzie
      cy.contains('Błąd rejestracji').should('be.visible');
      
      // Powinno pozostać na tej samej stronie
      cy.url().should('include', '/register');
    });
  
    it('tests password visibility toggle', () => {
      // Sprawdzamy, czy hasło jest początkowo ukryte
      cy.get('input[name="password"]').should('have.attr', 'type', 'password');
      
      // Klikamy przycisk widoczności hasła
      cy.get('button[aria-label="Pokaż hasło"]').click();
      
      // Sprawdzamy, czy hasło i potwierdzenie są teraz widoczne
      cy.get('input[name="password"]').should('have.attr', 'type', 'text');
      cy.get('input[name="confirmPassword"]').should('have.attr', 'type', 'text');
      
      // Klikamy ponownie, aby ukryć hasło
      cy.get('button[aria-label="Ukryj hasło"]').click();
      
      // Sprawdzamy, czy hasło i potwierdzenie są znowu ukryte
      cy.get('input[name="password"]').should('have.attr', 'type', 'password');
      cy.get('input[name="confirmPassword"]').should('have.attr', 'type', 'password');
    });
  
    it('navigates to login page', () => {
      // Klikamy link do logowania
      cy.contains('a', 'Zaloguj się').click();
      
      // Sprawdzamy, czy przekierowało na stronę logowania
      cy.url().should('include', '/login');
      cy.contains('h3', 'Zaloguj się').should('be.visible');
    });
  
    it('simulates resending activation email', () => {
      // Najpierw symulujemy pomyślną rejestrację
      cy.intercept('POST', '**/auth/v1/signup*', {
        statusCode: 200,
        body: {
          id: 'user-123',
          email: newUser.email
        }
      }).as('registerRequest');
      
      // Wypełniamy formularz
      cy.get('input[name="email"]').type(newUser.email);
      cy.get('input[name="password"]').type(newUser.password);
      cy.get('input[name="confirmPassword"]').type(newUser.password);
      
      // Klikamy przycisk rejestracji
      cy.contains('button', 'Zarejestruj się').click();
      
      // Czekamy na żądanie
      cy.wait('@registerRequest');
      
      // Teraz testujemy ponowne wysłanie linka
      cy.intercept('POST', '**/auth/v1/resend*', {
        statusCode: 200,
        body: {}
      }).as('resendRequest');
      
      // Klikamy przycisk ponownego wysłania
      cy.contains('button', 'Wyślij ponownie link aktywacyjny').click();
      
      // Czekamy na żądanie
      cy.wait('@resendRequest');
      
      // Sprawdzamy, czy pojawił się komunikat o sukcesie
      cy.contains('Email wysłany ponownie').should('be.visible');
    });
  });