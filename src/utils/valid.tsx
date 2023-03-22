export const isValid = (s: string): boolean => {
    return /^\w+$/.test(s);
}

export const getCookie = (name: string) => {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.startsWith(name + '=')) {
        return cookie.substring(name.length + 1, cookie.length);
      }
    }
    return null;
};

export const setCookie = (name : string, value : string) => {
    document.cookie = `${name}=${value};path=/`;
};