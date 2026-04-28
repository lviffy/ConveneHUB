"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true,
});
exports["default"] = App;
function _interopRequireDefault(obj) {
  return obj && obj.__esModule
    ? obj
    : {
        default: obj,
      };
}
var _reactRouterDom = require("react-router-dom");
var _appClientLayout = require("@/app/client-layout");
var _appClientLayout2 = _interopRequireDefault(_appClientLayout);
var _appPage = require("@/app/page");
var _appPage2 = _interopRequireDefault(_appPage);
var _appEventsPage = require("@/app/events/page");
var _appEventsPage2 = _interopRequireDefault(_appEventsPage);
var _appLoginPage = require("@/app/login/page");
var _appLoginPage2 = _interopRequireDefault(_appLoginPage);
var _appBookingsPage = require("@/app/bookings/page");
var _appBookingsPage2 = _interopRequireDefault(_appBookingsPage);
var _appCompleteProfilePage = require("@/app/complete-profile/page");
var _appCompleteProfilePage2 = _interopRequireDefault(_appCompleteProfilePage);
var _appContactPage = require("@/app/contact/page");
var _appContactPage2 = _interopRequireDefault(_appContactPage);
var _appForgotPasswordPage = require("@/app/forgot-password/page");
var _appForgotPasswordPage2 = _interopRequireDefault(_appForgotPasswordPage);
var _appResetPasswordPage = require("@/app/reset-password/page");
var _appResetPasswordPage2 = _interopRequireDefault(_appResetPasswordPage);
var _appOrganizerLoginPage = require("@/app/organizer-login/page");
var _appOrganizerLoginPage2 = _interopRequireDefault(_appOrganizerLoginPage);
var _appOrganizerForgotPasswordPage = require("@/app/organizer-forgot-password/page");
var _appOrganizerForgotPasswordPage2 = _interopRequireDefault(
  _appOrganizerForgotPasswordPage,
);
var _appAdminUsersPage = require("@/app/admin/users/page");
var _appAdminUsersPage2 = _interopRequireDefault(_appAdminUsersPage);
var _appAdminEventsEditPage = require("@/app/admin/events/edit/page");
var _appAdminEventsEditPage2 = _interopRequireDefault(_appAdminEventsEditPage);
var _appAuthCallbackPage = require("@/app/auth/callback/page");
var _appAuthCallbackPage2 = _interopRequireDefault(_appAuthCallbackPage);
var _appAuthErrorPage = require("@/app/auth/error/page");
var _appAuthErrorPage2 = _interopRequireDefault(_appAuthErrorPage);
var _appPrivacyPage = require("@/app/privacy/page");
var _appPrivacyPage2 = _interopRequireDefault(_appPrivacyPage);
var _appRefundPage = require("@/app/refund/page");
var _appRefundPage2 = _interopRequireDefault(_appRefundPage);
var _appTermsPage = require("@/app/terms/page");
var _appTermsPage2 = _interopRequireDefault(_appTermsPage);
var _appNotFound = require("@/app/not-found");
var _appNotFound2 = _interopRequireDefault(_appNotFound);
var _componentsEventsEventBookingPage = require("@/components/events/event-booking-page");
var _componentsEventsEventBookingPage2 = _interopRequireDefault(
  _componentsEventsEventBookingPage,
);
var _srcPagesAdminPage = require("@/src/pages/admin-page");
var _srcPagesAdminPage2 = _interopRequireDefault(_srcPagesAdminPage);
var _srcPagesOrganizerTeamPage = require("@/src/pages/organizer-team-page");
var _srcPagesOrganizerTeamPage2 = _interopRequireDefault(
  _srcPagesOrganizerTeamPage,
);
var _srcPagesPromoterPage = require("@/src/pages/promoter-page");
var _srcPagesPromoterPage2 = _interopRequireDefault(_srcPagesPromoterPage);
var _componentsUiToaster = require("@/components/ui/toaster");
function EventDetailsRoute() {
  var _useParams = (0, _reactRouterDom.useParams)();
  var id = _useParams.id;
  if (!id) {
    return /*#__PURE__*/ React.createElement(_appNotFound2["default"], null);
  }
  return /*#__PURE__*/ React.createElement(
    _componentsEventsEventBookingPage2["default"],
    {
      eventId: id,
    },
  );
}
function App() {
  return /*#__PURE__*/ React.createElement(
    _appClientLayout2["default"],
    null,
    /*#__PURE__*/ React.createElement(
      _reactRouterDom.Routes,
      null,
      /*#__PURE__*/ React.createElement(_reactRouterDom.Route, {
        path: "/",
        element: /*#__PURE__*/ React.createElement(_appPage2["default"], null),
      }),
      /*#__PURE__*/ React.createElement(_reactRouterDom.Route, {
        path: "/events",
        element: /*#__PURE__*/ React.createElement(
          _appEventsPage2["default"],
          null,
        ),
      }),
      /*#__PURE__*/ React.createElement(_reactRouterDom.Route, {
        path: "/events/:id",
        element: /*#__PURE__*/ React.createElement(EventDetailsRoute, null),
      }),
      /*#__PURE__*/ React.createElement(_reactRouterDom.Route, {
        path: "/login",
        element: /*#__PURE__*/ React.createElement(
          _appLoginPage2["default"],
          null,
        ),
      }),
      /*#__PURE__*/ React.createElement(_reactRouterDom.Route, {
        path: "/bookings",
        element: /*#__PURE__*/ React.createElement(
          _appBookingsPage2["default"],
          null,
        ),
      }),
      /*#__PURE__*/ React.createElement(_reactRouterDom.Route, {
        path: "/complete-profile",
        element: /*#__PURE__*/ React.createElement(
          _appCompleteProfilePage2["default"],
          null,
        ),
      }),
      /*#__PURE__*/ React.createElement(_reactRouterDom.Route, {
        path: "/forgot-password",
        element: /*#__PURE__*/ React.createElement(
          _appForgotPasswordPage2["default"],
          null,
        ),
      }),
      /*#__PURE__*/ React.createElement(_reactRouterDom.Route, {
        path: "/reset-password",
        element: /*#__PURE__*/ React.createElement(
          _appResetPasswordPage2["default"],
          null,
        ),
      }),
      /*#__PURE__*/ React.createElement(_reactRouterDom.Route, {
        path: "/organizer-login",
        element: /*#__PURE__*/ React.createElement(
          _appOrganizerLoginPage2["default"],
          null,
        ),
      }),
      /*#__PURE__*/ React.createElement(_reactRouterDom.Route, {
        path: "/organizer-forgot-password",
        element: /*#__PURE__*/ React.createElement(
          _appOrganizerForgotPasswordPage2["default"],
          null,
        ),
      }),
      /*#__PURE__*/ React.createElement(_reactRouterDom.Route, {
        path: "/organizer",
        element: /*#__PURE__*/ React.createElement(
          _srcPagesOrganizerTeamPage2["default"],
          null,
        ),
      }),
      /*#__PURE__*/ React.createElement(_reactRouterDom.Route, {
        path: "/promoter",
        element: /*#__PURE__*/ React.createElement(
          _srcPagesPromoterPage2["default"],
          null,
        ),
      }),
      /*#__PURE__*/ React.createElement(_reactRouterDom.Route, {
        path: "/movie-team-login",
        element: /*#__PURE__*/ React.createElement(
          _appOrganizerLoginPage2["default"],
          null,
        ),
      }),
      /*#__PURE__*/ React.createElement(_reactRouterDom.Route, {
        path: "/movie-team-forgot-password",
        element: /*#__PURE__*/ React.createElement(
          _appOrganizerForgotPasswordPage2["default"],
          null,
        ),
      }),
      /*#__PURE__*/ React.createElement(_reactRouterDom.Route, {
        path: "/movie-team",
        element: /*#__PURE__*/ React.createElement(
          _srcPagesOrganizerTeamPage2["default"],
          null,
        ),
      }),
      /*#__PURE__*/ React.createElement(_reactRouterDom.Route, {
        path: "/admin",
        element: /*#__PURE__*/ React.createElement(
          _srcPagesAdminPage2["default"],
          null,
        ),
      }),
      /*#__PURE__*/ React.createElement(_reactRouterDom.Route, {
        path: "/admin/users",
        element: /*#__PURE__*/ React.createElement(
          _appAdminUsersPage2["default"],
          null,
        ),
      }),
      /*#__PURE__*/ React.createElement(_reactRouterDom.Route, {
        path: "/admin/events/edit",
        element: /*#__PURE__*/ React.createElement(
          _appAdminEventsEditPage2["default"],
          null,
        ),
      }),
      /*#__PURE__*/ React.createElement(_reactRouterDom.Route, {
        path: "/admin/assignments",
        element: /*#__PURE__*/ React.createElement(_reactRouterDom.Navigate, {
          to: "/admin?tab=events",
          replace: true,
        }),
      }),
      /*#__PURE__*/ React.createElement(_reactRouterDom.Route, {
        path: "/contact",
        element: /*#__PURE__*/ React.createElement(
          _appContactPage2["default"],
          null,
        ),
      }),
      /*#__PURE__*/ React.createElement(_reactRouterDom.Route, {
        path: "/privacy",
        element: /*#__PURE__*/ React.createElement(
          _appPrivacyPage2["default"],
          null,
        ),
      }),
      /*#__PURE__*/ React.createElement(_reactRouterDom.Route, {
        path: "/refund",
        element: /*#__PURE__*/ React.createElement(
          _appRefundPage2["default"],
          null,
        ),
      }),
      /*#__PURE__*/ React.createElement(_reactRouterDom.Route, {
        path: "/terms",
        element: /*#__PURE__*/ React.createElement(
          _appTermsPage2["default"],
          null,
        ),
      }),
      /*#__PURE__*/ React.createElement(_reactRouterDom.Route, {
        path: "/auth/callback",
        element: /*#__PURE__*/ React.createElement(
          _appAuthCallbackPage2["default"],
          null,
        ),
      }),
      /*#__PURE__*/ React.createElement(_reactRouterDom.Route, {
        path: "/auth/error",
        element: /*#__PURE__*/ React.createElement(
          _appAuthErrorPage2["default"],
          null,
        ),
      }),
      /*#__PURE__*/ React.createElement(_reactRouterDom.Route, {
        path: "*",
        element: /*#__PURE__*/ React.createElement(
          _appNotFound2["default"],
          null,
        ),
      }),
    ),
    /*#__PURE__*/ React.createElement(_componentsUiToaster.Toaster, null),
  );
}
module.exports = exports["default"];
