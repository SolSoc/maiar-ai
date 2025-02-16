[@maiar-ai/core](../index.md) / MemoryService

# Class: MemoryService

Defined in: [packages/core/src/memory/service.ts:16](https://github.com/UraniumCorporation/maiar-ai/blob/main/packages/core/src/memory/service.ts#L16)

Service for managing memory operations

## Constructors

### new MemoryService()

> **new MemoryService**(`provider`): [`MemoryService`](MemoryService.md)

Defined in: [packages/core/src/memory/service.ts:19](https://github.com/UraniumCorporation/maiar-ai/blob/main/packages/core/src/memory/service.ts#L19)

#### Parameters

##### provider

[`MemoryProvider`](../interfaces/MemoryProvider.md)

#### Returns

[`MemoryService`](MemoryService.md)

## Methods

### storeUserInteraction()

> **storeUserInteraction**(`user`, `platform`, `message`, `timestamp`, `messageId`?): `Promise`\<`void`\>

Defined in: [packages/core/src/memory/service.ts:40](https://github.com/UraniumCorporation/maiar-ai/blob/main/packages/core/src/memory/service.ts#L40)

Store a user interaction in memory

#### Parameters

##### user

`string`

##### platform

`string`

##### message

`string`

##### timestamp

`number`

##### messageId?

`string`

#### Returns

`Promise`\<`void`\>

***

### storeAssistantInteraction()

> **storeAssistantInteraction**(`user`, `platform`, `response`, `contextChain`): `Promise`\<`void`\>

Defined in: [packages/core/src/memory/service.ts:100](https://github.com/UraniumCorporation/maiar-ai/blob/main/packages/core/src/memory/service.ts#L100)

Store an assistant interaction and its context in memory

#### Parameters

##### user

`string`

##### platform

`string`

##### response

`string`

##### contextChain

[`BaseContextItem`](../interfaces/BaseContextItem.md)[]

#### Returns

`Promise`\<`void`\>

***

### storeMessage()

> **storeMessage**(`message`, `conversationId`): `Promise`\<`void`\>

Defined in: [packages/core/src/memory/service.ts:188](https://github.com/UraniumCorporation/maiar-ai/blob/main/packages/core/src/memory/service.ts#L188)

#### Parameters

##### message

[`Message`](../interfaces/Message.md)

##### conversationId

`string`

#### Returns

`Promise`\<`void`\>

***

### storeContext()

> **storeContext**(`context`, `conversationId`): `Promise`\<`void`\>

Defined in: [packages/core/src/memory/service.ts:197](https://github.com/UraniumCorporation/maiar-ai/blob/main/packages/core/src/memory/service.ts#L197)

#### Parameters

##### context

[`Context`](../interfaces/Context.md)

##### conversationId

`string`

#### Returns

`Promise`\<`void`\>

***

### getMessages()

> **getMessages**(`options`): `Promise`\<[`Message`](../interfaces/Message.md)[]\>

Defined in: [packages/core/src/memory/service.ts:206](https://github.com/UraniumCorporation/maiar-ai/blob/main/packages/core/src/memory/service.ts#L206)

#### Parameters

##### options

[`MemoryQueryOptions`](../interfaces/MemoryQueryOptions.md)

#### Returns

`Promise`\<[`Message`](../interfaces/Message.md)[]\>

***

### getContexts()

> **getContexts**(`conversationId`): `Promise`\<[`Context`](../interfaces/Context.md)[]\>

Defined in: [packages/core/src/memory/service.ts:214](https://github.com/UraniumCorporation/maiar-ai/blob/main/packages/core/src/memory/service.ts#L214)

#### Parameters

##### conversationId

`string`

#### Returns

`Promise`\<[`Context`](../interfaces/Context.md)[]\>

***

### getConversation()

> **getConversation**(`conversationId`): `Promise`\<[`Conversation`](../interfaces/Conversation.md)\>

Defined in: [packages/core/src/memory/service.ts:222](https://github.com/UraniumCorporation/maiar-ai/blob/main/packages/core/src/memory/service.ts#L222)

#### Parameters

##### conversationId

`string`

#### Returns

`Promise`\<[`Conversation`](../interfaces/Conversation.md)\>

***

### createConversation()

> **createConversation**(`options`?): `Promise`\<`string`\>

Defined in: [packages/core/src/memory/service.ts:230](https://github.com/UraniumCorporation/maiar-ai/blob/main/packages/core/src/memory/service.ts#L230)

#### Parameters

##### options?

###### id

`string`

###### metadata

`Record`\<`string`, `any`\>

eslint-disable-next-line @typescript-eslint/no-explicit-any

#### Returns

`Promise`\<`string`\>

***

### deleteConversation()

> **deleteConversation**(`conversationId`): `Promise`\<`void`\>

Defined in: [packages/core/src/memory/service.ts:242](https://github.com/UraniumCorporation/maiar-ai/blob/main/packages/core/src/memory/service.ts#L242)

#### Parameters

##### conversationId

`string`

#### Returns

`Promise`\<`void`\>

***

### getOrCreateConversation()

> **getOrCreateConversation**(`user`, `platform`): `Promise`\<`string`\>

Defined in: [packages/core/src/memory/service.ts:249](https://github.com/UraniumCorporation/maiar-ai/blob/main/packages/core/src/memory/service.ts#L249)

Get or create a conversation for a user on a platform

#### Parameters

##### user

`string`

##### platform

`string`

#### Returns

`Promise`\<`string`\>

***

### getRecentConversationHistory()

> **getRecentConversationHistory**(`user`, `platform`, `limit`): `Promise`\<`object`[]\>

Defined in: [packages/core/src/memory/service.ts:267](https://github.com/UraniumCorporation/maiar-ai/blob/main/packages/core/src/memory/service.ts#L267)

Get recent conversation history for a user/platform

#### Parameters

##### user

`string`

##### platform

`string`

##### limit

`number` = `100`

#### Returns

`Promise`\<`object`[]\>
