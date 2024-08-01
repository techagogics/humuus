function msecToSec(n: number): number {
  return Math.floor(n / 1000);
}

function size(obj: object) {
  let size = 0;
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) size++;
  }
  return size;
}

function getRandomInt(max: number) {
  return Math.floor(Math.random() * max);
}
