// @ts-check

import * as assert from 'node:assert';
import test from 'node:test';
import { EventEmitter } from '../src/index.js';

const noop = () => {};

test('normal subscribers', async (t) => {
	await t.test('on()', () => {
		const emitter = new EventEmitter();
		let count = 0;

		return new Promise((resolve) => {
			emitter.on('event', (a) => {
				switch (count) {
					case 0:
						assert.strictEqual(a, 1);
						break;
					case 1:
						assert.strictEqual(a, 2);
						break;
				}

				count++;

				resolve();
			});

			emitter.emit('event', 1);
			emitter.emit('event', 2);
		});
	});

	await t.test('addListener()', () => {
		const emitter = new EventEmitter();
		let count = 0;

		return new Promise((resolve) => {
			emitter.addListener('event', (a) => {
				switch (count) {
					case 0:
						assert.strictEqual(a, 1);
						break;
					case 1:
						assert.strictEqual(a, 2);
						break;
				}

				count++;

				resolve();
			});

			emitter.emit('event', 1);
			emitter.emit('event', 2);
		});
	});

	await t.test('prependListener()', () => {
		const emitter = new EventEmitter();
		let id = 0;

		return new Promise((resolve) => {
			emitter.on('event', () => (id = 2));
			emitter.prependListener('event', () => (id = 1));

			emitter.emit('event', 1);
			emitter.emit('event', 2);

			setTimeout(() => {
				assert.strictEqual(id, 2);
				resolve();
			}, 100);
		});
	});

	await t.test('off()', () => {
		const emitter = new EventEmitter();

		const handler = () => assert.fail('should not be called');

		emitter.on('event', handler);
		assert.strictEqual(emitter.listenerCount('event'), 1, 'there should be one listener registered');

		emitter.off('event', handler);
		assert.strictEqual(emitter.listenerCount('event'), 0, 'there should be one listener registered');

		assert.equal(emitter.emit('event', 1), false, 'should return false');
	});

	await t.test('removeListener()', () => {
		const emitter = new EventEmitter();
		let count = 0;

		return new Promise((resolve) => {
			const handler = () => assert.fail('should not be called');

			emitter.on('event', handler);
			emitter.removeListener('event', handler);
			assert.strictEqual(emitter.eventNames().length, 0, 'eventNames');
			assert.deepStrictEqual(emitter.listeners('event'), [], 'listeners');
			assert.strictEqual(emitter.listenerCount('event'), 0, 'listenerCount');

			emitter.emit('event', 1);

			setTimeout(() => {
				assert.strictEqual(count, 0);
				resolve();
			}, 100);
		});
	});

	await t.test("removeAllListeners('event')", () => {
		const emitter = new EventEmitter();

		emitter.on('event', noop);
		assert.strictEqual(emitter.eventNames().length, 1, 'there should be one event registered');
		assert.deepStrictEqual(emitter.listeners('event'), [noop], 'there should be one listener registered');
		assert.strictEqual(emitter.listenerCount('event'), 1, 'listeners count should be 1');

		emitter.on('event', noop);
		assert.strictEqual(emitter.eventNames().length, 1, 'there should be one event registered');
		assert.deepStrictEqual(emitter.listeners('event'), [noop, noop], 'there should be one listener registered');
		assert.strictEqual(emitter.listenerCount('event'), 2, 'listeners count should be 2');

		emitter.removeAllListeners('event');

		assert.strictEqual(emitter.eventNames().length, 0, 'there should be no events registered');
		assert.deepStrictEqual(emitter.listeners('event'), [], 'there should be no listeners');
		assert.strictEqual(emitter.listenerCount('event'), 0, 'listeners count should be 0');
	});

	await t.test('removeAllListeners()', () => {
		const emitter = new EventEmitter();

		emitter.on('event', noop);
		emitter.on('event', noop);
		assert.strictEqual(emitter.eventNames().length, 1, 'there should be one event registered');
		assert.deepStrictEqual(emitter.listeners('event'), [noop, noop], 'there should be two listeners registered');
		assert.strictEqual(emitter.listenerCount('event'), 2, 'listeners count should be 2');

		emitter.removeAllListeners();

		assert.strictEqual(emitter.eventNames().length, 0, 'there should be no events registered');
		assert.deepStrictEqual(emitter.listeners('event'), [], 'there should be no listeners');
		assert.strictEqual(emitter.listenerCount('event'), 0, 'listeners count should be 0');
	});
});

test('once subscribers', async (t) => {
	await t.test('once()', () => {
		const emitter = new EventEmitter();

		const handler = t.mock.fn(() => assert.fail('should not be called'), noop, { times: 1 });

		emitter.once('event', handler);
		emitter.emit('event', 1);
		emitter.emit('event', 2);
	});

	await t.test('prependOnceListener()', () => {
		const emitter = new EventEmitter();
		let id = 0;

		return new Promise((resolve) => {
			emitter.prependOnceListener('event', () => (id = 1));

			emitter.emit('event', 1);
			emitter.emit('event', 2);

			setTimeout(() => {
				assert.strictEqual(id, 1);
				resolve();
			}, 100);
		});
	});
});
