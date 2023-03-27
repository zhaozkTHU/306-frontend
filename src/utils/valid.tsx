export const isValid = (s: string): boolean => {
    return /^\w+$/.test(s);
}

export const transTime = (time: number): string => {
    return `${new Date(time*=1000).getFullYear()}-${new Date(time).getMonth()+1}-${new Date(time).getDate()} ${
        new Date(time).getHours()<10?"0"+new Date(time).getHours():new Date(time).getHours()
    }:${new Date(time).getMinutes()<10?"0"+new Date(time).getMinutes():new Date(time).getMinutes()
    }:${new Date(time).getSeconds()<10?"0"+new Date(time).getSeconds():new Date(time).getSeconds()}`
}

