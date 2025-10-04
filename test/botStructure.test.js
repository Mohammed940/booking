const BotHandler = require('../botHandler');

// Mock the Telegram bot
const mockBot = {
  sendMessage: jest.fn(),
  on: jest.fn()
};

describe('Bot Structure', () => {
  let botHandler;

  beforeEach(() => {
    botHandler = new BotHandler(mockBot);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should initialize with required properties', () => {
    expect(botHandler.bot).toBe(mockBot);
    expect(botHandler.userStates).toBeInstanceOf(Map);
    expect(botHandler.pendingConfirmations).toBeInstanceOf(Map);
  });

  test('should have handleMessage method', () => {
    expect(typeof botHandler.handleMessage).toBe('function');
  });

  test('should have handleCallbackQuery method', () => {
    expect(typeof botHandler.handleCallbackQuery).toBe('function');
  });

  test('should have startBookingProcess method', () => {
    expect(typeof botHandler.startBookingProcess).toBe('function');
  });

  test('should have showHelpInstructions method', () => {
    expect(typeof botHandler.showHelpInstructions).toBe('function');
  });
});