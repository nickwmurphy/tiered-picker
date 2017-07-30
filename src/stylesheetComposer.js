// CSS modules a map of style classes keyed to their hashed name, e.g.
// { "foo" : "foo_4b" }
//
// To extend these classes, simply add a new hashed name separated by a space:
// { "foo": "foo_4b foo_7u" }
//
// This util takes a set of base styles and an array of extension maps to
// apply these extensions to the base, then return it.

/* eslint-disable func-names */
/* eslint-disable prefer-arrow-callback */
/* eslint-disable no-param-reassign */

module.exports = function composer(base, extensions) {
  const initialValue = Object.assign({}, base);

  return extensions.reduce(function (result, baseStyle) {
    return Object.keys(baseStyle).reduce(function (subResult, k) {
      if (subResult[k] && baseStyle[k]) {
        subResult[k] = subResult[k].split(' ').concat(baseStyle[k].split(' ')).join(' ');
      }

      return subResult;
    }, result);
  }, initialValue);
};
