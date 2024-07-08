// @ts-check

export const errorMonitor = Symbol.for('tinynodeeventemitter.errorMonitor');

// FIXME: implement `emitter[Symbol.for('nodejs.rejection')](err, eventName[, ...args])`
// export const captureRejectionsSymbol = Symbol.for('tinynodeeventemitter.captureRejectionsSymbol');

/**
 * @typedef {(...args: Args) => void} Listener
 * @template {any[]} Args
 */

/**
 * @class EventEmitter
 * @description Portable implementation of the Node.js EventEmitter class
 * @see https://nodejs.org/docs/latest/api/events.html#events_class_eventemitter
 *
 * @template {{ [event: string | symbol]: Listener<any> }} [AllEvents=any]
 */
export class EventEmitter {
	/** * @type {Map<keyof AllEvents, Array<Listener<Parameters<AllEvents[keyof AllEvents]>>>>} */
	#handlers = new Map();

	#captureRejections = false;
	#emitEventEmitterEvents = true;

	/**
	 * @param {object} options
	 * @param {boolean} [options.captureRejections=false] - Capture rejections (not implemented)
	 * @param {boolean} [options.emitEventEmitterEvents=true] - Emit 'newListener' and 'removeListener' events
	 * @constructor
	 */
	constructor({ captureRejections = false, emitEventEmitterEvents = true } = {}) {
		this.#captureRejections = captureRejections;
		this.#emitEventEmitterEvents = emitEventEmitterEvents;
	}

	/**
	 * Adds the listener function to the end of the listeners array for the event.
	 * No checks are made to see if the listener has already been added.
	 * Multiple calls passing the same combination of eventName and listener will result in the listener being added, and called, multiple times.
	 *
	 * @param {E} event The name of the event
	 * @param {AllEvents[E]} handler The callback function
	 * @template {keyof AllEvents} E
	 * @returns {this} The instance this method was called on, useful for chaining
	 *
	 * @see https://nodejs.org/docs/latest/api/events.html#emitteroneventname-listener
	 */
	on(event, handler) {
		this.#addHandler(event, handler);
		return this;
	}
	/**
	 * Alias for emitter.{@link on}(eventName, listener).
	 *
	 * @param {E} event
	 * @param {AllEvents[E]} handler
	 * @template {keyof AllEvents} E
	 * @returns {this} The instance this method was called on, useful for chaining
	 *
	 * @alias on
	 * @see https://nodejs.org/docs/latest/api/events.html#emitteraddlistenereventname-listener
	 */
	addListener(event, handler) {
		return this.on(event, handler);
	}
	/**
	 * Adds the listener function to the beginning of the listeners array for the event.
	 * No checks are made to see if the listener has already been added.
	 * Multiple calls passing the same combination of eventName and listener will result in the listener being added, and called, multiple times.
	 *
	 * @param {E} event
	 * @param {AllEvents[E]} handler
	 * @template {keyof AllEvents} E
	 * @returns {this} The instance this method was called on, useful for chaining
	 *
	 * @see https://nodejs.org/docs/latest/api/events.html#emitterprependlistenereventname-listener
	 */
	prependListener(event, handler) {
		this.#prependHandler(event, handler);
		return this;
	}

	/**
	 * Adds a one-time listener function for the event.
	 * The next time eventName is triggered, this listener is removed and then invoked.
	 *
	 * @param {E} event
	 * @param {Listener<Parameters<AllEvents[E]>>} handler
	 * @template {keyof AllEvents} E
	 * @returns {this} The instance this method was called on, useful for chaining
	 *
	 * @see https://nodejs.org/docs/latest/api/events.html#emitteronceeventname-listener
	 */
	once(event, handler) {
		this.#addHandler(event, this.#newOnce(event, handler));
		return this;
	}

	/**
	 * Adds a one-time listener function for the event to the beginning of the listeners array.
	 * The next time eventName is triggered, this listener is removed, and then invoked.
	 *
	 * @param {E} event
	 * @param {Listener<Parameters<AllEvents[E]>>} handler
	 * @template {keyof AllEvents} E
	 * @returns {this} The instance this method was called on, useful for chaining
	 *
	 * @see https://nodejs.org/docs/latest/api/events.html#emitterprependoncelistenereventname-listener
	 */
	prependOnceListener(event, handler) {
		this.#prependHandler(event, this.#newOnce(event, handler));
		return this;
	}

