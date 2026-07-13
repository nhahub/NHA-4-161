/**
 * Unit tests for blockTimeService — mocks BlockTime's Mongoose methods
 * directly, so no live MongoDB connection is needed (unlike cascade.test.js,
 * which requires the docker-compose replica set).
 *
 * Run with:  node --test server/src/tests/blockTime.test.js
 */
const assert = require('node:assert/strict');
const { test, mock, beforeEach } = require('node:test');

const BlockTime = require('../models/BlockTime');
const { createBlock, listBlocks, removeBlock } = require('../services/blockTimeService');

beforeEach(() => {
  mock.restoreAll();
});

test('createBlock passes fields straight through to BlockTime.create', async () => {
  const created = { _id: 'block1', doctorId: 'doc1', date: '2026-07-13', startTime: '13:00', endTime: '14:00', reason: 'Lunch' };
  mock.method(BlockTime, 'create', async (data) => {
    assert.deepEqual(data, { doctorId: 'doc1', date: '2026-07-13', startTime: '13:00', endTime: '14:00', reason: 'Lunch' });
    return created;
  });

  const result = await createBlock({ doctorId: 'doc1', date: '2026-07-13', startTime: '13:00', endTime: '14:00', reason: 'Lunch' });
  assert.deepEqual(result, created);
});

test('listBlocks scopes to doctorId when provided', async () => {
  const chain = {
    populate: () => chain,
    sort: () => Promise.resolve([{ _id: 'block1' }]),
  };
  mock.method(BlockTime, 'find', (filter) => {
    assert.deepEqual(filter, { isActive: true, doctorId: 'doc1' });
    return chain;
  });

  const result = await listBlocks({ doctorId: 'doc1' });
  assert.equal(result.length, 1);
});

test('listBlocks with no doctorId returns everything (admin view)', async () => {
  const chain = { populate: () => chain, sort: () => Promise.resolve([]) };
  mock.method(BlockTime, 'find', (filter) => {
    assert.deepEqual(filter, { isActive: true });
    return chain;
  });

  await listBlocks({});
});

test('removeBlock throws 404 when the block does not exist', async () => {
  mock.method(BlockTime, 'findOne', async () => null);

  await assert.rejects(
    () => removeBlock('missing-id', { userId: 'doc1', role: 'doctor' }),
    (err) => {
      assert.equal(err.status, 404);
      return true;
    }
  );
});

test('removeBlock throws 403 when a doctor tries to remove someone else\'s block', async () => {
  mock.method(BlockTime, 'findOne', async () => ({
    doctorId: { toString: () => 'other-doctor' },
    isActive: true,
    save: async () => {},
  }));

  await assert.rejects(
    () => removeBlock('block1', { userId: 'doc1', role: 'doctor' }),
    (err) => {
      assert.equal(err.status, 403);
      return true;
    }
  );
});

test('removeBlock succeeds for the owning doctor and soft-deletes', async () => {
  let saved = false;
  const block = {
    doctorId: { toString: () => 'doc1' },
    isActive: true,
    deletedAt: null,
    save: async () => { saved = true; },
  };
  mock.method(BlockTime, 'findOne', async () => block);

  await removeBlock('block1', { userId: 'doc1', role: 'doctor' });

  assert.equal(block.isActive, false);
  assert.ok(block.deletedAt instanceof Date);
  assert.ok(saved, 'save() should have been called');
});

test('removeBlock succeeds for an admin removing any doctor\'s block', async () => {
  const block = {
    doctorId: { toString: () => 'some-other-doctor' },
    isActive: true,
    deletedAt: null,
    save: async () => {},
  };
  mock.method(BlockTime, 'findOne', async () => block);

  await removeBlock('block1', { userId: 'admin1', role: 'admin' });

  assert.equal(block.isActive, false);
});
