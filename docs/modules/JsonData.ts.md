---
title: JsonData.ts
nav_order: 6
parent: Modules
---

## JsonData overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [JsonArray (type alias)](#jsonarray-type-alias)
  - [JsonData (type alias)](#jsondata-type-alias)
  - [JsonObject (type alias)](#jsonobject-type-alias)

---

# utils

## JsonArray (type alias)

**Signature**

```ts
export type JsonArray = ReadonlyArray<JsonData>
```

Added in v1.0.0

## JsonData (type alias)

**Signature**

```ts
export type JsonData = null | boolean | number | string | JsonArray | JsonObject
```

Added in v1.0.0

## JsonObject (type alias)

**Signature**

```ts
export type JsonObject = { readonly [key: string]: JsonData }
```

Added in v1.0.0
