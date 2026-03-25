import { mockDb } from './mockDb';

export const runPersistenceTests = async () => {
  console.group('🧪 Persistence Verification Tests');
  
  // Set test mode - Use a unique key for isolation
  const TEST_KEY = 'adminData_TEST_' + Date.now();
  window.MOCK_DB_KEY = TEST_KEY;
  
  console.log(`Diagnostic: Using isolated storage key: ${TEST_KEY}`);
  
  // Cleanup start
  localStorage.removeItem(TEST_KEY);
  
  const testRouteId = 'test-route-' + Date.now();
  let stopId = null;

  try {
    // Test 0: LocalStorage Availability
    console.log('Test 0: Checking LocalStorage capability...');
    try {
        const testKey = 'test_ls_' + Date.now();
        localStorage.setItem(testKey, 'ok');
        const val = localStorage.getItem(testKey);
        localStorage.removeItem(testKey);
        if (val === 'ok') console.log('✅ Pass: LocalStorage is working');
        else console.error('❌ Fail: LocalStorage read/write mismatch');
    } catch (lsErr) {
        console.error('❌ Fail: LocalStorage threw error', lsErr);
    }

    // Diagnostic: Check test DB before start
    const existingData = localStorage.getItem(TEST_KEY);
    console.log('Diagnostic: Test DB length:', existingData ? existingData.length : 0);

    // Test 1: Validation - Missing Route ID
    console.log('Test 1: Creating stop without Route ID...');
    const res1 = await mockDb.createStop({ name: 'Invalid Stop', price4Seater: 0, price6SeaterLuxurySuv: 0, price6to10SeaterSuv: 0 });
    if (res1.error) console.log('✅ Pass: Correctly rejected missing Route ID');
    else console.error('❌ Fail: Allowed missing Route ID');

    // Test 2: Validation - Negative Price
    console.log('Test 2: Creating stop with negative price...');
    const res2 = await mockDb.createStop({ routeId: testRouteId, name: 'Negative Price', price4Seater: -100, price6SeaterLuxurySuv: 0, price6to10SeaterSuv: 0 });
    if (res2.error) console.log('✅ Pass: Correctly rejected negative price');
    else console.error('❌ Fail: Allowed negative price');

    // Test 3: Successful Creation
    console.log('Test 3: Creating valid stop...');
    const validStop = {
      routeId: testRouteId,
      name: 'Valid Stop ' + Date.now(),
      price4Seater: 500,
      price6SeaterLuxurySuv: 600,
      price6to10SeaterSuv: 800,
      description: 'A test stop'
    };
    const res3 = await mockDb.createStop(validStop);
    if (res3.data && !res3.error) {
        console.log('✅ Pass: Stop created successfully');
        stopId = res3.data.id;
        
        // Diagnostic: Check persistence immediately
        const afterSaveData = localStorage.getItem(TEST_KEY);
        console.log('Diagnostic: adminData after save length:', afterSaveData ? afterSaveData.length : 0);
        console.log('Diagnostic: adminData after save content:', afterSaveData);
        
    } else {
        console.error('❌ Fail: Could not create valid stop', res3.error);
    }

    // Test 4: Duplicate Check
    console.log('Test 4: checking for duplicates...');
    const res4 = await mockDb.createStop(validStop);
    if (res4.error && res4.error.message.includes('Duplicate')) {
        console.log('✅ Pass: Correctly rejected duplicate stop');
    } else {
        console.error('❌ Fail: Allowed duplicate stop', res4);
    }

    // Test 5: Persistence Retrieval
    console.log('Test 5: Retrieving stop from storage...');
    const res5 = await mockDb.getStopsByRouteId(testRouteId);
    
    if (res5.data && res5.data.length === 1 && res5.data[0].id === stopId) {
        console.log('✅ Pass: Data persisted and retrieved correctly');
    } else {
        console.error(`❌ Fail: Data retrieval failed or mismatch. Expected 1 stop, found ${res5.data ? res5.data.length : 'null'}`);
        if (res5.data && res5.data.length > 0) {
            console.table(res5.data);
        }
    }

    // Cleanup
    if (stopId) {
        await mockDb.deleteStop(stopId);
        console.log('🧹 Cleanup: Test stop deleted');
    }

  } catch (e) {
      console.error('🚨 Test Suite Crashed:', e);
  } finally {
      // Cleanup test key
      localStorage.removeItem(TEST_KEY);
      delete window.MOCK_DB_KEY; // Restore default behavior
      console.log('🧹 Cleanup: Test DB removed');
      console.groupEnd();
  }
};
