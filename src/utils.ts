export function line(length: number = 0) {
  console.log(Array(length).fill("-").join(""));
}
export function center(text: string, length: number = 0) {
  const left = Math.round((length - text.length) / 2);
  console.log(
    Array(left > 0 ? left : 0)
      .fill(" ")
      .join("") + text
  );
}
export function spacebetween(text1: string, text2: string, length: number = 0) {
  const totalLength = text1.length + text2.length;
  const space = length - totalLength;
  if (space < 1) return console.log(text1 + " " + text2);
  console.log(text1 + Array(space).fill(" ").join("") + text2);
}

export function timer() {
  const startTime = Number(new Date());
  return () => {
    const endTime = Number(new Date());
    const timeDiff = endTime - startTime; //in ms
    return timeDiff;
  };
}
