/* eslint-disable no-bitwise */

// Generates an RFC4122 compliant universally unique identifier.
// https://stackoverflow.com/a/2117523/385273

function replacer(c) {
  const r = Math.random() * 16 | 0;
  const v = c === 'x' ? r : ((r & 0x3) | 0x8);
  return v.toString(16);
}

module.exports = function generateId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, replacer);
};
