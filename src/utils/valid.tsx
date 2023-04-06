export const isValid = (s: string): boolean => {
  return /^[0-9a-zA-Z_]{1,}$/.test(s);
};

export const transTime = (time: number): string => {
  return `${new Date(time).getFullYear()}-${new Date(time).getMonth() + 1}-${new Date(
    time
  ).getDate()} ${
    new Date(time).getHours() < 10 ? "0" + new Date(time).getHours() : new Date(time).getHours()
  }:${
    new Date(time).getMinutes() < 10
      ? "0" + new Date(time).getMinutes()
      : new Date(time).getMinutes()
  }:${
    new Date(time).getSeconds() < 10
      ? "0" + new Date(time).getSeconds()
      : new Date(time).getSeconds()
  }`;
};
