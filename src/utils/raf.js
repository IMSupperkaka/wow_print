let raf = (callback) => +setTimeout(callback, 16);
let caf = (num) => clearTimeout(num);

// if (typeof window !== 'undefined' && 'requestAnimationFrame' in window) {
//   raf = (callback) =>
//     window.requestAnimationFrame(callback);
//   caf = (handle) => {
//     window.cancelAnimationFrame(handle)
//   };
// }

export default function wrapperRaf(callback) {
  return raf(callback);
}

wrapperRaf.cancel = caf;
