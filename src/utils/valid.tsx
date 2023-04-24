import { Dispatch, SetStateAction } from "react";
import { request } from "./network";

/**
 *
 * @param s
 * @returns if the string s only contains 1-9, a-z, A-Z, _
 */
export const isValid = (s: string, isStrict: boolean): boolean => {
  if (isStrict) {
    return /^[0-9a-zA-Z_]{1,}$/.test(s);
  }
  return /^[0-9a-zA-Z_\'\-\$\*\(\)\^\%\=]{1,}$/.test(s);
};

/**
 *
 * @param time
 * @returns the yyyy-mm-dd hh:mm:ss of the timestamp
 */
export const transTime = (time: number): string => {
  return `${new Date(time).getFullYear()}-${new Date(time).getMonth() + 1}-${new Date(
    time
  ).getDate()} ${new Date(time).getHours() < 10 ? "0" + new Date(time).getHours() : new Date(time).getHours()
    }:${new Date(time).getMinutes() < 10
      ? "0" + new Date(time).getMinutes()
      : new Date(time).getMinutes()
    }:${new Date(time).getSeconds() < 10
      ? "0" + new Date(time).getSeconds()
      : new Date(time).getSeconds()
    }`;
};

/**
 *
 * @param arr
 * @param ele
 * @returns if ele in arr
 */
export const isIn = (arr: any[], ele: any): boolean => {
  for (let i = 0; i < arr.length; i++) {
    if (i === arr[i]) {
      return true;
    }
  }
  return false;
};

/**
 *
 * @brief translate the url to url
 * @param taskid
 */

export const translateUrl = (url: string): string => {
  request("/api/file", "GET", {
    responseType: "arraybuffer", // 将响应数据解析为 ArrayBuffer 类型
    params: { url: url },
  })
    .then((response) => {
      const blob = new Blob([response.data], { type: "image/jpeg" });
      const url = URL.createObjectURL(blob);
      return url
    })
    .catch((error) => {
      console.error(error);
    });
  return url
}
