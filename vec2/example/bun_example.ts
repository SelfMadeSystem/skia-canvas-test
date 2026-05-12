import { Vec2 } from '../index.ts'

const a = new Vec2(1.0, 2.0)
const b = new Vec2(3.0, 4.0)
const c = a.add(b)

console.log('c.x =', c.x)
console.log('c.y =', c.y)
console.log('dot(a, b) =', a.dot(b))

a.free()
b.free()
c.free()
