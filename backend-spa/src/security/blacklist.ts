const blacklist = new Set<string>()

export const addToBlacklist = (jti: string): void => {
    blacklist.add(jti)
}

export const isBlacklisted = (jti: string): boolean => {
    return blacklist.has(jti)
}
