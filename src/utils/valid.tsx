export const isValid = (s: string): boolean => {
    return /^\w+$/.test(s);
}