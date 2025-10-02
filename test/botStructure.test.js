const fs = require('fs');
const path = require('path');

// Test that all required files exist
describe('Bot Structure', () => {
  test('should have all required files', () => {
    const requiredFiles = [
      'index.js',
      'config.js',
      'googleSheetsService.js',
      'botHandler.js',
      'package.json',
      '.env.example',
      'README.md'
    ];
    
    requiredFiles.forEach(file => {
      const filePath = path.join(__dirname, '..', file);
      expect(fs.existsSync(filePath)).toBe(true);
    });
  });
  
  test('should have package.json with required dependencies', () => {
    const packageJson = require('../package.json');
    
    expect(packageJson.dependencies).toHaveProperty('node-telegram-bot-api');
    expect(packageJson.dependencies).toHaveProperty('googleapis');
    expect(packageJson.dependencies).toHaveProperty('node-cron');
    expect(packageJson.dependencies).toHaveProperty('dotenv');
  });
  
  test('should have config file with required structure', () => {
    const config = require('../config');
    
    expect(config).toHaveProperty('TELEGRAM_TOKEN');
    expect(config).toHaveProperty('GOOGLE_SHEETS');
    expect(config.GOOGLE_SHEETS).toHaveProperty('SPREADSHEET_ID');
    expect(config).toHaveProperty('TIMEZONE');
    expect(config).toHaveProperty('REMINDER_MINUTES_BEFORE');
  });
  
  test('should handle missing Google Sheets credentials gracefully', () => {
    // Save original environment
    const originalCredentials = process.env.GOOGLE_CREDENTIALS;
    
    // Temporarily remove credentials
    delete process.env.GOOGLE_CREDENTIALS;
    
    // Reload config
    jest.resetModules();
    const config = require('../config');
    
    // Should not throw an error even with missing credentials
    expect(config.GOOGLE_SHEETS.CREDENTIALS).toBeNull();
    
    // Restore original environment
    process.env.GOOGLE_CREDENTIALS = originalCredentials;
  });
});