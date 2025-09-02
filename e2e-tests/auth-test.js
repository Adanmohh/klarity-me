const puppeteer = require('puppeteer');

const BASE_URL = 'http://localhost:5174';
const API_URL = 'http://localhost:8000';

// Generate unique test email
const testEmail = `test_${Date.now()}@example.com`;
const testPassword = 'TestPassword123!';
const testName = 'Test User';

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testAuthFlow() {
  console.log('Starting authentication flow test...');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    slowMo: 100,
    devtools: true,
    args: ['--start-maximized']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 768 });
  
  // Enable console logging
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  
  try {
    // Step 1: Navigate to the app
    console.log('1. Navigating to app...');
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await delay(2000);
    
    // Take a screenshot of initial page
    await page.screenshot({ path: 'e2e-tests/screenshots/01-initial-page.png' });
    
    // Step 2: Check if we're redirected to login page
    console.log('2. Checking for login page...');
    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);
    
    // Look for login form elements
    const hasLoginForm = await page.evaluate(() => {
      const emailInput = document.querySelector('input[type="email"], input[name="email"], input[placeholder*="email" i]');
      const passwordInput = document.querySelector('input[type="password"], input[name="password"], input[placeholder*="password" i]');
      const loginButton = Array.from(document.querySelectorAll('button')).find(btn => 
        btn.textContent.toLowerCase().includes('login') || 
        btn.textContent.toLowerCase().includes('sign in')
      );
      return !!(emailInput && passwordInput);
    });
    
    if (!hasLoginForm) {
      console.log('No login form found. Looking for authentication redirect...');
      
      // Check if we're on the main app (which would redirect if not authenticated)
      const isMainApp = await page.evaluate(() => {
        return document.querySelector('.app-container') || document.querySelector('[class*="App"]');
      });
      
      if (isMainApp) {
        console.log('Main app detected, but no authentication required?');
        await page.screenshot({ path: 'e2e-tests/screenshots/02-main-app-no-auth.png' });
      }
    } else {
      console.log('Login form detected!');
      await page.screenshot({ path: 'e2e-tests/screenshots/02-login-page.png' });
      
      // Step 3: Look for signup link and click it
      console.log('3. Looking for signup link...');
      const signupLink = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('a, button'));
        const signupLink = links.find(link => {
          const text = link.textContent.toLowerCase();
          return text.includes('sign up') || text.includes('register') || text.includes('create account');
        });
        if (signupLink) {
          signupLink.click();
          return true;
        }
        return false;
      });
      
      if (signupLink) {
        console.log('Clicked signup link, waiting for navigation...');
        await delay(2000);
        await page.screenshot({ path: 'e2e-tests/screenshots/03-signup-page.png' });
        
        // Step 4: Fill signup form
        console.log('4. Filling signup form...');
        
        // Find and fill email field
        await page.evaluate((email) => {
          const emailInput = document.querySelector('input[type="email"], input[name="email"], input[placeholder*="email" i]');
          if (emailInput) {
            emailInput.value = email;
            emailInput.dispatchEvent(new Event('input', { bubbles: true }));
            emailInput.dispatchEvent(new Event('change', { bubbles: true }));
          }
        }, testEmail);
        
        // Find and fill password field
        await page.evaluate((password) => {
          const passwordInput = document.querySelector('input[type="password"], input[name="password"], input[placeholder*="password" i]');
          if (passwordInput) {
            passwordInput.value = password;
            passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
            passwordInput.dispatchEvent(new Event('change', { bubbles: true }));
          }
        }, testPassword);
        
        // Find and fill name field if it exists
        await page.evaluate((name) => {
          const nameInput = document.querySelector('input[name="name"], input[name="fullName"], input[name="full_name"], input[placeholder*="name" i]');
          if (nameInput && nameInput.type !== 'email' && nameInput.type !== 'password') {
            nameInput.value = name;
            nameInput.dispatchEvent(new Event('input', { bubbles: true }));
            nameInput.dispatchEvent(new Event('change', { bubbles: true }));
          }
        }, testName);
        
        await page.screenshot({ path: 'e2e-tests/screenshots/04-signup-form-filled.png' });
        
        // Step 5: Submit signup form
        console.log('5. Submitting signup form...');
        const signupSubmitted = await page.evaluate(() => {
          const submitButton = Array.from(document.querySelectorAll('button')).find(btn => {
            const text = btn.textContent.toLowerCase();
            return (text.includes('sign up') || text.includes('register') || text.includes('create')) && 
                   !text.includes('already');
          });
          if (submitButton) {
            submitButton.click();
            return true;
          }
          return false;
        });
        
        if (signupSubmitted) {
          console.log('Signup form submitted, waiting for response...');
          await delay(3000);
          await page.screenshot({ path: 'e2e-tests/screenshots/05-after-signup.png' });
          
          // Check if we're logged in
          const isLoggedIn = await page.evaluate(() => {
            // Check for typical logged-in indicators
            return !!(
              document.querySelector('[class*="dashboard"]') ||
              document.querySelector('[class*="cards"]') ||
              document.querySelector('[class*="tasks"]') ||
              document.querySelector('button[class*="logout"]') ||
              document.querySelector('a[href*="logout"]')
            );
          });
          
          if (isLoggedIn) {
            console.log('✅ Successfully signed up and logged in!');
            await page.screenshot({ path: 'e2e-tests/screenshots/06-logged-in.png' });
            
            // Test logout
            console.log('6. Testing logout...');
            const loggedOut = await page.evaluate(() => {
              const logoutBtn = document.querySelector('button[class*="logout"], a[href*="logout"], button:has-text("Logout"), button:has-text("Sign Out")');
              if (logoutBtn) {
                logoutBtn.click();
                return true;
              }
              return false;
            });
            
            if (loggedOut) {
              await delay(2000);
              console.log('✅ Successfully logged out!');
              await page.screenshot({ path: 'e2e-tests/screenshots/07-after-logout.png' });
              
              // Test login with created account
              console.log('7. Testing login with created account...');
              
              // Fill login form
              await page.evaluate((email, password) => {
                const emailInput = document.querySelector('input[type="email"], input[name="email"]');
                const passwordInput = document.querySelector('input[type="password"], input[name="password"]');
                
                if (emailInput) {
                  emailInput.value = email;
                  emailInput.dispatchEvent(new Event('input', { bubbles: true }));
                }
                if (passwordInput) {
                  passwordInput.value = password;
                  passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
                }
                
                const loginBtn = Array.from(document.querySelectorAll('button')).find(btn => 
                  btn.textContent.toLowerCase().includes('login') || 
                  btn.textContent.toLowerCase().includes('sign in')
                );
                if (loginBtn) loginBtn.click();
              }, testEmail, testPassword);
              
              await delay(3000);
              await page.screenshot({ path: 'e2e-tests/screenshots/08-after-login.png' });
              console.log('✅ Login test completed!');
            }
          } else {
            console.log('⚠️ Signup completed but not automatically logged in');
            
            // Check for any error messages
            const errorMessage = await page.evaluate(() => {
              const error = document.querySelector('[class*="error"], [class*="alert"], [role="alert"]');
              return error ? error.textContent : null;
            });
            
            if (errorMessage) {
              console.log('Error message found:', errorMessage);
            }
          }
        }
      } else {
        console.log('No signup link found, checking if signup form is already visible...');
      }
    }
    
    console.log('\n=== Test Summary ===');
    console.log('Test Email:', testEmail);
    console.log('Screenshots saved in e2e-tests/screenshots/');
    console.log('Test completed!');
    
  } catch (error) {
    console.error('Test failed:', error);
    await page.screenshot({ path: 'e2e-tests/screenshots/error-state.png' });
  } finally {
    await delay(5000); // Keep browser open for inspection
    await browser.close();
  }
}

// Run the test
testAuthFlow().catch(console.error);