type Vec2Symbols = typeof import('./bun.ts')['symbols'];
type Vec2Handle = ReturnType<Vec2Symbols['vec2_new']>;

const symbols: Vec2Symbols | null =
    typeof Bun !== 'undefined' ? (await import('./bun.ts')).symbols : null;

const vec2Finalizer =
    typeof FinalizationRegistry !== 'undefined' && symbols
        ? new FinalizationRegistry<Vec2Handle>((handle) => {
            symbols.vec2_free(handle);
        })
        : null;

function requireSymbols(): Vec2Symbols {
    if (!symbols) {
        throw new Error('Vec2 requires Bun at runtime.');
    }

    return symbols;
}

export class Vec2 {
    private handle: Vec2Handle;
    private owned = true;
    private finalizerToken = {};

    constructor(x = 0, y = 0) {
        this.handle = requireSymbols().vec2_new(x, y);
        vec2Finalizer?.register(this, this.handle, this.finalizerToken);
    }

    static fromHandle(handle: Vec2Handle, owned = true) {
        const vec = Object.create(Vec2.prototype) as Vec2;
        vec.handle = handle;
        vec.owned = owned;
        vec.finalizerToken = {};
        if (owned) {
            vec2Finalizer?.register(vec, handle, vec.finalizerToken);
        }
        return vec;
    }

    static load() {
        return requireSymbols();
    }

    get x() {
        return requireSymbols().vec2_get_x(this.handle);
    }

    set x(value: number) {
        requireSymbols().vec2_set_x(this.handle, value);
    }

    get y() {
        return requireSymbols().vec2_get_y(this.handle);
    }

    set y(value: number) {
        requireSymbols().vec2_set_y(this.handle, value);
    }

    free() {
        if (!this.owned) {
            return;
        }

        requireSymbols().vec2_free(this.handle);
        vec2Finalizer?.unregister(this.finalizerToken);
        this.owned = false;
    }

    clone() {
        return Vec2.fromHandle(requireSymbols().vec2_new(this.x, this.y));
    }

    add(other: Vec2) {
        return Vec2.fromHandle(requireSymbols().vec2_add(this.handle, other.handle));
    }

    sub(other: Vec2) {
        return Vec2.fromHandle(requireSymbols().vec2_sub(this.handle, other.handle));
    }

    mul(other: Vec2) {
        return Vec2.fromHandle(requireSymbols().vec2_mul(this.handle, other.handle));
    }

    div(other: Vec2) {
        return Vec2.fromHandle(requireSymbols().vec2_div(this.handle, other.handle));
    }

    rem(other: Vec2) {
        return Vec2.fromHandle(requireSymbols().vec2_rem(this.handle, other.handle));
    }

    min(other: Vec2) {
        return Vec2.fromHandle(requireSymbols().vec2_min(this.handle, other.handle));
    }

    max(other: Vec2) {
        return Vec2.fromHandle(requireSymbols().vec2_max(this.handle, other.handle));
    }

    projectOnto(other: Vec2) {
        return Vec2.fromHandle(requireSymbols().vec2_project_onto(this.handle, other.handle));
    }

    projectOntoNormalized(other: Vec2) {
        return Vec2.fromHandle(requireSymbols().vec2_project_onto_normalized(this.handle, other.handle));
    }

    rejectFrom(other: Vec2) {
        return Vec2.fromHandle(requireSymbols().vec2_reject_from(this.handle, other.handle));
    }

    rejectFromNormalized(other: Vec2) {
        return Vec2.fromHandle(requireSymbols().vec2_reject_from_normalized(this.handle, other.handle));
    }

    dot(other: Vec2) {
        return requireSymbols().vec2_dot(this.handle, other.handle);
    }

    distance(other: Vec2) {
        return requireSymbols().vec2_distance(this.handle, other.handle);
    }

    distanceSquared(other: Vec2) {
        return requireSymbols().vec2_distance_squared(this.handle, other.handle);
    }

    length() {
        return requireSymbols().vec2_length(this.handle);
    }

    lengthSquared() {
        return requireSymbols().vec2_length_squared(this.handle);
    }

    normalize() {
        return Vec2.fromHandle(requireSymbols().vec2_normalize(this.handle));
    }

    perp() {
        return Vec2.fromHandle(requireSymbols().vec2_perp(this.handle));
    }

    abs() {
        return Vec2.fromHandle(requireSymbols().vec2_abs(this.handle));
    }

    toString() {
        return `Vec2(${this.x}, ${this.y})`;
    }
}

export function loadVec2Bindings() {
    return requireSymbols();
}

