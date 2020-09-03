import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Helpers | context-consumer', function (hooks) {
  setupRenderingTest(hooks);

  test('consumer pulls value from provider by key', async function (assert) {
    this.set('value', '1');

    await render(hbs`
      <ContextProvider @key="key" @value={{value}}>
        {{context-consumer "key"}}
      </ContextProvider>
    `);

    assert.dom().hasText('1', 'Consumer retrieved the value from the Provider');

    this.set('value', '2');
    await settled();

    assert.dom().hasText('2', 'Consumer emits new value when Provider is updated');
  });

  test('can nest unrelated providers', async function (assert) {
    this.set('value1', 'a');
    this.set('value2', 'b');

    await render(hbs`
      <ContextProvider @key="key-1" @value={{value1}}>
        <ContextProvider @key="key-2" @value={{value2}}>
          <div data-test-value-1>
            {{context-consumer "key-1"}}
          </div>
          <div data-test-value-2>
            {{context-consumer "key-2"}}
          </div>
        </ContextProvider>
      </ContextProvider>
    `);

    assert.dom('[data-test-value-1]').hasText('a');
    assert.dom('[data-test-value-2]').hasText('b');

    this.set('value1', 'c');
    this.set('value2', 'd');
    await settled();

    assert.dom('[data-test-value-1]').hasText('c');
    assert.dom('[data-test-value-2]').hasText('d');
  });

  test('can handle adjacent instances of a provider with the same key', async function (assert) {
    this.set('first', 'a');
    this.set('second', 'b');

    await render(hbs`
      <ContextProvider @key="key" @value={{first}}>
        <div data-test-first>
          {{context-consumer "key"}}
        </div>
      </ContextProvider>

      <ContextProvider @key="key" @value={{second}}>
        <div data-test-second>
          {{context-consumer "key"}}
        </div>
      </ContextProvider>
    `);

    assert.dom('[data-test-first]').hasText('a');
    assert.dom('[data-test-second]').hasText('b');

    this.set('first', 'c');
    await settled();

    assert.dom('[data-test-first]').hasText('c', 'First instance reads new value');
    assert.dom('[data-test-second]').hasText('b', 'Second instance still reads original value');
  });
});
