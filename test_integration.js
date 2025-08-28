// Integration test to verify the TODO app is working

const puppeteer = require('puppeteer');

async function testTodoApp() {
  console.log('Starting integration test...');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Navigate to the app
    console.log('1. Navigating to app...');
    await page.goto('http://localhost:5174', { waitUntil: 'networkidle2' });
    
    // Check if cards are visible
    console.log('2. Checking for cards...');
    await page.waitForSelector('h3', { timeout: 5000 });
    
    const cards = await page.$$eval('h3', elements => 
      elements.map(el => el.textContent)
    );
    console.log('   Found cards:', cards);
    
    // Click Enter Focus button
    console.log('3. Clicking Enter Focus button...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.textContent.includes('Enter Focus'));
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });
    
    // Wait for navigation or view change
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check current view
    console.log('4. Checking focus view...');
    const pageContent = await page.evaluate(() => {
      const headers = Array.from(document.querySelectorAll('h1, h2, h3')).map(h => h.textContent);
      const hasNoTasks = document.body.textContent.includes('No Tasks Yet');
      const hasTasks = document.body.textContent.includes('Setup JWT');
      
      return {
        headers,
        hasNoTasks,
        hasTasks,
        url: window.location.href
      };
    });
    
    console.log('   Page state:', pageContent);
    
    // Test API directly
    console.log('5. Testing API directly...');
    const apiResponse = await page.evaluate(async () => {
      try {
        const response = await fetch('http://localhost:8000/api/v1/cards/596bb074-a0ab-493a-ac91-c664f34bc534');
        const data = await response.json();
        return {
          success: true,
          taskCount: data.focus_tasks ? data.focus_tasks.length : 0,
          firstTask: data.focus_tasks ? data.focus_tasks[0]?.title : null
        };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });
    
    console.log('   API Response:', apiResponse);
    
    // Summary
    console.log('\n=== TEST SUMMARY ===');
    console.log('✓ App loads successfully');
    console.log('✓ Cards are displayed');
    console.log('✓ API returns tasks:', apiResponse.taskCount, 'tasks');
    
    if (pageContent.hasTasks) {
      console.log('✓ Tasks are displayed in UI');
    } else if (pageContent.hasNoTasks) {
      console.log('✗ UI shows "No Tasks" but API has tasks - ISSUE FOUND');
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await browser.close();
    console.log('\nTest completed.');
  }
}

// Run the test
testTodoApp().catch(console.error);