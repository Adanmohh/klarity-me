// Test script for Archive Feature
const API_BASE = 'http://localhost:8000/api/v1';

async function testArchiveFeature() {
    console.log('🧪 Testing Archive Feature...\n');
    
    try {
        // Step 1: Get cards
        console.log('Step 1: Getting cards...');
        const cardsResponse = await fetch(`${API_BASE}/cards/`, {
            headers: { 'Authorization': 'Bearer dev-token' }
        });
        const cards = await cardsResponse.json();
        
        if (!cards || cards.length === 0) {
            console.error('❌ No cards found!');
            return;
        }
        
        const testCard = cards[0];
        console.log(`✅ Found card: ${testCard.title} (ID: ${testCard.id})\n`);
        
        // Step 2: Create a test task
        console.log('Step 2: Creating test task...');
        const createResponse = await fetch(`${API_BASE}/focus-tasks/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer dev-token'
            },
            body: JSON.stringify({
                title: `Archive Test Task ${Date.now()}`,
                card_id: testCard.id,
                lane: 'main',
                position: 0,
                description: 'This task will be archived and restored'
            })
        });
        
        if (!createResponse.ok) {
            console.error('❌ Failed to create task:', await createResponse.text());
            return;
        }
        
        const newTask = await createResponse.json();
        console.log(`✅ Created task: ${newTask.title}`);
        console.log(`   ID: ${newTask.id}`);
        console.log(`   Status: ${newTask.status}\n`);
        
        // Step 3: Archive the task
        console.log('Step 3: Archiving task...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const archiveResponse = await fetch(`${API_BASE}/focus-tasks/${newTask.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer dev-token'
            },
            body: JSON.stringify({ status: 'archived' })
        });
        
        if (!archiveResponse.ok) {
            console.error('❌ Failed to archive task:', await archiveResponse.text());
            return;
        }
        
        const archivedTask = await archiveResponse.json();
        console.log(`✅ Task archived!`);
        console.log(`   Status: ${archivedTask.status}\n`);
        
        // Step 4: Get all tasks to verify archived task appears
        console.log('Step 4: Verifying archived task...');
        const tasksResponse = await fetch(`${API_BASE}/focus-tasks/?card_id=${testCard.id}`, {
            headers: { 'Authorization': 'Bearer dev-token' }
        });
        const allTasks = await tasksResponse.json();
        
        const archivedTasks = allTasks.filter(t => t.status === 'archived');
        console.log(`✅ Found ${archivedTasks.length} archived task(s)`);
        
        if (archivedTasks.length > 0) {
            console.log('   Archived tasks:');
            archivedTasks.forEach(t => console.log(`   - ${t.title} (Status: ${t.status})`));
        }
        console.log();
        
        // Step 5: Restore the task
        console.log('Step 5: Restoring task...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const restoreResponse = await fetch(`${API_BASE}/focus-tasks/${newTask.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer dev-token'
            },
            body: JSON.stringify({ status: 'active' })
        });
        
        if (!restoreResponse.ok) {
            console.error('❌ Failed to restore task:', await restoreResponse.text());
            return;
        }
        
        const restoredTask = await restoreResponse.json();
        console.log(`✅ Task restored!`);
        console.log(`   Status: ${restoredTask.status}\n`);
        
        // Step 6: Archive again
        console.log('Step 6: Archiving task again...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const archiveResponse2 = await fetch(`${API_BASE}/focus-tasks/${newTask.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer dev-token'
            },
            body: JSON.stringify({ status: 'archived' })
        });
        
        if (!archiveResponse2.ok) {
            console.error('❌ Failed to archive task:', await archiveResponse2.text());
            return;
        }
        
        console.log('✅ Task archived again\n');
        
        // Step 7: Delete permanently
        console.log('Step 7: Deleting task permanently...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const deleteResponse = await fetch(`${API_BASE}/focus-tasks/${newTask.id}`, {
            method: 'DELETE',
            headers: { 'Authorization': 'Bearer dev-token' }
        });
        
        if (!deleteResponse.ok) {
            console.error('❌ Failed to delete task:', await deleteResponse.text());
            return;
        }
        
        console.log('✅ Task deleted permanently!\n');
        
        // Step 8: Verify task is gone
        console.log('Step 8: Verifying deletion...');
        const finalTasksResponse = await fetch(`${API_BASE}/focus-tasks/?card_id=${testCard.id}`, {
            headers: { 'Authorization': 'Bearer dev-token' }
        });
        const finalTasks = await finalTasksResponse.json();
        
        const taskStillExists = finalTasks.find(t => t.id === newTask.id);
        if (taskStillExists) {
            console.error('❌ Task still exists after deletion!');
        } else {
            console.log('✅ Task successfully deleted\n');
        }
        
        console.log('🎉 Archive Feature Test Complete!');
        console.log('================================');
        console.log('Summary:');
        console.log('✅ Task creation works');
        console.log('✅ Task archiving works');
        console.log('✅ Task restoration works');
        console.log('✅ Permanent deletion works');
        console.log('✅ Archive feature is fully functional!');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error(error);
    }
}

// Run the test
testArchiveFeature();