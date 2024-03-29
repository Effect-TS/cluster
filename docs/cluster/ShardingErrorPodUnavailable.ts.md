---
title: ShardingErrorPodUnavailable.ts
nav_order: 28
parent: "@effect/cluster"
---

## ShardingErrorPodUnavailable overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [constructors](#constructors)
  - [ShardingErrorPodUnavailable](#shardingerrorpodunavailable)
- [models](#models)
  - [ShardingErrorPodUnavailable (interface)](#shardingerrorpodunavailable-interface)
- [schema](#schema)
  - [ShardingErrorPodUnavailableSchema](#shardingerrorpodunavailableschema)
- [symbols](#symbols)
  - [ShardingErrorPodUnavailableTag](#shardingerrorpodunavailabletag)
- [utils](#utils)
  - [isShardingErrorPodUnavailable](#isshardingerrorpodunavailable)

---

# constructors

## ShardingErrorPodUnavailable

**Signature**

```ts
export declare function ShardingErrorPodUnavailable(
  pod: PodAddress.PodAddress
): ShardingErrorPodUnavailable;
```

Added in v1.0.0

# models

## ShardingErrorPodUnavailable (interface)

**Signature**

```ts
export interface ShardingErrorPodUnavailable
  extends Schema.Schema.Type<typeof ShardingErrorPodUnavailableSchema_> {}
```

Added in v1.0.0

# schema

## ShardingErrorPodUnavailableSchema

**Signature**

```ts
export declare const ShardingErrorPodUnavailableSchema: Schema.Schema<
  ShardingErrorPodUnavailable,
  {
    readonly _tag: "./ShardingErrorPodUnavailable";
    readonly pod: PodAddress.PodAddress.From;
  },
  never
>;
```

Added in v1.0.0

# symbols

## ShardingErrorPodUnavailableTag

**Signature**

```ts
export declare const ShardingErrorPodUnavailableTag: "./ShardingErrorPodUnavailable";
```

Added in v1.0.0

# utils

## isShardingErrorPodUnavailable

**Signature**

```ts
export declare function isShardingErrorPodUnavailable(
  value: any
): value is ShardingErrorPodUnavailable;
```

Added in v1.0.0
