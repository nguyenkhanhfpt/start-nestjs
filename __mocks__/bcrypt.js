module.exports = {
  hash: jest.fn(async (password) => `hashed_${password}`),
  compare: jest.fn(async (password, hash) => password === hash.replace('hashed_', '')),
};
