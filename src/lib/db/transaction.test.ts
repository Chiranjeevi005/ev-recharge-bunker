import { executeTransaction, withTransaction } from './transaction';

// Mock MongoDB ClientSession
const mockSession = {
  startTransaction: jest.fn(),
  commitTransaction: jest.fn(),
  abortTransaction: jest.fn(),
  endSession: jest.fn()
};

// Mock MongoDB client
const mockClient = {
  startSession: jest.fn(() => mockSession)
};

// Mock database connection function
jest.mock('./connection', () => ({
  connectToDatabase: jest.fn(() => Promise.resolve({ client: mockClient, db: {} }))
}));

describe('executeTransaction', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should execute transaction successfully', async () => {
    const transactionFunction = jest.fn(async () => 'success');
    
    mockSession.startTransaction.mockImplementation(() => {});
    mockSession.commitTransaction.mockImplementation(() => Promise.resolve());
    
    const result = await executeTransaction(transactionFunction);
    
    expect(result).toBe('success');
    expect(mockClient.startSession).toHaveBeenCalled();
    expect(mockSession.startTransaction).toHaveBeenCalled();
    expect(transactionFunction).toHaveBeenCalledWith(mockSession);
    expect(mockSession.commitTransaction).toHaveBeenCalled();
    expect(mockSession.endSession).toHaveBeenCalled();
  });

  it('should abort transaction and retry on error', async () => {
    const transactionFunction = jest.fn()
      .mockRejectedValueOnce(new Error('Transient error'))
      .mockResolvedValueOnce('success');
    
    mockSession.startTransaction.mockImplementation(() => {});
    mockSession.commitTransaction.mockImplementation(() => Promise.resolve());
    mockSession.abortTransaction.mockImplementation(() => Promise.resolve());
    
    const result = await executeTransaction(transactionFunction, 2);
    
    expect(result).toBe('success');
    expect(mockClient.startSession).toHaveBeenCalledTimes(1);
    expect(mockSession.startTransaction).toHaveBeenCalledTimes(2);
    expect(transactionFunction).toHaveBeenCalledTimes(2);
    expect(mockSession.abortTransaction).toHaveBeenCalledTimes(1);
    expect(mockSession.commitTransaction).toHaveBeenCalledTimes(1);
    expect(mockSession.endSession).toHaveBeenCalled();
  });

  it('should throw error after max retries exceeded', async () => {
    const transactionFunction = jest.fn()
      .mockRejectedValue(new Error('Persistent error'));
    
    mockSession.startTransaction.mockImplementation(() => {});
    mockSession.abortTransaction.mockImplementation(() => Promise.resolve());
    
    await expect(executeTransaction(transactionFunction, 2))
      .rejects
      .toThrow('Transaction failed after 2 attempts: Error: Persistent error');
    
    expect(mockClient.startSession).toHaveBeenCalledTimes(1);
    expect(mockSession.startTransaction).toHaveBeenCalledTimes(2);
    expect(transactionFunction).toHaveBeenCalledTimes(2);
    expect(mockSession.abortTransaction).toHaveBeenCalledTimes(2);
    expect(mockSession.commitTransaction).not.toHaveBeenCalled();
    expect(mockSession.endSession).toHaveBeenCalled();
  });
});

describe('withTransaction', () => {
  it('should be an alias for executeTransaction', async () => {
    const transactionFunction = jest.fn(async () => 'result');
    
    mockSession.startTransaction.mockImplementation(() => {});
    mockSession.commitTransaction.mockImplementation(() => Promise.resolve());
    
    const result = await withTransaction(transactionFunction);
    
    expect(result).toBe('result');
    expect(transactionFunction).toHaveBeenCalledWith(mockSession);
  });
});