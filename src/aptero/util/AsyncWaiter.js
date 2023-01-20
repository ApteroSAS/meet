export async function wait(validator, poolingIntervalMs = 200) {
  return new Promise((resolve) => {
    if (validator()) {
      resolve();
    } else {
      setTimeout(async () => {
        if (!validator()) {
          await wait(validator);
          resolve();
        } else {
          resolve();
        }
      }, poolingIntervalMs);
    }
  });
}
