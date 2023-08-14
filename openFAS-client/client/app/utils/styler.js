export const truncate = (input, length = 5) =>
  input.length > length ? `${input.substring(0, length)}...` : input;