	/**
	 * Alias for emitter.{@link removeListener}().
	 *
	 * @param {E} event
	 * @param {Listener<Parameters<AllEvents[E]>>} handler
	 * @template {keyof AllEvents} E
	 * @returns {this} The instance this method was called on, useful for chaining
	 *
	 * @alias removeListener
	 * @see https://nodejs.org/docs/latest/api/events.html#emitteroffeventname-listener
	 */
	off(event, handler) {
		return this.removeListener(event, handler);
	}

	/**
	 * Removes the specified listener from the listener array for the event.
	 *
	 * {@link removeListener}() will remove, at most, one instance of a listener from the listener array.
	 * If any single listener has been added multiple times to the listener array for the specified eventName, then {@link removeListener}() must be called multiple times to remove each instance.
	 *
	 * Once an event is emitted, all listeners attached to it at the time of emitting are called in order.
	 * This implies that any {@link removeListener}() or {@link removeAllListeners}() calls after emitting and before the last listener finishes execution will not remove them from {@link emit}() in progress.
	 * Subsequent events behave as expected.
	 *
	 * @param {E} event
	 * @param {Listener<Parameters<AllEvents[E]>>} handler
	 * @template {keyof AllEvents} E
	 * @returns {this} The instance this method was called on, useful for chaining
	 */
	removeListener(event, handler) {
		this.#removeHandler(event, handler);
		return this;
	}

	/**
	 * Removes all listeners, or those of the specified eventName.
	 *
	 * It is bad practice to remove listeners added elsewhere in the code, particularly when the EventEmitter instance was created by some other component or module.
	 *
	 * @param {keyof AllEvents} [event]
	 * @returns {this} The instance this method was called on, useful for chaining
	 *
	 * @see https://nodejs.org/docs/latest/api/events.html#emitterremovealllistenerseventname
	 */
	removeAllListeners(event) {
		if (event === undefined) {
			for (const event of this.eventNames()) this.removeAllListeners(event);
		} else {
			for (const handler of this.listeners(event).slice()) {
				this.#removeHandler(event, handler);
			}
		}

		return this;
	}

	/**
	 * Synchronously calls each of the listeners registered for the event, in the order they were registered, passing the supplied arguments to each.
	 *
	 * @param {E} event The name of the event
	 * @param {Args} args The arguments to pass to the listeners
	 * @returns {boolean} `true` if the event had listeners, `false` otherwise
	 * @template {keyof AllEvents} E
	 * @template {Parameters<AllEvents[E]>} Args
	 *
	 * @see https://nodejs.org/docs/latest/api/events.html#emitteremiteventname-args
	 */
	emit(event, ...args) {
		let handlers = this.#getOrEmpty(event);
		if (event === 'error') handlers = this.#getOrEmpty(errorMonitor).concat(handlers);

		for (const handler of handlers) {
			try {
				handler(...args);
			} catch {}
		}

		return handlers.length > 0;
	}

