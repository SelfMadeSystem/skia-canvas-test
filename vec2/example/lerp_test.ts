import { Vec2 } from '../index.ts'

const a = new Vec2(0, 0)
const b = new Vec2(10, 20)

// Test lerp at 0.5 should give (5, 10)
const mid = a.lerp(b, 0.5)
console.log('lerp(0.5):', `(${mid.x}, ${mid.y})`)

// Test moveTowards - move from a towards b by distance 5
const halfway = a.moveTowards(b, 5)
console.log('moveTowards(5):', `(${halfway.x}, ${halfway.y})`)

// Cleanup
a.free()
b.free()
mid.free()
halfway.free()
