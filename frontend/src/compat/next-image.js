"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true,
});
var _extends2 =
  Object.assign ||
  function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
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
var Image = /*#__PURE__*/ _react2["default"].forwardRef(function (_ref, ref) {
  var src = _ref.src;
  var alt = _ref.alt;
  var _ref$fill = _ref.fill;
  var fill = _ref$fill === undefined ? false : _ref$fill;
  var _ref$priority = _ref.priority;
  var priority = _ref$priority === undefined ? false : _ref$priority;
  var _quality = _ref.quality;
  var _placeholder = _ref.placeholder;
  var _blurDataURL = _ref.blurDataURL;
  var _unoptimized = _ref.unoptimized;
  var style = _ref.style;
  var width = _ref.width;
  var height = _ref.height;
  var loading = _ref.loading;
  var props = _objectWithoutProperties(_ref, [
    "src",
    "alt",
    "fill",
    "priority",
    "quality",
    "placeholder",
    "blurDataURL",
    "unoptimized",
    "style",
    "width",
    "height",
    "loading",
  ]);
  var resolvedSrc = typeof src === "string" ? src : src.src;
  var fillStyle = fill
    ? {
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
      }
    : {};
  return /*#__PURE__*/ _react2["default"].createElement(
    "img",
    _extends(
      {
        ref: ref,
        src: resolvedSrc,
        alt: alt,
        width: fill ? undefined : width,
        height: fill ? undefined : height,
        loading: priority ? "eager" : loading,
        style: _extends2({}, fillStyle, style),
      },
      props,
    ),
  );
});
Image.displayName = "Image";
exports["default"] = Image;
module.exports = exports["default"];
