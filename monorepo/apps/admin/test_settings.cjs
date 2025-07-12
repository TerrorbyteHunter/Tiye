const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3001';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'your-admin-token-here';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Authorization': `Bearer ${ADMIN_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

async function testSettingsAPI() {
  console.log('🧪 Testing Tiyende System Settings API...\n');

  try {
    // Test 1: Get all settings
    console.log('1. Testing GET /api/settings...');
    const settingsResponse = await api.get('/api/settings');
    console.log(`✅ Retrieved ${settingsResponse.data.length} settings`);
    
    // Display some settings
    const systemSettings = settingsResponse.data.filter(s => s.name.startsWith('system_'));
    console.log(`   - System settings: ${systemSettings.length}`);
    console.log(`   - Contact settings: ${settingsResponse.data.filter(s => s.name.startsWith('contact_')).length}`);
    console.log(`   - Security settings: ${settingsResponse.data.filter(s => s.name.startsWith('security_')).length}`);
    console.log(`   - Notification settings: ${settingsResponse.data.filter(s => s.name.startsWith('notification_')).length}`);
    console.log(`   - Backup settings: ${settingsResponse.data.filter(s => s.name.startsWith('backup_')).length}\n`);

    // Test 2: Update a setting
    console.log('2. Testing POST /api/settings/system_name...');
    const updateResponse = await api.post('/api/settings/system_name', {
      value: 'Tiyende Bus Reservation System'
    });
    console.log(`✅ Updated system_name: ${updateResponse.data.value}\n`);

    // Test 3: Update contact email
    console.log('3. Testing POST /api/settings/contact_email...');
    const emailResponse = await api.post('/api/settings/contact_email', {
      value: 'support@tiyende.com'
    });
    console.log(`✅ Updated contact_email: ${emailResponse.data.value}\n`);

    // Test 4: Update security settings
    console.log('4. Testing security settings...');
    await api.post('/api/settings/security_session_timeout', { value: '60' });
    await api.post('/api/settings/security_password_min_length', { value: '10' });
    await api.post('/api/settings/security_two_factor_enabled', { value: 'true' });
    console.log('✅ Updated security settings\n');

    // Test 5: Update notification settings
    console.log('5. Testing notification settings...');
    await api.post('/api/settings/notification_email_enabled', { value: 'true' });
    await api.post('/api/settings/notification_sms_enabled', { value: 'false' });
    await api.post('/api/settings/notification_webhook_url', { value: 'https://api.example.com/webhook' });
    console.log('✅ Updated notification settings\n');

    // Test 6: Update backup settings
    console.log('6. Testing backup settings...');
    await api.post('/api/settings/backup_scheduled', { value: 'true' });
    await api.post('/api/settings/backup_frequency', { value: 'daily' });
    await api.post('/api/settings/backup_retention_days', { value: '30' });
    console.log('✅ Updated backup settings\n');

    // Test 7: Test backup creation
    console.log('7. Testing backup creation...');
    try {
      const backupResponse = await api.post('/api/backups');
      console.log(`✅ Created backup: ${backupResponse.data.path}\n`);
    } catch (error) {
      console.log('⚠️  Backup creation failed (this is expected if pg_dump is not available)');
      console.log(`   Error: ${error.response?.data?.message || error.message}\n`);
    }

    // Test 8: Test backup listing
    console.log('8. Testing backup listing...');
    try {
      const backupsResponse = await api.get('/api/backups');
      console.log(`✅ Found ${backupsResponse.data.length} backups\n`);
    } catch (error) {
      console.log('⚠️  Backup listing failed');
      console.log(`   Error: ${error.response?.data?.message || error.message}\n`);
    }

    // Test 9: Verify settings were updated
    console.log('9. Verifying updated settings...');
    const updatedSettings = await api.get('/api/settings');
    const updatedSystemName = updatedSettings.data.find(s => s.name === 'system_name');
    const updatedSessionTimeout = updatedSettings.data.find(s => s.name === 'security_session_timeout');
    const updatedBackupScheduled = updatedSettings.data.find(s => s.name === 'backup_scheduled');

    console.log(`✅ System name: ${updatedSystemName?.value}`);
    console.log(`✅ Session timeout: ${updatedSessionTimeout?.value} minutes`);
    console.log(`✅ Backup scheduled: ${updatedBackupScheduled?.value}\n`);

    // Test 10: Test invalid setting update
    console.log('10. Testing invalid setting update...');
    try {
      await api.post('/api/settings/invalid_setting', { value: 'test' });
      console.log('❌ Should have failed but didn\'t');
    } catch (error) {
      console.log('✅ Correctly rejected invalid setting update');
    }

    console.log('🎉 All settings tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

async function testSettingsValidation() {
  console.log('\n🔍 Testing Settings Validation...\n');

  const testCases = [
    {
      name: 'system_name',
      value: 'Valid System Name',
      shouldPass: true
    },
    {
      name: 'system_name',
      value: '',
      shouldPass: false
    },
    {
      name: 'contact_email',
      value: 'valid@email.com',
      shouldPass: true
    },
    {
      name: 'contact_email',
      value: 'invalid-email',
      shouldPass: false
    },
    {
      name: 'security_session_timeout',
      value: '30',
      shouldPass: true
    },
    {
      name: 'security_session_timeout',
      value: '0',
      shouldPass: false
    }
  ];

  for (const testCase of testCases) {
    try {
      await api.post(`/api/settings/${testCase.name}`, { value: testCase.value });
      if (testCase.shouldPass) {
        console.log(`✅ ${testCase.name} = "${testCase.value}" - PASSED`);
      } else {
        console.log(`❌ ${testCase.name} = "${testCase.value}" - Should have failed but passed`);
      }
    } catch (error) {
      if (testCase.shouldPass) {
        console.log(`❌ ${testCase.name} = "${testCase.value}" - Should have passed but failed`);
      } else {
        console.log(`✅ ${testCase.name} = "${testCase.value}" - Correctly rejected`);
      }
    }
  }
}

async function testSettingsGroups() {
  console.log('\n📊 Testing Settings Groups...\n');

  try {
    // Get all settings
    const allSettings = await api.get('/api/settings');
    
    // Group settings by prefix
    const groups = {
      system: allSettings.data.filter(s => s.name.startsWith('system_')),
      contact: allSettings.data.filter(s => s.name.startsWith('contact_')),
      security: allSettings.data.filter(s => s.name.startsWith('security_')),
      notification: allSettings.data.filter(s => s.name.startsWith('notification_')),
      backup: allSettings.data.filter(s => s.name.startsWith('backup_'))
    };

    console.log('Settings by group:');
    for (const [groupName, settings] of Object.entries(groups)) {
      console.log(`  ${groupName}: ${settings.length} settings`);
      settings.forEach(setting => {
        console.log(`    - ${setting.name}: ${setting.value}`);
      });
    }

    console.log('\n✅ Settings grouping test completed');

  } catch (error) {
    console.error('❌ Settings grouping test failed:', error.response?.data || error.message);
  }
}

async function main() {
  console.log('🚀 Starting Tiyende System Settings Test Suite\n');
  
  await testSettingsAPI();
  await testSettingsValidation();
  await testSettingsGroups();
  
  console.log('\n✨ All tests completed!');
}

// Run tests if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  testSettingsAPI,
  testSettingsValidation,
  testSettingsGroups
}; 