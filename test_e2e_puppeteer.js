const puppeteer = require('puppeteer');

async function runE2ETest() {
  console.log('=== END-TO-END TEST STARTING ===\n');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1280, height: 800 }
  });
  
  const page = await browser.newPage();
  let testsPassed = 0;
  let testsFailed = 0;
  
  try {
    // Test 1: Authentication Flow
    console.log('TEST 1: Authentication');
    console.log('----------------------');
    
    // Navigate to the app first
    await page.goto('http://localhost:5174', { waitUntil: 'networkidle0' });
    
    // Get fresh token via page context
    const authResult = await page.evaluate(async () => {
      try {
        // Request OTP
        const otpResp = await fetch('http://localhost:8001/api/v1/auth-otp/request-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            email: 'test@example.com', 
            full_name: 'Test User' 
          })
        });
        const otpData = await otpResp.json();
        
        // Verify OTP
        const verifyResp = await fetch('http://localhost:8001/api/v1/auth-otp/verify-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            email: 'test@example.com',
            otp: otpData.debug_otp  // Changed from otp_code to otp
          })
        });
        const tokenData = await verifyResp.json();
        
        return {
          success: true,
          otp: otpData.debug_otp,
          token: tokenData.access_token,
          tokenData: tokenData  // Include full response for debug
        };
      } catch (error) {
        return {
          success: false,
          error: error.message
        };
      }
    });
    
    if (!authResult.success) {
      console.log('Auth error:', authResult.error);
      throw new Error(`Auth failed: ${authResult.error}`);
    }
    
    console.log('✓ OTP requested:', authResult.otp);
    const token = authResult.token;
    
    if (token) {
      console.log('✓ Token obtained successfully');
      console.log(`  Token (first 20 chars): ${token.substring(0, 20)}...`);
      testsPassed++;
    } else {
      console.log('✗ Failed to get token');
      console.log('Full auth result:', JSON.stringify(authResult, null, 2));
      console.log('Token data received:', JSON.stringify(authResult.tokenData, null, 2));
      testsFailed++;
      throw new Error('Authentication failed - token is undefined');
    }
    
    // Test 2: Navigate to App and Set Authentication
    console.log('\nTEST 2: Navigation & Session');
    console.log('-----------------------------');
    
    await page.goto('http://localhost:5174', { waitUntil: 'networkidle0' });
    
    // Set authentication in localStorage
    await page.evaluate((authToken) => {
      localStorage.setItem('token', authToken);
      localStorage.setItem('access_token', authToken);
      localStorage.setItem('user', JSON.stringify({
        id: 'test-user-1',
        email: 'test@example.com',
        full_name: 'Test User'
      }));
    }, token);
    
    console.log('✓ Authentication set in localStorage');
    
    // Navigate to focus page
    await page.goto('http://localhost:5174/focus', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 2000));
    
    const focusPageLoaded = await page.evaluate(() => {
      return window.location.pathname === '/focus' && 
             document.body.textContent.includes('Focus Queue');
    });
    
    if (focusPageLoaded) {
      console.log('✓ Focus page loaded successfully');
      testsPassed++;
    } else {
      console.log('✗ Failed to load focus page');
      testsFailed++;
    }
    
    // Test 3: Card Activation
    console.log('\nTEST 3: Card Activation');
    console.log('------------------------');
    
    // Find and click Activate button
    const activateClicked = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const activateBtn = buttons.find(btn => btn.textContent.trim() === 'Activate');
      if (activateBtn) {
        activateBtn.click();
        return true;
      }
      return false;
    });
    
    if (activateClicked) {
      console.log('✓ Clicked Activate button');
      await new Promise(r => setTimeout(r, 2000));
      
      // Check if Enter Focus button appeared
      const hasEnterFocus = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('button'))
          .some(btn => btn.textContent.includes('Enter Focus'));
      });
      
      if (hasEnterFocus) {
        console.log('✓ Enter Focus button appeared');
        testsPassed++;
      } else {
        console.log('✗ Enter Focus button did not appear');
        testsFailed++;
      }
    } else {
      console.log('✗ Could not find Activate button');
      testsFailed++;
    }
    
    // Test 4: Enter Focus Mode
    console.log('\nTEST 4: Enter Focus Mode');
    console.log('-------------------------');
    
    const enterFocusClicked = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const enterBtn = buttons.find(btn => btn.textContent.includes('Enter Focus'));
      if (enterBtn) {
        enterBtn.click();
        return true;
      }
      return false;
    });
    
    if (enterFocusClicked) {
      console.log('✓ Clicked Enter Focus button');
      await new Promise(r => setTimeout(r, 2000));
      
      // Check if in focus mode
      const inFocusMode = await page.evaluate(() => {
        return document.body.textContent.includes('25:00') && 
               document.body.textContent.includes('Focus Mode');
      });
      
      if (inFocusMode) {
        console.log('✓ Successfully entered focus mode');
        console.log('  - Timer shows 25:00');
        console.log('  - Focus Mode title visible');
        testsPassed++;
      } else {
        console.log('✗ Did not enter focus mode');
        testsFailed++;
      }
    } else {
      console.log('✗ Could not find Enter Focus button');
      testsFailed++;
    }
    
    // Test 5: Add Task in Focus Mode
    console.log('\nTEST 5: Add Task');
    console.log('-----------------');
    
    // Click Add Task button
    const addTaskClicked = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const addBtn = buttons.find(btn => btn.textContent.includes('Add Task'));
      if (addBtn) {
        addBtn.click();
        return true;
      }
      return false;
    });
    
    if (addTaskClicked) {
      console.log('✓ Clicked Add Task button');
      await new Promise(r => setTimeout(r, 1000));
      
      // Type task title
      await page.type('input[type="text"]', 'E2E Test Task');
      console.log('✓ Entered task title');
      
      // Add description
      const descriptionAdded = await page.evaluate(() => {
        const textarea = document.querySelector('textarea');
        if (textarea) {
          textarea.value = 'This task was created by the E2E test';
          textarea.dispatchEvent(new Event('input', { bubbles: true }));
          return true;
        }
        return false;
      });
      
      if (descriptionAdded) {
        console.log('✓ Added task description');
      }
      
      // Click Create Task button
      const createClicked = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const createBtn = buttons.find(btn => btn.textContent.trim() === 'Create Task');
        if (createBtn) {
          createBtn.click();
          return true;
        }
        return false;
      });
      
      if (createClicked) {
        console.log('✓ Clicked Create Task button');
        await new Promise(r => setTimeout(r, 2000));
        
        // Verify task was added via API (using page context)
        const verifyResult = await page.evaluate(async (authToken) => {
          const resp = await fetch('http://localhost:8001/api/v1/focus-tasks/', {
            headers: { 'Authorization': `Bearer ${authToken}` }
          });
          if (resp.ok) {
            return await resp.json();
          }
          return null;
        }, token);
        
        if (verifyResult) {
          const tasks = verifyResult;
          const e2eTask = tasks.find(t => t.title === 'E2E Test Task');
          
          if (e2eTask) {
            console.log('✓ Task successfully created and verified via API');
            console.log(`  - Task ID: ${e2eTask.id.substring(0, 8)}...`);
            console.log(`  - Lane: ${e2eTask.lane}`);
            testsPassed++;
          } else {
            console.log('✗ Task not found via API');
            testsFailed++;
          }
        }
      } else {
        console.log('✗ Could not find Create Task button');
        testsFailed++;
      }
    } else {
      console.log('✗ Could not find Add Task button');
      testsFailed++;
    }
    
    // Test 6: Session Persistence
    console.log('\nTEST 6: Session Persistence');
    console.log('----------------------------');
    
    // Refresh page
    await page.reload({ waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 2000));
    
    const stillInFocusMode = await page.evaluate(() => {
      return window.location.pathname.includes('focus') &&
             document.body.textContent.includes('Focus Mode');
    });
    
    if (stillInFocusMode) {
      console.log('✓ Session persisted after refresh');
      testsPassed++;
    } else {
      console.log('✗ Session lost after refresh');
      testsFailed++;
    }
    
    // Take final screenshot
    await page.screenshot({ path: 'e2e_test_final.png', fullPage: true });
    console.log('\n✓ Final screenshot saved: e2e_test_final.png');
    
  } catch (error) {
    console.error('\n❌ Test failed with error:', error.message);
    await page.screenshot({ path: 'e2e_test_error.png', fullPage: true });
    console.log('Error screenshot saved: e2e_test_error.png');
    testsFailed++;
  } finally {
    // Results summary
    console.log('\n' + '='.repeat(50));
    console.log('TEST RESULTS SUMMARY');
    console.log('='.repeat(50));
    console.log(`✅ Tests Passed: ${testsPassed}`);
    console.log(`❌ Tests Failed: ${testsFailed}`);
    console.log(`📊 Success Rate: ${Math.round((testsPassed / (testsPassed + testsFailed)) * 100)}%`);
    console.log('='.repeat(50));
    
    await browser.close();
  }
}

// Run the test
console.log('Starting E2E test suite...\n');
runE2ETest().catch(console.error);