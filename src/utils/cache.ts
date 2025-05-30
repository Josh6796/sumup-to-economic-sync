type CacheKey = string;

export class MemoryCache<T> {
    private cache: Map<CacheKey, T> = new Map();

    set(key: CacheKey, value: T) {
        this.cache.set(key, value);
    }

    get(key: CacheKey): T | undefined {
        return this.cache.get(key);
    }

    has(key: CacheKey): boolean {
        return this.cache.has(key);
    }

    clear() {
        this.cache.clear();
    }
}
