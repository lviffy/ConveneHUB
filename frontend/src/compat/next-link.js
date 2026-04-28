"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true,
});
function _interopRequireDefault(obj) {
  return obj && obj.__esModule
    ? obj
    : {
        default: obj,
      };
}
function _objectWithoutProperties(obj, keys) {
  var target = {};
  for (var i in obj) {
    if (keys.indexOf(i) >= 0) continue;
    if (!Object.prototype.hasOwnProperty.call(obj, i)) continue;
    target[i] = obj[i];
  }
  return target;
}
var _react = require("react");
var _react2 = _interopRequireDefault(_react);
var _reactRouterDom = require("react-router-dom");
function _extends() {
  return (
    (_extends = Object.assign
      ? Object.assign.bind()
      : function (n) {
          for (var e = 1; e < arguments.length; e++) {
            var t = arguments[e];
            for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);
          }
          return n;
        }),
    _extends.apply(null, arguments)
  );
}
var Link = /*#__PURE__*/ _react2["default"].forwardRef(function (_ref, ref) {
  var href = _ref.href;
  var children = _ref.children;
  var _prefetch = _ref.prefetch;
  var _scroll = _ref.scroll;
  var props = _objectWithoutProperties(_ref, [
    "href",
    "children",
    "prefetch",
    "scroll",
  ]);
  return /*#__PURE__*/ _react2["default"].createElement(
    _reactRouterDom.Link,
    _extends(
      {
        ref: ref,
        to: href,
      },
      props,
    ),
    children,
  );
});
Link.displayName = "Link";
exports["default"] = Link;
module.exports = exports["default"];
