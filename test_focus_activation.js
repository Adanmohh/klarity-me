const puppeteer = require('puppeteer');

async function testFocusActivation() {
  console.log('=== Testing Card Activation and Focus Mode ===\n');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  try {
    // Step 1: Get a valid auth token
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
    console.log('   OTP:', authData.debug_otp);
    
    const verifyResponse = await fetch('http://localhost:8001/api/v1/auth-otp/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: 'test@example.com',
        otp_code: authData.debug_otp
      })
    });
    
    const tokenData = await verifyResponse.json();
    const token = tokenData.access_token;
    console.log('   Token obtained:', token ? 'Yes' : 'No');
    
    if (!token) {
      throw new Error('Failed to get token');
    }
    
    // Step 2: Navigate and set auth
    console.log('\n2. Setting up authentication...');
    await page.goto('http://localhost:5174', { waitUntil: 'networkidle0' });
    
    await page.evaluate((authToken) => {
      localStorage.setItem('token', authToken);
      localStorage.setItem('access_token', authToken);
      localStorage.setItem('user', JSON.stringify({
        id: 'test-user-1',
        email: 'test@example.com',
        full_name: 'Test User'
      }));
    }, token);
    
    // Step 3: Navigate to Focus page
    console.log('\n3. Navigating to Focus page...');
    await page.goto('http://localhost:5174/focus', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 3000)); // Wait for cards to load
    
    // Step 4: Check page content
    console.log('\n4. Analyzing page content...');
    const pageContent = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('div')).filter(div => {
        const text = div.textContent || '';
        return text.includes('Main Focus') || text.includes('Quick Tasks') || text.includes('Projects');
      });
      
      const buttons = Array.from(document.querySelectorAll('button')).map(btn => ({
        text: btn.textContent.trim(),
        disabled: btn.disabled,
        className: btn.className
      }));
      
      return {
        hasCards: cards.length > 0,
        cardCount: cards.length,
        buttons: buttons.filter(b => b.text),
        pageTitle: document.title,
        url: window.location.href
      };
    });
    
    console.log('   Page URL:', pageContent.url);
    console.log('   Cards found:', pageContent.cardCount);
    console.log('   Buttons:', pageContent.buttons.map(b => b.text).join(', '));
    
    // Step 5: Try to activate a card
    console.log('\n5. Looking for activation controls...');
    
    // Look for Activate button
    const activateResult = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const activateBtn = buttons.find(btn => 
        btn.textContent.includes('Activate') || 
        btn.textContent.includes('Resume')
      );
      
      if (activateBtn) {
        activateBtn.click();
        return { clicked: true, text: activateBtn.textContent };
      }
      
      return { clicked: false };
    });
    
    if (activateResult.clicked) {
      console.log(`   Clicked "${activateResult.text}" button`);
      await new Promise(r => setTimeout(r, 2000));
      
      // Check for Enter Focus button
      console.log('\n6. Looking for Enter Focus button...');
      const focusResult = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const focusBtn = buttons.find(btn => 
          btn.textContent.includes('Enter Focus')
        );
        
        if (focusBtn) {
          focusBtn.click();
          return { clicked: true };
        }
        
        return { clicked: false, available: buttons.map(b => b.textContent) };
      });
      
      if (focusResult.clicked) {
        console.log('   ✓ Clicked "Enter Focus" button!');
        await new Promise(r => setTimeout(r, 2000));
        
        // Check if in focus mode
        const inFocusMode = await page.evaluate(() => {
          const focusElements = document.querySelectorAll('[class*="session"], [class*="timer"], [class*="focus"]');
          const hasTimer = Array.from(document.querySelectorAll('*')).some(el => 
            el.textContent.includes('25:00') || 
            el.textContent.includes('Session') ||
            el.textContent.includes('Pomodoro')
          );
          return focusElements.length > 0 || hasTimer;
        });
        
        console.log('   In focus mode:', inFocusMode ? 'Yes ✓' : 'No ✗');
      } else {
        console.log('   ✗ "Enter Focus" button not found');
        console.log('   Available buttons:', focusResult.available);
      }
    } else {
      // Check if Enter Focus is already available
      const focusAvailable = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        return buttons.some(btn => btn.textContent.includes('Enter Focus'));
      });
      
      if (focusAvailable) {
        console.log('   Card already active, "Enter Focus" button is available');
        
        const result = await page.evaluate(() => {
          const btn = Array.from(document.querySelectorAll('button'))
            .find(b => b.textContent.includes('Enter Focus'));
          if (btn) {
            btn.click();
            return true;
          }
          return false;
        });
        
        if (result) {
          console.log('   ✓ Clicked "Enter Focus" button!');
          await new Promise(r => setTimeout(r, 2000));
        }
      } else {
        console.log('   ✗ No activation buttons found');
      }
    }
    
    // Take final screenshot
    await page.screenshot({ path: 'final_state.png', fullPage: true });
    console.log('\n7. Screenshot saved: final_state.png');
    
    // Final state check
    const finalState = await page.evaluate(() => {
      return {
        url: window.location.href,
        hasTimer: document.body.textContent.includes('25:00'),
        hasSession: document.body.textContent.includes('Session'),
        focusElements: document.querySelectorAll('[class*="focus"]').length
      };
    });
    
    console.log('\n=== Final State ===');
    console.log('URL:', finalState.url);
    console.log('Has timer:', finalState.hasTimer);
    console.log('Has session:', finalState.hasSession);
    console.log('Focus elements:', finalState.focusElements);
    
  } catch (error) {
    console.error('\nError:', error.message);
    await page.screenshot({ path: 'error_state.png', fullPage: true });
  } finally {
    console.log('\n=== Test Complete ===');
    await browser.close();
  }
}

testFocusActivation().catch(console.error);