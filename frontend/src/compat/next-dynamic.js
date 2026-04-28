"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true,
});
exports["default"] = dynamic;
function _interopRequireDefault(obj) {
  return obj && obj.__esModule
    ? obj
    : {
        default: obj,
      };
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
function normalizeModule(mod) {
  if (typeof mod === "object" && mod !== null && "default" in mod) {
    return mod;
  }
  return {
    default: mod,
  };
}
function dynamic(loader) {
  var _this = this;
  var options =
    arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
  var LazyComponent = /*#__PURE__*/ _react2["default"].lazy(
    function callee$1$0() {
      return regeneratorRuntime.async(
        function callee$1$0$(context$2$0) {
          while (1)
            switch ((context$2$0.prev = context$2$0.next)) {
              case 0:
                context$2$0.next = 2;
                return regeneratorRuntime.awrap(loader());
              case 2:
                context$2$0.t0 = context$2$0.sent;
                return context$2$0.abrupt(
                  "return",
                  normalizeModule(context$2$0.t0),
                );
              case 4:
              case "end":
                return context$2$0.stop();
            }
        },
        null,
        _this,
      );
    },
  );
  var LoadingComponent = options.loading;
  var DynamicComponent = /*#__PURE__*/ _react2["default"].forwardRef(
    function (props, ref) {
      return /*#__PURE__*/ _react2["default"].createElement(
        _react.Suspense,
        {
          fallback: LoadingComponent
            ? /*#__PURE__*/ _react2["default"].createElement(
                LoadingComponent,
                null,
              )
            : null,
        },
        /*#__PURE__*/ _react2["default"].createElement(
          LazyComponent,
          _extends({}, props, {
            ref: ref,
          }),
        ),
      );
    },
  );
  DynamicComponent.displayName = "DynamicComponent";
  return DynamicComponent;
}
module.exports = exports["default"];
