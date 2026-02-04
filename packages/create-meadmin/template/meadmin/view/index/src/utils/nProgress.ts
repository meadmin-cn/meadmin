import nProgress from 'nprogress';
import 'nprogress/nprogress.css';

let number = 0;
export const done = (n = 1) => {
  number -= n;
  if (number <= 0) {
    if (!import.meta.env.SSR) {
      nProgress.done();
    }
    number = 0;
  } else {
    if (!import.meta.env.SSR) {
      nProgress.set(number / (number + n));
    }
  }
};

export const forceDone = () => {
  number = 0;
  if (!import.meta.env.SSR) {
    nProgress.done();
  }
};

export const start = (n = 1) => {
  if (!import.meta.env.SSR) {
    if (number <= 0) {
      nProgress.start();
      number = n;
    } else {
      number += n;
    }
  }
};

export const set = (n: number) => {
  if (n > 0 && !import.meta.env.SSR) {
    if (number <= 0) {
      start(number);
    } else {
      nProgress.set(n);
    }
  }
};

export const remove = () => {
  number = 0;
  if (!import.meta.env.SSR) {
    nProgress.remove();
  }
};
