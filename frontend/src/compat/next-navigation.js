"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true,
});
var _slicedToArray = (function () {
  function sliceIterator(arr, i) {
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;
    try {
      for (
        var _i = arr[Symbol.iterator](), _s;
        !(_n = (_s = _i.next()).done);
        _n = true
      ) {
        _arr.push(_s.value);
        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"]) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }
    return _arr;
  }
  return function (arr, i) {
    if (Array.isArray(arr)) {
      return arr;
    } else if (Symbol.iterator in Object(arr)) {
      return sliceIterator(arr, i);
    } else {
      throw new TypeError(
        "Invalid attempt to destructure non-iterable instance",
      );
    }
  };
})();
exports.useRouter = useRouter;
exports.useSearchParams = useSearchParams;
exports.usePathname = usePathname;
exports.redirect = redirect;
exports.notFound = notFound;
exports.useParams = useParams;
exports.useSelectedLayoutSegment = useSelectedLayoutSegment;
exports.useSelectedLayoutSegments = useSelectedLayoutSegments;
exports.useServerInsertedHTML = useServerInsertedHTML;
var _react = require("react");
var _reactRouterDom = require("react-router-dom");
function navigateWithBrowserFallback(path) {
  var replace =
    arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];
  if (typeof window === "undefined") {
    return;
  }
  if (replace) {
    window.location.replace(path);
    return;
  }
  window.location.assign(path);
}
function useRouter() {
  var _this = this;
  var navigate = (0, _reactRouterDom.useNavigate)();
  return (0, _react.useMemo)(
    function () {
      return {
        push: function push(href, _options) {
          return navigate(href);
        },
        replace: function replace(href, _options) {
          return navigate(href, {
            replace: true,
          });
        },
        back: function back() {
          return navigate(-1);
        },
        refresh: function refresh() {
          if (typeof window !== "undefined") {
            window.location.reload();
          }
        },
        prefetch: function prefetch(_href) {
          return regeneratorRuntime.async(
            function prefetch$(context$3$0) {
              while (1)
                switch ((context$3$0.prev = context$3$0.next)) {
                  case 0:
                  case "end":
                    return context$3$0.stop();
                }
            },
            null,
            _this,
          );
        },
      };
    },
    [navigate],
  );
}
function useSearchParams() {
  var _useReactRouterSearchParams = (0, _reactRouterDom.useSearchParams)();
  var _useReactRouterSearchParams2 = _slicedToArray(
    _useReactRouterSearchParams,
    1,
  );
  var searchParams = _useReactRouterSearchParams2[0];
  return searchParams;
}
function usePathname() {
  var location = (0, _reactRouterDom.useLocation)();
  return location.pathname;
}
function redirect(path) {
  navigateWithBrowserFallback(path, true);
}
function notFound() {
  navigateWithBrowserFallback("/404", true);
}
function useParams() {
  throw new Error("Use react-router-dom useParams directly in the Vite app.");
}
function useSelectedLayoutSegment() {
  return null;
}
function useSelectedLayoutSegments() {
  return [];
}
function useServerInsertedHTML(callback) {
  (0, _react.useCallback)(callback, [callback]);
}
