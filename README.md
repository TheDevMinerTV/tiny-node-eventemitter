# `tiny-node-eventemitter`

[![npm](https://img.shields.io/npm/v/tiny-node-eventemitter?style=for-the-badge)](https://www.npmjs.com/package/tiny-node-eventemitter) [![docs](https://img.shields.io/badge/docs-online-green?style=for-the-badge)](https://thedevminertv.github.io/tiny-node-eventemitter/) ![test status](https://img.shields.io/github/actions/workflow/status/thedevminertv/tiny-node-eventemitter/test.yml?style=for-the-badge) [![license](https://img.shields.io/github/license/thedevminertv/tiny-node-eventemitter?style=for-the-badge)](/LICENSE)

> Tiny (**568b** minified + brotlified!) portable (0 dependencies!) EventEmitter replacement with support for strict event types.

## Usage

You can find the API documentation [here](https://thedevminertv.github.io/tiny-node-eventemitter/).

```ts
import { EventEmitter } from 'tiny-node-eventemitter';

const untypedDemo = new EventEmitter();
untypedDemo.on('foo', (foo) => console.log(foo));
untypedDemo.on('bar', (bar) => console.log(bar));
untypedDemo.on('baz', (foo, bar, baz) => console.log(foo, bar, baz));
untypedDemo.emit('foo', 1);
untypedDemo.emit('bar', 'bar');
untypedDemo.emit('baz', 1, 'bar', new Date());

// You can also extend the EventEmitter class to add your own methods
class ClassDemo extends EventEmitter {
  constructor() {
    super();
  }

  foo() {
    this.emit('foo', 1);
  }

  bar() {
    this.emit('bar', 'bar');
  }

  baz() {
    this.emit('baz', 1, 'bar', new Date());
  }
}

const classDemo = new ClassDemo();
classDemo.on('foo', (foo) => console.log(foo));
classDemo.on('bar', (bar) => console.log(bar));
classDemo.on('baz', (foo, bar, baz) => console.log(foo, bar, baz));
classDemo.foo();
classDemo.bar();
classDemo.baz();
```

There's also built in support for strict event types, as you might know from [`strict-event-emitter-types`](https://npmjs.com/strict-event-emitter-types):

```ts
import { EventEmitter } from 'tiny-node-eventemitter';

// You can also use an interface to define the event types
type TypedEvents = {
  foo(foo: number): void;
  bar(bar: string): void;
  baz(foo: number, bar: string, baz: Date): void;
};

const typedDemo = new EventEmitter<TypedEvents>();
typedDemo.on('foo', (foo) => console.log(foo));
typedDemo.on('bar', (bar) => console.log(bar));
typedDemo.on('baz', (foo, bar, baz) => console.log(foo, bar, baz));
typedDemo.emit('foo', 1);
typedDemo.emit('bar', 'bar');
typedDemo.emit('baz', 1, 'bar', new Date());

/*
 * In case you're using JSDoc, you can also use the following syntax:
 */
/**
 * @type {EventEmitter<{ foo: (foo: number) => void, bar: (bar: string) => void, baz: (foo: number, bar: string, baz: Date) => void }>}
 */
const typedJSDocDemo = new EventEmitter();

// Or you can extend the EventEmitter class with a generic
class TypedClassDemo extends EventEmitter<TypedEvents> {
  constructor() {
    super();
  }

  foo() {
    this.emit('foo', 1);
  }

  bar() {
    this.emit('bar', 'bar');
  }

  baz() {
    this.emit('baz', 1, 'bar', new Date());
  }
}

const typedClassDemo = new TypedClassDemo();
typedClassDemo.on('foo', (foo) => console.log(foo));
typedClassDemo.on('bar', (bar) => console.log(bar));
typedClassDemo.on('baz', (foo, bar, baz) => console.log(foo, bar, baz));
typedClassDemo.foo();
typedClassDemo.bar();
typedClassDemo.baz();
```

## License

This project is licensed under the MIT License. See the included [LICENSE](/LICENSE) file for details.
