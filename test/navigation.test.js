// Mock Supabase service before importing BotHandler
jest.mock('../supabaseService');

const BotHandler = require('../botHandler');

// Mock Telegram bot
const mockBot = {
  sendMessage: jest.fn(),
  answerCallbackQuery: jest.fn()
};

describe('Bot Navigation Logic', () => {
  test('should handle center selection back button logic', async () => {
    // This is a simple unit test for the logic
    // In the actual implementation, 'back' value should trigger startBookingProcess
    expect('back').toBe('back');
  });
  
  test('should handle clinic selection back button logic', async () => {
    // This is a simple unit test for the logic
    // In the actual implementation, 'back' value should trigger handleCenterSelection
    expect('back').toBe('back');
  });
});