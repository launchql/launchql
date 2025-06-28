import { Pool } from 'pg';
import { withTransaction, executeQuery, TransactionContext } from '../utils/transaction';

describe('Transaction utilities', () => {
  let mockPool: any;
  let mockClient: any;

  beforeEach(() => {
    mockClient = {
      query: jest.fn(),
      release: jest.fn()
    };

    mockPool = {
      connect: jest.fn().mockResolvedValue(mockClient),
      query: jest.fn(),
      end: jest.fn()
    };
  });

  describe('withTransaction', () => {
    it('should execute callback within transaction', async () => {
      const callback = jest.fn().mockResolvedValue('result');

      const result = await withTransaction(mockPool, { useTransaction: true }, callback);

      expect(mockPool.connect).toHaveBeenCalled();
      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(callback).toHaveBeenCalledWith({ client: mockClient, isTransaction: true });
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
      expect(mockClient.release).toHaveBeenCalled();
      expect(result).toBe('result');
    });

    it('should rollback on error', async () => {
      const error = new Error('Test error');
      const callback = jest.fn().mockRejectedValue(error);

      await expect(withTransaction(mockPool, { useTransaction: true }, callback)).rejects.toThrow(error);

      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(callback).toHaveBeenCalledWith({ client: mockClient, isTransaction: true });
      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should not use transaction when disabled', async () => {
      const callback = jest.fn().mockResolvedValue('result');

      const result = await withTransaction(mockPool, { useTransaction: false }, callback);

      expect(mockPool.connect).not.toHaveBeenCalled();
      expect(callback).toHaveBeenCalledWith({ client: mockPool, isTransaction: false });
      expect(mockClient.query).not.toHaveBeenCalled();
      expect(result).toBe('result');
    });
  });

  describe('executeQuery', () => {
    it('should use client query when in transaction', async () => {
      const queryResult = { rows: [{ id: 1 }] };
      mockClient.query.mockResolvedValue(queryResult);
      
      const context: TransactionContext = { client: mockClient, isTransaction: true };
      const result = await executeQuery(context, 'SELECT * FROM test');

      expect(mockClient.query).toHaveBeenCalledWith('SELECT * FROM test', undefined);
      expect(result).toBe(queryResult);
    });

    it('should use pool query when not in transaction', async () => {
      const queryResult = { rows: [{ id: 1 }] };
      mockPool.query.mockResolvedValue(queryResult);
      
      const context: TransactionContext = { client: mockPool, isTransaction: false };
      const result = await executeQuery(context, 'SELECT * FROM test');

      expect(mockPool.query).toHaveBeenCalledWith('SELECT * FROM test', undefined);
      expect(result).toBe(queryResult);
    });

    it('should pass query parameters', async () => {
      const queryResult = { rows: [{ id: 1 }] };
      mockClient.query.mockResolvedValue(queryResult);
      
      const context: TransactionContext = { client: mockClient, isTransaction: true };
      const result = await executeQuery(context, 'SELECT * FROM test WHERE id = $1', [1]);

      expect(mockClient.query).toHaveBeenCalledWith('SELECT * FROM test WHERE id = $1', [1]);
      expect(result).toBe(queryResult);
    });
  });
});