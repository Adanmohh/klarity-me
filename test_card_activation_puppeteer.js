const puppeteer = require('puppeteer');

async function testCardActivation() {
  const browser = await puppeteer.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    devtools: true
  });
  
  const page = await browser.newPage();
  
  try {
    console.log('=== Card Activation Test ===\n');
    
    // Step 1: Get authentication token via API
    console.log('1. Getting authentication token...');
    const authResponse = await fetch('http://localhost:8001/api/v1/auth-otp/request-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: 'test@example.com', 
        full_name: 'Test User' 
      })
    });
    
    const authData = await authResponse.json();
    console.log('   OTP received:', authData.debug_otp);
    
    // Verify OTP
    const verifyResponse = await fetch('http://localhost:8001/api/v1/auth-otp/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: 'test@example.com',
        otp_code: authData.debug_otp
      })
    });
    
    const tokenData = await verifyResponse.json();
    console.log('   Token received:', tokenData.access_token ? 'Yes' : 'No');
    
    // Step 2: Navigate to app and inject token
    console.log('\n2. Navigating to application...');
    await page.goto('http://localhost:5174', { waitUntil: 'networkidle0' });
    
    // Inject token into localStorage
    await page.evaluate((token) => {
      localStorage.setItem('token', token);
      localStorage.setItem('access_token', token);
      localStorage.setItem('user', JSON.stringify({
        id: 'test-user-1',
        email: 'test@example.com'
      }));
    }, tokenData.access_token);
    
    console.log('   Token injected into localStorage');
    
    // Step 3: Navigate to Focus page
    console.log('\n3. Navigating to Focus page...');
    await page.goto('http://localhost:5174/focus', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 2000));
    
    // Take screenshot of initial state
    await page.screenshot({ path: 'focus_page_initial.png', fullPage: true });
    console.log('   Screenshot saved: focus_page_initial.png');
    
    // Step 4: Check for cards
    console.log('\n4. Looking for cards...');
    const cards = await page.evaluate(() => {
      const cardElements = document.querySelectorAll('[class*="card"], [data-testid*="card"]');
      return Array.from(cardElements).map(el => ({
        text: el.textContent,
        hasActivateButton: !!el.querySelector('button:has-text("Activate"), button:has-text("Resume")')
      }));
    });
    
    console.log(`   Found ${cards.length} cards`);
    
    // Step 5: Try to activate a card
    console.log('\n5. Attempting to activate a card...');
    
    // Look for Activate button using XPath
    const activateButtons = await page.$$eval('button', buttons => 
      buttons.filter(btn => btn.textContent.includes('Activate')).map(btn => btn.textContent)
    );
    console.log('   Activate buttons found:', activateButtons);
    
    const [activateButton] = await page.$x("//button[contains(., 'Activate')]");
    if (activateButton) {
      console.log('   Found "Activate" button, clicking...');
      await activateButton.click();
      await new Promise(r => setTimeout(r, 2000));
      
      // Take screenshot after activation
      await page.screenshot({ path: 'focus_page_after_activate.png', fullPage: true });
      console.log('   Screenshot saved: focus_page_after_activate.png');
      
      // Check if Enter Focus button appeared
      const [enterFocusButton] = await page.$x("//button[contains(., 'Enter Focus')]");
      if (enterFocusButton) {
        console.log('   ✓ "Enter Focus" button appeared!');
        
        // Step 6: Click Enter Focus
        console.log('\n6. Clicking "Enter Focus" button...');
        await enterFocusButton.click();
        await new Promise(r => setTimeout(r, 2000));
        
        // Take screenshot of focus mode
        await page.screenshot({ path: 'focus_mode.png', fullPage: true });
        console.log('   Screenshot saved: focus_mode.png');
        
        // Check if we're in focus mode
        const inFocusMode = await page.evaluate(() => {
          return !!document.querySelector('[class*="focus-session"], [class*="timer"], [class*="pomodoro"]');
        });
        
        if (inFocusMode) {
          console.log('   ✓ Successfully entered focus mode!');
        } else {
          console.log('   ✗ Did not enter focus mode');
        }
      } else {
        console.log('   ✗ "Enter Focus" button did not appear');
      }
    } else {
      console.log('   ✗ No "Activate" button found');
      
      // Check if there's already an active card
      const [enterFocusButton] = await page.$x("//button[contains(., 'Enter Focus')]");
      if (enterFocusButton) {
        console.log('   Found "Enter Focus" button (card already active)');
        console.log('   Clicking "Enter Focus"...');
        await enterFocusButton.click();
        await new Promise(r => setTimeout(r, 2000));
        
        await page.screenshot({ path: 'focus_mode_direct.png', fullPage: true });
        console.log('   Screenshot saved: focus_mode_direct.png');
      }
    }
    
    // Step 7: Debug - Log all buttons found
    console.log('\n7. Debug - All buttons on page:');
    const allButtons = await page.evaluate(() => {
      const buttons = document.querySelectorAll('button');
      return Array.from(buttons).map(btn => btn.textContent.trim()).filter(text => text);
    });
    console.log('   Buttons:', allButtons);
    
    // Step 8: Check console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('   Browser console error:', msg.text());
      }
    });
    
    console.log('\n=== Test Complete ===');
    console.log('Check the screenshots to see the UI state at each step.');
    
  } catch (error) {
    console.error('Test failed:', error);
    await page.screenshot({ path: 'error_state.png', fullPage: true });
    console.log('Error screenshot saved: error_state.png');
  } finally {
    await browser.close();
  }
}

// Run the test
testCardActivation().catch(console.error);