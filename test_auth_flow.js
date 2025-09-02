const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  try {
    console.log('1. Navigating to app...');
    await page.goto('http://localhost:5174', { waitUntil: 'networkidle0' });
    
    // Check if we're redirected to login or if session persists
    await new Promise(r => setTimeout(r, 2000));
    
    const url = page.url();
    console.log('Current URL:', url);
    
    // Check if we have stored session
    const localStorage = await page.evaluate(() => {
      return {
        token: window.localStorage.getItem('access_token') || window.localStorage.getItem('token'),
        user: window.localStorage.getItem('user')
      };
    });
    
    console.log('Stored session:', {
      hasToken: !!localStorage.token,
      hasUser: !!localStorage.user
    });
    
    if (url.includes('/login') || url.includes('/auth')) {
      console.log('2. On login page, testing OTP flow...');
      
      // Enter email
      await page.type('input[type="email"]', 'test@example.com');
      await page.click('button[type="submit"]');
      
      console.log('3. Email submitted, waiting for OTP field...');
      await new Promise(r => setTimeout(r, 2000));
      
      // Request OTP code from backend
      const otpResponse = await fetch('http://localhost:8000/api/v1/auth-otp/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com', full_name: 'Test User' })
      });
      
      const otpData = await otpResponse.json();
      console.log('OTP Response:', otpData);
      
      if (otpData.debug_otp) {
        console.log('4. Got OTP:', otpData.debug_otp);
        
        // Enter OTP
        const otpInput = await page.$('input[placeholder*="code" i], input[placeholder*="otp" i], input[type="text"]:not([type="email"])');
        if (otpInput) {
          await otpInput.type(otpData.debug_otp);
          
          // Submit OTP
          const submitButton = await page.$('button[type="submit"]:not([disabled])');
          if (submitButton) {
            await submitButton.click();
          }
        }
      }
      
      console.log('5. Waiting for dashboard...');
      await new Promise(r => setTimeout(r, 3000));
    }
    
    // Check if we're on dashboard
    const finalUrl = page.url();
    const isOnDashboard = !finalUrl.includes('/login') && !finalUrl.includes('/auth');
    
    console.log('Final URL:', finalUrl);
    console.log('Successfully logged in:', isOnDashboard);
    
    if (isOnDashboard) {
      console.log('6. Testing page refresh for session persistence...');
      await page.reload({ waitUntil: 'networkidle0' });
      await new Promise(r => setTimeout(r, 2000));
      
      const urlAfterRefresh = page.url();
      const stillOnDashboard = !urlAfterRefresh.includes('/login') && !urlAfterRefresh.includes('/auth');
      
      console.log('URL after refresh:', urlAfterRefresh);
      console.log('Session persisted:', stillOnDashboard);
      
      // Check if cards are loaded
      const cards = await page.$$('.card, [data-testid="card"], div[class*="card"]');
      console.log('Cards found:', cards.length);
    }
    
    console.log('Test completed successfully!');
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await browser.close();
  }
})();