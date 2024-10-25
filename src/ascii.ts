import pc from "picocolors";
function stripColors(str) {
  return str.replace(/\x1b\[[0-9;]*m/g, "");
}
function pcBg(color) {
  switch (color) {
    case "black":
      return pc.bgBlack;
    case "red":
      return pc.bgRed;
    case "green":
      return pc.bgGreen;
    case "yellow":
      return pc.bgYellow;
    case "blue":
      return pc.bgBlue;
    case "magenta":
      return pc.bgMagenta;
    case "cyan":
      return pc.bgCyan;
    case "white":
      return pc.bgWhite;
    default:
      return pc.bgBlack;
  }
}
function pcFg(color) {
  switch (color) {
    case "black":
      return pc.black;
    case "red":
      return pc.red;
    case "green":
      return pc.green;
    case "yellow":
      return pc.yellow;
    case "blue":
      return pc.blue;
    case "magenta":
      return pc.magenta;
    case "cyan":
      return pc.cyan;
    case "white":
      return pc.white;
    default:
      return pc.black;
  }
}

function gradient(from, to) {
  const bg = pcBg(to);
  const fg = pcFg(from);

  return `${bg(fg("█▓▒░"))}`;
}
function doublebox(string) {
  const lines = string.split("\n");

  const maxLength = Math.max(
    ...lines.map((line) => {
      return stripColors(line).length;
    })
  );

  const top = `╔${"═".repeat(maxLength + 2)}╗`;
  const bottom = `╚${"═".repeat(maxLength + 2)}╝`;
  const middle = lines.map((line) => `║ ${line} ║`);
  return [top, ...middle, bottom].join("\n");
}

export function wpwipelogo() {
  const gradientStart = gradient("green", "cyan") + gradient("cyan", "red") + gradient("red", "yellow");
  const gradientEnd = gradient("yellow", "red") + gradient("red", "cyan") + gradient("cyan", "green");
  const lines = [gradientStart + pc.bgYellow(pc.black("        ")) + gradientEnd, gradientStart + pc.bgYellow(pc.black(" WPWipe ")) + gradientEnd, gradientStart + pc.bgYellow(pc.black("        ")) + gradientEnd].join("\n");
  return doublebox(lines);
}