	/**
	 * Returns an array listing the events for which the emitter has registered listeners.
	 *
	 * @returns {Array<keyof AllEvents>} The names of the events for which the emitter has registered listeners
	 *
	 * @see https://nodejs.org/docs/latest/api/events.html#emittereventnames
	 */
	eventNames() {
		return Array.from(this.#handlers.keys());
	}

	/**
	 * Noop, kept for compatibility.
	 *
	 * @returns {number} Number of maximum listeners allowed per event, always returns Infinity.
	 *
	 * @see https://nodejs.org/docs/latest/api/events.html#emitteraddlistenereventname-listener
	 */
	getMaxListeners() {
		return Infinity;
	}

	/**
	 * Noop, kept for compatibility.
	 *
	 * @param {number} n The maximum number of listeners
	 * @returns {this} The instance this method was called on, useful for chaining
	 *
	 * @see https://nodejs.org/docs/latest/api/events.html#emittersetmaxlistenersn
	 */
	setMaxListeners(n) {
		return this;
	}

	/**
	 * Returns the number of listeners listening for the event.
	 * If listener is provided, it will return how many times the listener is found in the list of the listeners of the event.
	 *
	 * @param {keyof AllEvents} event The name of the event being listened for
	 * @param {Listener<Parameters<AllEvents[keyof AllEvents]>>} [handler] The callback function
	 * @returns {number} The number of listeners for the event
	 *
	 * @see https://nodejs.org/docs/latest/api/events.html#emitterlistenercounteventname-listener
	 */
	listenerCount(event, handler) {
		const handlers = this.#getOrEmpty(event);
		if (handler === undefined) return handlers.length;

		return handlers.filter((otherHandler) => handler === otherHandler).length;
	}

	/**
	 * Returns a copy of the array of listeners for the event.
	 *
	 * @param {keyof AllEvents} event The name of the event
	 * @returns {Array<Listener<Parameters<AllEvents[keyof AllEvents]>>>} Copy of the array of listeners for the event
	 *
	 * @see https://nodejs.org/docs/latest/api/events.html#emitterlistenerseventname
	 */
	listeners(event) {
		return this.#getOrEmpty(event).map((handler) => {
			if ('original' in handler) return /* @type {Listener<Parameters<AllEvents[keyof AllEvents]>>} */ handler;
			return handler;
		});
	}

	/**
	 * Returns a copy of the array of listeners for the event, including any wrappers (such as those created by .{@link once}()).
	 *
	 * @param {keyof AllEvents} event The name of the event
	 * @returns {Array<Listener<Parameters<AllEvents[keyof AllEvents]>>>} Copy of the array of listeners for the event
	 *
	 * @see https://nodejs.org/docs/latest/api/events.html#emitterrawlistenerseventname
	 */
	rawListeners(event) {
		return this.#getOrEmpty(event).slice();
	}

	// FIXME: implement `emitter[Symbol.for('nodejs.rejection')](err, eventName[, ...args])`
	// [Symbol.for("nodejs.rejection")](err, eventName, ...args) {
	//   this.emit(eventName, err, ...args);
	// }

	// #region Internals
	/**
	 * @param {keyof AllEvents} event
	 * @returns {Array<Listener<Parameters<AllEvents[keyof AllEvents]>>>}
	 */
	#getOrEmpty(event) {
		return this.#handlers.get(event) ?? [];
	}
	/**
	 * @param {keyof AllEvents} event
	 * @returns {Array<Listener<Parameters<AllEvents[keyof AllEvents]>>>}
	 */
	#getOrCreate(event) {
		let handlers = this.#handlers.get(event);
		if (handlers === undefined) {
			handlers = [];
			this.#handlers.set(event, handlers);
		}

		return handlers;
	}

	/**
	 * @param {keyof AllEvents} event
	 * @param {Listener<Parameters<AllEvents[keyof AllEvents]>>} handler
	 * @returns
	 */
	#newOnce(event, handler) {
		/** @param  {Parameters<AllEvents[keyof AllEvents]>} args */
		const wrapped = (...args) => {
			handler(...args);
			this.#removeHandler(event, wrapped);
		};
		wrapped.original = handler;
		Object.freeze(wrapped);

		return wrapped;
	}

	/**
	 * @param {E} event
	 * @param {Listener<Parameters<AllEvents[E]>>} handler
	 * @template {keyof AllEvents} E
	 */
	#addHandler(event, handler) {
		this.#getOrCreate(event).push(handler);

		// @ts-expect-error the people know what they are doing
		if (this.#emitEventEmitterEvents) this.emit('newListener', event, handler);
	}

	/**
	 * @param {E} event
	 * @param {Listener<Parameters<AllEvents[E]>>} handler
	 * @template {keyof AllEvents} E
	 */
	#prependHandler(event, handler) {
		this.#getOrCreate(event).unshift(handler);

		// @ts-expect-error the people know what they are doing
		if (this.#emitEventEmitterEvents) this.emit('newListener', event, handler);
	}

	/**
	 * @param {E} event
	 * @param {Listener<Parameters<AllEvents[E]>>} handler
	 * @template {keyof AllEvents} E
	 */
	#removeHandler(event, handler) {
		const handlers = this.#getOrEmpty(event);
		const index = handlers.indexOf(handler);
		if (index === -1) return;

		handlers.splice(index, 1);

		if (handlers.length < 1) {
			this.#handlers.delete(event);
		} else {
			this.#handlers.set(event, handlers);
		}

		// @ts-expect-error the people know what they are doing
		if (this.#emitEventEmitterEvents) this.emit('removeListener', event, handler);
	}
	// #endregion
}
