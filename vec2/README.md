# vec2 — Bun FFI Bindings for glam::Vec2

A Rust library exposing `glam::Vec2` to Bun via FFI with **auto-generated TypeScript bindings from a single source of truth**.

## Architecture

- **Single Source of Truth**: FFI exports defined only in [src/lib.rs](src/lib.rs) via macros
- **Auto-generation**: [build.rs](build.rs) parses the macros and generates [index.ts](index.ts) on every build
- **Zero Duplication**: TypeScript bindings always match Rust exports exactly

## Adding New Exports

Add a single line in [src/lib.rs](src/lib.rs) using one of the provided macros:

```rust
// Getters (pointer -> f32)
getter!(vec2_get_x, x);
getter!(vec2_get_y, y);

// Setters (pointer, f32 -> void)
setter!(vec2_set_x, x);
setter!(vec2_set_y, y);

// Binary ops (pointer, pointer -> pointer)
binary_op!(vec2_add, +);
binary_op!(vec2_sub, -);

// Scalar binary ops (pointer, pointer -> f32)
scalar_binary_op!(vec2_dot, dot);

// Unary ops (pointer -> pointer)
unary_op!(vec2_normalize, normalize);

// Scalar unary ops (pointer -> f32)
scalar_unary_op!(vec2_length, length);
```

Then run `cargo build --release` — that's all. [index.ts](index.ts) auto-updates.

## Building

```bash
cargo build --release
```

This:
1. Compiles Rust → `target/release/libvec2.so`
2. Parses macros from [src/lib.rs](src/lib.rs)
3. Generates [index.ts](index.ts)

## Usage

```typescript
import { Vec2 } from './index.ts'

const a = new Vec2(1.0, 2.0)
const b = new Vec2(3.0, 4.0)
const c = a.add(b)

console.log(c.x)        // 4
console.log(c.y)        // 6
console.log(a.dot(b))   // 11

a.free()
b.free()
c.free()
```

## Running the example

```bash
cargo build --release
bun run example/bun_example.mjs
```

Expected output:
```
c.x = 4
c.y = 6
dot(a, b) = 11
```
