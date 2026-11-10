//#region \0rolldown/runtime.js
var e = Object.create, t = Object.defineProperty, n = Object.getOwnPropertyDescriptor, r = Object.getOwnPropertyNames, i = Object.getPrototypeOf, a = Object.prototype.hasOwnProperty, o = (e, t) => () => (t || (e((t = { exports: {} }).exports, t), e = null), t.exports), s = (e, i, o, s) => {
	if (i && typeof i == "object" || typeof i == "function") for (var c = r(i), l = 0, u = c.length, d; l < u; l++) d = c[l], !a.call(e, d) && d !== o && t(e, d, {
		get: ((e) => i[e]).bind(null, d),
		enumerable: !(s = n(i, d)) || s.enumerable
	});
	return e;
}, c = (n, r, o) => (o = n == null ? {} : e(i(n)), s(r || !n || !n.__esModule || !a.call(n, "default") ? t(o, "default", {
	value: n,
	enumerable: !0
}) : o, n)), l = /* @__PURE__ */ o(((e) => {
	var t = Symbol.for("react.transitional.element"), n = Symbol.for("react.portal"), r = Symbol.for("react.fragment"), i = Symbol.for("react.strict_mode"), a = Symbol.for("react.profiler"), o = Symbol.for("react.consumer"), s = Symbol.for("react.context"), c = Symbol.for("react.forward_ref"), l = Symbol.for("react.suspense"), u = Symbol.for("react.memo"), d = Symbol.for("react.lazy"), f = Symbol.for("react.activity"), p = Symbol.for("react.view_transition"), m = Symbol.iterator;
	function h(e) {
		return typeof e != "object" || !e ? null : (e = m && e[m] || e["@@iterator"], typeof e == "function" ? e : null);
	}
	var g = {
		isMounted: function() {
			return !1;
		},
		enqueueForceUpdate: function() {},
		enqueueReplaceState: function() {},
		enqueueSetState: function() {}
	}, _ = Object.assign, v = {};
	function y(e, t, n) {
		this.props = e, this.context = t, this.refs = v, this.updater = n || g;
	}
	y.prototype.isReactComponent = {}, y.prototype.setState = function(e, t) {
		if (typeof e != "object" && typeof e != "function" && e != null) throw Error("takes an object of state variables to update or a function which returns an object of state variables.");
		this.updater.enqueueSetState(this, e, t, "setState");
	}, y.prototype.forceUpdate = function(e) {
		this.updater.enqueueForceUpdate(this, e, "forceUpdate");
	};
	function b() {}
	b.prototype = y.prototype;
	function ee(e, t, n) {
		this.props = e, this.context = t, this.refs = v, this.updater = n || g;
	}
	var te = ee.prototype = new b();
	te.constructor = ee, _(te, y.prototype), te.isPureReactComponent = !0;
	var ne = Array.isArray;
	function re() {}
	var x = {
		H: null,
		A: null,
		T: null,
		S: null
	}, ie = Object.prototype.hasOwnProperty;
	function S(e, n, r) {
		var i = r.ref;
		return {
			$$typeof: t,
			type: e,
			key: n,
			ref: i === void 0 ? null : i,
			props: r
		};
	}
	function C(e, t) {
		return S(e.type, t, e.props);
	}
	function ae(e) {
		return typeof e == "object" && !!e && e.$$typeof === t;
	}
	function oe(e) {
		var t = {
			"=": "=0",
			":": "=2"
		};
		return "$" + e.replace(/[=:]/g, function(e) {
			return t[e];
		});
	}
	var se = /\/+/g;
	function w(e, t) {
		return typeof e == "object" && e && e.key != null ? oe("" + e.key) : t.toString(36);
	}
	function ce(e) {
		switch (e.status) {
			case "fulfilled": return e.value;
			case "rejected": throw e.reason;
			default: switch (typeof e.status == "string" ? e.then(re, re) : (e.status = "pending", e.then(function(t) {
				e.status === "pending" && (e.status = "fulfilled", e.value = t);
			}, function(t) {
				e.status === "pending" && (e.status = "rejected", e.reason = t);
			})), e.status) {
				case "fulfilled": return e.value;
				case "rejected": throw e.reason;
			}
		}
		throw e;
	}
	function le(e, r, i, a, o) {
		var s = typeof e;
		(s === "undefined" || s === "boolean") && (e = null);
		var c = !1;
		if (e === null) c = !0;
		else switch (s) {
			case "bigint":
			case "string":
			case "number":
				c = !0;
				break;
			case "object": switch (e.$$typeof) {
				case t:
				case n:
					c = !0;
					break;
				case d: return c = e._init, le(c(e._payload), r, i, a, o);
			}
		}
		if (c) return o = o(e), c = a === "" ? "." + w(e, 0) : a, ne(o) ? (i = "", c != null && (i = c.replace(se, "$&/") + "/"), le(o, r, i, "", function(e) {
			return e;
		})) : o != null && (ae(o) && (o = C(o, i + (o.key == null || e && e.key === o.key ? "" : ("" + o.key).replace(se, "$&/") + "/") + c)), r.push(o)), 1;
		c = 0;
		var l = a === "" ? "." : a + ":";
		if (ne(e)) for (var u = 0; u < e.length; u++) a = e[u], s = l + w(a, u), c += le(a, r, i, s, o);
		else if (u = h(e), typeof u == "function") for (e = u.call(e), u = 0; !(a = e.next()).done;) a = a.value, s = l + w(a, u++), c += le(a, r, i, s, o);
		else if (s === "object") {
			if (typeof e.then == "function") return le(ce(e), r, i, a, o);
			throw r = String(e), Error("Objects are not valid as a React child (found: " + (r === "[object Object]" ? "object with keys {" + Object.keys(e).join(", ") + "}" : r) + "). If you meant to render a collection of children, use an array instead.");
		}
		return c;
	}
	function ue(e, t, n) {
		if (e == null) return e;
		var r = [], i = 0;
		return le(e, r, "", "", function(e) {
			return t.call(n, e, i++);
		}), r;
	}
	function de(e) {
		if (e._status === -1) {
			var t = e._result, n = t();
			n.then(function(t) {
				(e._status === 0 || e._status === -1) && (e._status = 1, e._result = t, n.status === void 0 && (n.status = "fulfilled", n.value = t));
			}, function(t) {
				(e._status === 0 || e._status === -1) && (e._status = 2, e._result = t, n.status === void 0 && (n.status = "rejected", n.reason = t));
			}), e._status === -1 && (e._status = 0, e._result = n);
		}
		if (e._status === 1) return e._result.default;
		throw e._result;
	}
	var fe = typeof reportError == "function" ? reportError : function(e) {
		if (typeof window == "object" && typeof window.ErrorEvent == "function") {
			var t = new window.ErrorEvent("error", {
				bubbles: !0,
				cancelable: !0,
				message: typeof e == "object" && e && typeof e.message == "string" ? String(e.message) : String(e),
				error: e
			});
			if (!window.dispatchEvent(t)) return;
		} else if (typeof process == "object" && typeof process.emit == "function") {
			process.emit("uncaughtException", e);
			return;
		}
		console.error(e);
	};
	function pe(e) {
		var t = x.T, n = {};
		n.types = t === null ? null : t.types, x.T = n;
		try {
			var r = e(), i = x.S;
			i !== null && i(n, r), typeof r == "object" && r && typeof r.then == "function" && r.then(re, fe);
		} catch (e) {
			fe(e);
		} finally {
			t !== null && n.types !== null && (t.types = n.types), x.T = t;
		}
	}
	function me(e) {
		var t = x.T;
		if (t !== null) {
			var n = t.types;
			n === null ? t.types = [e] : n.indexOf(e) === -1 && n.push(e);
		} else pe(me.bind(null, e));
	}
	var he = {
		map: ue,
		forEach: function(e, t, n) {
			ue(e, function() {
				t.apply(this, arguments);
			}, n);
		},
		count: function(e) {
			var t = 0;
			return ue(e, function() {
				t++;
			}), t;
		},
		toArray: function(e) {
			return ue(e, function(e) {
				return e;
			}) || [];
		},
		only: function(e) {
			if (!ae(e)) throw Error("React.Children.only expected to receive a single React element child.");
			return e;
		}
	};
	e.Activity = f, e.Children = he, e.Component = y, e.Fragment = r, e.Profiler = a, e.PureComponent = ee, e.StrictMode = i, e.Suspense = l, e.ViewTransition = p, e.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = x, e.__COMPILER_RUNTIME = {
		__proto__: null,
		c: function(e) {
			return x.H.useMemoCache(e);
		}
	}, e.addTransitionType = me, e.cache = function(e) {
		return function() {
			return e.apply(null, arguments);
		};
	}, e.cacheSignal = function() {
		return null;
	}, e.cloneElement = function(e, t, n) {
		if (e == null) throw Error("The argument must be a React element, but you passed " + e + ".");
		var r = _({}, e.props), i = e.key;
		if (t != null) for (a in t.key !== void 0 && (i = "" + t.key), t) !ie.call(t, a) || a === "key" || a === "__self" || a === "__source" || a === "ref" && t.ref === void 0 || (r[a] = t[a]);
		var a = arguments.length - 2;
		if (a === 1) r.children = n;
		else if (1 < a) {
			for (var o = Array(a), s = 0; s < a; s++) o[s] = arguments[s + 2];
			r.children = o;
		}
		return S(e.type, i, r);
	}, e.createContext = function(e) {
		return e = {
			$$typeof: s,
			_currentValue: e,
			_currentValue2: e,
			_threadCount: 0,
			Provider: null,
			Consumer: null
		}, e.Provider = e, e.Consumer = {
			$$typeof: o,
			_context: e
		}, e;
	}, e.createElement = function(e, t, n) {
		var r, i = {}, a = null;
		if (t != null) for (r in t.key !== void 0 && (a = "" + t.key), t) ie.call(t, r) && r !== "key" && r !== "__self" && r !== "__source" && (i[r] = t[r]);
		var o = arguments.length - 2;
		if (o === 1) i.children = n;
		else if (1 < o) {
			for (var s = Array(o), c = 0; c < o; c++) s[c] = arguments[c + 2];
			i.children = s;
		}
		if (e && e.defaultProps) for (r in o = e.defaultProps, o) i[r] === void 0 && (i[r] = o[r]);
		return S(e, a, i);
	}, e.createRef = function() {
		return { current: null };
	}, e.forwardRef = function(e) {
		return {
			$$typeof: c,
			render: e
		};
	}, e.isValidElement = ae, e.lazy = function(e) {
		return {
			$$typeof: d,
			_payload: {
				_status: -1,
				_result: e
			},
			_init: de
		};
	}, e.memo = function(e, t) {
		return {
			$$typeof: u,
			type: e,
			compare: t === void 0 ? null : t
		};
	}, e.startTransition = pe, e.unstable_useCacheRefresh = function() {
		return x.H.useCacheRefresh();
	}, e.use = function(e) {
		return x.H.use(e);
	}, e.useActionState = function(e, t, n) {
		return x.H.useActionState(e, t, n);
	}, e.useCallback = function(e, t) {
		return x.H.useCallback(e, t);
	}, e.useContext = function(e) {
		return x.H.useContext(e);
	}, e.useDebugValue = function() {}, e.useDeferredValue = function(e, t) {
		return x.H.useDeferredValue(e, t);
	}, e.useEffect = function(e, t) {
		return x.H.useEffect(e, t);
	}, e.useEffectEvent = function(e) {
		return x.H.useEffectEvent(e);
	}, e.useId = function() {
		return x.H.useId();
	}, e.useImperativeHandle = function(e, t, n) {
		return x.H.useImperativeHandle(e, t, n);
	}, e.useInsertionEffect = function(e, t) {
		return x.H.useInsertionEffect(e, t);
	}, e.useLayoutEffect = function(e, t) {
		return x.H.useLayoutEffect(e, t);
	}, e.useMemo = function(e, t) {
		return x.H.useMemo(e, t);
	}, e.useOptimistic = function(e, t) {
		return x.H.useOptimistic(e, t);
	}, e.useReducer = function(e, t, n) {
		return x.H.useReducer(e, t, n);
	}, e.useRef = function(e) {
		return x.H.useRef(e);
	}, e.useState = function(e) {
		return x.H.useState(e);
	}, e.useSyncExternalStore = function(e, t, n) {
		return x.H.useSyncExternalStore(e, t, n);
	}, e.useTransition = function() {
		return x.H.useTransition();
	}, e.version = "19.3.0";
})), u = /* @__PURE__ */ o(((e, t) => {
	t.exports = l();
})), d = /* @__PURE__ */ o(((e) => {
	function t(e, t) {
		var n = e.length;
		e.push(t);
		a: for (; 0 < n;) {
			var r = n - 1 >>> 1, a = e[r];
			if (0 < i(a, t)) e[r] = t, e[n] = a, n = r;
			else break a;
		}
	}
	function n(e) {
		return e.length === 0 ? null : e[0];
	}
	function r(e) {
		if (e.length === 0) return null;
		var t = e[0], n = e.pop();
		if (n !== t) {
			e[0] = n;
			a: for (var r = 0, a = e.length, o = a >>> 1; r < o;) {
				var s = 2 * (r + 1) - 1, c = e[s], l = s + 1, u = e[l];
				if (0 > i(c, n)) l < a && 0 > i(u, c) ? (e[r] = u, e[l] = n, r = l) : (e[r] = c, e[s] = n, r = s);
				else if (l < a && 0 > i(u, n)) e[r] = u, e[l] = n, r = l;
				else break a;
			}
		}
		return t;
	}
	function i(e, t) {
		var n = e.sortIndex - t.sortIndex;
		return n === 0 ? e.id - t.id : n;
	}
	if (e.unstable_now = void 0, typeof performance == "object" && typeof performance.now == "function") {
		var a = performance;
		e.unstable_now = function() {
			return a.now();
		};
	} else {
		var o = Date, s = o.now();
		e.unstable_now = function() {
			return o.now() - s;
		};
	}
	var c = [], l = [], u = 1, d = null, f = 3, p = !1, m = !1, h = !1, g = !1, _ = typeof setTimeout == "function" ? setTimeout : null, v = typeof clearTimeout == "function" ? clearTimeout : null, y = typeof setImmediate < "u" ? setImmediate : null;
	function b(e) {
		for (var i = n(l); i !== null;) {
			if (i.callback === null) r(l);
			else if (i.startTime <= e) r(l), i.sortIndex = i.expirationTime, t(c, i);
			else break;
			i = n(l);
		}
	}
	function ee(e) {
		if (h = !1, b(e), !m) {
			if (n(c) !== null) m = !0, te || (te = !0, C());
			else {
				var t = n(l);
				t !== null && se(ee, t.startTime - e);
			}
		}
	}
	var te = !1, ne = -1, re = 5, x = -1;
	function ie() {
		return g ? !0 : !(e.unstable_now() - x < re);
	}
	function S() {
		if (g = !1, te) {
			var t = e.unstable_now();
			x = t;
			var i = !0;
			try {
				a: {
					m = !1, h && (h = !1, v(ne), ne = -1), p = !0;
					var a = f;
					try {
						b: {
							for (b(t), d = n(c); d !== null && !(d.expirationTime > t && ie());) {
								var o = d.callback;
								if (typeof o == "function") {
									d.callback = null, f = d.priorityLevel;
									var s = o(d.expirationTime <= t);
									if (t = e.unstable_now(), typeof s == "function") {
										d.callback = s, b(t), i = !0;
										break b;
									}
									d === n(c) && r(c), b(t);
								} else r(c);
								d = n(c);
							}
							if (d !== null) i = !0;
							else {
								var u = n(l);
								u !== null && se(ee, u.startTime - t), i = !1;
							}
						}
						break a;
					} finally {
						d = null, f = a, p = !1;
					}
					i = void 0;
				}
			} finally {
				i ? C() : te = !1;
			}
		}
	}
	var C;
	if (typeof y == "function") C = function() {
		y(S);
	};
	else if (typeof MessageChannel < "u") {
		var ae = new MessageChannel(), oe = ae.port2;
		ae.port1.onmessage = S, C = function() {
			oe.postMessage(null);
		};
	} else C = function() {
		_(S, 0);
	};
	function se(t, n) {
		ne = _(function() {
			t(e.unstable_now());
		}, n);
	}
	e.unstable_IdlePriority = 5, e.unstable_ImmediatePriority = 1, e.unstable_LowPriority = 4, e.unstable_NormalPriority = 3, e.unstable_Profiling = null, e.unstable_UserBlockingPriority = 2, e.unstable_cancelCallback = function(e) {
		e.callback = null;
	}, e.unstable_forceFrameRate = function(e) {
		0 > e || 125 < e ? console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported") : re = 0 < e ? Math.floor(1e3 / e) : 5;
	}, e.unstable_getCurrentPriorityLevel = function() {
		return f;
	}, e.unstable_next = function(e) {
		switch (f) {
			case 1:
			case 2:
			case 3:
				var t = 3;
				break;
			default: t = f;
		}
		var n = f;
		f = t;
		try {
			return e();
		} finally {
			f = n;
		}
	}, e.unstable_requestPaint = function() {
		g = !0;
	}, e.unstable_runWithPriority = function(e, t) {
		switch (e) {
			case 1:
			case 2:
			case 3:
			case 4:
			case 5: break;
			default: e = 3;
		}
		var n = f;
		f = e;
		try {
			return t();
		} finally {
			f = n;
		}
	}, e.unstable_scheduleCallback = function(r, i, a) {
		var o = e.unstable_now();
		switch (typeof a == "object" && a ? (a = a.delay, a = typeof a == "number" && 0 < a ? o + a : o) : a = o, r) {
			case 1:
				var s = -1;
				break;
			case 2:
				s = 250;
				break;
			case 5:
				s = 1073741823;
				break;
			case 4:
				s = 1e4;
				break;
			default: s = 5e3;
		}
		return s = a + s, r = {
			id: u++,
			callback: i,
			priorityLevel: r,
			startTime: a,
			expirationTime: s,
			sortIndex: -1
		}, a > o ? (r.sortIndex = a, t(l, r), n(c) === null && r === n(l) && (h ? (v(ne), ne = -1) : h = !0, se(ee, a - o))) : (r.sortIndex = s, t(c, r), m || p || (m = !0, te || (te = !0, C()))), r;
	}, e.unstable_shouldYield = ie, e.unstable_wrapCallback = function(e) {
		var t = f;
		return function() {
			var n = f;
			f = t;
			try {
				return e.apply(this, arguments);
			} finally {
				f = n;
			}
		};
	};
})), f = /* @__PURE__ */ o(((e, t) => {
	t.exports = d();
})), p = /* @__PURE__ */ o(((e) => {
	var t = u();
	function n(e) {
		var t = "https://react.dev/errors/" + e;
		if (1 < arguments.length) {
			t += "?args[]=" + encodeURIComponent(arguments[1]);
			for (var n = 2; n < arguments.length; n++) t += "&args[]=" + encodeURIComponent(arguments[n]);
		}
		return "Minified React error #" + e + "; visit " + t + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
	}
	function r() {}
	var i = {
		d: {
			f: r,
			r: function() {
				throw Error(n(522));
			},
			D: r,
			C: r,
			L: r,
			m: r,
			X: r,
			S: r,
			M: r
		},
		p: 0,
		findDOMNode: null
	}, a = Symbol.for("react.portal"), o = Symbol.for("react.recoverable"), s = Symbol.for("react.optimistic_key");
	function c(e, t, n) {
		var r = 3 < arguments.length && arguments[3] !== void 0 ? arguments[3] : null;
		return {
			$$typeof: a,
			key: r == null ? null : r === s ? s : "" + r,
			children: e,
			containerInfo: t,
			implementation: n
		};
	}
	var l = t.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
	function d(e, t) {
		if (e === "font") return "";
		if (typeof t == "string") return t === "use-credentials" ? t : "";
	}
	e.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = i, e.browser = function(e) {
		return {
			$$typeof: o,
			_reason: e
		};
	}, e.createPortal = function(e, t) {
		var r = 2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null;
		if (!t || t.nodeType !== 1 && t.nodeType !== 9 && t.nodeType !== 11) throw Error(n(299));
		return c(e, t, null, r);
	}, e.flushSync = function(e) {
		var t = l.T, n = i.p;
		try {
			if (l.T = null, i.p = 2, e) return e();
		} finally {
			l.T = t, i.p = n, i.d.f();
		}
	}, e.preconnect = function(e, t) {
		typeof e == "string" && (t ? (t = t.crossOrigin, t = typeof t == "string" ? t === "use-credentials" ? t : "" : void 0) : t = null, i.d.C(e, t));
	}, e.prefetchDNS = function(e) {
		typeof e == "string" && i.d.D(e);
	}, e.preinit = function(e, t) {
		if (typeof e == "string" && t && typeof t.as == "string") {
			var n = t.as, r = d(n, t.crossOrigin), a = typeof t.integrity == "string" ? t.integrity : void 0, o = typeof t.fetchPriority == "string" ? t.fetchPriority : void 0;
			n === "style" ? i.d.S(e, typeof t.precedence == "string" ? t.precedence : void 0, {
				crossOrigin: r,
				integrity: a,
				fetchPriority: o
			}) : n === "script" && i.d.X(e, {
				crossOrigin: r,
				integrity: a,
				fetchPriority: o,
				nonce: typeof t.nonce == "string" ? t.nonce : void 0
			});
		}
	}, e.preinitModule = function(e, t) {
		if (typeof e == "string") {
			if (typeof t == "object" && t) {
				if (t.as == null || t.as === "script") {
					var n = d(t.as, t.crossOrigin);
					i.d.M(e, {
						crossOrigin: n,
						integrity: typeof t.integrity == "string" ? t.integrity : void 0,
						nonce: typeof t.nonce == "string" ? t.nonce : void 0,
						fetchPriority: typeof t.fetchPriority == "string" ? t.fetchPriority : void 0
					});
				}
			} else t ?? i.d.M(e);
		}
	}, e.preload = function(e, t) {
		if (typeof e == "string" && typeof t == "object" && t && typeof t.as == "string") {
			var n = t.as, r = d(n, t.crossOrigin);
			i.d.L(e, n, {
				crossOrigin: r,
				integrity: typeof t.integrity == "string" ? t.integrity : void 0,
				nonce: typeof t.nonce == "string" ? t.nonce : void 0,
				type: typeof t.type == "string" ? t.type : void 0,
				fetchPriority: typeof t.fetchPriority == "string" ? t.fetchPriority : void 0,
				referrerPolicy: typeof t.referrerPolicy == "string" ? t.referrerPolicy : void 0,
				imageSrcSet: typeof t.imageSrcSet == "string" ? t.imageSrcSet : void 0,
				imageSizes: typeof t.imageSizes == "string" ? t.imageSizes : void 0,
				media: typeof t.media == "string" ? t.media : void 0
			});
		}
	}, e.preloadModule = function(e, t) {
		if (typeof e == "string") {
			if (t) {
				var n = d(t.as, t.crossOrigin);
				i.d.m(e, {
					as: typeof t.as == "string" && t.as !== "script" ? t.as : void 0,
					crossOrigin: n,
					integrity: typeof t.integrity == "string" ? t.integrity : void 0,
					nonce: typeof t.nonce == "string" ? t.nonce : void 0,
					fetchPriority: typeof t.fetchPriority == "string" ? t.fetchPriority : void 0
				});
			} else i.d.m(e);
		}
	}, e.requestFormReset = function(e) {
		i.d.r(e);
	}, e.unstable_batchedUpdates = function(e, t) {
		return e(t);
	}, e.useFormState = function(e, t, n) {
		return l.H.useFormState(e, t, n);
	}, e.useFormStatus = function() {
		return l.H.useHostTransitionStatus();
	}, e.version = "19.3.0";
})), m = /* @__PURE__ */ o(((e, t) => {
	function n() {
		if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE == "function") try {
			__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(n);
		} catch (e) {
			console.error(e);
		}
	}
	n(), t.exports = p();
})), h = /* @__PURE__ */ o(((e) => {
	var t = f(), n = u(), r = m();
	function i(e) {
		var t = "https://react.dev/errors/" + e;
		if (1 < arguments.length) {
			t += "?args[]=" + encodeURIComponent(arguments[1]);
			for (var n = 2; n < arguments.length; n++) t += "&args[]=" + encodeURIComponent(arguments[n]);
		}
		return "Minified React error #" + e + "; visit " + t + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
	}
	function a(e) {
		return !(!e || e.nodeType !== 1 && e.nodeType !== 9 && e.nodeType !== 11);
	}
	function o(e) {
		for (var t = e, n = t; n && !n.alternate;) t = n, t.flags & 4098 && (e = t.return), n = t.return;
		for (; t.return;) t = t.return;
		return t.tag === 3 ? e : null;
	}
	function s(e) {
		if (e.tag === 13) {
			var t = e.memoizedState;
			if (t === null && (e = e.alternate, e !== null && (t = e.memoizedState)), t !== null) return t.dehydrated;
		}
		return null;
	}
	function c(e) {
		if (e.tag === 31) {
			var t = e.memoizedState;
			if (t === null && (e = e.alternate, e !== null && (t = e.memoizedState)), t !== null) return t.dehydrated;
		}
		return null;
	}
	function l(e) {
		if (o(e) !== e) throw Error(i(188));
	}
	function d(e) {
		var t = e.alternate;
		if (!t) {
			if (t = o(e), t === null) throw Error(i(188));
			return t === e ? e : null;
		}
		for (var n = e, r = t;;) {
			var a = n.return;
			if (a === null) break;
			var s = a.alternate;
			if (s === null) {
				if (r = a.return, r !== null) {
					n = r;
					continue;
				}
				break;
			}
			if (a.child === s.child) {
				for (s = a.child; s;) {
					if (s === n) return l(a), e;
					if (s === r) return l(a), t;
					s = s.sibling;
				}
				throw Error(i(188));
			}
			if (n.return !== r.return) n = a, r = s;
			else {
				for (var c = !1, u = a.child; u;) {
					if (u === n) {
						c = !0, n = a, r = s;
						break;
					}
					if (u === r) {
						c = !0, r = a, n = s;
						break;
					}
					u = u.sibling;
				}
				if (!c) {
					for (u = s.child; u;) {
						if (u === n) {
							c = !0, n = s, r = a;
							break;
						}
						if (u === r) {
							c = !0, r = s, n = a;
							break;
						}
						u = u.sibling;
					}
					if (!c) throw Error(i(189));
				}
			}
			if (n.alternate !== r) throw Error(i(190));
		}
		if (n.tag !== 3) throw Error(i(188));
		return n.stateNode.current === n ? e : t;
	}
	function p(e) {
		var t = e.tag;
		if (t === 5 || t === 26 || t === 27 || t === 6) return e;
		for (e = e.child; e !== null;) {
			if (t = p(e), t !== null) return t;
			e = e.sibling;
		}
		return null;
	}
	function h(e, t, n, r, i, a) {
		for (; e !== null;) {
			if ((e.tag === 5 || e.tag === 27 || e.tag === 6) && n(e, r, i, a) || (e.tag !== 22 || e.memoizedState === null) && (t || e.tag !== 5 && e.tag !== 27) && h(e.child, t, n, r, i, a)) return !0;
			e = e.sibling;
		}
		return !1;
	}
	function g(e) {
		for (e = e.return; e !== null;) {
			if (e.tag === 3 || e.tag === 5 || e.tag === 27) return e;
			e = e.return;
		}
		return null;
	}
	function _(e) {
		var t = !1;
		for (e = e.return; e !== null && (e.tag === 4 && (t = !0), e.tag !== 3 && e.tag !== 5 && e.tag !== 27);) e = e.return;
		return t;
	}
	function v(e) {
		var t = [null, null], n = g(e);
		return n === null || y(t, e, n.child, { foundSelf: !1 }), t;
	}
	function y(e, t, n, r) {
		for (; n !== null;) {
			if (n === t) r.foundSelf = !0;
			else if (n.tag === 5 || n.tag === 27 || n.tag === 6) {
				if (r.foundSelf) return e[1] = n, !0;
				e[0] = n;
			} else if ((n.tag !== 22 || n.memoizedState === null) && y(e, t, n.child, r)) return !0;
			n = n.sibling;
		}
		return !1;
	}
	function b(e) {
		switch (e.tag) {
			case 5:
			case 27:
			case 6: return e.stateNode;
			case 3: return e.stateNode.containerInfo;
			default: throw Error(i(559));
		}
	}
	var ee = null, te = null;
	function ne(e, t, n) {
		return e === n || e === t && (ee = e, !0);
	}
	function re(e, t, n) {
		return e === n ? (te = e, !1) : e === t && (te !== null && (ee = e), !0);
	}
	function x(e) {
		if (e === null) return null;
		do
			e = e === null ? null : e.return;
		while (e && e.tag !== 5 && e.tag !== 27 && e.tag !== 3);
		return e || null;
	}
	function ie(e, t, n) {
		for (var r = 0, i = e; i; i = n(i)) r++;
		i = 0;
		for (var a = t; a; a = n(a)) i++;
		for (; 0 < r - i;) e = n(e), r--;
		for (; 0 < i - r;) t = n(t), i--;
		for (; r--;) {
			if (e === t || t !== null && e === t.alternate) return e;
			e = n(e), t = n(t);
		}
		return null;
	}
	var S = Object.assign, C = Symbol.for("react.element"), ae = Symbol.for("react.transitional.element"), oe = Symbol.for("react.portal"), se = Symbol.for("react.fragment"), w = Symbol.for("react.strict_mode"), ce = Symbol.for("react.profiler"), le = Symbol.for("react.consumer"), ue = Symbol.for("react.context"), de = Symbol.for("react.forward_ref"), fe = Symbol.for("react.suspense"), pe = Symbol.for("react.suspense_list"), me = Symbol.for("react.memo"), he = Symbol.for("react.lazy"), ge = Symbol.for("react.activity"), _e = Symbol.for("react.legacy_hidden"), ve = Symbol.for("react.memo_cache_sentinel"), ye = Symbol.for("react.view_transition"), be = Symbol.for("react.recoverable"), xe = Symbol.iterator;
	function Se(e) {
		return typeof e != "object" || !e ? null : (e = xe && e[xe] || e["@@iterator"], typeof e == "function" ? e : null);
	}
	var Ce = Symbol.for("react.client.reference");
	function we(e) {
		if (e == null) return null;
		if (typeof e == "function") return e.$$typeof === Ce ? null : e.displayName || e.name || null;
		if (typeof e == "string") return e;
		switch (e) {
			case se: return "Fragment";
			case ce: return "Profiler";
			case w: return "StrictMode";
			case fe: return "Suspense";
			case pe: return "SuspenseList";
			case ge: return "Activity";
			case ye: return "ViewTransition";
		}
		if (typeof e == "object") switch (e.$$typeof) {
			case oe: return "Portal";
			case ue: return e.displayName || "Context";
			case le: return (e._context.displayName || "Context") + ".Consumer";
			case de:
				var t = e.render;
				return e = e.displayName, e ||= (e = t.displayName || t.name || "", e === "" ? "ForwardRef" : "ForwardRef(" + e + ")"), e;
			case me: return t = e.displayName || null, t === null ? we(e.type) || "Memo" : t;
			case he:
				t = e._payload, e = e._init;
				try {
					return we(e(t));
				} catch {}
		}
		return null;
	}
	var Te = Array.isArray, T = n.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, E = r.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, Ee = {
		pending: !1,
		data: null,
		method: null,
		action: null
	}, De = [], Oe = -1;
	function ke(e) {
		return { current: e };
	}
	function Ae(e) {
		0 > Oe || (e.current = De[Oe], De[Oe] = null, Oe--);
	}
	function D(e, t) {
		Oe++, De[Oe] = e.current, e.current = t;
	}
	var je = ke(null), Me = ke(null), Ne = ke(null), Pe = ke(null);
	function Fe(e, t) {
		switch (D(Ne, t), D(Me, e), D(je, null), t.nodeType) {
			case 9:
			case 11:
				e = (e = t.documentElement) && (e = e.namespaceURI) ? up(e) : 0;
				break;
			default: if (e = t.tagName, t = t.namespaceURI) t = up(t), e = dp(t, e);
			else switch (e) {
				case "svg":
					e = 1;
					break;
				case "math":
					e = 2;
					break;
				default: e = 0;
			}
		}
		Ae(je), D(je, e);
	}
	function Ie() {
		Ae(je), Ae(Me), Ae(Ne);
	}
	function Le(e) {
		var t = e.memoizedState;
		t !== null && (sh._currentValue = t.memoizedState, D(Pe, e)), t = je.current;
		var n = dp(t, e.type);
		t !== n && (D(Me, e), D(je, n));
	}
	function Re(e) {
		Me.current === e && (Ae(je), Ae(Me)), Pe.current === e && (Ae(Pe), sh._currentValue = Ee);
	}
	var ze, Be;
	function Ve(e) {
		if (ze === void 0) try {
			throw Error();
		} catch (e) {
			var t = e.stack.trim().match(/\n( *(at )?)/);
			ze = t && t[1] || "", Be = -1 < e.stack.indexOf("\n    at") ? " (<anonymous>)" : -1 < e.stack.indexOf("@") ? "@unknown:0:0" : "";
		}
		return "\n" + ze + e + Be;
	}
	var He = !1;
	function Ue(e, t) {
		if (!e || He) return "";
		He = !0;
		var n = Error.prepareStackTrace;
		Error.prepareStackTrace = void 0;
		try {
			var r = { DetermineComponentFrameRoot: function() {
				try {
					if (t) {
						var n = function() {
							throw Error();
						};
						if (Object.defineProperty(n.prototype, "props", { set: function() {
							throw Error();
						} }), typeof Reflect == "object" && Reflect.construct) {
							try {
								Reflect.construct(n, []);
							} catch (e) {
								var r = e;
							}
							Reflect.construct(e, [], n);
						} else {
							try {
								n.call();
							} catch (e) {
								r = e;
							}
							n = !1;
							try {
								var i = Object.getOwnPropertyDescriptor(e.prototype, "props");
								Object.defineProperty(e.prototype, "props", {
									configurable: !0,
									set: function() {
										throw Error();
									}
								}), n = !0, new e();
							} finally {
								n && (i === void 0 ? delete e.prototype.props : Object.defineProperty(e.prototype, "props", i));
							}
						}
					} else {
						try {
							throw Error();
						} catch (e) {
							r = e;
						}
						(n = e()) && typeof n.catch == "function" && n.catch(function() {});
					}
				} catch (e) {
					if (e && r && typeof e.stack == "string") return [e.stack, r.stack];
				}
				return [null, null];
			} };
			r.DetermineComponentFrameRoot.displayName = "DetermineComponentFrameRoot";
			var i = Object.getOwnPropertyDescriptor(r.DetermineComponentFrameRoot, "name");
			i && i.configurable && Object.defineProperty(r.DetermineComponentFrameRoot, "name", { value: "DetermineComponentFrameRoot" });
			var a = r.DetermineComponentFrameRoot(), o = a[0], s = a[1];
			if (o && s) {
				var c = o.split("\n"), l = s.split("\n");
				for (i = r = 0; r < c.length && !c[r].includes("DetermineComponentFrameRoot");) r++;
				for (; i < l.length && !l[i].includes("DetermineComponentFrameRoot");) i++;
				if (r === c.length || i === l.length) for (r = c.length - 1, i = l.length - 1; 1 <= r && 0 <= i && c[r] !== l[i];) i--;
				for (; 1 <= r && 0 <= i; r--, i--) if (c[r] !== l[i]) {
					if (r !== 1 || i !== 1) do
						if (r--, i--, 0 > i || c[r] !== l[i]) {
							var u = "\n" + c[r].replace(" at new ", " at ");
							return e.displayName && u.includes("<anonymous>") && (u = u.replace("<anonymous>", e.displayName)), u;
						}
					while (1 <= r && 0 <= i);
					break;
				}
			}
		} finally {
			He = !1, Error.prepareStackTrace = n;
		}
		return (n = e ? e.displayName || e.name : "") ? Ve(n) : "";
	}
	function We(e, t) {
		switch (e.tag) {
			case 26:
			case 27:
			case 5: return Ve(e.type);
			case 16: return Ve("Lazy");
			case 13: return e.child !== t && t !== null ? Ve("Suspense Fallback") : Ve("Suspense");
			case 19: return Ve("SuspenseList");
			case 0:
			case 15: return Ue(e.type, !1);
			case 11: return Ue(e.type.render, !1);
			case 1: return Ue(e.type, !0);
			case 31: return Ve("Activity");
			case 30: return Ve("ViewTransition");
			default: return "";
		}
	}
	function Ge(e) {
		try {
			var t = "", n = null;
			do
				t += We(e, n), n = e, e = e.return;
			while (e);
			return t;
		} catch (e) {
			return "\nError generating stack: " + e.message + "\n" + e.stack;
		}
	}
	var Ke = Object.prototype.hasOwnProperty, qe = t.unstable_scheduleCallback, Je = t.unstable_cancelCallback, Ye = t.unstable_shouldYield, Xe = t.unstable_requestPaint, Ze = t.unstable_now, Qe = t.unstable_getCurrentPriorityLevel, $e = t.unstable_ImmediatePriority, et = t.unstable_UserBlockingPriority, tt = t.unstable_NormalPriority, nt = t.unstable_LowPriority, rt = t.unstable_IdlePriority, it = t.log, at = t.unstable_setDisableYieldValue, ot = null, st = null;
	function ct(e) {
		if (typeof it == "function" && at(e), st && typeof st.setStrictMode == "function") try {
			st.setStrictMode(ot, e);
		} catch {}
	}
	var lt = Math.clz32 ? Math.clz32 : ft, ut = Math.log, dt = Math.LN2;
	function ft(e) {
		return e >>>= 0, e === 0 ? 32 : 31 - (ut(e) / dt | 0) | 0;
	}
	var pt = 256, mt = 262144, ht = 4194304;
	function gt(e) {
		var t = e & 42;
		if (t !== 0) return t;
		switch (e & -e) {
			case 1: return 1;
			case 2: return 2;
			case 4: return 4;
			case 8: return 8;
			case 16: return 16;
			case 32: return 32;
			case 64: return 64;
			case 128: return 128;
			case 256:
			case 512:
			case 1024:
			case 2048:
			case 4096:
			case 8192:
			case 16384:
			case 32768:
			case 65536:
			case 131072: return e & -e;
			case 262144:
			case 524288:
			case 1048576:
			case 2097152: return e & 3932160;
			case 4194304:
			case 8388608:
			case 16777216:
			case 33554432: return e & 62914560;
			case 67108864: return 67108864;
			case 134217728: return 134217728;
			case 268435456: return 268435456;
			case 536870912: return 536870912;
			case 1073741824: return 0;
			default: return e;
		}
	}
	function _t(e, t, n) {
		var r = e.pendingLanes;
		if (r === 0) return 0;
		var i = 0, a = e.suspendedLanes, o = e.pingedLanes;
		e = e.warmLanes;
		var s = r & 134217727;
		return s === 0 ? (s = r & ~a, s === 0 ? o === 0 ? n || (n = r & ~e, n !== 0 && (i = gt(n))) : i = gt(o) : i = gt(s)) : (r = s & ~a, r === 0 ? (o &= s, o === 0 ? n || (n = s & ~e, n !== 0 && (i = gt(n))) : i = gt(o)) : i = gt(r)), i === 0 ? 0 : t !== 0 && t !== i && (t & a) === 0 && (a = i & -i, n = t & -t, a >= n || a === 32 && n & 4194048) ? t : i;
	}
	function O(e, t) {
		return (e.pendingLanes & ~(e.suspendedLanes & ~e.pingedLanes) & t) === 0;
	}
	function vt(e, t) {
		t & 8 && (t |= t & 32);
		var n = e.entangledLanes;
		if (n !== 0) for (e = e.entanglements, n &= t; 0 < n;) {
			var r = 31 - lt(n), i = 1 << r;
			t |= e[r], n &= ~i;
		}
		return t;
	}
	function yt(e, t) {
		switch (e) {
			case 1:
			case 2:
			case 4:
			case 8:
			case 64: return t + 250;
			case 16:
			case 32:
			case 128:
			case 256:
			case 512:
			case 1024:
			case 2048:
			case 4096:
			case 8192:
			case 16384:
			case 32768:
			case 65536:
			case 131072:
			case 262144:
			case 524288:
			case 1048576:
			case 2097152: return t + 5e3;
			case 4194304:
			case 8388608:
			case 16777216:
			case 33554432: return -1;
			case 67108864:
			case 134217728:
			case 268435456:
			case 536870912:
			case 1073741824: return -1;
			default: return -1;
		}
	}
	function k() {
		var e = ht;
		return ht <<= 1, !(ht & 62914560) && (ht = 4194304), e;
	}
	function bt(e) {
		for (var t = [], n = 0; 31 > n; n++) t.push(e);
		return t;
	}
	function xt(e, t) {
		e.pendingLanes |= t, t !== 268435456 && (e.suspendedLanes = 0, e.pingedLanes = 0, e.warmLanes = 0);
	}
	function St(e, t, n, r, i, a) {
		var o = e.pendingLanes;
		e.pendingLanes = n, e.suspendedLanes = 0, e.pingedLanes = 0, e.warmLanes = 0, e.expiredLanes &= n, e.entangledLanes &= n, e.errorRecoveryDisabledLanes &= n, e.shellSuspendCounter = 0;
		var s = e.entanglements, c = e.expirationTimes, l = e.hiddenUpdates;
		for (n = o & ~n; 0 < n;) {
			var u = 31 - lt(n), d = 1 << u;
			s[u] = 0, c[u] = -1;
			var f = l[u];
			if (f !== null) for (l[u] = null, u = 0; u < f.length; u++) {
				var p = f[u];
				p !== null && (p.lane &= -536870913);
			}
			n &= ~d;
		}
		r !== 0 && Ct(e, r, 0), a !== 0 && i === 0 && e.tag !== 0 && (e.suspendedLanes |= a & ~(o & ~t));
	}
	function Ct(e, t, n) {
		e.pendingLanes |= t, e.suspendedLanes &= ~t;
		var r = 31 - lt(t);
		e.entangledLanes |= t, e.entanglements[r] = e.entanglements[r] | 1073741824 | n & 261930;
	}
	function wt(e, t) {
		var n = e.entangledLanes |= t;
		for (e = e.entanglements; n;) {
			var r = 31 - lt(n), i = 1 << r;
			i & t | e[r] & t && (e[r] |= t), n &= ~i;
		}
	}
	function Tt(e, t) {
		var n = t & -t;
		return n = n & 42 ? 1 : Et(n), (n & (e.suspendedLanes | t)) === 0 ? n : 0;
	}
	function Et(e) {
		switch (e) {
			case 2:
				e = 1;
				break;
			case 8:
				e = 4;
				break;
			case 32:
				e = 16;
				break;
			case 256:
			case 512:
			case 1024:
			case 2048:
			case 4096:
			case 8192:
			case 16384:
			case 32768:
			case 65536:
			case 131072:
			case 262144:
			case 524288:
			case 1048576:
			case 2097152:
			case 4194304:
			case 8388608:
			case 16777216:
			case 33554432:
				e = 128;
				break;
			case 268435456:
				e = 134217728;
				break;
			default: e = 0;
		}
		return e;
	}
	function Dt(e) {
		return e &= -e, 2 < e ? 8 < e ? e & 134217727 ? 32 : 268435456 : 8 : 2;
	}
	function Ot() {
		var e = E.p;
		return e === 0 ? (e = window.event, e === void 0 ? 32 : Ch(e.type)) : e;
	}
	function A(e, t) {
		var n = E.p;
		try {
			return E.p = e, t();
		} finally {
			E.p = n;
		}
	}
	var kt = Math.random().toString(36).slice(2), j = "__reactFiber$" + kt, At = "__reactProps$" + kt, jt = "__reactContainer$" + kt, Mt = "__reactEvents$" + kt, Nt = "__reactListeners$" + kt, Pt = "__reactHandles$" + kt, Ft = "__reactResources$" + kt, It = "__reactMarker$" + kt, Lt = "__reactLoad$" + kt;
	function Rt(e) {
		delete e[j], delete e[At], delete e[Nt], delete e[Pt];
	}
	function zt(e) {
		var t;
		if (t = e[j]) return t;
		for (var n = e.parentNode; n;) {
			if (t = n[jt] || n[j]) {
				if (n = t.alternate, t.child !== null || n !== null && n.child !== null) for (e = fm(e); e !== null;) {
					if (n = e[j]) return n;
					e = fm(e);
				}
				return t;
			}
			e = n, n = e.parentNode;
		}
		return null;
	}
	function Bt(e) {
		if (e = e[j] || e[jt]) {
			var t = e.tag;
			if (t === 5 || t === 6 || t === 13 || t === 31 || t === 26 || t === 27 || t === 3) return e;
		}
		return null;
	}
	function Vt(e) {
		var t = e.tag;
		if (t === 5 || t === 26 || t === 27 || t === 6) return e.stateNode;
		throw Error(i(33));
	}
	function Ht(e) {
		var t = e[Ft];
		return t ||= e[Ft] = {
			hoistableStyles: /* @__PURE__ */ new Map(),
			hoistableScripts: /* @__PURE__ */ new Map()
		}, t;
	}
	function Ut(e) {
		e[It] = !0;
	}
	function Wt(e) {
		e[Lt] = void 0;
	}
	var Gt = /* @__PURE__ */ new Set(), Kt = {};
	function qt(e, t) {
		Jt(e, t), Jt(e + "Capture", t);
	}
	function Jt(e, t) {
		for (Kt[e] = t, e = 0; e < t.length; e++) Gt.add(t[e]);
	}
	var Yt = RegExp("^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$"), Xt = {}, Zt = {};
	function Qt(e) {
		return Ke.call(Zt, e) ? !0 : Ke.call(Xt, e) ? !1 : Yt.test(e) ? Zt[e] = !0 : (Xt[e] = !0, !1);
	}
	var M = !1;
	function $t() {
		var e = M;
		return M = !1, e;
	}
	function en(e, t, n) {
		if (Qt(t)) {
			if (n === null) e.removeAttribute(t);
			else {
				switch (typeof n) {
					case "undefined":
					case "function":
					case "symbol":
						e.removeAttribute(t);
						return;
					case "boolean":
						var r = t.toLowerCase().slice(0, 5);
						if (r !== "data-" && r !== "aria-") {
							e.removeAttribute(t);
							return;
						}
				}
				e.setAttribute(t, n);
			}
		}
	}
	function tn(e, t, n) {
		if (n === null) e.removeAttribute(t);
		else {
			switch (typeof n) {
				case "undefined":
				case "function":
				case "symbol":
				case "boolean":
					e.removeAttribute(t);
					return;
			}
			e.setAttribute(t, n);
		}
	}
	function nn(e, t, n, r) {
		if (r === null) e.removeAttribute(n);
		else {
			switch (typeof r) {
				case "undefined":
				case "function":
				case "symbol":
				case "boolean":
					e.removeAttribute(n);
					return;
			}
			e.setAttributeNS(t, n, r);
		}
	}
	function rn(e) {
		switch (typeof e) {
			case "bigint":
			case "boolean":
			case "number":
			case "string":
			case "undefined": return e;
			case "object": return e;
			default: return "";
		}
	}
	function an(e) {
		var t = e.type;
		return (e = e.nodeName) && e.toLowerCase() === "input" && (t === "checkbox" || t === "radio");
	}
	function on(e, t, n) {
		var r = Object.getOwnPropertyDescriptor(e.constructor.prototype, t);
		if (!e.hasOwnProperty(t) && r !== void 0 && typeof r.get == "function" && typeof r.set == "function") {
			var i = r.get, a = r.set;
			return Object.defineProperty(e, t, {
				configurable: !0,
				get: function() {
					return i.call(this);
				},
				set: function(e) {
					n = "" + e, a.call(this, e);
				}
			}), Object.defineProperty(e, t, { enumerable: r.enumerable }), {
				getValue: function() {
					return n;
				},
				setValue: function(e) {
					n = "" + e;
				},
				stopTracking: function() {
					e._valueTracker = null, delete e[t];
				}
			};
		}
	}
	function sn(e) {
		if (!e._valueTracker) {
			var t = an(e) ? "checked" : "value";
			e._valueTracker = on(e, t, "" + e[t]);
		}
	}
	function cn(e) {
		if (!e) return !1;
		var t = e._valueTracker;
		if (!t) return !0;
		var n = t.getValue(), r = "";
		return e && (r = an(e) ? e.checked ? "true" : "false" : e.value), e = r, e !== n && (t.setValue(e), !0);
	}
	var ln = /[\n"\\]/g;
	function un(e) {
		return e.replace(ln, function(e) {
			return "\\" + e.charCodeAt(0).toString(16) + " ";
		});
	}
	function dn(e, t, n, r, i, a, o, s) {
		e.name = "", o != null && typeof o != "function" && typeof o != "symbol" && typeof o != "boolean" ? e.type = o : e.removeAttribute("type"), t == null ? o !== "submit" && o !== "reset" || e.removeAttribute("value") : o === "number" ? (t === 0 && e.value === "" || e.value != t) && (e.value = "" + rn(t)) : e.value !== "" + rn(t) && (e.value = "" + rn(t)), t == null ? n == null ? r != null && e.removeAttribute("value") : pn(e, rn(n)) : o === "number" && e.value == t ? pn(e, rn(e.value)) : pn(e, rn(t)), i == null && a != null && (e.defaultChecked = !!a), i != null && (e.checked = i && typeof i != "function" && typeof i != "symbol"), s != null && typeof s != "function" && typeof s != "symbol" && typeof s != "boolean" ? e.name = "" + rn(s) : e.removeAttribute("name");
	}
	function fn(e, t, n, r, i, a, o, s) {
		if (a != null && typeof a != "function" && typeof a != "symbol" && typeof a != "boolean" && (e.type = a), t != null || n != null) {
			if (!(a !== "submit" && a !== "reset" || t != null)) {
				sn(e);
				return;
			}
			n = n == null ? "" : "" + rn(n), t = t == null ? n : "" + rn(t), s || t === e.value || (e.value = t), e.defaultValue = t;
		}
		r ??= i, r = typeof r != "function" && typeof r != "symbol" && !!r, e.checked = s ? e.checked : !!r, e.defaultChecked = !!r, o != null && typeof o != "function" && typeof o != "symbol" && typeof o != "boolean" && (e.name = o), sn(e);
	}
	function pn(e, t) {
		e.defaultValue !== "" + t && (e.defaultValue = "" + t);
	}
	function mn(e, t, n, r) {
		if (e = e.options, t) {
			t = {};
			for (var i = 0; i < n.length; i++) t["$" + n[i]] = !0;
			for (n = 0; n < e.length; n++) i = t.hasOwnProperty("$" + e[n].value), e[n].selected !== i && (e[n].selected = i), i && r && (e[n].defaultSelected = !0);
		} else {
			for (n = "" + rn(n), t = null, i = 0; i < e.length; i++) {
				if (e[i].value === n) {
					e[i].selected = !0, r && (e[i].defaultSelected = !0);
					return;
				}
				t !== null || e[i].disabled || (t = e[i]);
			}
			t !== null && (t.selected = !0);
		}
	}
	function hn(e, t, n) {
		if (t != null && (t = "" + rn(t), t !== e.value && (e.value = t), n == null)) {
			e.defaultValue !== t && (e.defaultValue = t);
			return;
		}
		e.defaultValue = n == null ? "" : "" + rn(n);
	}
	function gn(e, t, n, r) {
		if (t == null) {
			if (r != null) {
				if (n != null) throw Error(i(92));
				if (Te(r)) {
					if (1 < r.length) throw Error(i(93));
					r = r[0];
				}
				n = r;
			}
			n ??= "", t = n;
		}
		n = rn(t), e.defaultValue = n, r = e.textContent, r === n && r !== "" && r !== null && (e.value = r), sn(e);
	}
	function _n(e, t) {
		if (t) {
			var n = e.firstChild;
			if (n && n === e.lastChild && n.nodeType === 3) {
				n.nodeValue = t;
				return;
			}
		}
		e.textContent = t;
	}
	var vn = new Set("animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(" "));
	function yn(e, t, n) {
		var r = t.indexOf("--") === 0;
		n == null || typeof n == "boolean" || n === "" ? r ? e.setProperty(t, "") : t === "float" ? e.cssFloat = "" : e[t] = "" : r ? e.setProperty(t, n) : typeof n != "number" || n === 0 || vn.has(t) ? t === "float" ? e.cssFloat = n : e[t] = ("" + n).trim() : e[t] = n + "px";
	}
	function bn(e, t, n) {
		if (t != null && typeof t != "object") throw Error(i(62));
		if (e = e.style, n != null) {
			for (var r in n) !n.hasOwnProperty(r) || t != null && t.hasOwnProperty(r) || (r.indexOf("--") === 0 ? e.setProperty(r, "") : r === "float" ? e.cssFloat = "" : e[r] = "", M = !0);
			for (var a in t) r = t[a], t.hasOwnProperty(a) && n[a] !== r && (yn(e, a, r), M = !0);
		} else for (var o in t) t.hasOwnProperty(o) && yn(e, o, t[o]);
	}
	function xn(e) {
		if (e.indexOf("-") === -1) return !1;
		switch (e) {
			case "annotation-xml":
			case "color-profile":
			case "font-face":
			case "font-face-src":
			case "font-face-uri":
			case "font-face-format":
			case "font-face-name":
			case "missing-glyph": return !1;
			default: return !0;
		}
	}
	var Sn = /* @__PURE__ */ new Map([
		["acceptCharset", "accept-charset"],
		["htmlFor", "for"],
		["httpEquiv", "http-equiv"],
		["crossOrigin", "crossorigin"],
		["accentHeight", "accent-height"],
		["alignmentBaseline", "alignment-baseline"],
		["arabicForm", "arabic-form"],
		["baselineShift", "baseline-shift"],
		["capHeight", "cap-height"],
		["clipPath", "clip-path"],
		["clipRule", "clip-rule"],
		["colorInterpolation", "color-interpolation"],
		["colorInterpolationFilters", "color-interpolation-filters"],
		["colorProfile", "color-profile"],
		["colorRendering", "color-rendering"],
		["dominantBaseline", "dominant-baseline"],
		["enableBackground", "enable-background"],
		["fillOpacity", "fill-opacity"],
		["fillRule", "fill-rule"],
		["floodColor", "flood-color"],
		["floodOpacity", "flood-opacity"],
		["fontFamily", "font-family"],
		["fontSize", "font-size"],
		["fontSizeAdjust", "font-size-adjust"],
		["fontStretch", "font-stretch"],
		["fontStyle", "font-style"],
		["fontVariant", "font-variant"],
		["fontWeight", "font-weight"],
		["glyphName", "glyph-name"],
		["glyphOrientationHorizontal", "glyph-orientation-horizontal"],
		["glyphOrientationVertical", "glyph-orientation-vertical"],
		["horizAdvX", "horiz-adv-x"],
		["horizOriginX", "horiz-origin-x"],
		["imageRendering", "image-rendering"],
		["letterSpacing", "letter-spacing"],
		["lightingColor", "lighting-color"],
		["markerEnd", "marker-end"],
		["markerMid", "marker-mid"],
		["markerStart", "marker-start"],
		["maskType", "mask-type"],
		["overlinePosition", "overline-position"],
		["overlineThickness", "overline-thickness"],
		["paintOrder", "paint-order"],
		["panose-1", "panose-1"],
		["pointerEvents", "pointer-events"],
		["renderingIntent", "rendering-intent"],
		["shapeRendering", "shape-rendering"],
		["stopColor", "stop-color"],
		["stopOpacity", "stop-opacity"],
		["strikethroughPosition", "strikethrough-position"],
		["strikethroughThickness", "strikethrough-thickness"],
		["strokeDasharray", "stroke-dasharray"],
		["strokeDashoffset", "stroke-dashoffset"],
		["strokeLinecap", "stroke-linecap"],
		["strokeLinejoin", "stroke-linejoin"],
		["strokeMiterlimit", "stroke-miterlimit"],
		["strokeOpacity", "stroke-opacity"],
		["strokeWidth", "stroke-width"],
		["textAnchor", "text-anchor"],
		["textDecoration", "text-decoration"],
		["textRendering", "text-rendering"],
		["transformOrigin", "transform-origin"],
		["underlinePosition", "underline-position"],
		["underlineThickness", "underline-thickness"],
		["unicodeBidi", "unicode-bidi"],
		["unicodeRange", "unicode-range"],
		["unitsPerEm", "units-per-em"],
		["vAlphabetic", "v-alphabetic"],
		["vHanging", "v-hanging"],
		["vIdeographic", "v-ideographic"],
		["vMathematical", "v-mathematical"],
		["vectorEffect", "vector-effect"],
		["vertAdvY", "vert-adv-y"],
		["vertOriginX", "vert-origin-x"],
		["vertOriginY", "vert-origin-y"],
		["wordSpacing", "word-spacing"],
		["writingMode", "writing-mode"],
		["xmlnsXlink", "xmlns:xlink"],
		["xHeight", "x-height"]
	]), Cn = /^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;
	function wn(e) {
		return Cn.test("" + e) ? "javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')" : e;
	}
	function Tn() {}
	var En = null;
	function Dn(e) {
		return e = e.target || e.srcElement || window, e.correspondingUseElement && (e = e.correspondingUseElement), e.nodeType === 3 ? e.parentNode : e;
	}
	var On = null, kn = null;
	function An(e) {
		var t = Bt(e);
		if (t && (e = t.stateNode)) {
			var n = e[At] || null;
			a: switch (e = t.stateNode, t.type) {
				case "input":
					if (dn(e, n.value, n.defaultValue, n.defaultValue, n.checked, n.defaultChecked, n.type, n.name), t = n.name, n.type === "radio" && t != null) {
						for (n = e; n.parentNode;) n = n.parentNode;
						for (n = n.querySelectorAll("input[name=\"" + un("" + t) + "\"][type=\"radio\"]"), t = 0; t < n.length; t++) {
							var r = n[t];
							if (r !== e && r.form === e.form) {
								var a = r[At] || null;
								if (!a) throw Error(i(90));
								dn(r, a.value, a.defaultValue, a.defaultValue, a.checked, a.defaultChecked, a.type, a.name);
							}
						}
						for (t = 0; t < n.length; t++) r = n[t], r.form === e.form && cn(r);
					}
					break a;
				case "textarea":
					hn(e, n.value, n.defaultValue);
					break a;
				case "select": t = n.value, t != null && mn(e, !!n.multiple, t, !1);
			}
		}
	}
	var jn = !1;
	function Mn(e, t, n) {
		if (jn) return e(t, n);
		jn = !0;
		try {
			return e(t);
		} finally {
			if (jn = !1, (On !== null || kn !== null) && (zd(), On && (t = On, e = kn, kn = On = null, An(t), e))) for (t = 0; t < e.length; t++) An(e[t]);
		}
	}
	function Nn(e, t) {
		var n = e.stateNode;
		if (n === null) return null;
		var r = n[At] || null;
		if (r === null) return null;
		n = r[t];
		a: switch (t) {
			case "onClick":
			case "onClickCapture":
			case "onDoubleClick":
			case "onDoubleClickCapture":
			case "onMouseDown":
			case "onMouseDownCapture":
			case "onMouseMove":
			case "onMouseMoveCapture":
			case "onMouseUp":
			case "onMouseUpCapture":
			case "onMouseEnter":
				(r = !r.disabled) || (e = e.type, r = e !== "button" && e !== "input" && e !== "select" && e !== "textarea"), e = !r;
				break a;
			default: e = !1;
		}
		if (e) return null;
		if (n && typeof n != "function") throw Error(i(231, t, typeof n));
		return n;
	}
	var Pn = typeof window < "u" && window.document !== void 0 && window.document.createElement !== void 0, Fn = !1;
	if (Pn) try {
		var In = {};
		Object.defineProperty(In, "passive", { get: function() {
			Fn = !0;
		} }), window.addEventListener("test", In, In), window.removeEventListener("test", In, In);
	} catch {
		Fn = !1;
	}
	var Ln = null, Rn = null, zn = null;
	function Bn() {
		if (zn) return zn;
		var e, t = Rn, n = t.length, r, i = "value" in Ln ? Ln.value : Ln.textContent, a = i.length;
		for (e = 0; e < n && t[e] === i[e]; e++);
		var o = n - e;
		for (r = 1; r <= o && t[n - r] === i[a - r]; r++);
		return zn = i.slice(e, 1 < r ? 1 - r : void 0);
	}
	function Vn(e) {
		var t = e.keyCode;
		return "charCode" in e ? (e = e.charCode, e === 0 && t === 13 && (e = 13)) : e = t, e === 10 && (e = 13), 32 <= e || e === 13 ? e : 0;
	}
	function Hn() {
		return !0;
	}
	function Un() {
		return !1;
	}
	function Wn(e) {
		function t(t, n, r, i, a) {
			for (var o in this._reactName = t, this._targetInst = r, this.type = n, this.nativeEvent = i, this.target = a, this.currentTarget = null, e) e.hasOwnProperty(o) && (t = e[o], this[o] = t ? t(i) : i[o]);
			return this.isDefaultPrevented = (i.defaultPrevented == null ? !1 === i.returnValue : i.defaultPrevented) ? Hn : Un, this.isPropagationStopped = Un, this;
		}
		return S(t.prototype, {
			preventDefault: function() {
				this.defaultPrevented = !0;
				var e = this.nativeEvent;
				e && (e.preventDefault ? e.preventDefault() : typeof e.returnValue != "unknown" && (e.returnValue = !1), this.isDefaultPrevented = Hn);
			},
			stopPropagation: function() {
				var e = this.nativeEvent;
				e && (e.stopPropagation ? e.stopPropagation() : typeof e.cancelBubble != "unknown" && (e.cancelBubble = !0), this.isPropagationStopped = Hn);
			},
			persist: function() {},
			isPersistent: Hn
		}), t;
	}
	var Gn = {
		eventPhase: 0,
		bubbles: 0,
		cancelable: 0,
		timeStamp: function(e) {
			return e.timeStamp || Date.now();
		},
		defaultPrevented: 0,
		isTrusted: 0
	}, Kn = Wn(Gn), qn = S({}, Gn, {
		view: 0,
		detail: 0
	}), Jn = Wn(qn), Yn, Xn, Zn, Qn = S({}, qn, {
		screenX: 0,
		screenY: 0,
		clientX: 0,
		clientY: 0,
		pageX: 0,
		pageY: 0,
		ctrlKey: 0,
		shiftKey: 0,
		altKey: 0,
		metaKey: 0,
		getModifierState: lr,
		button: 0,
		buttons: 0,
		relatedTarget: function(e) {
			return e.relatedTarget === void 0 ? e.fromElement === e.srcElement ? e.toElement : e.fromElement : e.relatedTarget;
		},
		movementX: function(e) {
			return "movementX" in e ? e.movementX : (e !== Zn && (Zn && e.type === "mousemove" ? (Yn = e.screenX - Zn.screenX, Xn = e.screenY - Zn.screenY) : Xn = Yn = 0, Zn = e), Yn);
		},
		movementY: function(e) {
			return "movementY" in e ? e.movementY : Xn;
		}
	}), $n = Wn(Qn), er = Wn(S({}, Qn, { dataTransfer: 0 })), tr = Wn(S({}, qn, { relatedTarget: 0 })), nr = Wn(S({}, Gn, {
		animationName: 0,
		elapsedTime: 0,
		pseudoElement: 0
	})), rr = Wn(S({}, Gn, { clipboardData: function(e) {
		return "clipboardData" in e ? e.clipboardData : window.clipboardData;
	} })), ir = Wn(S({}, Gn, { data: 0 })), ar = {
		Esc: "Escape",
		Spacebar: " ",
		Left: "ArrowLeft",
		Up: "ArrowUp",
		Right: "ArrowRight",
		Down: "ArrowDown",
		Del: "Delete",
		Win: "OS",
		Menu: "ContextMenu",
		Apps: "ContextMenu",
		Scroll: "ScrollLock",
		MozPrintableKey: "Unidentified"
	}, or = {
		8: "Backspace",
		9: "Tab",
		12: "Clear",
		13: "Enter",
		16: "Shift",
		17: "Control",
		18: "Alt",
		19: "Pause",
		20: "CapsLock",
		27: "Escape",
		32: " ",
		33: "PageUp",
		34: "PageDown",
		35: "End",
		36: "Home",
		37: "ArrowLeft",
		38: "ArrowUp",
		39: "ArrowRight",
		40: "ArrowDown",
		45: "Insert",
		46: "Delete",
		112: "F1",
		113: "F2",
		114: "F3",
		115: "F4",
		116: "F5",
		117: "F6",
		118: "F7",
		119: "F8",
		120: "F9",
		121: "F10",
		122: "F11",
		123: "F12",
		144: "NumLock",
		145: "ScrollLock",
		224: "Meta"
	}, sr = {
		Alt: "altKey",
		Control: "ctrlKey",
		Meta: "metaKey",
		Shift: "shiftKey"
	};
	function cr(e) {
		var t = this.nativeEvent;
		return t.getModifierState ? t.getModifierState(e) : (e = sr[e]) ? !!t[e] : !1;
	}
	function lr() {
		return cr;
	}
	var ur = Wn(S({}, qn, {
		key: function(e) {
			if (e.key) {
				var t = ar[e.key] || e.key;
				if (t !== "Unidentified") return t;
			}
			return e.type === "keypress" ? (e = Vn(e), e === 13 ? "Enter" : String.fromCharCode(e)) : e.type === "keydown" || e.type === "keyup" ? or[e.keyCode] || "Unidentified" : "";
		},
		code: 0,
		location: 0,
		ctrlKey: 0,
		shiftKey: 0,
		altKey: 0,
		metaKey: 0,
		repeat: 0,
		locale: 0,
		getModifierState: lr,
		charCode: function(e) {
			return e.type === "keypress" ? Vn(e) : 0;
		},
		keyCode: function(e) {
			return e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
		},
		which: function(e) {
			return e.type === "keypress" ? Vn(e) : e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
		}
	})), dr = Wn(S({}, Qn, {
		pointerId: 0,
		width: 0,
		height: 0,
		pressure: 0,
		tangentialPressure: 0,
		tiltX: 0,
		tiltY: 0,
		twist: 0,
		pointerType: 0,
		isPrimary: 0
	})), fr = Wn(S({}, Gn, { submitter: 0 })), pr = Wn(S({}, qn, {
		touches: 0,
		targetTouches: 0,
		changedTouches: 0,
		altKey: 0,
		metaKey: 0,
		ctrlKey: 0,
		shiftKey: 0,
		getModifierState: lr
	})), mr = Wn(S({}, Gn, {
		propertyName: 0,
		elapsedTime: 0,
		pseudoElement: 0
	})), hr = Wn(S({}, Qn, {
		deltaX: function(e) {
			return "deltaX" in e ? e.deltaX : "wheelDeltaX" in e ? -e.wheelDeltaX : 0;
		},
		deltaY: function(e) {
			return "deltaY" in e ? e.deltaY : "wheelDeltaY" in e ? -e.wheelDeltaY : "wheelDelta" in e ? -e.wheelDelta : 0;
		},
		deltaZ: 0,
		deltaMode: 0
	})), gr = Wn(S({}, Gn, {
		newState: 0,
		oldState: 0,
		source: 0
	})), _r = [
		9,
		13,
		27,
		32
	], vr = Pn && "CompositionEvent" in window, yr = null;
	Pn && "documentMode" in document && (yr = document.documentMode);
	var br = Pn && "TextEvent" in window && !yr, xr = Pn && (!vr || yr && 8 < yr && 11 >= yr), Sr = " ", Cr = !1;
	function wr(e, t) {
		switch (e) {
			case "keyup": return _r.indexOf(t.keyCode) !== -1;
			case "keydown": return t.keyCode !== 229;
			case "keypress":
			case "mousedown":
			case "focusout": return !0;
			default: return !1;
		}
	}
	function Tr(e) {
		return e = e.detail, typeof e == "object" && "data" in e ? e.data : null;
	}
	var Er = !1;
	function Dr(e, t) {
		switch (e) {
			case "compositionend": return Tr(t);
			case "keypress": return t.which === 32 ? (Cr = !0, Sr) : null;
			case "textInput": return e = t.data, e === Sr && Cr ? null : e;
			default: return null;
		}
	}
	function Or(e, t) {
		if (Er) return e === "compositionend" || !vr && wr(e, t) ? (e = Bn(), zn = Rn = Ln = null, Er = !1, e) : null;
		switch (e) {
			case "paste": return null;
			case "keypress":
				if (!(t.ctrlKey || t.altKey || t.metaKey) || t.ctrlKey && t.altKey) {
					if (t.char && 1 < t.char.length) return t.char;
					if (t.which) return String.fromCharCode(t.which);
				}
				return null;
			case "compositionend": return xr && t.locale !== "ko" ? null : t.data;
			default: return null;
		}
	}
	var kr = {
		color: !0,
		date: !0,
		datetime: !0,
		"datetime-local": !0,
		email: !0,
		month: !0,
		number: !0,
		password: !0,
		range: !0,
		search: !0,
		tel: !0,
		text: !0,
		time: !0,
		url: !0,
		week: !0
	};
	function Ar(e) {
		var t = e && e.nodeName && e.nodeName.toLowerCase();
		return t === "input" ? !!kr[e.type] : t === "textarea";
	}
	function jr(e, t, n, r) {
		On ? kn ? kn.push(r) : kn = [r] : On = r, t = Jf(t, "onChange"), 0 < t.length && (n = new Kn("onChange", "change", null, n, r), e.push({
			event: n,
			listeners: t
		}));
	}
	var Mr = null, Nr = null;
	function Pr(e) {
		Vf(e, 0);
	}
	function Fr(e) {
		if (cn(Vt(e))) return e;
	}
	function Ir(e, t) {
		if (e === "change") return t;
	}
	var Lr = !1;
	if (Pn) {
		var Rr;
		if (Pn) {
			var zr = "oninput" in document;
			if (!zr) {
				var Br = document.createElement("div");
				Br.setAttribute("oninput", "return;"), zr = typeof Br.oninput == "function";
			}
			Rr = zr;
		} else Rr = !1;
		Lr = Rr && (!document.documentMode || 9 < document.documentMode);
	}
	function Vr() {
		Mr && (Mr.detachEvent("onpropertychange", Hr), Nr = Mr = null);
	}
	function Hr(e) {
		if (e.propertyName === "value" && Fr(Nr)) {
			var t = [];
			jr(t, Nr, e, Dn(e)), Mn(Pr, t);
		}
	}
	function Ur(e, t, n) {
		e === "focusin" ? (Vr(), Mr = t, Nr = n, Mr.attachEvent("onpropertychange", Hr)) : e === "focusout" && Vr();
	}
	function Wr(e) {
		if (e === "selectionchange" || e === "keyup" || e === "keydown") return Fr(Nr);
	}
	function Gr(e, t) {
		if (e === "click") return Fr(t);
	}
	function Kr(e, t) {
		if (e === "input" || e === "change") return Fr(t);
	}
	function qr(e, t) {
		return e === t && (e !== 0 || 1 / e == 1 / t) || e !== e && t !== t;
	}
	var Jr = typeof Object.is == "function" ? Object.is : qr;
	function Yr(e, t) {
		if (Jr(e, t)) return !0;
		if (typeof e != "object" || !e || typeof t != "object" || !t) return !1;
		var n = Object.keys(e), r = Object.keys(t);
		if (n.length !== r.length) return !1;
		for (r = 0; r < n.length; r++) {
			var i = n[r];
			if (!Ke.call(t, i) || !Jr(e[i], t[i])) return !1;
		}
		return !0;
	}
	function Xr(e) {
		if (e ||= typeof document < "u" ? document : void 0, e === void 0) return null;
		try {
			return e.activeElement || e.body;
		} catch {
			return e.body;
		}
	}
	function Zr(e) {
		for (; e && e.firstChild;) e = e.firstChild;
		return e;
	}
	function Qr(e, t) {
		var n = Zr(e);
		e = 0;
		for (var r; n;) {
			if (n.nodeType === 3) {
				if (r = e + n.textContent.length, e <= t && r >= t) return {
					node: n,
					offset: t - e
				};
				e = r;
			}
			a: {
				for (; n;) {
					if (n.nextSibling) {
						n = n.nextSibling;
						break a;
					}
					n = n.parentNode;
				}
				n = void 0;
			}
			n = Zr(n);
		}
	}
	function $r(e, t) {
		return e && t ? e === t ? !0 : e && e.nodeType === 3 ? !1 : t && t.nodeType === 3 ? $r(e, t.parentNode) : "contains" in e ? e.contains(t) : e.compareDocumentPosition ? !!(e.compareDocumentPosition(t) & 16) : !1 : !1;
	}
	function ei(e) {
		e = e != null && e.ownerDocument != null && e.ownerDocument.defaultView != null ? e.ownerDocument.defaultView : window;
		for (var t = Xr(e.document); t instanceof e.HTMLIFrameElement;) {
			try {
				var n = typeof t.contentWindow.location.href == "string";
			} catch {
				n = !1;
			}
			if (n) e = t.contentWindow;
			else break;
			t = Xr(e.document);
		}
		return t;
	}
	function ti(e) {
		var t = e && e.nodeName && e.nodeName.toLowerCase();
		return t && (t === "input" && (e.type === "text" || e.type === "search" || e.type === "tel" || e.type === "url" || e.type === "password") || t === "textarea" || e.contentEditable === "true");
	}
	var ni = Pn && "documentMode" in document && 11 >= document.documentMode, ri = null, ii = null, ai = null, oi = !1;
	function si(e, t, n) {
		var r = n.window === n ? n.document : n.nodeType === 9 ? n : n.ownerDocument;
		oi || ri == null || ri !== Xr(r) || (r = ri, "selectionStart" in r && ti(r) ? r = {
			start: r.selectionStart,
			end: r.selectionEnd
		} : (r = (r.ownerDocument && r.ownerDocument.defaultView || window).getSelection(), r = {
			anchorNode: r.anchorNode,
			anchorOffset: r.anchorOffset,
			focusNode: r.focusNode,
			focusOffset: r.focusOffset
		}), ai && Yr(ai, r) || (ai = r, r = Jf(ii, "onSelect"), 0 < r.length && (t = new Kn("onSelect", "select", null, t, n), e.push({
			event: t,
			listeners: r
		}), t.target = ri)));
	}
	function ci(e, t) {
		var n = {};
		return n[e.toLowerCase()] = t.toLowerCase(), n["Webkit" + e] = "webkit" + t, n["Moz" + e] = "moz" + t, n;
	}
	var li = {
		animationend: ci("Animation", "AnimationEnd"),
		animationiteration: ci("Animation", "AnimationIteration"),
		animationstart: ci("Animation", "AnimationStart"),
		transitionrun: ci("Transition", "TransitionRun"),
		transitionstart: ci("Transition", "TransitionStart"),
		transitioncancel: ci("Transition", "TransitionCancel"),
		transitionend: ci("Transition", "TransitionEnd")
	}, ui = {}, di = {};
	Pn && (di = document.createElement("div").style, "AnimationEvent" in window || (delete li.animationend.animation, delete li.animationiteration.animation, delete li.animationstart.animation), "TransitionEvent" in window || delete li.transitionend.transition);
	function fi(e) {
		if (ui[e]) return ui[e];
		if (!li[e]) return e;
		var t = li[e], n;
		for (n in t) if (t.hasOwnProperty(n) && n in di) return ui[e] = t[n];
		return e;
	}
	var pi = fi("animationend"), mi = fi("animationiteration"), hi = fi("animationstart"), gi = fi("transitionrun"), _i = fi("transitionstart"), vi = fi("transitioncancel"), yi = fi("transitionend"), bi = /* @__PURE__ */ new Map(), xi = "abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error fullscreenChange fullscreenError gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");
	xi.push("scrollEnd");
	function Si(e, t) {
		bi.set(e, t), qt(t, [e]);
	}
	var Ci = 0;
	function wi(e, t) {
		if (e.name != null && e.name !== "auto") return e.name;
		if (t.autoName !== null) return t.autoName;
		e = bd.identifierPrefix;
		var n = Ci++;
		return e = "_" + e + "t_" + n.toString(32) + "_", t.autoName = e;
	}
	function Ti(e) {
		if (e == null || typeof e == "string") return e;
		var t = null, n = Od;
		if (n !== null) for (var r = 0; r < n.length; r++) {
			var i = e[n[r]];
			if (i != null) {
				if (i === "none") return "none";
				t = t == null ? i : t + (" " + i);
			}
		}
		return t ?? e.default;
	}
	function Ei(e, t) {
		return e = Ti(e), t = Ti(t), t == null ? e === "auto" ? null : e : t === "auto" ? null : t;
	}
	var Di = typeof reportError == "function" ? reportError : function(e) {
		if (typeof window == "object" && typeof window.ErrorEvent == "function") {
			var t = new window.ErrorEvent("error", {
				bubbles: !0,
				cancelable: !0,
				message: typeof e == "object" && e && typeof e.message == "string" ? String(e.message) : String(e),
				error: e
			});
			if (!window.dispatchEvent(t)) return;
		} else if (typeof process == "object" && typeof process.emit == "function") {
			process.emit("uncaughtException", e);
			return;
		}
		console.error(e);
	}, Oi = [], ki = 0, Ai = 0;
	function ji() {
		for (var e = ki, t = Ai = ki = 0; t < e;) {
			var n = Oi[t];
			Oi[t++] = null;
			var r = Oi[t];
			Oi[t++] = null;
			var i = Oi[t];
			Oi[t++] = null;
			var a = Oi[t];
			if (Oi[t++] = null, r !== null && i !== null) {
				var o = r.pending;
				o === null ? i.next = i : (i.next = o.next, o.next = i), r.pending = i;
			}
			a !== 0 && Fi(n, i, a);
		}
	}
	function Mi(e, t, n, r) {
		Oi[ki++] = e, Oi[ki++] = t, Oi[ki++] = n, Oi[ki++] = r, Ai |= r, e.lanes |= r, e = e.alternate, e !== null && (e.lanes |= r);
	}
	function Ni(e, t, n, r) {
		return Mi(e, t, n, r), Ii(e);
	}
	function Pi(e, t) {
		return Mi(e, null, null, t), Ii(e);
	}
	function Fi(e, t, n) {
		e.lanes |= n;
		var r = e.alternate;
		r !== null && (r.lanes |= n);
		for (var i = !1, a = e.return; a !== null;) a.childLanes |= n, r = a.alternate, r !== null && (r.childLanes |= n), a.tag === 22 && (e = a.stateNode, e === null || e._visibility & 1 || (i = !0)), e = a, a = a.return;
		return e.tag === 3 ? (a = e.stateNode, i && t !== null && (i = 31 - lt(n), e = a.hiddenUpdates, r = e[i], r === null ? e[i] = [t] : r.push(t), t.lane = n | 536870912), a) : null;
	}
	function Ii(e) {
		if (50 < kd) throw kd = 0, Ad = null, Error(i(185));
		for (var t = e.return; t !== null;) e = t, t = e.return;
		return e.tag === 3 ? e.stateNode : null;
	}
	var Li = {};
	function Ri(e, t, n, r) {
		this.tag = e, this.key = n, this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null, this.index = 0, this.refCleanup = this.ref = null, this.pendingProps = t, this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null, this.mode = r, this.subtreeFlags = this.flags = 0, this.deletions = null, this.childLanes = this.lanes = 0, this.alternate = null;
	}
	function zi(e, t, n, r) {
		return new Ri(e, t, n, r);
	}
	function Bi(e) {
		return e = e.prototype, !(!e || !e.isReactComponent);
	}
	function Vi(e, t) {
		var n = e.alternate;
		return n === null ? (n = zi(e.tag, t, e.key, e.mode), n.elementType = e.elementType, n.type = e.type, n.stateNode = e.stateNode, n.alternate = e, e.alternate = n) : (n.pendingProps = t, n.type = e.type, n.flags = 0, n.subtreeFlags = 0, n.deletions = null), n.flags = e.flags & 1206910976, n.childLanes = e.childLanes, n.lanes = e.lanes, n.child = e.child, n.memoizedProps = e.memoizedProps, n.memoizedState = e.memoizedState, n.updateQueue = e.updateQueue, t = e.dependencies, n.dependencies = t === null ? null : {
			lanes: t.lanes,
			firstContext: t.firstContext
		}, n.sibling = e.sibling, n.index = e.index, n.ref = e.ref, n.refCleanup = e.refCleanup, n;
	}
	function Hi(e, t) {
		e.flags &= 1206910978;
		var n = e.alternate;
		return n === null ? (e.childLanes = 0, e.lanes = t, e.child = null, e.subtreeFlags = 0, e.memoizedProps = null, e.memoizedState = null, e.updateQueue = null, e.dependencies = null, e.stateNode = null) : (e.childLanes = n.childLanes, e.lanes = n.lanes, e.child = n.child, e.subtreeFlags = 0, e.deletions = null, e.memoizedProps = n.memoizedProps, e.memoizedState = n.memoizedState, e.updateQueue = n.updateQueue, e.type = n.type, t = n.dependencies, e.dependencies = t === null ? null : {
			lanes: t.lanes,
			firstContext: t.firstContext
		}), e;
	}
	function Ui(e, t, n, r, a, o) {
		var s = 0;
		if (r = e, typeof r == "function") Bi(r) && (s = 1);
		else if (typeof r == "string") s = qm(e, n, je.current) ? 26 : e === "html" || e === "head" || e === "body" ? 27 : 5;
		else a: switch (r) {
			case ge: return e = zi(31, n, t, a), e.elementType = ge, e.lanes = o, e;
			case se: return Wi(n.children, a, o, t);
			case w:
				s = 8, a |= 24;
				break;
			case ce: return e = zi(12, n, t, a | 2), e.elementType = ce, e.lanes = o, e;
			case fe: return e = zi(13, n, t, a), e.elementType = fe, e.lanes = o, e;
			case pe: return e = zi(19, n, t, a), e.elementType = pe, e.lanes = o, e;
			case _e:
			case ye: return e = a | 32, e = zi(30, n, t, e), e.elementType = ye, e.lanes = o, e.stateNode = {
				autoName: null,
				paired: null,
				clones: null,
				ref: null
			}, e;
			default:
				if (typeof r == "object" && r) switch (r.$$typeof) {
					case ue:
						s = 10;
						break a;
					case le:
						s = 9;
						break a;
					case de:
						s = 11;
						break a;
					case me:
						s = 14;
						break a;
					case he:
						s = 16, r = null;
						break a;
				}
				s = 29, n = Error(i(130, e === null ? "null" : typeof e, "")), r = null;
		}
		return t = zi(s, n, t, a), t.elementType = e, t.type = r, t.lanes = o, t;
	}
	function Wi(e, t, n, r) {
		return e = zi(7, e, r, t), e.lanes = n, e;
	}
	function Gi(e, t, n) {
		return e = zi(6, e, null, t), e.lanes = n, e;
	}
	function Ki(e) {
		var t = zi(18, null, null, 0);
		return t.stateNode = e, t;
	}
	function qi(e, t, n) {
		return t = zi(4, e.children === null ? [] : e.children, e.key, t), t.lanes = n, t.stateNode = {
			containerInfo: e.containerInfo,
			pendingChildren: null,
			implementation: e.implementation
		}, t;
	}
	var Ji = /* @__PURE__ */ new WeakMap();
	function Yi(e, t) {
		if (typeof e == "object" && e) {
			var n = Ji.get(e);
			return n === void 0 ? (t = {
				value: e,
				source: t,
				stack: Ge(t)
			}, Ji.set(e, t), t) : n;
		}
		return {
			value: e,
			source: t,
			stack: Ge(t)
		};
	}
	var Xi = [], Zi = 0, Qi = null, $i = 0, ea = [], ta = 0, na = null, ra = 1, ia = "";
	function aa(e, t) {
		Xi[Zi++] = $i, Xi[Zi++] = Qi, Qi = e, $i = t;
	}
	function oa(e, t, n) {
		ea[ta++] = ra, ea[ta++] = ia, ea[ta++] = na, na = e;
		var r = ra;
		e = ia;
		var i = 32 - lt(r) - 1;
		r &= ~(1 << i), n += 1;
		var a = 32 - lt(t) + i;
		if (30 < a) {
			var o = i - i % 5;
			a = (r & (1 << o) - 1).toString(32), r >>= o, i -= o, ra = 1 << 32 - lt(t) + i | n << i | r, ia = a + e;
		} else ra = 1 << a | n << i | r, ia = e;
	}
	function sa(e) {
		e.return !== null && (aa(e, 1), oa(e, 1, 0));
	}
	function ca(e) {
		for (; e === Qi;) Qi = Xi[--Zi], Xi[Zi] = null, $i = Xi[--Zi], Xi[Zi] = null;
		for (; e === na;) na = ea[--ta], ea[ta] = null, ia = ea[--ta], ea[ta] = null, ra = ea[--ta], ea[ta] = null;
	}
	function la(e, t) {
		ea[ta++] = ra, ea[ta++] = ia, ea[ta++] = na, ra = t.id, ia = t.overflow, na = e;
	}
	var ua = null, N = null, P = !1, da = null, fa = !1, pa = Error(i(519));
	function ma(e) {
		throw ba(Yi(Error(i(418, 1 < arguments.length && arguments[1] !== void 0 && arguments[1] ? "text" : "HTML", "")), e)), pa;
	}
	function ha(e) {
		var t = e.stateNode, n = e.type, r = e.memoizedProps;
		switch (t[j] = e, t[At] = r, n) {
			case "dialog":
				Q("cancel", t), Q("close", t);
				break;
			case "iframe":
			case "object":
			case "embed":
				Q("load", t);
				break;
			case "video":
			case "audio":
				for (n = 0; n < zf.length; n++) Q(zf[n], t);
				break;
			case "source":
				Q("error", t);
				break;
			case "img":
			case "image":
			case "link":
				Q("error", t), Q("load", t);
				break;
			case "details":
				Q("toggle", t);
				break;
			case "input":
				Q("invalid", t), fn(t, r.value, r.defaultValue, r.checked, r.defaultChecked, r.type, r.name, !0);
				break;
			case "select":
				Q("invalid", t);
				break;
			case "textarea": Q("invalid", t), gn(t, r.value, r.defaultValue, r.children);
		}
		n = r.children, typeof n != "string" && typeof n != "number" && typeof n != "bigint" || t.textContent === "" + n || !0 === r.suppressHydrationWarning || ep(t.textContent, n) ? (r.popover != null && (Q("beforetoggle", t), Q("toggle", t)), r.onScroll != null && Q("scroll", t), r.onScrollEnd != null && Q("scrollend", t), r.onClick != null && (t.onclick = Tn), t = !0) : t = !1, t || ma(e, !0);
	}
	function ga(e) {
		for (ua = e.return; ua;) switch (ua.tag) {
			case 5:
			case 31:
			case 13:
				fa = !1;
				return;
			case 27:
			case 3:
				fa = !0;
				return;
			default: ua = ua.return;
		}
	}
	function _a(e) {
		if (e !== ua) return !1;
		if (!P) return ga(e), P = !0, !1;
		var t = e.tag, n;
		if ((n = t !== 3 && t !== 27) && ((n = t === 5) && (n = e.type, n = n === "form" || n === "button" || pp(e.type, e.memoizedProps)), n = !n), n && N && ma(e), ga(e), t === 13) {
			if (e = e.memoizedState, e = e === null ? null : e.dehydrated, !e) throw Error(i(317));
			N = dm(e);
		} else if (t === 31) {
			if (e = e.memoizedState, e = e === null ? null : e.dehydrated, !e) throw Error(i(317));
			N = dm(e);
		} else t === 27 ? (t = N, Sp(e.type) ? (e = um, um = null, N = e) : N = t) : N = ua ? lm(e.stateNode.nextSibling) : null;
		return !0;
	}
	function va() {
		N = ua = null, P = !1;
	}
	function ya() {
		var e = da;
		return e !== null && (pd === null ? pd = e : pd.push.apply(pd, e), da = null), e;
	}
	function ba(e) {
		da === null ? da = [e] : da.push(e);
	}
	var xa = ke(null), Sa = null, Ca = null;
	function wa(e, t, n) {
		D(xa, t._currentValue), t._currentValue = n;
	}
	function Ta(e) {
		e._currentValue = xa.current, Ae(xa);
	}
	function Ea(e, t, n) {
		for (; e !== null;) {
			var r = e.alternate;
			if ((e.childLanes & t) === t ? r !== null && (r.childLanes & t) !== t && (r.childLanes |= t) : (e.childLanes |= t, r !== null && (r.childLanes |= t)), e === n) break;
			e = e.return;
		}
	}
	function Da(e, t, n, r) {
		var a = e.child;
		for (a !== null && (a.return = e); a !== null;) {
			var o = a.dependencies;
			if (o !== null) {
				var s = a.child;
				o = o.firstContext;
				a: for (; o !== null;) {
					var c = o;
					o = a;
					for (var l = 0; l < t.length; l++) if (c.context === t[l]) {
						o.lanes |= n, c = o.alternate, c !== null && (c.lanes |= n), Ea(o.return, n, e), r || (s = null);
						break a;
					}
					o = c.next;
				}
			} else if (a.tag === 18) {
				if (s = a.return, s === null) throw Error(i(341));
				s.lanes |= n, o = s.alternate, o !== null && (o.lanes |= n), Ea(s, n, e), s = null;
			} else a.tag === 13 && a.memoizedState !== null && a.memoizedState.dehydrated === null ? (a.lanes |= n, s = a.alternate, s !== null && (s.lanes |= n), Ea(a.return, n, e), s = a.child, s = s === null ? null : s.sibling) : s = a.child;
			if (s !== null) s.return = a;
			else for (s = a; s !== null;) {
				if (s === e) {
					s = null;
					break;
				}
				if (a = s.sibling, a !== null) {
					a.return = s.return, s = a;
					break;
				}
				s = s.return;
			}
			a = s;
		}
	}
	function Oa(e, t, n, r) {
		e = null;
		for (var a = t, o = !1; a !== null;) {
			if (!o) {
				if (a.flags & 524288) o = !0;
				else if (a.flags & 262144) break;
			}
			if (a.tag === 10) {
				var s = a.alternate;
				if (s === null) throw Error(i(387));
				if (s = s.memoizedProps, s !== null) {
					var c = a.type;
					Jr(a.pendingProps.value, s.value) || (e === null ? e = [c] : e.push(c));
				}
			} else if (a === Pe.current) {
				if (s = a.alternate, s === null) throw Error(i(387));
				s.memoizedState.memoizedState !== a.memoizedState.memoizedState && (e === null ? e = [sh] : e.push(sh));
			}
			a = a.return;
		}
		return e !== null && Da(t, e, n, r), t.flags |= 262144, e !== null;
	}
	function ka(e) {
		for (e = e.firstContext; e !== null;) {
			if (!Jr(e.context._currentValue, e.memoizedValue)) return !0;
			e = e.next;
		}
		return !1;
	}
	function Aa(e) {
		Sa = e, Ca = null, e = e.dependencies, e !== null && (e.firstContext = null);
	}
	function ja(e) {
		return Na(Sa, e);
	}
	function Ma(e, t) {
		return Sa === null && Aa(e), Na(e, t);
	}
	function Na(e, t) {
		var n = t._currentValue;
		if (t = {
			context: t,
			memoizedValue: n,
			next: null
		}, Ca === null) {
			if (e === null) throw Error(i(308));
			Ca = t, e.dependencies = {
				lanes: 0,
				firstContext: t
			}, e.flags |= 524288;
		} else Ca = Ca.next = t;
		return n;
	}
	var Pa = typeof AbortController < "u" ? AbortController : function() {
		var e = [], t = this.signal = {
			aborted: !1,
			addEventListener: function(t, n) {
				e.push(n);
			}
		};
		this.abort = function() {
			t.aborted = !0, e.forEach(function(e) {
				return e();
			});
		};
	}, Fa = t.unstable_scheduleCallback, Ia = t.unstable_NormalPriority, F = {
		$$typeof: ue,
		Consumer: null,
		Provider: null,
		_currentValue: null,
		_currentValue2: null,
		_threadCount: 0
	};
	function La() {
		return {
			controller: new Pa(),
			data: /* @__PURE__ */ new Map(),
			refCount: 0
		};
	}
	function Ra(e) {
		e.refCount--, e.refCount === 0 && Fa(Ia, function() {
			e.controller.abort();
		});
	}
	function za(e, t) {
		if (e.pendingLanes & 4194048) {
			var n = e.transitionTypes;
			for (n === null && (n = e.transitionTypes = []), e = 0; e < t.length; e++) {
				var r = t[e];
				n.indexOf(r) === -1 && n.push(r);
			}
		}
	}
	var Ba = null;
	function Va(e) {
		var t = e.transitionTypes;
		return e.transitionTypes = null, t;
	}
	var Ha = null, Ua = 0, Wa = 0, Ga = null;
	function Ka(e, t) {
		if (Ha === null) {
			var n = Ha = [];
			Ua = 0, Wa = Pf(), Ga = {
				status: "pending",
				value: void 0,
				then: function(e) {
					n.push(e);
				}
			};
		}
		return Ua++, t.then(qa, qa), t;
	}
	function qa() {
		if (--Ua === 0 && (Ba = null, Ha !== null)) {
			Ga !== null && (Ga.status = "fulfilled");
			var e = Ha;
			Ha = null, Wa = 0, Ga = null;
			for (var t = 0; t < e.length; t++) (0, e[t])();
		}
	}
	function Ja(e, t) {
		var n = [], r = {
			status: "pending",
			value: null,
			reason: null,
			then: function(e) {
				n.push(e);
			}
		};
		return e.then(function() {
			r.status = "fulfilled", r.value = t;
			for (var e = 0; e < n.length; e++) (0, n[e])(t);
		}, function(e) {
			for (r.status = "rejected", r.reason = e, e = 0; e < n.length; e++) (0, n[e])(void 0);
		}), r;
	}
	var Ya = T.S;
	T.S = function(e, t) {
		if (gd = Ze(), typeof t == "object" && t && typeof t.then == "function" && Ka(e, t), Ba !== null) for (var n = bf; n !== null;) za(n, Ba), n = n.next;
		if (n = e.types, n !== null) {
			for (var r = bf; r !== null;) za(r, n), r = r.next;
			if (Wa !== 0) {
				r = Ba, r === null && (r = Ba = []);
				for (var i = 0; i < n.length; i++) {
					var a = n[i];
					r.indexOf(a) === -1 && r.push(a);
				}
			}
		}
		Ya !== null && Ya(e, t);
	};
	var Xa = ke(null);
	function Za() {
		var e = Xa.current;
		return e === null ? G.pooledCache : e;
	}
	function Qa(e, t) {
		t === null ? D(Xa, Xa.current) : D(Xa, t.pool);
	}
	function $a() {
		var e = Za();
		return e === null ? null : {
			parent: F._currentValue,
			pool: e
		};
	}
	var eo = Error(i(460)), to = Error(i(474)), no = Error(i(542)), ro = { then: function() {} };
	function io(e) {
		return e = e.status, e === "fulfilled" || e === "rejected";
	}
	function ao(e, t, n) {
		switch (n = e[n], n === void 0 ? e.push(t) : n !== t && (t.then(Tn, Tn), t = n), t.status) {
			case "fulfilled": return t.value;
			case "rejected": throw e = t.reason, lo(e), e === void 0 && !("reason" in t) ? Error(i(600)) : e;
			default:
				if (typeof t.status == "string") t.then(Tn, Tn);
				else {
					if (e = G, e !== null && 100 < e.shellSuspendCounter) throw Error(i(482));
					e = t, e.status = "pending", e.then(function(e) {
						if (t.status === "pending") {
							var n = t;
							n.status = "fulfilled", n.value = e;
						}
					}, function(e) {
						if (t.status === "pending") {
							var n = t;
							n.status = "rejected", n.reason = e;
						}
					});
				}
				switch (t.status) {
					case "fulfilled": return t.value;
					case "rejected": throw e = t.reason, lo(e), e;
				}
				throw so = t, eo;
		}
	}
	function oo(e) {
		try {
			var t = e._init;
			return t(e._payload);
		} catch (e) {
			throw typeof e == "object" && e && typeof e.then == "function" ? (so = e, eo) : e;
		}
	}
	var so = null;
	function co() {
		if (so === null) throw Error(i(459));
		var e = so;
		return so = null, e;
	}
	function lo(e) {
		if (e === eo || e === no) throw Error(i(483));
	}
	var uo = null, fo = 0;
	function po(e) {
		var t = fo;
		return fo += 1, uo === null && (uo = []), ao(uo, e, t);
	}
	function mo(e, t) {
		t = t.props.ref, e.ref = t === void 0 ? null : t;
	}
	function ho(e, t) {
		throw t.$$typeof === C ? Error(i(525)) : (e = Object.prototype.toString.call(t), Error(i(31, e === "[object Object]" ? "object with keys {" + Object.keys(t).join(", ") + "}" : e)));
	}
	function go(e) {
		function t(t, n) {
			if (e) {
				var r = t.deletions;
				r === null ? (t.deletions = [n], t.flags |= 16) : r.push(n);
			}
		}
		function n(n, r) {
			if (!e) return null;
			for (; r !== null;) t(n, r), r = r.sibling;
			return null;
		}
		function r(e) {
			for (var t = /* @__PURE__ */ new Map(); e !== null;) e.key === null ? t.set(e.index, e) : t.set(e.key, e), e = e.sibling;
			return t;
		}
		function a(e, t) {
			return e = Vi(e, t), e.index = 0, e.sibling = null, e;
		}
		function o(t, n, r) {
			return t.index = r, e ? (r = t.alternate, r === null ? (t.flags |= 134217730, n) : (r = r.index, r < n ? (t.flags |= 2, n) : r)) : (t.flags |= 1048576, n);
		}
		function s(t) {
			return e && t.alternate === null && (t.flags |= 134217730), t;
		}
		function c(e, t, n, r) {
			return t === null || t.tag !== 6 ? (t = Gi(n, e.mode, r), t.return = e, t) : (t = a(t, n), t.return = e, t);
		}
		function l(e, t, n, r) {
			var i = n.type;
			return i === se ? (e = d(e, t, n.props.children, r, n.key), mo(e, n), e) : t !== null && (t.elementType === i || typeof i == "object" && i && i.$$typeof === he && oo(i) === t.type) ? (t = a(t, n.props), mo(t, n), t.return = e, t) : (t = Ui(n.type, n.key, n.props, null, e.mode, r), mo(t, n), t.return = e, t);
		}
		function u(e, t, n, r) {
			return t === null || t.tag !== 4 || t.stateNode.containerInfo !== n.containerInfo || t.stateNode.implementation !== n.implementation ? (t = qi(n, e.mode, r), t.return = e, t) : (t = a(t, n.children || []), t.return = e, t);
		}
		function d(e, t, n, r, i) {
			return t === null || t.tag !== 7 ? (t = Wi(n, e.mode, r, i), t.return = e, t) : (t = a(t, n), t.return = e, t);
		}
		function f(e, t, n) {
			if (typeof t == "string" && t !== "" || typeof t == "number" || typeof t == "bigint") return t = Gi("" + t, e.mode, n), t.return = e, t;
			if (typeof t == "object" && t) {
				switch (t.$$typeof) {
					case ae: return n = Ui(t.type, t.key, t.props, null, e.mode, n), mo(n, t), n.return = e, n;
					case oe: return t = qi(t, e.mode, n), t.return = e, t;
					case he: return t = oo(t), f(e, t, n);
				}
				if (Te(t) || Se(t)) return t = Wi(t, e.mode, n, null), t.return = e, t;
				if (typeof t.then == "function") return f(e, po(t), n);
				if (t.$$typeof === ue) return f(e, Ma(e, t), n);
				ho(e, t);
			}
			return null;
		}
		function p(e, t, n, r) {
			var i = t === null ? null : t.key;
			if (typeof n == "string" && n !== "" || typeof n == "number" || typeof n == "bigint") return i === null ? c(e, t, "" + n, r) : null;
			if (typeof n == "object" && n) {
				switch (n.$$typeof) {
					case ae: return n.key === i ? l(e, t, n, r) : null;
					case oe: return n.key === i ? u(e, t, n, r) : null;
					case he: return n = oo(n), p(e, t, n, r);
				}
				if (Te(n) || Se(n)) return i === null ? d(e, t, n, r, null) : null;
				if (typeof n.then == "function") return p(e, t, po(n), r);
				if (n.$$typeof === ue) return p(e, t, Ma(e, n), r);
				ho(e, n);
			}
			return null;
		}
		function m(e, t, n, r, i) {
			if (typeof r == "string" && r !== "" || typeof r == "number" || typeof r == "bigint") return e = e.get(n) || null, c(t, e, "" + r, i);
			if (typeof r == "object" && r) {
				switch (r.$$typeof) {
					case ae: return e = e.get(r.key === null ? n : r.key) || null, l(t, e, r, i);
					case oe: return e = e.get(r.key === null ? n : r.key) || null, u(t, e, r, i);
					case he: return r = oo(r), m(e, t, n, r, i);
				}
				if (Te(r) || Se(r)) return e = e.get(n) || null, d(t, e, r, i, null);
				if (typeof r.then == "function") return m(e, t, n, po(r), i);
				if (r.$$typeof === ue) return m(e, t, n, Ma(t, r), i);
				ho(t, r);
			}
			return null;
		}
		function h(i, a, s, c) {
			for (var l = null, u = null, d = a, h = a = 0, g = null; d !== null && h < s.length; h++) {
				d.index > h ? (g = d, d = null) : g = d.sibling;
				var _ = p(i, d, s[h], c);
				if (_ === null) {
					d === null && (d = g);
					break;
				}
				e && d && _.alternate === null && t(i, d), a = o(_, a, h), u === null ? l = _ : u.sibling = _, u = _, d = g;
			}
			if (h === s.length) return n(i, d), P && aa(i, h), l;
			if (d === null) {
				for (; h < s.length; h++) d = f(i, s[h], c), d !== null && (a = o(d, a, h), u === null ? l = d : u.sibling = d, u = d);
				return P && aa(i, h), l;
			}
			for (d = r(d); h < s.length; h++) g = m(d, i, h, s[h], c), g !== null && (e && (_ = g.alternate, _ !== null && d.delete(_.key === null ? h : _.key)), a = o(g, a, h), u === null ? l = g : u.sibling = g, u = g);
			return e && d.forEach(function(e) {
				return t(i, e);
			}), P && aa(i, h), l;
		}
		function g(a, s, c, l) {
			if (c == null) throw Error(i(151));
			for (var u = null, d = null, h = s, g = s = 0, _ = null, v = c.next(); h !== null && !v.done; g++, v = c.next()) {
				h.index > g ? (_ = h, h = null) : _ = h.sibling;
				var y = p(a, h, v.value, l);
				if (y === null) {
					h === null && (h = _);
					break;
				}
				e && h && y.alternate === null && t(a, h), s = o(y, s, g), d === null ? u = y : d.sibling = y, d = y, h = _;
			}
			if (v.done) return n(a, h), P && aa(a, g), u;
			if (h === null) {
				for (; !v.done; g++, v = c.next()) v = f(a, v.value, l), v !== null && (s = o(v, s, g), d === null ? u = v : d.sibling = v, d = v);
				return P && aa(a, g), u;
			}
			for (h = r(h); !v.done; g++, v = c.next()) v = m(h, a, g, v.value, l), v !== null && (e && (_ = v.alternate, _ !== null && h.delete(_.key === null ? g : _.key)), s = o(v, s, g), d === null ? u = v : d.sibling = v, d = v);
			return e && h.forEach(function(e) {
				return t(a, e);
			}), P && aa(a, g), u;
		}
		function _(e, r, o, c) {
			if (typeof o == "object" && o && o.type === se && o.key === null && o.props.ref === void 0 && (o = o.props.children), typeof o == "object" && o) {
				switch (o.$$typeof) {
					case ae:
						a: {
							for (var l = o.key; r !== null;) {
								if (r.key === l) {
									if (l = o.type, l === se) {
										if (r.tag === 7) {
											n(e, r.sibling), c = a(r, o.props.children), mo(c, o), c.return = e, e = c;
											break a;
										}
									} else if (r.elementType === l || typeof l == "object" && l && l.$$typeof === he && oo(l) === r.type) {
										n(e, r.sibling), c = a(r, o.props), mo(c, o), c.return = e, e = c;
										break a;
									}
									n(e, r);
									break;
								}
								t(e, r), r = r.sibling;
							}
							o.type === se ? (c = Wi(o.props.children, e.mode, c, o.key), mo(c, o), c.return = e, e = c) : (c = Ui(o.type, o.key, o.props, null, e.mode, c), mo(c, o), c.return = e, e = c);
						}
						return s(e);
					case oe:
						a: {
							for (l = o.key; r !== null;) {
								if (r.key === l) {
									if (r.tag === 4 && r.stateNode.containerInfo === o.containerInfo && r.stateNode.implementation === o.implementation) {
										n(e, r.sibling), c = a(r, o.children || []), c.return = e, e = c;
										break a;
									}
									n(e, r);
									break;
								}
								t(e, r), r = r.sibling;
							}
							c = qi(o, e.mode, c), c.return = e, e = c;
						}
						return s(e);
					case he: return o = oo(o), _(e, r, o, c);
				}
				if (Te(o)) return h(e, r, o, c);
				if (Se(o)) {
					if (l = Se(o), typeof l != "function") throw Error(i(150));
					return o = l.call(o), g(e, r, o, c);
				}
				if (typeof o.then == "function") return _(e, r, po(o), c);
				if (o.$$typeof === ue) return _(e, r, Ma(e, o), c);
				ho(e, o);
			}
			return typeof o == "string" && o !== "" || typeof o == "number" || typeof o == "bigint" ? (o = "" + o, r !== null && r.tag === 6 ? (n(e, r.sibling), c = a(r, o), c.return = e, e = c) : (n(e, r), c = Gi(o, e.mode, c), c.return = e, e = c), s(e)) : n(e, r);
		}
		return function(e, t, n, r) {
			try {
				fo = 0;
				var i = _(e, t, n, r);
				return uo = null, i;
			} catch (t) {
				if (t === eo || t === no) throw t;
				var a = zi(29, t, null, e.mode);
				return a.lanes = r, a.return = e, a;
			}
		};
	}
	var _o = go(!0), vo = go(!1), yo = !1;
	function bo(e) {
		e.updateQueue = {
			baseState: e.memoizedState,
			firstBaseUpdate: null,
			lastBaseUpdate: null,
			shared: {
				pending: null,
				lanes: 0,
				hiddenCallbacks: null
			},
			callbacks: null
		};
	}
	function xo(e, t) {
		e = e.updateQueue, t.updateQueue === e && (t.updateQueue = {
			baseState: e.baseState,
			firstBaseUpdate: e.firstBaseUpdate,
			lastBaseUpdate: e.lastBaseUpdate,
			shared: e.shared,
			callbacks: null
		});
	}
	function So(e) {
		return {
			lane: e,
			tag: 0,
			payload: null,
			callback: null,
			next: null
		};
	}
	function Co(e, t, n) {
		var r = e.updateQueue;
		if (r === null) return null;
		if (r = r.shared, W & 2) {
			var i = r.pending;
			return i === null ? t.next = t : (t.next = i.next, i.next = t), r.pending = t, t = Ii(e), Fi(e, null, n), t;
		}
		return Mi(e, r, t, n), Ii(e);
	}
	function wo(e, t, n) {
		if (t = t.updateQueue, t !== null && (t = t.shared, n & 4194048)) {
			var r = t.lanes;
			r &= e.pendingLanes, n |= r, t.lanes = n, wt(e, n);
		}
	}
	function To(e, t) {
		var n = e.updateQueue, r = e.alternate;
		if (r !== null && (r = r.updateQueue, n === r)) {
			var i = null, a = null;
			if (n = n.firstBaseUpdate, n !== null) {
				do {
					var o = {
						lane: n.lane,
						tag: n.tag,
						payload: n.payload,
						callback: null,
						next: null
					};
					a === null ? i = a = o : a = a.next = o, n = n.next;
				} while (n !== null);
				a === null ? i = a = t : a = a.next = t;
			} else i = a = t;
			n = {
				baseState: r.baseState,
				firstBaseUpdate: i,
				lastBaseUpdate: a,
				shared: r.shared,
				callbacks: r.callbacks
			}, e.updateQueue = n;
			return;
		}
		e = n.lastBaseUpdate, e === null ? n.firstBaseUpdate = t : e.next = t, n.lastBaseUpdate = t;
	}
	var Eo = !1;
	function Do() {
		if (Eo) {
			var e = Ga;
			if (e !== null) throw e;
		}
	}
	function Oo(e, t, n, r) {
		Eo = !1;
		var i = e.updateQueue;
		yo = !1;
		var a = i.firstBaseUpdate, o = i.lastBaseUpdate, s = i.shared.pending;
		if (s !== null) {
			i.shared.pending = null;
			var c = s, l = c.next;
			c.next = null, o === null ? a = l : o.next = l, o = c;
			var u = e.alternate;
			u !== null && (u = u.updateQueue, s = u.lastBaseUpdate, s !== o && (s === null ? u.firstBaseUpdate = l : s.next = l, u.lastBaseUpdate = c));
		}
		if (a !== null) {
			var d = i.baseState;
			o = 0, u = l = c = null, s = a;
			do {
				var f = s.lane & -536870913, p = f !== s.lane;
				if (p ? (q & f) === f : (r & f) === f) {
					f !== 0 && f === Wa && (Eo = !0), u !== null && (u = u.next = {
						lane: 0,
						tag: s.tag,
						payload: s.payload,
						callback: null,
						next: null
					});
					a: {
						var m = e, h = s;
						f = t;
						var g = n;
						switch (h.tag) {
							case 1:
								if (m = h.payload, typeof m == "function") {
									d = m.call(g, d, f);
									break a;
								}
								d = m;
								break a;
							case 3: m.flags = m.flags & -65537 | 128;
							case 0:
								if (m = h.payload, f = typeof m == "function" ? m.call(g, d, f) : m, f == null) break a;
								d = S({}, d, f);
								break a;
							case 2: yo = !0;
						}
					}
					f = s.callback, f !== null && (e.flags |= 64, p && (e.flags |= 8192), p = i.callbacks, p === null ? i.callbacks = [f] : p.push(f));
				} else p = {
					lane: f,
					tag: s.tag,
					payload: s.payload,
					callback: s.callback,
					next: null
				}, u === null ? (l = u = p, c = d) : u = u.next = p, o |= f;
				if (s = s.next, s === null) {
					if (s = i.shared.pending, s === null) break;
					p = s, s = p.next, p.next = null, i.lastBaseUpdate = p, i.shared.pending = null;
				}
			} while (1);
			u === null && (c = d), i.baseState = c, i.firstBaseUpdate = l, i.lastBaseUpdate = u, a === null && (i.shared.lanes = 0), sd |= o, e.lanes = o, e.memoizedState = d;
		}
	}
	function ko(e, t) {
		if (typeof e != "function") throw Error(i(191, e));
		e.call(t);
	}
	function Ao(e, t) {
		var n = e.callbacks;
		if (n !== null) for (e.callbacks = null, e = 0; e < n.length; e++) ko(n[e], t);
	}
	var jo = ke(null), Mo = ke(0);
	function No(e, t) {
		e = od, D(Mo, e), D(jo, t), od = e | t.baseLanes;
	}
	function Po() {
		D(Mo, od), D(jo, jo.current);
	}
	function Fo() {
		od = Mo.current, Ae(jo), Ae(Mo);
	}
	var Io = ke(null), Lo = null;
	function Ro(e) {
		var t = e.alternate;
		D(Uo, Uo.current & 1), D(Io, e), Lo === null && (t === null || jo.current !== null || t.memoizedState !== null) && (Lo = e);
	}
	function zo(e) {
		D(Uo, Uo.current), D(Io, e), Lo === null && (Lo = e);
	}
	function Bo(e) {
		e.tag === 22 ? (D(Uo, Uo.current), D(Io, e), Lo === null && (Lo = e)) : Vo();
	}
	function Vo() {
		D(Uo, Uo.current), D(Io, Io.current);
	}
	function Ho(e) {
		Ae(Io), Lo === e && (Lo = null), Ae(Uo);
	}
	var Uo = ke(0);
	function Wo(e, t) {
		D(Io, Io.current), D(Uo, t);
	}
	function Go(e) {
		Ae(Uo), Ae(Io), Lo === e && (Lo = null);
	}
	function Ko(e) {
		for (var t = e; t !== null;) {
			if (t.tag === 13) {
				var n = t.memoizedState;
				if (n !== null && (n = n.dehydrated, n === null || om(n) || sm(n))) return t;
			} else if (t.tag === 19 && t.memoizedProps.revealOrder !== "independent") {
				if (t.flags & 128) return t;
			} else if (t.child !== null) {
				t.child.return = t, t = t.child;
				continue;
			}
			if (t === e) break;
			for (; t.sibling === null;) {
				if (t.return === null || t.return === e) return null;
				t = t.return;
			}
			t.sibling.return = t.return, t = t.sibling;
		}
		return null;
	}
	var qo = 0, I = null, L = null, R = null, Jo = !1, Yo = !1, Xo = !1, Zo = 0, Qo = 0, $o = null, es = 0;
	function z() {
		throw Error(i(321));
	}
	function ts(e, t) {
		if (t === null) return !1;
		for (var n = 0; n < t.length && n < e.length; n++) if (!Jr(e[n], t[n])) return !1;
		return !0;
	}
	function ns(e, t, n, r, i, a) {
		return qo = a, I = t, t.memoizedState = null, t.updateQueue = null, t.lanes = 0, T.H = e === null || e.memoizedState === null ? vc : yc, Xo = !1, a = n(r, i), Xo = !1, Yo && (a = is(t, n, r, i)), rs(e), a;
	}
	function rs(e) {
		T.H = _c;
		var t = L !== null && L.next !== null;
		if (qo = 0, R = L = I = null, Jo = !1, Qo = 0, $o = null, t) throw Error(i(300));
		e === null || Ic || (e = e.dependencies, e !== null && ka(e) && (Ic = !0));
	}
	function is(e, t, n, r) {
		I = e;
		var a = 0;
		do {
			if (Yo && ($o = null), Qo = 0, Yo = !1, 25 <= a) throw Error(i(301));
			if (a += 1, R = L = null, e.updateQueue != null) {
				var o = e.updateQueue;
				o.lastEffect = null, o.events = null, o.stores = null, o.memoCache != null && (o.memoCache.index = 0);
			}
			T.H = bc, o = t(n, r);
		} while (Yo);
		return o;
	}
	function as() {
		var e = T.H, t = e.useState()[0];
		return t = typeof t.then == "function" ? ds(t) : t, e = e.useState()[0], (L === null ? null : L.memoizedState) !== e && (I.flags |= 1024), t;
	}
	function os() {
		var e = Zo !== 0;
		return Zo = 0, e;
	}
	function ss(e, t, n) {
		t.updateQueue = e.updateQueue, t.flags &= -2053, e.lanes &= ~n;
	}
	function cs(e) {
		if (Jo) {
			for (e = e.memoizedState; e !== null;) {
				var t = e.queue;
				t !== null && (t.pending = null), e = e.next;
			}
			Jo = !1;
		}
		qo = 0, R = L = I = null, Yo = !1, Qo = Zo = 0, $o = null;
	}
	function ls() {
		var e = {
			memoizedState: null,
			baseState: null,
			baseQueue: null,
			queue: null,
			next: null
		};
		return R === null ? I.memoizedState = R = e : R = R.next = e, R;
	}
	function B() {
		if (L === null) {
			var e = I.alternate;
			e = e === null ? null : e.memoizedState;
		} else e = L.next;
		var t = R === null ? I.memoizedState : R.next;
		if (t !== null) R = t, L = e;
		else {
			if (e === null) throw I.alternate === null ? Error(i(467)) : Error(i(310));
			L = e, e = {
				memoizedState: L.memoizedState,
				baseState: L.baseState,
				baseQueue: L.baseQueue,
				queue: L.queue,
				next: null
			}, R === null ? I.memoizedState = R = e : R = R.next = e;
		}
		return R;
	}
	function us() {
		return {
			lastEffect: null,
			events: null,
			stores: null,
			memoCache: null
		};
	}
	function ds(e) {
		var t = Qo;
		return Qo += 1, $o === null && ($o = []), e = ao($o, e, t), t = I, (R === null ? t.memoizedState : R.next) === null && (t = t.alternate, T.H = t === null || t.memoizedState === null ? vc : yc), e;
	}
	function fs(e) {
		if (typeof e == "object" && e) {
			if (typeof e.then == "function") return ds(e);
			if (e.$$typeof === be) return;
			if (e.$$typeof === ue) return ja(e);
		}
		throw Error(i(438, String(e)));
	}
	function ps(e) {
		var t = null, n = I.updateQueue;
		if (n !== null && (t = n.memoCache), t == null) {
			var r = I.alternate;
			r !== null && (r = r.updateQueue, r !== null && (r = r.memoCache, r != null && (t = {
				data: r.data.map(function(e) {
					return e.slice();
				}),
				index: 0
			})));
		}
		if (t ??= {
			data: [],
			index: 0
		}, n === null && (n = us(), I.updateQueue = n), n.memoCache = t, n = t.data[t.index], n === void 0) for (n = t.data[t.index] = Array(e), r = 0; r < e; r++) n[r] = ve;
		return t.index++, n;
	}
	function ms(e, t) {
		return typeof t == "function" ? t(e) : t;
	}
	function hs(e) {
		return gs(B(), L, e);
	}
	function gs(e, t, n) {
		var r = e.queue;
		if (r === null) throw Error(i(311));
		r.lastRenderedReducer = n;
		var a = e.baseQueue, o = r.pending;
		if (o !== null) {
			if (a !== null) {
				var s = a.next;
				a.next = o.next, o.next = s;
			}
			t.baseQueue = a = o, r.pending = null;
		}
		if (o = e.baseState, a === null) e.memoizedState = o;
		else {
			t = a.next;
			var c = s = null, l = null, u = t, d = !1;
			do {
				var f = u.lane & -536870913;
				if (f === u.lane ? (qo & f) === f : (q & f) === f) {
					var p = u.revertLane;
					if (p === 0) l !== null && (l = l.next = {
						lane: 0,
						revertLane: 0,
						gesture: null,
						action: u.action,
						hasEagerState: u.hasEagerState,
						eagerState: u.eagerState,
						next: null
					}), f === Wa && (d = !0);
					else if ((qo & p) === p) {
						u = u.next, p === Wa && (d = !0);
						continue;
					} else f = {
						lane: 0,
						revertLane: u.revertLane,
						gesture: null,
						action: u.action,
						hasEagerState: u.hasEagerState,
						eagerState: u.eagerState,
						next: null
					}, l === null ? (c = l = f, s = o) : l = l.next = f, I.lanes |= p, sd |= p;
					f = u.action, Xo && n(o, f), o = u.hasEagerState ? u.eagerState : n(o, f);
				} else p = {
					lane: f,
					revertLane: u.revertLane,
					gesture: u.gesture,
					action: u.action,
					hasEagerState: u.hasEagerState,
					eagerState: u.eagerState,
					next: null
				}, l === null ? (c = l = p, s = o) : l = l.next = p, I.lanes |= f, sd |= f;
				u = u.next;
			} while (u !== null && u !== t);
			if (l === null ? s = o : l.next = c, !Jr(o, e.memoizedState) && (Ic = !0, d && (n = Ga, n !== null))) throw n;
			e.memoizedState = o, e.baseState = s, e.baseQueue = l, r.lastRenderedState = o;
		}
		return a === null && (r.lanes = 0), [e.memoizedState, r.dispatch];
	}
	function _s(e) {
		var t = B(), n = t.queue;
		if (n === null) throw Error(i(311));
		n.lastRenderedReducer = e;
		var r = n.dispatch, a = n.pending, o = t.memoizedState;
		if (a !== null) {
			n.pending = null;
			var s = a = a.next;
			do
				o = e(o, s.action), s = s.next;
			while (s !== a);
			Jr(o, t.memoizedState) || (Ic = !0), t.memoizedState = o, t.baseQueue === null && (t.baseState = o), n.lastRenderedState = o;
		}
		return [o, r];
	}
	function vs(e, t, n) {
		var r = I, a = B(), o = P;
		if (o) {
			if (n === void 0) throw Error(i(407));
			n = n();
		} else n = t();
		var s = !Jr((L || a).memoizedState, n);
		if (s && (a.memoizedState = n, Ic = !0), a = a.queue, Us(xs.bind(null, r, a, e), [e]), e = a.getSnapshot !== t || s || R !== null && !!(R.memoizedState.tag & 1), Rs(e ? 9 : 8, { destroy: void 0 }, bs.bind(null, r, a, n, t), null), e) {
			if (r.flags |= 2048, G === null) throw Error(i(349));
			o || qo & 127 || ys(r, t, n);
		}
		return n;
	}
	function ys(e, t, n) {
		e.flags |= 16384, e = {
			getSnapshot: t,
			value: n
		}, t = I.updateQueue, t === null ? (t = us(), I.updateQueue = t, t.stores = [e]) : (n = t.stores, n === null ? t.stores = [e] : n.push(e));
	}
	function bs(e, t, n, r) {
		t.value = n, t.getSnapshot = r, Ss(t) && Cs(e);
	}
	function xs(e, t, n) {
		return n(function() {
			Ss(t) && Cs(e);
		});
	}
	function Ss(e) {
		var t = e.getSnapshot;
		e = e.value;
		try {
			var n = t();
			return !Jr(e, n);
		} catch {
			return !0;
		}
	}
	function Cs(e) {
		var t = Pi(e, 2);
		t !== null && Pd(t, e, 2);
	}
	function ws(e) {
		var t = ls();
		if (typeof e == "function") {
			var n = e;
			if (e = n(), Xo) {
				ct(!0);
				try {
					n();
				} finally {
					ct(!1);
				}
			}
		}
		return t.memoizedState = t.baseState = e, t.queue = {
			pending: null,
			lanes: 0,
			dispatch: null,
			lastRenderedReducer: ms,
			lastRenderedState: e
		}, t;
	}
	function Ts(e, t, n, r) {
		return e.baseState = n, gs(e, L, typeof r == "function" ? r : ms);
	}
	function Es(e, t, n, r, a) {
		if (mc(e)) throw Error(i(485));
		if (e = t.action, e !== null) {
			var o = {
				payload: a,
				action: e,
				next: null,
				isTransition: !0,
				status: "pending",
				value: null,
				reason: null,
				listeners: [],
				then: function(e) {
					o.listeners.push(e);
				}
			};
			T.T === null ? o.isTransition = !1 : n(!0), r(o), n = t.pending, n === null ? (o.next = t.pending = o, Ds(t, o)) : (o.next = n.next, t.pending = n.next = o);
		}
	}
	function Ds(e, t) {
		var n = t.action, r = t.payload, i = e.state;
		if (t.isTransition) {
			var a = T.T, o = {};
			o.types = a === null ? null : a.types, T.T = o;
			try {
				var s = n(i, r), c = T.S;
				c !== null && c(o, s), Os(e, t, s);
			} catch (n) {
				As(e, t, n);
			} finally {
				a !== null && o.types !== null && (a.types = o.types), T.T = a;
			}
		} else try {
			a = n(i, r), Os(e, t, a);
		} catch (n) {
			As(e, t, n);
		}
	}
	function Os(e, t, n) {
		typeof n == "object" && n && typeof n.then == "function" ? n.then(function(n) {
			ks(e, t, n);
		}, function(n) {
			return As(e, t, n);
		}) : ks(e, t, n);
	}
	function ks(e, t, n) {
		t.status = "fulfilled", t.value = n, js(t), e.state = n, t = e.pending, t !== null && (n = t.next, n === t ? e.pending = null : (n = n.next, t.next = n, Ds(e, n)));
	}
	function As(e, t, n) {
		var r = e.pending;
		if (e.pending = null, r !== null) {
			r = r.next;
			do
				t.status = "rejected", t.reason = n, js(t), t = t.next;
			while (t !== r);
		}
		e.action = null;
	}
	function js(e) {
		e = e.listeners;
		for (var t = 0; t < e.length; t++) (0, e[t])();
	}
	function Ms(e, t) {
		return t;
	}
	function Ns(e, t) {
		if (P) {
			var n = G.formState;
			if (n !== null) {
				a: {
					var r = I;
					if (P) {
						if (N) {
							b: {
								for (var i = N, a = fa; i.nodeType !== 8;) {
									if (!a) {
										i = null;
										break b;
									}
									if (i = lm(i.nextSibling), i === null) {
										i = null;
										break b;
									}
								}
								a = i.data, i = a === "F!" || a === "F" ? i : null;
							}
							if (i) {
								N = lm(i.nextSibling), r = i.data === "F!";
								break a;
							}
						}
						ma(r);
					}
					r = !1;
				}
				r && (t = n[0]);
			}
		}
		return n = ls(), n.memoizedState = n.baseState = t, r = {
			pending: null,
			lanes: 0,
			dispatch: null,
			lastRenderedReducer: Ms,
			lastRenderedState: t
		}, n.queue = r, n = dc.bind(null, I, r), r.dispatch = n, r = ws(!1), a = pc.bind(null, I, !1, r.queue), r = ls(), i = {
			state: t,
			dispatch: null,
			action: e,
			pending: null
		}, r.queue = i, n = Es.bind(null, I, i, a, n), i.dispatch = n, r.memoizedState = e, [
			t,
			n,
			!1
		];
	}
	function Ps(e) {
		return Fs(B(), L, e);
	}
	function Fs(e, t, n) {
		if (t = gs(e, t, Ms)[0], e = hs(ms)[0], typeof t == "object" && t && typeof t.then == "function") try {
			var r = ds(t);
		} catch (e) {
			throw e === eo ? no : e;
		}
		else r = t;
		t = B();
		var i = t.queue, a = i.dispatch;
		return n !== t.memoizedState && (I.flags |= 2048, Rs(9, { destroy: void 0 }, Is.bind(null, i, n), null)), [
			r,
			a,
			e
		];
	}
	function Is(e, t) {
		e.action = t;
	}
	function Ls(e) {
		var t = B(), n = L;
		if (n !== null) return Fs(t, n, e);
		B(), t = t.memoizedState, n = B();
		var r = n.queue.dispatch;
		return n.memoizedState = e, [
			t,
			r,
			!1
		];
	}
	function Rs(e, t, n, r) {
		return e = {
			tag: e,
			create: n,
			deps: r,
			inst: t,
			next: null
		}, t = I.updateQueue, t === null && (t = us(), I.updateQueue = t), n = t.lastEffect, n === null ? t.lastEffect = e.next = e : (r = n.next, n.next = e, e.next = r, t.lastEffect = e), e;
	}
	function zs() {
		return B().memoizedState;
	}
	function Bs(e, t, n, r) {
		var i = ls();
		I.flags |= e, i.memoizedState = Rs(1 | t, { destroy: void 0 }, n, r === void 0 ? null : r);
	}
	function Vs(e, t, n, r) {
		var i = B();
		r = r === void 0 ? null : r;
		var a = i.memoizedState.inst;
		L !== null && r !== null && ts(r, L.memoizedState.deps) ? i.memoizedState = Rs(t, a, n, r) : (I.flags |= e, i.memoizedState = Rs(1 | t, a, n, r));
	}
	function Hs(e, t) {
		Bs(8390656, 8, e, t);
	}
	function Us(e, t) {
		Vs(2048, 8, e, t);
	}
	function Ws(e) {
		I.flags |= 4;
		var t = I.updateQueue;
		if (t === null) t = us(), I.updateQueue = t, t.events = [e];
		else {
			var n = t.events;
			n === null ? t.events = [e] : n.push(e);
		}
	}
	function Gs(e) {
		var t = B().memoizedState;
		return Ws({
			ref: t,
			nextImpl: e
		}), function() {
			if (W & 2) throw Error(i(440));
			return t.impl.apply(void 0, arguments);
		};
	}
	function Ks(e, t) {
		return Vs(4, 2, e, t);
	}
	function qs(e, t) {
		return Vs(4, 4, e, t);
	}
	function Js(e, t) {
		if (typeof t == "function") {
			e = e();
			var n = t(e);
			return function() {
				typeof n == "function" ? n() : t(null);
			};
		}
		if (t != null) return e = e(), t.current = e, function() {
			t.current = null;
		};
	}
	function Ys(e, t, n) {
		n = n == null ? null : n.concat([e]), Vs(4, 4, Js.bind(null, t, e), n);
	}
	function Xs() {}
	function Zs(e, t) {
		var n = B();
		t = t === void 0 ? null : t;
		var r = n.memoizedState;
		return t !== null && ts(t, r[1]) ? r[0] : (n.memoizedState = [e, t], e);
	}
	function Qs(e, t) {
		var n = B();
		t = t === void 0 ? null : t;
		var r = n.memoizedState;
		if (t !== null && ts(t, r[1])) return r[0];
		if (r = e(), Xo) {
			ct(!0);
			try {
				e();
			} finally {
				ct(!1);
			}
		}
		return n.memoizedState = [r, t], r;
	}
	function $s(e, t, n) {
		return n === void 0 || qo & 1073741824 && !(q & 261930) ? e.memoizedState = t : (e.memoizedState = n, e = Md(), I.lanes |= e, sd |= e, n);
	}
	function ec(e, t, n, r) {
		return Jr(n, t) ? n : jo.current === null ? !(qo & 106) || qo & 1073741824 && !(q & 261930) ? (Ic = !0, e.memoizedState = n) : (e = Md(), I.lanes |= e, sd |= e, t) : (e = $s(e, n, r), Jr(e, t) || (Ic = !0), e);
	}
	function tc(e, t, n, r, i) {
		var a = E.p;
		E.p = a !== 0 && 8 > a ? a : 8;
		var o = T.T, s = {};
		s.types = o === null ? null : o.types, T.T = s, pc(e, !1, t, n);
		try {
			var c = i(), l = T.S;
			l !== null && l(s, c), typeof c == "object" && c && typeof c.then == "function" ? fc(e, t, Ja(c, r), jd(e)) : fc(e, t, r, jd(e));
		} catch (n) {
			fc(e, t, {
				then: function() {},
				status: "rejected",
				reason: n
			}, jd());
		} finally {
			E.p = a, o !== null && s.types !== null && (o.types = s.types), T.T = o;
		}
	}
	function nc() {}
	function rc(e, t, n, r) {
		if (e.tag !== 5) throw Error(i(476));
		var a = ic(e).queue;
		tc(e, a, t, Ee, n === null ? nc : function() {
			return ac(e), n(r);
		});
	}
	function ic(e) {
		var t = e.memoizedState;
		if (t !== null) return t;
		t = {
			memoizedState: Ee,
			baseState: Ee,
			baseQueue: null,
			queue: {
				pending: null,
				lanes: 0,
				dispatch: null,
				lastRenderedReducer: ms,
				lastRenderedState: Ee
			},
			next: null
		};
		var n = {};
		return t.next = {
			memoizedState: n,
			baseState: n,
			baseQueue: null,
			queue: {
				pending: null,
				lanes: 0,
				dispatch: null,
				lastRenderedReducer: ms,
				lastRenderedState: n
			},
			next: null
		}, e.memoizedState = t, e = e.alternate, e !== null && (e.memoizedState = t), t;
	}
	function ac(e) {
		var t = ic(e);
		t.next === null && (t = e.alternate.memoizedState), fc(e, t.next.queue, {}, jd());
	}
	function oc() {
		return ja(sh);
	}
	function sc() {
		return B().memoizedState;
	}
	function cc() {
		return B().memoizedState;
	}
	function lc(e) {
		for (var t = e.return; t !== null;) {
			switch (t.tag) {
				case 24:
				case 3:
					var n = jd();
					e = So(n);
					var r = Co(t, e, n);
					r !== null && (Pd(r, t, n), wo(r, t, n)), t = { cache: La() }, e.payload = t;
					return;
			}
			t = t.return;
		}
	}
	function uc(e, t, n) {
		var r = jd();
		n = {
			lane: r,
			revertLane: 0,
			gesture: null,
			action: n,
			hasEagerState: !1,
			eagerState: null,
			next: null
		}, mc(e) ? hc(t, n) : (n = Ni(e, t, n, r), n !== null && (Pd(n, e, r), gc(n, t, r)));
	}
	function dc(e, t, n) {
		fc(e, t, n, jd());
	}
	function fc(e, t, n, r) {
		var i = {
			lane: r,
			revertLane: 0,
			gesture: null,
			action: n,
			hasEagerState: !1,
			eagerState: null,
			next: null
		};
		if (mc(e)) hc(t, i);
		else {
			var a = e.alternate;
			if (e.lanes === 0 && (a === null || a.lanes === 0) && (a = t.lastRenderedReducer, a !== null)) try {
				var o = t.lastRenderedState, s = a(o, n);
				if (i.hasEagerState = !0, i.eagerState = s, Jr(s, o)) return Mi(e, t, i, 0), G === null && ji(), !1;
			} catch {}
			if (n = Ni(e, t, i, r), n !== null) return Pd(n, e, r), gc(n, t, r), !0;
		}
		return !1;
	}
	function pc(e, t, n, r) {
		if (r = {
			lane: 2,
			revertLane: Pf(),
			gesture: null,
			action: r,
			hasEagerState: !1,
			eagerState: null,
			next: null
		}, mc(e)) {
			if (t) throw Error(i(479));
		} else t = Ni(e, n, r, 2), t !== null && Pd(t, e, 2);
	}
	function mc(e) {
		var t = e.alternate;
		return e === I || t !== null && t === I;
	}
	function hc(e, t) {
		Yo = Jo = !0;
		var n = e.pending;
		n === null ? t.next = t : (t.next = n.next, n.next = t), e.pending = t;
	}
	function gc(e, t, n) {
		if (n & 4194048) {
			var r = t.lanes;
			r &= e.pendingLanes, n |= r, t.lanes = n, wt(e, n);
		}
	}
	var _c = {
		readContext: ja,
		use: fs,
		useCallback: z,
		useContext: z,
		useEffect: z,
		useImperativeHandle: z,
		useLayoutEffect: z,
		useInsertionEffect: z,
		useMemo: z,
		useReducer: z,
		useRef: z,
		useState: z,
		useDebugValue: z,
		useDeferredValue: z,
		useTransition: z,
		useSyncExternalStore: z,
		useId: z,
		useHostTransitionStatus: z,
		useFormState: z,
		useActionState: z,
		useOptimistic: z,
		useMemoCache: z,
		useCacheRefresh: z,
		useEffectEvent: z
	}, vc = {
		readContext: ja,
		use: fs,
		useCallback: function(e, t) {
			return ls().memoizedState = [e, t === void 0 ? null : t], e;
		},
		useContext: ja,
		useEffect: Hs,
		useImperativeHandle: function(e, t, n) {
			n = n == null ? null : n.concat([e]), Bs(4194308, 4, Js.bind(null, t, e), n);
		},
		useLayoutEffect: function(e, t) {
			return Bs(4194308, 4, e, t);
		},
		useInsertionEffect: function(e, t) {
			Bs(4, 2, e, t);
		},
		useMemo: function(e, t) {
			var n = ls();
			t = t === void 0 ? null : t;
			var r = e();
			if (Xo) {
				ct(!0);
				try {
					e();
				} finally {
					ct(!1);
				}
			}
			return n.memoizedState = [r, t], r;
		},
		useReducer: function(e, t, n) {
			var r = ls();
			if (n !== void 0) {
				var i = n(t);
				if (Xo) {
					ct(!0);
					try {
						n(t);
					} finally {
						ct(!1);
					}
				}
			} else i = t;
			return r.memoizedState = r.baseState = i, e = {
				pending: null,
				lanes: 0,
				dispatch: null,
				lastRenderedReducer: e,
				lastRenderedState: i
			}, r.queue = e, e = e.dispatch = uc.bind(null, I, e), [r.memoizedState, e];
		},
		useRef: function(e) {
			var t = ls();
			return e = { current: e }, t.memoizedState = e;
		},
		useState: function(e) {
			e = ws(e);
			var t = e.queue, n = dc.bind(null, I, t);
			return t.dispatch = n, [e.memoizedState, n];
		},
		useDebugValue: Xs,
		useDeferredValue: function(e, t) {
			return $s(ls(), e, t);
		},
		useTransition: function() {
			var e = ws(!1);
			return e = tc.bind(null, I, e.queue, !0, !1), ls().memoizedState = e, [!1, e];
		},
		useSyncExternalStore: function(e, t, n) {
			var r = I, a = ls();
			if (P) {
				if (n === void 0) throw Error(i(407));
				n = n();
			} else {
				if (n = t(), G === null) throw Error(i(349));
				q & 127 || ys(r, t, n);
			}
			a.memoizedState = n;
			var o = {
				value: n,
				getSnapshot: t
			};
			return a.queue = o, Hs(xs.bind(null, r, o, e), [e]), r.flags |= 2048, Rs(9, { destroy: void 0 }, bs.bind(null, r, o, n, t), null), n;
		},
		useId: function() {
			var e = ls(), t = G.identifierPrefix;
			if (P) {
				var n = ia, r = ra;
				n = (r & ~(1 << 32 - lt(r) - 1)).toString(32) + n, t = "_" + t + "R_" + n, n = Zo++, 0 < n && (t += "H" + n.toString(32)), t += "_";
			} else n = es++, t = "_" + t + "r_" + n.toString(32) + "_";
			return e.memoizedState = t;
		},
		useHostTransitionStatus: oc,
		useFormState: Ns,
		useActionState: Ns,
		useOptimistic: function(e) {
			var t = ls();
			t.memoizedState = t.baseState = e;
			var n = {
				pending: null,
				lanes: 0,
				dispatch: null,
				lastRenderedReducer: null,
				lastRenderedState: null
			};
			return t.queue = n, t = pc.bind(null, I, !0, n), n.dispatch = t, [e, t];
		},
		useMemoCache: ps,
		useCacheRefresh: function() {
			return ls().memoizedState = lc.bind(null, I);
		},
		useEffectEvent: function(e) {
			var t = ls(), n = { impl: e };
			return t.memoizedState = n, function() {
				if (W & 2) throw Error(i(440));
				return n.impl.apply(void 0, arguments);
			};
		}
	}, yc = {
		readContext: ja,
		use: fs,
		useCallback: Zs,
		useContext: ja,
		useEffect: Us,
		useImperativeHandle: Ys,
		useInsertionEffect: Ks,
		useLayoutEffect: qs,
		useMemo: Qs,
		useReducer: hs,
		useRef: zs,
		useState: function() {
			return hs(ms);
		},
		useDebugValue: Xs,
		useDeferredValue: function(e, t) {
			return ec(B(), L.memoizedState, e, t);
		},
		useTransition: function() {
			var e = hs(ms)[0], t = B().memoizedState;
			return [typeof e == "boolean" ? e : ds(e), t];
		},
		useSyncExternalStore: vs,
		useId: sc,
		useHostTransitionStatus: oc,
		useFormState: Ps,
		useActionState: Ps,
		useOptimistic: function(e, t) {
			return Ts(B(), L, e, t);
		},
		useMemoCache: ps,
		useCacheRefresh: cc,
		useEffectEvent: Gs
	}, bc = {
		readContext: ja,
		use: fs,
		useCallback: Zs,
		useContext: ja,
		useEffect: Us,
		useImperativeHandle: Ys,
		useInsertionEffect: Ks,
		useLayoutEffect: qs,
		useMemo: Qs,
		useReducer: _s,
		useRef: zs,
		useState: function() {
			return _s(ms);
		},
		useDebugValue: Xs,
		useDeferredValue: function(e, t) {
			var n = B();
			return L === null ? $s(n, e, t) : ec(n, L.memoizedState, e, t);
		},
		useTransition: function() {
			var e = _s(ms)[0], t = B().memoizedState;
			return [typeof e == "boolean" ? e : ds(e), t];
		},
		useSyncExternalStore: vs,
		useId: sc,
		useHostTransitionStatus: oc,
		useFormState: Ls,
		useActionState: Ls,
		useOptimistic: function(e, t) {
			var n = B();
			return L === null ? (n.baseState = e, [e, n.queue.dispatch]) : Ts(n, L, e, t);
		},
		useMemoCache: ps,
		useCacheRefresh: cc,
		useEffectEvent: Gs
	};
	function xc(e, t, n, r) {
		t = e.memoizedState, n = n(r, t), n = n == null ? t : S({}, t, n), e.memoizedState = n, e.lanes === 0 && (e.updateQueue.baseState = n);
	}
	var Sc = {
		enqueueSetState: function(e, t, n) {
			e = e._reactInternals;
			var r = jd(), i = So(r);
			i.payload = t, n != null && (i.callback = n), t = Co(e, i, r), t !== null && (Pd(t, e, r), wo(t, e, r));
		},
		enqueueReplaceState: function(e, t, n) {
			e = e._reactInternals;
			var r = jd(), i = So(r);
			i.tag = 1, i.payload = t, n != null && (i.callback = n), t = Co(e, i, r), t !== null && (Pd(t, e, r), wo(t, e, r));
		},
		enqueueForceUpdate: function(e, t) {
			e = e._reactInternals;
			var n = jd(), r = So(n);
			r.tag = 2, t != null && (r.callback = t), t = Co(e, r, n), t !== null && (Pd(t, e, n), wo(t, e, n));
		}
	};
	function Cc(e, t, n, r, i, a, o) {
		return e = e.stateNode, typeof e.shouldComponentUpdate == "function" ? e.shouldComponentUpdate(r, a, o) : t.prototype && t.prototype.isPureReactComponent ? !Yr(n, r) || !Yr(i, a) : !0;
	}
	function wc(e, t, n, r) {
		e = t.state, typeof t.componentWillReceiveProps == "function" && t.componentWillReceiveProps(n, r), typeof t.UNSAFE_componentWillReceiveProps == "function" && t.UNSAFE_componentWillReceiveProps(n, r), t.state !== e && Sc.enqueueReplaceState(t, t.state, null);
	}
	function Tc(e, t) {
		var n = t;
		if ("ref" in t) for (var r in n = {}, t) r !== "ref" && (n[r] = t[r]);
		if (e = e.defaultProps) for (var i in n === t && (n = S({}, n)), e) n[i] === void 0 && (n[i] = e[i]);
		return n;
	}
	function Ec(e) {
		Di(e);
	}
	function Dc(e) {
		console.error(e);
	}
	function Oc(e) {
		Di(e);
	}
	function kc(e, t) {
		try {
			var n = e.onUncaughtError;
			n(t.value, { componentStack: t.stack });
		} catch (e) {
			setTimeout(function() {
				throw e;
			});
		}
	}
	function Ac(e, t, n) {
		try {
			var r = e.onCaughtError;
			r(n.value, {
				componentStack: n.stack,
				errorBoundary: t.tag === 1 ? t.stateNode : null
			});
		} catch (e) {
			setTimeout(function() {
				throw e;
			});
		}
	}
	function jc(e, t, n) {
		return n = So(n), n.tag = 3, n.payload = { element: null }, n.callback = function() {
			kc(e, t);
		}, n;
	}
	function Mc(e) {
		return e = So(e), e.tag = 3, e;
	}
	function Nc(e, t, n, r) {
		var i = n.type.getDerivedStateFromError;
		if (typeof i == "function") {
			var a = r.value;
			e.payload = function() {
				return i(a);
			}, e.callback = function() {
				Ac(t, n, r);
			};
		}
		var o = n.stateNode;
		o !== null && typeof o.componentDidCatch == "function" && (e.callback = function() {
			Ac(t, n, r), typeof i != "function" && (yd === null ? yd = /* @__PURE__ */ new Set([this]) : yd.add(this));
			var e = r.stack;
			this.componentDidCatch(r.value, { componentStack: e === null ? "" : e });
		});
	}
	function Pc(e, t, n, r, a) {
		if (n.flags |= 32768, typeof r == "object" && r && typeof r.then == "function") {
			if (t = n.alternate, t !== null && Oa(t, n, a, !0), n = Io.current, n !== null) {
				switch (n.tag) {
					case 31:
					case 13:
					case 19: return Lo === null ? Kd() : n.alternate === null && Y === 0 && (Y = 3), n.flags &= -257, n.flags |= 65536, n.lanes = a, r === ro ? n.flags |= 16384 : (t = n.updateQueue, t === null ? n.updateQueue = /* @__PURE__ */ new Set([r]) : t.add(r), mf(e, r, a)), !1;
					case 22: return n.flags |= 65536, r === ro ? n.flags |= 16384 : (t = n.updateQueue, t === null ? (t = {
						transitions: null,
						markerInstances: null,
						retryQueue: /* @__PURE__ */ new Set([r])
					}, n.updateQueue = t) : (n = t.retryQueue, n === null ? t.retryQueue = /* @__PURE__ */ new Set([r]) : n.add(r)), mf(e, r, a)), !1;
				}
				throw Error(i(435, n.tag));
			}
			return mf(e, r, a), Kd(), !1;
		}
		if (P) return t = Io.current, t === null ? (r !== pa && (t = Error(i(423), { cause: r }), ba(Yi(t, n))), e = e.current.alternate, e.flags |= 65536, a &= -a, e.lanes |= a, r = Yi(r, n), a = jc(e.stateNode, r, a), To(e, a), Y !== 4 && (Y = 2)) : (!(t.flags & 65536) && (t.flags |= 256), t.flags |= 65536, t.lanes = a, r !== pa && (e = Error(i(422), { cause: r }), ba(Yi(e, n)))), !1;
		var o = Error(i(520), { cause: r });
		if (o = Yi(o, n), fd === null ? fd = [o] : fd.push(o), Y !== 4 && (Y = 2), t === null) return !0;
		r = Yi(r, n), n = t;
		do {
			switch (n.tag) {
				case 3: return n.flags |= 65536, e = a & -a, n.lanes |= e, e = jc(n.stateNode, r, e), To(n, e), !1;
				case 1:
					if (t = n.type, o = n.stateNode, !(n.flags & 128) && (typeof t.getDerivedStateFromError == "function" || o !== null && typeof o.componentDidCatch == "function" && (yd === null || !yd.has(o)))) return n.flags |= 65536, a &= -a, n.lanes |= a, a = Mc(a), Nc(a, e, n, r), To(n, a), !1;
					break;
				case 22: if (n.memoizedState !== null) return n.flags |= 65536, !1;
			}
			n = n.return;
		} while (n !== null);
		return !1;
	}
	var Fc = Error(i(461)), Ic = !1;
	function Lc(e, t, n, r) {
		t.child = e === null ? vo(t, null, n, r) : _o(t, e.child, n, r);
	}
	function Rc(e, t, n, r, i) {
		n = n.render;
		var a = t.ref;
		if ("ref" in r) {
			var o = {};
			for (var s in r) s !== "ref" && (o[s] = r[s]);
		} else o = r;
		return Aa(t), r = ns(e, t, n, o, a, i), s = os(), e !== null && !Ic ? (ss(e, t, i), fl(e, t, i)) : (P && s && sa(t), t.flags |= 1, Lc(e, t, r, i), t.child);
	}
	function zc(e, t, n, r, i) {
		if (e === null) {
			var a = n.type;
			return typeof a == "function" && !Bi(a) && a.defaultProps === void 0 && n.compare === null ? (t.tag = 15, t.type = a, Bc(e, t, a, r, i)) : (e = Ui(n.type, null, r, t, t.mode, i), e.ref = t.ref, e.return = t, t.child = e);
		}
		if (a = e.child, !pl(e, i)) {
			var o = a.memoizedProps;
			if (n = n.compare, n = n === null ? Yr : n, n(o, r) && e.ref === t.ref) return fl(e, t, i);
		}
		return t.flags |= 1, e = Vi(a, r), e.ref = t.ref, e.return = t, t.child = e;
	}
	function Bc(e, t, n, r, i) {
		if (e !== null) {
			var a = e.memoizedProps;
			if (Yr(a, r) && e.ref === t.ref) {
				if (Ic = !1, t.pendingProps = r = a, pl(e, i)) e.flags & 131072 && (Ic = !0);
				else return t.lanes = e.lanes, fl(e, t, i);
			}
		}
		return Jc(e, t, n, r, i);
	}
	function Vc(e, t, n, r) {
		var i = r.children, a = e === null ? null : e.memoizedState;
		if (e === null && t.stateNode === null && (t.stateNode = {
			_visibility: 1,
			_pendingMarkers: null,
			_retryCache: null,
			_transitions: null
		}), r.mode === "hidden") {
			if (t.flags & 128) {
				if (a = a === null ? n : a.baseLanes | n, e !== null) {
					for (r = t.child = e.child, i = 0; r !== null;) i = i | r.lanes | r.childLanes, r = r.sibling;
					r = i & ~a;
				} else r = 0, t.child = null;
				return Uc(e, t, a, n, r);
			}
			if (n & 536870912) t.memoizedState = {
				baseLanes: 0,
				cachePool: null
			}, e !== null && Qa(t, a === null ? null : a.cachePool), a === null ? Po() : No(t, a), Bo(t);
			else return r = t.lanes = 536870912, Uc(e, t, a === null ? n : a.baseLanes | n, n, r);
		} else a === null ? (e !== null && Qa(t, null), Po(), Vo()) : (Qa(t, a.cachePool), No(t, a), Vo(), t.memoizedState = null);
		return Lc(e, t, i, n), t.child;
	}
	function Hc(e, t) {
		return e !== null && e.tag === 22 || t.stateNode !== null || (t.stateNode = {
			_visibility: 1,
			_pendingMarkers: null,
			_retryCache: null,
			_transitions: null
		}), t.sibling;
	}
	function Uc(e, t, n, r, i) {
		var a = Za();
		return a = a === null ? null : {
			parent: F._currentValue,
			pool: a
		}, t.memoizedState = {
			baseLanes: n,
			cachePool: a
		}, e !== null && Qa(t, null), Po(), Bo(t), e !== null && Oa(e, t, r, !0), t.childLanes = i, null;
	}
	function Wc(e, t) {
		return t = rl({
			mode: t.mode,
			children: t.children
		}, e.mode), t.ref = e.ref, e.child = t, t.return = e, t;
	}
	function Gc(e, t, n) {
		return _o(t, e.child, null, n), e = Wc(t, t.pendingProps), e.flags |= 2, Ho(t), t.memoizedState = null, e;
	}
	function Kc(e, t, n) {
		var r = t.pendingProps, a = !!(t.flags & 128);
		if (t.flags &= -129, e === null) {
			if (P) {
				if (r.mode === "hidden") return e = Wc(t, r), t.lanes = 536870912, e.memoizedState = {
					baseLanes: 0,
					cachePool: null
				}, Hc(null, e);
				if (zo(t), (e = N) ? (e = am(e, fa), e = e !== null && e.data === "&" ? e : null, e !== null && (t.memoizedState = {
					dehydrated: e,
					treeContext: na === null ? null : {
						id: ra,
						overflow: ia
					},
					retryLane: 536870912,
					hydrationErrors: null
				}, n = Ki(e), n.return = t, t.child = n, ua = t, N = null)) : e = null, e === null) throw ma(t);
				return t.lanes = 536870912, null;
			}
			return Wc(t, r);
		}
		var o = e.memoizedState;
		if (o !== null) {
			var s = o.dehydrated;
			if (zo(t), a) {
				if (t.flags & 256) t.flags &= -257, t = Gc(e, t, n);
				else if (t.memoizedState !== null) t.child = e.child, t.flags |= 128, t = null;
				else throw Error(i(558));
			} else if (Ic || Oa(e, t, n, !1), a = (n & e.childLanes) !== 0, Ic || a) {
				if (jo.current === null) {
					if (r = G, r !== null && (s = Tt(r, n), s !== 0 && s !== o.retryLane)) throw o.retryLane = s, Pi(e, s), Pd(r, e, s), Fc;
					Kd();
				}
				t = Gc(e, t, n);
			} else e = o.treeContext, N = lm(s.nextSibling), ua = t, P = !0, da = null, fa = !1, e !== null && la(t, e), t = Wc(t, r), t.flags |= 134221824;
			return t;
		}
		return e = Vi(e.child, {
			mode: r.mode,
			children: r.children
		}), e.ref = t.ref, t.child = e, e.return = t, e;
	}
	function qc(e, t) {
		var n = t.ref;
		if (n === null) e !== null && e.ref !== null && (t.flags |= 4194816);
		else {
			if (typeof n != "function" && typeof n != "object") throw Error(i(284));
			(e === null || e.ref !== n) && (t.flags |= 4194816);
		}
	}
	function Jc(e, t, n, r, i) {
		return Aa(t), n = ns(e, t, n, r, void 0, i), r = os(), e !== null && !Ic ? (ss(e, t, i), fl(e, t, i)) : (P && r && sa(t), t.flags |= 1, Lc(e, t, n, i), t.child);
	}
	function Yc(e, t, n, r, i, a) {
		return Aa(t), t.updateQueue = null, n = is(t, r, n, i), rs(e), r = os(), e !== null && !Ic ? (ss(e, t, a), fl(e, t, a)) : (P && r && sa(t), t.flags |= 1, Lc(e, t, n, a), t.child);
	}
	function Xc(e, t, n, r, i) {
		if (Aa(t), t.stateNode === null) {
			var a = Li, o = n.contextType;
			typeof o == "object" && o && (a = ja(o)), a = new n(r, a), t.memoizedState = a.state !== null && a.state !== void 0 ? a.state : null, a.updater = Sc, t.stateNode = a, a._reactInternals = t, a = t.stateNode, a.props = r, a.state = t.memoizedState, a.refs = {}, bo(t), o = n.contextType, a.context = typeof o == "object" && o ? ja(o) : Li, a.state = t.memoizedState, o = n.getDerivedStateFromProps, typeof o == "function" && (xc(t, n, o, r), a.state = t.memoizedState), typeof n.getDerivedStateFromProps == "function" || typeof a.getSnapshotBeforeUpdate == "function" || typeof a.UNSAFE_componentWillMount != "function" && typeof a.componentWillMount != "function" || (o = a.state, typeof a.componentWillMount == "function" && a.componentWillMount(), typeof a.UNSAFE_componentWillMount == "function" && a.UNSAFE_componentWillMount(), o !== a.state && Sc.enqueueReplaceState(a, a.state, null), Oo(t, r, a, i), Do(), a.state = t.memoizedState), typeof a.componentDidMount == "function" && (t.flags |= 4194308), r = !0;
		} else if (e === null) {
			a = t.stateNode;
			var s = t.memoizedProps, c = Tc(n, s);
			a.props = c;
			var l = a.context, u = n.contextType;
			o = Li, typeof u == "object" && u && (o = ja(u));
			var d = n.getDerivedStateFromProps;
			u = typeof d == "function" || typeof a.getSnapshotBeforeUpdate == "function", s = t.pendingProps !== s, u || typeof a.UNSAFE_componentWillReceiveProps != "function" && typeof a.componentWillReceiveProps != "function" || (s || l !== o) && wc(t, a, r, o), yo = !1;
			var f = t.memoizedState;
			a.state = f, Oo(t, r, a, i), Do(), l = t.memoizedState, s || f !== l || yo ? (typeof d == "function" && (xc(t, n, d, r), l = t.memoizedState), (c = yo || Cc(t, n, c, r, f, l, o)) ? (u || typeof a.UNSAFE_componentWillMount != "function" && typeof a.componentWillMount != "function" || (typeof a.componentWillMount == "function" && a.componentWillMount(), typeof a.UNSAFE_componentWillMount == "function" && a.UNSAFE_componentWillMount()), typeof a.componentDidMount == "function" && (t.flags |= 4194308)) : (typeof a.componentDidMount == "function" && (t.flags |= 4194308), t.memoizedProps = r, t.memoizedState = l), a.props = r, a.state = l, a.context = o, r = c) : (typeof a.componentDidMount == "function" && (t.flags |= 4194308), r = !1);
		} else {
			a = t.stateNode, xo(e, t), o = t.memoizedProps, u = Tc(n, o), a.props = u, d = t.pendingProps, f = a.context, l = n.contextType, c = Li, typeof l == "object" && l && (c = ja(l)), s = n.getDerivedStateFromProps, (l = typeof s == "function" || typeof a.getSnapshotBeforeUpdate == "function") || typeof a.UNSAFE_componentWillReceiveProps != "function" && typeof a.componentWillReceiveProps != "function" || (o !== d || f !== c) && wc(t, a, r, c), yo = !1, f = t.memoizedState, a.state = f, Oo(t, r, a, i), Do();
			var p = t.memoizedState;
			o !== d || f !== p || yo || e !== null && e.dependencies !== null && ka(e.dependencies) ? (typeof s == "function" && (xc(t, n, s, r), p = t.memoizedState), (u = yo || Cc(t, n, u, r, f, p, c) || e !== null && e.dependencies !== null && ka(e.dependencies)) ? (l || typeof a.UNSAFE_componentWillUpdate != "function" && typeof a.componentWillUpdate != "function" || (typeof a.componentWillUpdate == "function" && a.componentWillUpdate(r, p, c), typeof a.UNSAFE_componentWillUpdate == "function" && a.UNSAFE_componentWillUpdate(r, p, c)), typeof a.componentDidUpdate == "function" && (t.flags |= 4), typeof a.getSnapshotBeforeUpdate == "function" && (t.flags |= 1024)) : (typeof a.componentDidUpdate != "function" || o === e.memoizedProps && f === e.memoizedState || (t.flags |= 4), typeof a.getSnapshotBeforeUpdate != "function" || o === e.memoizedProps && f === e.memoizedState || (t.flags |= 1024), t.memoizedProps = r, t.memoizedState = p), a.props = r, a.state = p, a.context = c, r = u) : (typeof a.componentDidUpdate != "function" || o === e.memoizedProps && f === e.memoizedState || (t.flags |= 4), typeof a.getSnapshotBeforeUpdate != "function" || o === e.memoizedProps && f === e.memoizedState || (t.flags |= 1024), r = !1);
		}
		return a = r, qc(e, t), r = !!(t.flags & 128), a || r ? (a = t.stateNode, n = r && typeof n.getDerivedStateFromError != "function" ? null : a.render(), t.flags |= 1, e !== null && r ? (t.child = _o(t, e.child, null, i), t.child = _o(t, null, n, i)) : Lc(e, t, n, i), t.memoizedState = a.state, e = t.child) : e = fl(e, t, i), e;
	}
	function Zc(e, t, n, r) {
		return va(), t.flags |= 256, Lc(e, t, n, r), t.child;
	}
	var Qc = {
		dehydrated: null,
		treeContext: null,
		retryLane: 0,
		hydrationErrors: null
	};
	function $c(e) {
		return {
			baseLanes: e,
			cachePool: $a()
		};
	}
	function el(e, t, n) {
		return e = e === null ? 0 : e.childLanes & ~n, t && (e |= ud), e;
	}
	function tl(e, t, n) {
		var r = t.pendingProps, i = !1, a = !!(t.flags & 128), o;
		if ((o = a) || (o = e !== null && e.memoizedState === null ? !1 : !!(Uo.current & 2)), o && (i = !0, t.flags &= -129), o = !!(t.flags & 32), t.flags &= -33, e === null) {
			if (P) {
				if (i ? Ro(t) : Vo(), (e = N) ? (e = am(e, fa), e = e !== null && e.data !== "&" ? e : null, e !== null && (t.memoizedState = {
					dehydrated: e,
					treeContext: na === null ? null : {
						id: ra,
						overflow: ia
					},
					retryLane: 536870912,
					hydrationErrors: null
				}, n = Ki(e), n.return = t, t.child = n, ua = t, N = null)) : e = null, e === null) throw ma(t);
				return t.lanes = sm(e) ? 32 : 536870912, null;
			}
			return a = r.children, r = r.fallback, i ? (Vo(), i = t.mode, a = rl({
				mode: "hidden",
				children: a
			}, i), r = Wi(r, i, n, null), a.return = t, r.return = t, a.sibling = r, t.child = a, r = t.child, r.memoizedState = $c(n), r.childLanes = el(e, o, n), t.memoizedState = Qc, Hc(null, r)) : (Ro(t), nl(t, a));
		}
		var s = e.memoizedState;
		if (s !== null) {
			var c = s.dehydrated;
			if (c !== null) return al(e, t, a, o, r, c, s, n);
		}
		return i ? (Vo(), i = r.fallback, a = t.mode, s = e.child, c = s.sibling, r = Vi(s, {
			mode: "hidden",
			children: r.children
		}), r.subtreeFlags = s.subtreeFlags & 1206910976, c === null ? (i = Wi(i, a, n, null), i.flags |= 2) : i = Vi(c, i), i.return = t, r.return = t, r.sibling = i, t.child = r, Hc(null, r), r = t.child, i = e.child.memoizedState, i === null ? i = $c(n) : (a = i.cachePool, a === null ? a = $a() : (s = F._currentValue, a = a.parent === s ? a : {
			parent: s,
			pool: s
		}), i = {
			baseLanes: i.baseLanes | n,
			cachePool: a
		}), r.memoizedState = i, r.childLanes = el(e, o, n), t.memoizedState = Qc, Hc(e.child, r)) : (Ro(t), n = e.child, e = n.sibling, n = Vi(n, {
			mode: "visible",
			children: r.children
		}), n.return = t, n.sibling = null, e !== null && (o = t.deletions, o === null ? (t.deletions = [e], t.flags |= 16) : o.push(e)), t.child = n, t.memoizedState = null, n);
	}
	function nl(e, t) {
		return t = rl({
			mode: "visible",
			children: t
		}, e.mode), t.return = e, e.child = t;
	}
	function rl(e, t) {
		return e = zi(22, e, null, t), e.lanes = 0, e;
	}
	function il(e, t, n) {
		return _o(t, e.child, null, n), e = nl(t, t.pendingProps.children), e.flags |= 2, t.memoizedState = null, e;
	}
	function al(e, t, n, r, a, o, s, c) {
		if (n) return t.flags & 256 ? (Ro(t), t.flags &= -257, il(e, t, c)) : t.memoizedState === null ? (Vo(), o = a.fallback, s = t.mode, a = rl({
			mode: "visible",
			children: a.children
		}, s), o = Wi(o, s, c, null), o.flags |= 2, a.return = t, o.return = t, a.sibling = o, t.child = a, _o(t, e.child, null, c), a = t.child, a.memoizedState = $c(c), a.childLanes = el(e, r, c), t.memoizedState = Qc, Hc(null, a)) : (Vo(), t.child = e.child, t.flags |= 128, null);
		if (Ro(t), sm(o)) {
			if (r = o.nextSibling && o.nextSibling.dataset, r) var l = r.dgst;
			return r = l, r !== "" && (a = Error(i(419)), a.stack = "", a.digest = r, ba({
				value: a,
				source: null,
				stack: null
			})), il(e, t, c);
		}
		if (Ic || Oa(e, t, c, !1), r = (c & e.childLanes) !== 0, Ic || r) {
			if (jo.current !== null) return il(e, t, c);
			if (r = G, r !== null && (a = Tt(r, c), a !== 0 && a !== s.retryLane)) throw s.retryLane = a, Pi(e, a), Pd(r, e, a), Fc;
			return om(o) || Kd(), il(e, t, c);
		}
		return om(o) ? (t.flags |= 192, t.child = e.child, null) : (e = s.treeContext, N = lm(o.nextSibling), ua = t, P = !0, da = null, fa = !1, e !== null && la(t, e), t = nl(t, a.children), t.flags |= 134221824, t);
	}
	function ol(e, t, n) {
		e.lanes |= t;
		var r = e.alternate;
		r !== null && (r.lanes |= t), Ea(e.return, t, n);
	}
	function sl(e) {
		for (var t = null; e !== null;) {
			var n = e.alternate;
			n !== null && Ko(n) === null && (t = e), e = e.sibling;
		}
		return t;
	}
	function cl(e, t, n, r, i, a) {
		var o = e.memoizedState;
		o === null ? e.memoizedState = {
			isBackwards: t,
			rendering: null,
			renderingStartTime: 0,
			last: r,
			tail: n,
			tailMode: i,
			treeForkCount: a
		} : (o.isBackwards = t, o.rendering = null, o.renderingStartTime = 0, o.last = r, o.tail = n, o.tailMode = i, o.treeForkCount = a);
	}
	function ll(e) {
		var t = e.child;
		for (e.child = null; t !== null;) {
			var n = t.sibling;
			t.sibling = e.child, e.child = t, t = n;
		}
	}
	function ul(e, t, n) {
		var r = t.pendingProps, i = r.revealOrder, a = r.tail;
		r = r.children;
		var o = Uo.current;
		if (t.flags & 128) return Wo(t, o), null;
		var s = !!(o & 2);
		if (s ? (o = o & 1 | 2, t.flags |= 128) : o &= 1, Wo(t, o), i === "backwards" && e !== null ? (ll(e), Lc(e, t, r, n), ll(e)) : Lc(e, t, r, n), r = P ? $i : 0, !s && e !== null && e.flags & 128) a: for (e = t.child; e !== null;) {
			if (e.tag === 13) e.memoizedState !== null && ol(e, n, t);
			else if (e.tag === 19) ol(e, n, t);
			else if (e.child !== null) {
				e.child.return = e, e = e.child;
				continue;
			}
			if (e === t) break a;
			for (; e.sibling === null;) {
				if (e.return === null || e.return === t) break a;
				e = e.return;
			}
			e.sibling.return = e.return, e = e.sibling;
		}
		switch (i) {
			case "backwards":
				n = sl(t.child), n === null ? (i = t.child, t.child = null) : (i = n.sibling, n.sibling = null, ll(t)), cl(t, !0, i, null, a, r);
				break;
			case "unstable_legacy-backwards":
				for (n = null, i = t.child, t.child = null; i !== null;) {
					if (e = i.alternate, e !== null && Ko(e) === null) {
						t.child = i;
						break;
					}
					e = i.sibling, i.sibling = n, n = i, i = e;
				}
				cl(t, !0, n, null, a, r);
				break;
			case "together":
				cl(t, !1, null, null, void 0, r);
				break;
			case "independent":
				t.memoizedState = null;
				break;
			default: n = sl(t.child), n === null ? (i = t.child, t.child = null) : (i = n.sibling, n.sibling = null), cl(t, !1, i, n, a, r);
		}
		return t.child;
	}
	function dl(e, t, n) {
		var r = t.pendingProps;
		return wa(t, t.type, r.value), Lc(e, t, r.children, n), t.child;
	}
	function fl(e, t, n) {
		if (e !== null && (t.dependencies = e.dependencies), sd |= t.lanes, (n & t.childLanes) === 0) {
			if (e !== null) {
				if (Oa(e, t, n, !1), (n & t.childLanes) === 0) return null;
			} else return null;
		}
		if (e !== null && t.child !== e.child) throw Error(i(153));
		if (t.child !== null) {
			for (e = t.child, n = Vi(e, e.pendingProps), t.child = n, n.return = t; e.sibling !== null;) e = e.sibling, n = n.sibling = Vi(e, e.pendingProps), n.return = t;
			n.sibling = null;
		}
		return t.child;
	}
	function pl(e, t) {
		return (e.lanes & t) !== 0 || (e = e.dependencies, !!(e !== null && ka(e)));
	}
	function ml(e, t, n) {
		switch (t.tag) {
			case 3:
				Fe(t, t.stateNode.containerInfo), wa(t, F, e.memoizedState.cache), va();
				break;
			case 27:
			case 5:
				Le(t);
				break;
			case 4:
				Fe(t, t.stateNode.containerInfo);
				break;
			case 10:
				wa(t, t.type, t.memoizedProps.value);
				break;
			case 31:
				if (t.memoizedState !== null) return t.flags |= 128, zo(t), null;
				break;
			case 13:
				var r = t.memoizedState;
				if (r !== null) {
					if (r.dehydrated !== null) return Ro(t), t.flags |= 128, null;
					r = Oa(e, t, n, !1);
					var i = t.child.childLanes;
					return r || (n & i) !== 0 ? tl(e, t, n) : (Ro(t), e = fl(e, t, n), e === null ? null : e.sibling);
				}
				Ro(t);
				break;
			case 19:
				if (t.flags & 128) return ul(e, t, n);
				if (i = !!(e.flags & 128), r = (n & t.childLanes) !== 0, r ||= (Oa(e, t, n, !1), (n & t.childLanes) !== 0), i) {
					if (r) return ul(e, t, n);
					t.flags |= 128;
				}
				if (i = t.memoizedState, i !== null && (i.rendering = null, i.tail = null, i.lastEffect = null), Wo(t, Uo.current), r) break;
				return null;
			case 22: return t.lanes = 0, Vc(e, t, n, t.pendingProps);
			case 24: wa(t, F, e.memoizedState.cache);
		}
		return fl(e, t, n);
	}
	function hl(e, t, n) {
		if (e !== null) {
			if (e.memoizedProps !== t.pendingProps) Ic = !0;
			else {
				if (!pl(e, n) && !(t.flags & 128)) return Ic = !1, ml(e, t, n);
				Ic = !!(e.flags & 131072);
			}
		} else Ic = !1, P && t.flags & 1048576 && oa(t, $i, t.index);
		switch (t.lanes = 0, t.tag) {
			case 16:
				a: {
					var r = t.pendingProps;
					if (e = oo(t.elementType), t.type = e, typeof e == "function") Bi(e) ? (r = Tc(e, r), t.tag = 1, t = Xc(null, t, e, r, n)) : (t.tag = 0, t = Jc(null, t, e, r, n));
					else {
						if (e != null) {
							var a = e.$$typeof;
							if (a === de) {
								t.tag = 11, t = Rc(null, t, e, r, n);
								break a;
							}
							if (a === me) {
								t.tag = 14, t = zc(null, t, e, r, n);
								break a;
							}
							if (a === ue) {
								t.tag = 10, t.type = e, t = dl(null, t, n);
								break a;
							}
						}
						throw t = we(e) || e, Error(i(306, t, ""));
					}
				}
				return t;
			case 0: return Jc(e, t, t.type, t.pendingProps, n);
			case 1: return r = t.type, a = Tc(r, t.pendingProps), Xc(e, t, r, a, n);
			case 3:
				a: {
					if (Fe(t, t.stateNode.containerInfo), e === null) throw Error(i(387));
					r = t.pendingProps;
					var o = t.memoizedState;
					a = o.element, xo(e, t), Oo(t, r, null, n);
					var s = t.memoizedState;
					if (r = s.cache, wa(t, F, r), r !== o.cache && Da(t, [F], n, !0), Do(), r = s.element, o.isDehydrated) {
						if (o = {
							element: r,
							isDehydrated: !1,
							cache: s.cache
						}, t.updateQueue.baseState = o, t.memoizedState = o, t.flags & 256) {
							t = Zc(e, t, r, n);
							break a;
						}
						if (r !== a) {
							a = Yi(Error(i(424)), t), ba(a), t = Zc(e, t, r, n);
							break a;
						}
						switch (e = t.stateNode.containerInfo, e.nodeType) {
							case 9:
								e = e.body;
								break;
							default: e = e.nodeName === "HTML" ? e.ownerDocument.body : e;
						}
						for (N = lm(e.firstChild), ua = t, P = !0, da = null, fa = !0, n = vo(t, null, r, n), t.child = n; n;) n.flags = n.flags & -3 | 134221824, n = n.sibling;
					} else {
						if (va(), r === a) {
							t = fl(e, t, n);
							break a;
						}
						Lc(e, t, r, n);
					}
					t = t.child;
				}
				return t;
			case 26: return qc(e, t), e === null ? (n = Nm(t.type, null, t.pendingProps, null)) ? t.memoizedState = n : P || (t.stateNode = fp(t.type, t.pendingProps, Ne.current, t)) : t.memoizedState = Nm(t.type, e.memoizedProps, t.pendingProps, e.memoizedState), null;
			case 27: return Le(t), e === null && P && (r = t.stateNode = hm(t.type, t.pendingProps, Ne.current), ua = t, fa = !0, a = N, Sp(t.type) ? (um = a, N = lm(r.firstChild)) : N = a), Lc(e, t, t.pendingProps.children, n), qc(e, t), e === null && (t.flags |= 4194304), t.child;
			case 5: return e === null && P && ((a = r = N) && (r = rm(r, t.type, t.pendingProps, fa), r === null ? a = !1 : (t.stateNode = r, ua = t, N = lm(r.firstChild), fa = !1, a = !0)), a || ma(t)), Le(t), a = t.type, o = t.pendingProps, s = e === null ? null : e.memoizedProps, r = o.children, pp(a, o) ? r = null : s !== null && pp(a, s) && (t.flags |= 32), t.memoizedState !== null && (a = ns(e, t, as, null, null, n), sh._currentValue = a), qc(e, t), Lc(e, t, r, n), t.child;
			case 6: return e === null && P && ((e = n = N) && (n = im(n, t.pendingProps, fa), n === null ? e = !1 : (t.stateNode = n, ua = t, N = null, e = !0)), e || ma(t)), null;
			case 13: return tl(e, t, n);
			case 4: return Fe(t, t.stateNode.containerInfo), r = t.pendingProps, e === null ? t.child = _o(t, null, r, n) : Lc(e, t, r, n), t.child;
			case 11: return Rc(e, t, t.type, t.pendingProps, n);
			case 7: return r = t.pendingProps, qc(e, t), Lc(e, t, r, n), t.child;
			case 8: return Lc(e, t, t.pendingProps.children, n), t.child;
			case 12: return Lc(e, t, t.pendingProps.children, n), t.child;
			case 10: return dl(e, t, n);
			case 9: return a = t.type._context, r = t.pendingProps.children, Aa(t), a = ja(a), r = r(a), t.flags |= 1, Lc(e, t, r, n), t.child;
			case 14: return zc(e, t, t.type, t.pendingProps, n);
			case 15: return Bc(e, t, t.type, t.pendingProps, n);
			case 19: return ul(e, t, n);
			case 31: return Kc(e, t, n);
			case 22: return Vc(e, t, n, t.pendingProps);
			case 24: return Aa(t), r = ja(F), e === null ? (a = Za(), a === null && (a = G, o = La(), a.pooledCache = o, o.refCount++, o !== null && (a.pooledCacheLanes |= n), a = o), t.memoizedState = {
				parent: r,
				cache: a
			}, bo(t), wa(t, F, a)) : ((e.lanes & n) !== 0 && (xo(e, t), Oo(t, null, null, n), Do()), a = e.memoizedState, o = t.memoizedState, a.parent === r ? (r = o.cache, wa(t, F, r), r !== a.cache && Da(t, [F], n, !0)) : (a = {
				parent: r,
				cache: r
			}, t.memoizedState = a, t.lanes === 0 && (t.memoizedState = t.updateQueue.baseState = a), wa(t, F, r))), Lc(e, t, t.pendingProps.children, n), t.child;
			case 30: return t.stateNode === null && (t.stateNode = {
				autoName: null,
				paired: null,
				clones: null,
				ref: null
			}), r = t.pendingProps, r.name != null && r.name !== "auto" ? t.flags |= e === null ? 18882560 : 18874368 : P && sa(t), e !== null && e.memoizedProps.name !== r.name ? t.flags |= 4194816 : qc(e, t), Lc(e, t, r.children, n), t.child;
			case 29: throw t.pendingProps;
		}
		throw Error(i(156, t.tag));
	}
	function gl(e) {
		e.flags |= 4;
	}
	function _l(e, t, n, r, i) {
		var a;
		if ((a = !!(e.mode & 32)) && (a = n === null ? Jm(t, r) : Jm(t, r) && (r.src !== n.src || r.srcSet !== n.srcSet)), a) {
			if (e.flags |= 16777216, (i & 335544128) === i) {
				if (e.stateNode.complete) e.flags |= 8192;
				else if (Ud()) e.flags |= 8192;
				else throw so = ro, to;
			}
		} else e.flags &= -16777217;
	}
	function vl(e, t) {
		if (t.type !== "stylesheet" || t.state.loading & 4) e.flags &= -16777217;
		else if (e.flags |= 16777216, !Ym(t)) {
			if (Ud()) e.flags |= 8192;
			else throw so = ro, to;
		}
	}
	function yl(e, t) {
		t !== null && (e.flags |= 4), e.flags & 16384 && (t = e.tag === 22 ? 536870912 : k(), e.lanes |= t, dd |= t);
	}
	function bl(e, t) {
		if (!P) switch (e.tailMode) {
			case "visible": break;
			case "collapsed":
				for (var n = e.tail, r = null; n !== null;) n.alternate !== null && (r = n), n = n.sibling;
				r === null ? t || e.tail === null ? e.tail = null : e.tail.sibling = null : r.sibling = null;
				break;
			default:
				for (t = e.tail, n = null; t !== null;) t.alternate !== null && (n = t), t = t.sibling;
				n === null ? e.tail = null : n.sibling = null;
		}
	}
	function V(e) {
		var t = e.alternate !== null && e.alternate.child === e.child, n = 0, r = 0;
		if (t) for (var i = e.child; i !== null;) n |= i.lanes | i.childLanes, r |= i.subtreeFlags & 1206910976, r |= i.flags & 1206910976, i.return = e, i = i.sibling;
		else for (i = e.child; i !== null;) n |= i.lanes | i.childLanes, r |= i.subtreeFlags, r |= i.flags, i.return = e, i = i.sibling;
		return e.subtreeFlags |= r, e.childLanes = n, t;
	}
	function xl(e, t, n) {
		var r = t.pendingProps;
		switch (ca(t), t.tag) {
			case 16:
			case 15:
			case 0:
			case 11:
			case 7:
			case 8:
			case 12:
			case 9:
			case 14: return V(t), null;
			case 1: return V(t), null;
			case 3: return n = t.stateNode, r = null, e !== null && (r = e.memoizedState.cache), t.memoizedState.cache !== r && (t.flags |= 2048), Ta(F), Ie(), n.pendingContext && (n.context = n.pendingContext, n.pendingContext = null), (e === null || e.child === null) && (_a(t) ? gl(t) : e === null || e.memoizedState.isDehydrated && !(t.flags & 256) || (t.flags |= 1024, ya())), V(t), null;
			case 26:
				var a = t.type, o = t.memoizedState;
				return e === null ? (gl(t), o === null ? (V(t), _l(t, a, null, r, n)) : (V(t), vl(t, o))) : o ? o === e.memoizedState ? (V(t), t.flags &= -16777217) : (gl(t), V(t), vl(t, o)) : (e = e.memoizedProps, e !== r && gl(t), V(t), _l(t, a, e, r, n)), null;
			case 27:
				if (Re(t), n = Ne.current, a = t.type, e !== null && t.stateNode != null) e.memoizedProps !== r && gl(t);
				else {
					if (!r) {
						if (t.stateNode === null) throw Error(i(166));
						return V(t), t.subtreeFlags &= -33554433, null;
					}
					e = je.current, _a(t) ? ha(t, e) : (e = hm(a, r, n), t.stateNode = e, gl(t));
				}
				return V(t), t.subtreeFlags &= -33554433, null;
			case 5:
				if (Re(t), a = t.type, e !== null && t.stateNode != null) e.memoizedProps !== r && gl(t);
				else {
					if (!r) {
						if (t.stateNode === null) throw Error(i(166));
						return V(t), t.subtreeFlags &= -33554433, null;
					}
					if (o = je.current, _a(t)) ha(t, o);
					else {
						var s = lp(Ne.current);
						switch (o) {
							case 1:
								o = s.createElementNS("http://www.w3.org/2000/svg", a);
								break;
							case 2:
								o = s.createElementNS("http://www.w3.org/1998/Math/MathML", a);
								break;
							default: switch (a) {
								case "svg":
									o = s.createElementNS("http://www.w3.org/2000/svg", a);
									break;
								case "math":
									o = s.createElementNS("http://www.w3.org/1998/Math/MathML", a);
									break;
								case "script":
									o = s.createElement("div"), o.innerHTML = "<script><\/script>", o = o.removeChild(o.firstChild);
									break;
								case "select":
									o = typeof r.is == "string" ? s.createElement("select", { is: r.is }) : s.createElement("select"), r.multiple ? o.multiple = !0 : r.size && (o.size = r.size);
									break;
								default: o = typeof r.is == "string" ? s.createElement(a, { is: r.is }) : s.createElement(a);
							}
						}
						o[j] = t, o[At] = r;
						a: for (s = t.child; s !== null;) {
							if (s.tag === 5 || s.tag === 6) o.appendChild(s.stateNode);
							else if (s.tag !== 4 && s.tag !== 27 && s.child !== null) {
								s.child.return = s, s = s.child;
								continue;
							}
							if (s === t) break a;
							for (; s.sibling === null;) {
								if (s.return === null || s.return === t) break a;
								s = s.return;
							}
							s.sibling.return = s.return, s = s.sibling;
						}
						t.stateNode = o;
						a: switch (np(o, a, r), a) {
							case "button":
							case "input":
							case "select":
							case "textarea":
								r = !!r.autoFocus;
								break a;
							case "img":
								r = !0;
								break a;
							default: r = !1;
						}
						r && gl(t);
					}
				}
				return V(t), t.subtreeFlags &= -33554433, _l(t, t.type, e === null ? null : e.memoizedProps, t.pendingProps, n), null;
			case 6:
				if (e && t.stateNode != null) e.memoizedProps !== r && gl(t);
				else {
					if (typeof r != "string" && t.stateNode === null) throw Error(i(166));
					if (e = Ne.current, _a(t)) {
						if (e = t.stateNode, n = t.memoizedProps, r = null, a = ua, a !== null) switch (a.tag) {
							case 27:
							case 5: r = a.memoizedProps;
						}
						e[j] = t, e = !!(e.nodeValue === n || r !== null && !0 === r.suppressHydrationWarning || ep(e.nodeValue, n)), e || ma(t, !0);
					} else e = lp(e).createTextNode(r), e[j] = t, t.stateNode = e;
				}
				return V(t), null;
			case 31:
				if (n = t.memoizedState, e === null || e.memoizedState !== null) {
					if (r = _a(t), n !== null) {
						if (e === null) {
							if (!r) throw Error(i(318));
							if (e = t.memoizedState, e = e === null ? null : e.dehydrated, !e) throw Error(i(557));
							e[j] = t;
						} else va(), !(t.flags & 128) && (t.memoizedState = null), t.flags |= 4;
						V(t), e = !1;
					} else n = ya(), e !== null && e.memoizedState !== null && (e.memoizedState.hydrationErrors = n), e = !0;
					if (!e) return t.flags & 256 ? (Ho(t), t) : (Ho(t), null);
					if (t.flags & 128) throw Error(i(558));
				}
				return V(t), null;
			case 13:
				if (r = t.memoizedState, e === null || e.memoizedState !== null && e.memoizedState.dehydrated !== null) {
					if (a = _a(t), r !== null && r.dehydrated !== null) {
						if (e === null) {
							if (!a) throw Error(i(318));
							if (a = t.memoizedState, a = a === null ? null : a.dehydrated, !a) throw Error(i(317));
							a[j] = t;
						} else va(), !(t.flags & 128) && (t.memoizedState = null), t.flags |= 4;
						V(t), a = !1;
					} else a = ya(), e !== null && e.memoizedState !== null && (e.memoizedState.hydrationErrors = a), a = !0;
					if (!a) return t.flags & 256 ? (Ho(t), t) : (Ho(t), null);
				}
				return Ho(t), t.flags & 128 ? (t.lanes = n, t) : (n = r !== null, e = e !== null && e.memoizedState !== null, n && (r = t.child, a = null, r.alternate !== null && r.alternate.memoizedState !== null && r.alternate.memoizedState.cachePool !== null && (a = r.alternate.memoizedState.cachePool.pool), o = null, r.memoizedState !== null && r.memoizedState.cachePool !== null && (o = r.memoizedState.cachePool.pool), o !== a && (r.flags |= 2048)), n !== e && n && (t.child.flags |= 8192), yl(t, t.updateQueue), V(t), null);
			case 4: return Ie(), e === null && Wf(t.stateNode.containerInfo), t.flags |= 67108864, V(t), null;
			case 10: return Ta(t.type), V(t), null;
			case 19:
				if (Go(t), r = t.memoizedState, r === null) return V(t), null;
				if (a = !!(t.flags & 128), o = r.rendering, o === null) {
					if (a) bl(r, !1);
					else {
						if (Y !== 0 || e !== null && e.flags & 128) for (e = t.child; e !== null;) {
							if (o = Ko(e), o !== null) {
								for (t.flags |= 128, bl(r, !1), e = o.updateQueue, t.updateQueue = e, yl(t, e), t.subtreeFlags = 0, e = n, n = t.child; n !== null;) Hi(n, e), n = n.sibling;
								return Wo(t, Uo.current & 1 | 2), P && aa(t, r.treeForkCount), t.child;
							}
							e = e.sibling;
						}
						r.tail !== null && Ze() > _d && (t.flags |= 128, a = !0, bl(r, !1), t.lanes = 4194304);
					}
				} else {
					if (!a) {
						if (e = Ko(o), e !== null) {
							if (t.flags |= 128, a = !0, e = e.updateQueue, t.updateQueue = e, yl(t, e), bl(r, !0), r.tail === null && r.tailMode !== "collapsed" && r.tailMode !== "visible" && !o.alternate && !P) return V(t), null;
						} else 2 * Ze() - r.renderingStartTime > _d && n !== 536870912 && (t.flags |= 128, a = !0, bl(r, !1), t.lanes = 4194304);
					}
					r.isBackwards ? (o.sibling = t.child, t.child = o) : (e = r.last, e === null ? t.child = o : e.sibling = o, r.last = o);
				}
				if (r.tail !== null) {
					e = r.tail;
					a: {
						for (n = e; n !== null;) {
							if (n.alternate !== null) {
								n = !1;
								break a;
							}
							n = n.sibling;
						}
						n = !0;
					}
					return r.rendering = e, r.tail = e.sibling, r.renderingStartTime = Ze(), e.sibling = null, o = Uo.current, o = a ? o & 1 | 2 : o & 1, r.tailMode === "visible" || r.tailMode === "collapsed" || !n || P ? Wo(t, o) : (n = o, D(Io, t), D(Uo, n), Lo === null && (Lo = t)), P && aa(t, r.treeForkCount), e;
				}
				return V(t), null;
			case 22:
			case 23: return Ho(t), Fo(), r = t.memoizedState !== null, e === null ? r && (t.flags |= 8192) : e.memoizedState !== null !== r && (t.flags |= 8192), r ? n & 536870912 && !(t.flags & 128) && (V(t), t.subtreeFlags & 6 && (t.flags |= 8192)) : V(t), n = t.updateQueue, n !== null && yl(t, n.retryQueue), n = null, e !== null && e.memoizedState !== null && e.memoizedState.cachePool !== null && (n = e.memoizedState.cachePool.pool), r = null, t.memoizedState !== null && t.memoizedState.cachePool !== null && (r = t.memoizedState.cachePool.pool), r !== n && (t.flags |= 2048), e !== null && Ae(Xa), null;
			case 24: return n = null, e !== null && (n = e.memoizedState.cache), t.memoizedState.cache !== n && (t.flags |= 2048), Ta(F), V(t), null;
			case 25: return null;
			case 30: return t.flags |= 33554432, V(t), null;
		}
		throw Error(i(156, t.tag));
	}
	function Sl(e, t) {
		switch (ca(t), t.tag) {
			case 1: return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
			case 3: return Ta(F), Ie(), e = t.flags, e & 65536 && !(e & 128) ? (t.flags = e & -65537 | 128, t) : null;
			case 26:
			case 27:
			case 5: return Re(t), null;
			case 31:
				if (t.memoizedState !== null) {
					if (Ho(t), t.alternate === null) throw Error(i(340));
					va();
				}
				return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
			case 13:
				if (Ho(t), e = t.memoizedState, e !== null && e.dehydrated !== null) {
					if (t.alternate === null) throw Error(i(340));
					va();
				}
				return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
			case 19: return Go(t), e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, e = t.memoizedState, e !== null && (e.rendering = null, e.tail = null), t.flags |= 4, t) : null;
			case 4: return Ie(), null;
			case 10: return Ta(t.type), null;
			case 22:
			case 23: return Ho(t), Fo(), e !== null && Ae(Xa), e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
			case 24: return Ta(F), null;
			case 25: return null;
			default: return null;
		}
	}
	function Cl(e, t) {
		switch (ca(t), t.tag) {
			case 3:
				Ta(F), Ie();
				break;
			case 26:
			case 27:
			case 5:
				Re(t);
				break;
			case 4:
				Ie();
				break;
			case 31:
				t.memoizedState !== null && Ho(t);
				break;
			case 13:
				Ho(t);
				break;
			case 19:
				Go(t);
				break;
			case 10:
				Ta(t.type);
				break;
			case 22:
			case 23:
				Ho(t), Fo(), e !== null && Ae(Xa);
				break;
			case 24: Ta(F);
		}
	}
	function wl(e, t) {
		try {
			var n = t.updateQueue, r = n === null ? null : n.lastEffect;
			if (r !== null) {
				var i = r.next;
				n = i;
				do {
					if ((n.tag & e) === e) {
						r = void 0;
						var a = n.create, o = n.inst;
						r = a(), o.destroy = r;
					}
					n = n.next;
				} while (n !== i);
			}
		} catch (e) {
			Z(t, t.return, e);
		}
	}
	function Tl(e, t, n) {
		try {
			var r = t.updateQueue, i = r === null ? null : r.lastEffect;
			if (i !== null) {
				var a = i.next;
				r = a;
				do {
					if ((r.tag & e) === e) {
						var o = r.inst, s = o.destroy;
						if (s !== void 0) {
							o.destroy = void 0, i = t;
							var c = n, l = s;
							try {
								l();
							} catch (e) {
								Z(i, c, e);
							}
						}
					}
					r = r.next;
				} while (r !== a);
			}
		} catch (e) {
			Z(t, t.return, e);
		}
	}
	function El(e) {
		var t = e.updateQueue;
		if (t !== null) {
			var n = e.stateNode;
			try {
				Ao(t, n);
			} catch (t) {
				Z(e, e.return, t);
			}
		}
	}
	function Dl(e, t, n) {
		n.props = Tc(e.type, e.memoizedProps), n.state = e.memoizedState;
		try {
			n.componentWillUnmount();
		} catch (n) {
			Z(e, t, n);
		}
	}
	function Ol(e, t) {
		try {
			var n = e.ref;
			if (n !== null) {
				switch (e.tag) {
					case 26:
					case 27:
					case 5:
						var r = e.stateNode;
						break;
					case 30:
						var i = e.stateNode, a = wi(e.memoizedProps, i);
						(i.ref === null || i.ref.name !== a) && (i.ref = Pp(a)), r = i.ref;
						break;
					case 7:
						if (e.stateNode === null) {
							var o = new Fp(e);
							h(e.child, !1, Qp, o, void 0, void 0), e.stateNode = o;
						}
						r = e.stateNode;
						break;
					default: r = e.stateNode;
				}
				typeof n == "function" ? e.refCleanup = n(r) : n.current = r;
			}
		} catch (n) {
			Z(e, t, n);
		}
	}
	function kl(e, t) {
		var n = e.ref, r = e.refCleanup;
		if (n !== null) {
			if (typeof r == "function") try {
				r();
			} catch (n) {
				Z(e, t, n);
			} finally {
				e.refCleanup = null, e = e.alternate, e != null && (e.refCleanup = null);
			}
			else if (typeof n == "function") try {
				n(null);
			} catch (n) {
				Z(e, t, n);
			}
			else n.current = null;
		}
	}
	function Al(e, t) {
		if ((e.tag === 5 || e.tag === 27 || e.tag === 6) && e.alternate === null && t !== null) for (var n = 0; n < t.length; n++) em(e.stateNode, t[n]);
	}
	function jl(e) {
		for (var t = e.return; t !== null && (Pl(t) && em(e.stateNode, t.stateNode), !Nl(t));) t = t.return;
	}
	function Ml(e) {
		for (var t = e.return; t !== null && (Pl(t) && tm(e.stateNode, t.stateNode), !Nl(t));) t = t.return;
	}
	function Nl(e) {
		return e.tag === 5 || e.tag === 3 || e.tag === 27;
	}
	function Pl(e) {
		return e && e.tag === 7 && e.stateNode !== null;
	}
	function Fl(e) {
		var t = e.type, n = e.memoizedProps, r = e.stateNode;
		try {
			a: switch (t) {
				case "button":
				case "input":
				case "select":
				case "textarea":
					n.autoFocus && r.focus();
					break a;
				case "img": n.src ? r.src = n.src : n.srcSet && (r.srcset = n.srcSet);
			}
		} catch (t) {
			Z(e, e.return, t);
		}
	}
	function Il(e, t, n) {
		try {
			var r = e.stateNode;
			ip(r, e.type, n, t), r[At] = t;
		} catch (t) {
			Z(e, e.return, t);
		}
	}
	function Ll(e) {
		return e.tag === 5 || e.tag === 3 || e.tag === 26 || e.tag === 27 && Sp(e.type) || e.tag === 4;
	}
	function Rl(e) {
		a: for (;;) {
			for (; e.sibling === null;) {
				if (e.return === null || Ll(e.return)) return null;
				e = e.return;
			}
			for (e.sibling.return = e.return, e = e.sibling; e.tag !== 5 && e.tag !== 6 && e.tag !== 18;) {
				if (e.tag === 27 && Sp(e.type) || e.flags & 2 || e.child === null || e.tag === 4) continue a;
				e.child.return = e, e = e.child;
			}
			if (!(e.flags & 2)) return e.stateNode;
		}
	}
	function zl(e, t, n, r) {
		var i = e.tag;
		if (i === 5 || i === 6) i = e.stateNode, t ? (n.nodeType === 9 ? n.body : n.nodeName === "HTML" ? n.ownerDocument.body : n).insertBefore(i, t) : (t = n.nodeType === 9 ? n.body : n.nodeName === "HTML" ? n.ownerDocument.body : n, t.appendChild(i), n = n._reactRootContainer, n != null || t.onclick !== null || (t.onclick = Tn)), Al(e, r), M = !0;
		else if (i !== 4 && (i === 27 && (Al(e, r), r = null, Sp(e.type) && (n = e.stateNode, t = null)), e = e.child, e !== null)) for (zl(e, t, n, r), e = e.sibling; e !== null;) zl(e, t, n, r), e = e.sibling;
	}
	function Bl(e, t, n, r) {
		var i = e.tag;
		if (i === 5 || i === 6) i = e.stateNode, t ? n.insertBefore(i, t) : n.appendChild(i), Al(e, r), M = !0;
		else if (i !== 4 && (i === 27 && (Al(e, r), r = null, Sp(e.type) && (n = e.stateNode)), e = e.child, e !== null)) for (Bl(e, t, n, r), e = e.sibling; e !== null;) Bl(e, t, n, r), e = e.sibling;
	}
	function Vl(e) {
		var t = e.stateNode, n = e.memoizedProps;
		try {
			for (var r = e.type, i = t.attributes; i.length;) t.removeAttributeNode(i[0]);
			np(t, r, n), t[j] = e, t[At] = n;
		} catch (t) {
			Z(e, e.return, t);
		}
	}
	var Hl = !1, Ul = null;
	function Wl(e) {
		(e.tag === 30 || e.subtreeFlags & 33554432) && (Hl = !0);
	}
	var Gl = null;
	function Kl() {
		var e = Gl;
		return Gl = null, e;
	}
	var ql = 0;
	function Jl(e, t, n, r, i) {
		return ql = 0, Yl(e.child, t, n, r, i);
	}
	function Yl(e, t, n, r, i) {
		for (var a = !1; e !== null;) {
			if (e.tag === 5) {
				var o = e.stateNode;
				if (r !== null) {
					var s = Op(o);
					r.push(s), s.view && (a = !0);
				} else a || Op(o).view && (a = !0);
				Hl = !0, Tp(o, ql === 0 ? t : t + "_" + ql, n), ql++;
			} else (e.tag !== 22 || e.memoizedState === null) && (e.tag === 30 && i || Yl(e.child, t, n, r, i) && (a = !0));
			e = e.sibling;
		}
		return a;
	}
	function Xl(e, t) {
		for (; e !== null;) e.tag === 5 ? Ep(e.stateNode, e.memoizedProps) : (e.tag !== 22 || e.memoizedState === null) && (e.tag === 30 && t || Xl(e.child, t)), e = e.sibling;
	}
	function Zl(e) {
		if (e.subtreeFlags & 18874368) for (e = e.child; e !== null;) {
			if ((e.tag !== 22 || e.memoizedState === null) && (Zl(e), e.tag === 30 && e.flags & 18874368 && e.stateNode.paired)) {
				var t = e.memoizedProps;
				if (t.name == null || t.name === "auto") throw Error(i(544));
				var n = t.name;
				t = Ei(t.default, t.share), t !== "none" && (Jl(e, n, t, null, !1) || Xl(e.child, !1));
			}
			e = e.sibling;
		}
	}
	function Ql(e, t) {
		if (e.tag === 30) {
			var n = e.stateNode, r = e.memoizedProps, i = wi(r, n), a = Ei(r.default, n.paired ? r.share : r.enter);
			a === "none" ? Zl(e) : Jl(e, i, a, null, !1) ? (Zl(e), n.paired || t || Nd(e, r.onEnter)) : Xl(e.child, !1);
		} else if (e.subtreeFlags & 33554432) for (e = e.child; e !== null;) Ql(e, t), e = e.sibling;
		else Zl(e);
	}
	function $l(e) {
		if (Ul !== null && Ul.size !== 0) {
			var t = Ul;
			if (e.subtreeFlags & 18874368) for (e = e.child; e !== null;) {
				if (e.tag !== 22 || e.memoizedState === null) {
					if (e.tag === 30 && e.flags & 18874368) {
						var n = e.memoizedProps, r = n.name;
						if (r != null && r !== "auto") {
							var i = t.get(r);
							if (i !== void 0) {
								var a = Ei(n.default, n.share);
								if (a !== "none" && (Jl(e, r, a, null, !1) ? (a = e.stateNode, i.paired = a, a.paired = i, Nd(e, n.onShare)) : Xl(e.child, !1)), t.delete(r), t.size === 0) break;
							}
						}
					}
					$l(e);
				}
				e = e.sibling;
			}
		}
	}
	function eu(e) {
		if (e.tag === 30) {
			var t = e.memoizedProps, n = wi(t, e.stateNode), r = Ul === null ? void 0 : Ul.get(n), i = Ei(t.default, r === void 0 ? t.exit : t.share);
			i !== "none" && (Jl(e, n, i, null, !1) ? r === void 0 ? Nd(e, t.onExit) : (i = e.stateNode, r.paired = i, i.paired = r, Ul.delete(n), Nd(e, t.onShare)) : Xl(e.child, !1)), Ul !== null && $l(e);
		} else if (e.subtreeFlags & 33554432) for (e = e.child; e !== null;) eu(e), e = e.sibling;
		else Ul !== null && $l(e);
	}
	function tu(e) {
		for (e = e.child; e !== null;) {
			if (e.tag === 30) {
				var t = e.memoizedProps, n = wi(t, e.stateNode);
				t = Ei(t.default, t.update), e.flags &= -5, t !== "none" && Jl(e, n, t, e.memoizedState = [], !1);
			} else e.subtreeFlags & 33554432 && tu(e);
			e = e.sibling;
		}
	}
	function nu(e) {
		if (e.subtreeFlags & 18874368) for (e = e.child; e !== null;) {
			if (e.tag !== 22 || e.memoizedState === null) {
				if (e.tag === 30 && e.flags & 18874368) {
					var t = e.stateNode;
					t.paired !== null && (t.paired = null, Xl(e.child, !1));
				}
				nu(e);
			}
			e = e.sibling;
		}
	}
	function ru(e) {
		if (e.tag === 30) e.stateNode.paired = null, Xl(e.child, !1), nu(e);
		else if (e.subtreeFlags & 33554432) for (e = e.child; e !== null;) ru(e), e = e.sibling;
		else nu(e);
	}
	function iu(e) {
		for (e = e.child; e !== null;) e.tag === 30 ? Xl(e.child, !1) : e.subtreeFlags & 33554432 && iu(e), e = e.sibling;
	}
	function au(e, t, n, r, i, a, o) {
		for (var s = !1; t !== null;) {
			if (t.tag === 5) {
				var c = t.stateNode;
				if (a !== null && ql < a.length) {
					var l = a[ql], u = Op(c);
					(l.view || u.view) && (s = !0);
					var d;
					if (d = !(e.flags & 4)) {
						if (u.clip) d = !0;
						else {
							d = l.rect;
							var f = u.rect;
							d = d.y !== f.y || d.x !== f.x || d.height !== f.height || d.width !== f.width;
						}
					}
					d && (e.flags |= 4), u.abs ? u = !l.abs : (l = l.rect, u = u.rect, u = l.height !== u.height || l.width !== u.width), u && (e.flags |= 32);
				} else e.flags |= 32;
				e.flags & 4 && Tp(c, ql === 0 ? n : n + "_" + ql, i), s && e.flags & 4 || (Gl === null && (Gl = []), Gl.push(c, ql === 0 ? r : r + "_" + ql, t.memoizedProps)), ql++;
			} else (t.tag !== 22 || t.memoizedState === null) && (t.tag === 30 && o ? e.flags |= t.flags & 32 : au(e, t.child, n, r, i, a, o) && (s = !0));
			t = t.sibling;
		}
		return s;
	}
	function ou(e, t) {
		for (e = e.child; e !== null;) {
			if (e.tag === 30) {
				var n = e.memoizedProps, r = e.stateNode, i = wi(n, r), a = Ei(n.default, n.update);
				if (t) {
					r = r.clones;
					var o = r === null ? null : r.map(kp);
				} else o = e.memoizedState, e.memoizedState = null;
				r = e;
				var s = e.child;
				ql = 0, i = au(r, s, i, i, a, o, !1), e.flags & 4 && i && (t || Nd(e, n.onUpdate));
			} else e.subtreeFlags & 33554432 && ou(e, t);
			e = e.sibling;
		}
	}
	var su = !1, H = !1, cu = !1, lu = !1, uu = typeof WeakSet == "function" ? WeakSet : Set, du = null, fu = !1, pu = !1, mu = !1, hu = !1;
	function gu(e, t, n) {
		if (e = e.containerInfo, sp = gh, e = ei(e), ti(e)) {
			if ("selectionStart" in e) var r = {
				start: e.selectionStart,
				end: e.selectionEnd
			};
			else a: {
				r = (r = e.ownerDocument) && r.defaultView || window;
				var i = r.getSelection && r.getSelection();
				if (i && i.rangeCount !== 0) {
					r = i.anchorNode;
					var a = i.anchorOffset, o = i.focusNode;
					i = i.focusOffset;
					try {
						r.nodeType, o.nodeType;
					} catch {
						r = null;
						break a;
					}
					var s = 0, c = -1, l = -1, u = 0, d = 0, f = e, p = null;
					b: for (;;) {
						for (var m; f !== r || a !== 0 && f.nodeType !== 3 || (c = s + a), f !== o || i !== 0 && f.nodeType !== 3 || (l = s + i), f.nodeType === 3 && (s += f.nodeValue.length), (m = f.firstChild) !== null;) p = f, f = m;
						for (;;) {
							if (f === e) break b;
							if (p === r && ++u === a && (c = s), p === o && ++d === i && (l = s), (m = f.nextSibling) !== null) break;
							f = p, p = f.parentNode;
						}
						f = m;
					}
					r = c === -1 || l === -1 ? null : {
						start: c,
						end: l
					};
				} else r = null;
			}
			r ||= {
				start: 0,
				end: 0
			};
		} else r = null;
		for (cp = {
			focusedElem: e,
			selectionRange: r
		}, gh = !1, n = (n & 335544064) === n, du = t, t = n ? 9270 : 1024; du !== null;) {
			if (e = du, n && (r = e.deletions, r !== null)) for (a = 0; a < r.length; a++) n && eu(r[a]);
			if (e.alternate === null && e.flags & 2) n && Wl(e), _u(n);
			else {
				if (e.tag === 22) {
					if (r = e.alternate, e.memoizedState !== null) {
						r !== null && r.memoizedState === null && n && eu(r), _u(n);
						continue;
					}
					if (r !== null && r.memoizedState !== null) {
						n && Wl(e), _u(n);
						continue;
					}
				}
				r = e.child, (e.subtreeFlags & t) !== 0 && r !== null ? (r.return = e, du = r) : (n && tu(e), _u(n));
			}
		}
		Ul = null;
	}
	function _u(e) {
		for (; du !== null;) {
			var t = du, n = e, r = t.alternate, a = t.flags;
			switch (t.tag) {
				case 0:
				case 11:
				case 15: break;
				case 1:
					if (a & 1024 && r !== null) {
						n = void 0, a = r.memoizedProps, r = r.memoizedState;
						var o = t.stateNode;
						try {
							var s = Tc(t.type, a);
							n = o.getSnapshotBeforeUpdate(s, r), o.__reactInternalSnapshotBeforeUpdate = n;
						} catch (e) {
							Z(t, t.return, e);
						}
					}
					break;
				case 3:
					if (a & 1024) {
						if (r = t.stateNode.containerInfo, n = r.nodeType, n === 9) nm(r);
						else if (n === 1) switch (r.nodeName) {
							case "HEAD":
							case "HTML":
							case "BODY":
								nm(r);
								break;
							default: r.textContent = "";
						}
					}
					break;
				case 5:
				case 26:
				case 27:
				case 6:
				case 4:
				case 17: break;
				case 30:
					n && r !== null && (n = wi(r.memoizedProps, r.stateNode), a = t.memoizedProps, a = Ei(a.default, a.update), a !== "none" && Jl(r, n, a, r.memoizedState = [], !0));
					break;
				default: if (a & 1024) throw Error(i(163));
			}
			if (r = t.sibling, r !== null) {
				r.return = t.return, du = r;
				break;
			}
			du = t.return;
		}
	}
	function vu(e, t, n) {
		var r = n.flags;
		switch (n.tag) {
			case 0:
			case 11:
			case 15:
				Lu(e, n), r & 4 && wl(5, n);
				break;
			case 1:
				if (Lu(e, n), r & 4) {
					if (e = n.stateNode, t === null) try {
						e.componentDidMount();
					} catch (e) {
						Z(n, n.return, e);
					}
					else {
						var i = Tc(n.type, t.memoizedProps);
						t = t.memoizedState;
						try {
							e.componentDidUpdate(i, t, e.__reactInternalSnapshotBeforeUpdate);
						} catch (e) {
							Z(n, n.return, e);
						}
					}
				}
				r & 64 && El(n), r & 512 && Ol(n, n.return);
				break;
			case 3:
				if (Lu(e, n), r & 64 && (e = n.updateQueue, e !== null)) {
					if (t = null, n.child !== null) switch (n.child.tag) {
						case 27:
						case 5:
							t = n.child.stateNode;
							break;
						case 1: t = n.child.stateNode;
					}
					try {
						Ao(e, t);
					} catch (e) {
						Z(n, n.return, e);
					}
				}
				break;
			case 27: t === null && r & 4 && Vl(n);
			case 26:
			case 5:
				Lu(e, n), t === null && r & 4 && Fl(n), r & 512 && Ol(n, n.return);
				break;
			case 12:
				Lu(e, n);
				break;
			case 31:
				Lu(e, n), r & 4 && Eu(e, n);
				break;
			case 13:
				Lu(e, n), r & 4 && Du(e, n), r & 64 && (e = n.memoizedState, e !== null && (e = e.dehydrated, e !== null && (n = _f.bind(null, n), cm(e, n))));
				break;
			case 22:
				if (r = n.memoizedState !== null || su, !r) {
					var a = t !== null && t.memoizedState !== null || H;
					t = su, i = H, su = r, (H = a) && !i ? (r = 2, n.subtreeFlags & 8772 && (r |= 1), zu(e, n, r)) : Lu(e, n), su = t, H = i;
				}
				break;
			case 30:
				Lu(e, n), r & 512 && Ol(n, n.return);
				break;
			case 7: r & 512 && Ol(n, n.return);
			default: Lu(e, n);
		}
	}
	function yu(e, t) {
		for (e = e.child; e !== null;) bu(e, t), e = e.sibling;
	}
	function bu(e, t) {
		switch (e.tag) {
			case 5:
			case 26:
				try {
					var n = e.stateNode;
					if (t) {
						var r = n.style;
						typeof r.setProperty == "function" ? r.setProperty("display", "none", "important") : r.display = "none";
					} else {
						var i = e.stateNode, a = e.memoizedProps.style, o = a != null && a.hasOwnProperty("display") ? a.display : null;
						i.style.display = o == null || typeof o == "boolean" ? "" : ("" + o).trim();
					}
				} catch (t) {
					Z(e, e.return, t);
				}
				xu(e, t);
				break;
			case 6:
				try {
					e.stateNode.nodeValue = t ? "" : e.memoizedProps, M = !0;
				} catch (t) {
					Z(e, e.return, t);
				}
				break;
			case 18:
				try {
					var s = e.stateNode;
					t ? wp(s, !0) : wp(e.stateNode, !1);
				} catch (t) {
					Z(e, e.return, t);
				}
				break;
			case 22:
			case 23:
				e.memoizedState === null && yu(e, t);
				break;
			default: yu(e, t);
		}
	}
	function xu(e, t) {
		if (e.subtreeFlags & 67108864) for (e = e.child; e !== null;) {
			a: {
				var n = e, r = t;
				switch (n.tag) {
					case 4:
						bu(n, r);
						break a;
					case 22:
						n.memoizedState === null && xu(n, r);
						break a;
					default: xu(n, r);
				}
			}
			e = e.sibling;
		}
	}
	function Su(e) {
		var t = e.alternate;
		t !== null && (e.alternate = null, Su(t)), e.child = null, e.deletions = null, e.sibling = null, e.tag === 5 && (t = e.stateNode, t !== null && Rt(t)), e.stateNode = null, e.return = null, e.dependencies = null, e.memoizedProps = null, e.memoizedState = null, e.pendingProps = null, e.stateNode = null, e.updateQueue = null;
	}
	var U = null, Cu = !1;
	function wu(e, t, n) {
		for (n = n.child; n !== null;) Tu(e, t, n), n = n.sibling;
	}
	function Tu(e, t, n) {
		if (st && typeof st.onCommitFiberUnmount == "function") try {
			st.onCommitFiberUnmount(ot, n);
		} catch {}
		switch (n.tag) {
			case 26:
				H || kl(n, t), wu(e, t, n), n.memoizedState ? n.memoizedState.count-- : n.stateNode && !H && (n = n.stateNode, n.parentNode.removeChild(n));
				break;
			case 27:
				H || kl(n, t), Ml(n);
				var r = U, i = Cu;
				Sp(n.type) && (U = n.stateNode, Cu = !1), wu(e, t, n), gm(n.stateNode, n.type, n.memoizedProps), U = r, Cu = i;
				break;
			case 5: H || kl(n, t), Ml(n);
			case 6:
				if (n.tag === 6 && Ml(n), r = U, i = Cu, U = null, wu(e, t, n), U = r, Cu = i, U !== null) {
					if (Cu) try {
						(U.nodeType === 9 ? U.body : U.nodeName === "HTML" ? U.ownerDocument.body : U).removeChild(n.stateNode), M = !0;
					} catch (e) {
						Z(n, t, e);
					}
					else try {
						U.removeChild(n.stateNode), M = !0;
					} catch (e) {
						Z(n, t, e);
					}
				}
				break;
			case 18:
				U !== null && (Cu ? (e = U, Cp(e.nodeType === 9 ? e.body : e.nodeName === "HTML" ? e.ownerDocument.body : e, n.stateNode), Hh(e)) : Cp(U, n.stateNode));
				break;
			case 4:
				r = U, i = Cu, U = n.stateNode.containerInfo, Cu = !0, wu(e, t, n), U = r, Cu = i;
				break;
			case 0:
			case 11:
			case 14:
			case 15:
				Tl(2, n, t), H || Tl(4, n, t), wu(e, t, n);
				break;
			case 1:
				H || (kl(n, t), r = n.stateNode, typeof r.componentWillUnmount == "function" && Dl(n, t, r)), wu(e, t, n);
				break;
			case 21:
				wu(e, t, n);
				break;
			case 22:
				H = (r = H) || n.memoizedState !== null, wu(e, t, n), H = r;
				break;
			case 30:
				kl(n, t), wu(e, t, n);
				break;
			case 7:
				H || kl(n, t), wu(e, t, n);
				break;
			default: wu(e, t, n);
		}
	}
	function Eu(e, t) {
		if (t.memoizedState === null && (e = t.alternate, e !== null && (e = e.memoizedState, e !== null))) {
			e = e.dehydrated;
			try {
				Hh(e);
			} catch (e) {
				Z(t, t.return, e);
			}
		}
	}
	function Du(e, t) {
		if (t.memoizedState === null && (e = t.alternate, e !== null && (e = e.memoizedState, e !== null && (e = e.dehydrated, e !== null)))) try {
			Hh(e);
		} catch (e) {
			Z(t, t.return, e);
		}
	}
	function Ou(e) {
		switch (e.tag) {
			case 31:
			case 13:
			case 19:
				var t = e.stateNode;
				return t === null && (t = e.stateNode = new uu()), t;
			case 22: return e = e.stateNode, t = e._retryCache, t === null && (t = e._retryCache = new uu()), t;
			default: throw Error(i(435, e.tag));
		}
	}
	function ku(e, t) {
		var n = Ou(e);
		t.forEach(function(t) {
			if (!n.has(t)) {
				n.add(t);
				var r = vf.bind(null, e, t);
				t.then(r, r);
			}
		});
	}
	function Au(e, t, n) {
		var r = t.deletions;
		if (r !== null) for (var a = 0; a < r.length; a++) {
			var o = r[a], s = e, c = t, l = c;
			a: for (; l !== null;) {
				switch (l.tag) {
					case 27:
						if (Sp(l.type)) {
							U = l.stateNode, Cu = !1;
							break a;
						}
						break;
					case 5:
						U = l.stateNode, Cu = !1;
						break a;
					case 3:
					case 4:
						U = l.stateNode.containerInfo, Cu = !0;
						break a;
				}
				l = l.return;
			}
			if (U === null) throw Error(i(160));
			Tu(s, c, o), U = null, Cu = !1, s = o.alternate, s !== null && (s.return = null), o.return = null;
		}
		if (t.subtreeFlags & 13886) for (t = t.child; t !== null;) Mu(t, e, n), t = t.sibling;
	}
	var ju = null;
	function Mu(e, t, n) {
		var r = e.alternate, a = e.flags;
		switch (e.tag) {
			case 0:
			case 11:
			case 14:
			case 15:
				if (a & 4 && (r = e.updateQueue, r = r === null ? null : r.events, r !== null)) for (var o = 0; o < r.length; o++) {
					var s = r[o];
					s.ref.impl = s.nextImpl;
				}
				Au(t, e, n), Nu(e), a & 4 && (Tl(3, e, e.return), wl(3, e), Tl(5, e, e.return));
				break;
			case 1:
				Au(t, e, n), Nu(e), a & 512 && (H || r === null || kl(r, r.return)), a & 64 && su && (e = e.updateQueue, e !== null && (t = e.callbacks, t !== null && (n = e.shared.hiddenCallbacks, e.shared.hiddenCallbacks = n === null ? t : n.concat(t))));
				break;
			case 26:
				if (o = ju, Au(t, e, n), Nu(e), a & 512 && (H || r === null || kl(r, r.return)), a & 4) {
					if (a = r === null ? null : r.memoizedState, n = e.memoizedState, r === null) {
						if (n === null) {
							if (e.stateNode === null) {
								if (su) e.stateNode = fp(e.type, e.memoizedProps, t.containerInfo, e);
								else {
									a: {
										t = e.type, n = e.memoizedProps, a = o.ownerDocument || o;
										b: switch (t) {
											case "title":
												r = a.getElementsByTagName("title")[0], (!r || r[It] || r[j] || r.namespaceURI === "http://www.w3.org/2000/svg" || r.hasAttribute("itemprop")) && (r = a.createElement(t), a.head.insertBefore(r, a.querySelector("head > title"))), np(r, t, n), r[j] = e, Ut(r), t = r;
												break a;
											case "link":
												if (o = Gm("link", "href", a).get(t + (n.href || ""))) {
													for (s = 0; s < o.length; s++) if (r = o[s], r.getAttribute("href") === (n.href == null || n.href === "" ? null : n.href) && r.getAttribute("rel") === (n.rel == null ? null : n.rel) && r.getAttribute("title") === (n.title == null ? null : n.title) && r.getAttribute("crossorigin") === (n.crossOrigin == null ? null : n.crossOrigin)) {
														o.splice(s, 1);
														break b;
													}
												}
												r = a.createElement(t), np(r, t, n), a.head.appendChild(r);
												break;
											case "meta":
												if (o = Gm("meta", "content", a).get(t + (n.content || ""))) {
													for (s = 0; s < o.length; s++) if (r = o[s], r.getAttribute("content") === (n.content == null ? null : "" + n.content) && r.getAttribute("name") === (n.name == null ? null : n.name) && r.getAttribute("property") === (n.property == null ? null : n.property) && r.getAttribute("http-equiv") === (n.httpEquiv == null ? null : n.httpEquiv) && r.getAttribute("charset") === (n.charSet == null ? null : n.charSet)) {
														o.splice(s, 1);
														break b;
													}
												}
												r = a.createElement(t), np(r, t, n), a.head.appendChild(r);
												break;
											default: throw Error(i(468, t));
										}
										r[j] = e, Ut(r), t = r;
									}
									e.stateNode = t;
								}
							} else su || Km(o, e.type, e.stateNode);
						} else e.stateNode = Bm(o, n, e.memoizedProps);
					} else a === n ? n === null && e.stateNode !== null && Il(e, e.memoizedProps, r.memoizedProps) : (a === null ? (t = r.stateNode, t === null || H || t.parentNode.removeChild(t)) : a.count--, n === null ? su || Km(o, e.type, e.stateNode) : Bm(o, n, e.memoizedProps));
				}
				break;
			case 27:
				Au(t, e, n), Nu(e), a & 512 && (H || r === null || kl(r, r.return)), r !== null && a & 4 && Il(e, e.memoizedProps, r.memoizedProps);
				break;
			case 5:
				if (o = cu, cu = !1, Au(t, e, n), cu = o, Nu(e), a & 512 && (H || r === null || kl(r, r.return)), e.flags & 32) {
					t = e.stateNode;
					try {
						_n(t, ""), M = !0;
					} catch (t) {
						Z(e, e.return, t);
					}
				}
				a & 4 && e.stateNode != null && (t = e.memoizedProps, Il(e, t, r === null ? t : r.memoizedProps)), a & 1024 && (lu = !0);
				break;
			case 6:
				if (Au(t, e, n), Nu(e), a & 4) {
					if (e.stateNode === null) throw Error(i(162));
					t = e.memoizedProps, n = e.stateNode;
					try {
						n.nodeValue = t, M = !0;
					} catch (t) {
						Z(e, e.return, t);
					}
				}
				break;
			case 3:
				if (M = !1, Wm = null, o = ju, ju = bm(t.containerInfo), Au(t, e, n), ju = o, Nu(e), a & 4 && r !== null && r.memoizedState.isDehydrated) try {
					Hh(t.containerInfo);
				} catch (t) {
					Z(e, e.return, t);
				}
				lu && (lu = !1, Pu(e)), M = !1;
				break;
			case 4:
				a = cu, cu = su, r = $t(), o = ju, ju = bm(e.stateNode.containerInfo), Au(t, e, n), Nu(e), ju = o, M && pu && (mu = !0), M = r, cu = a;
				break;
			case 12:
				Au(t, e, n), Nu(e);
				break;
			case 31:
				Au(t, e, n), Nu(e), a & 4 && (t = e.updateQueue, t !== null && (e.updateQueue = null, ku(e, t)));
				break;
			case 13:
				Au(t, e, n), Nu(e), e.child.flags & 8192 && e.memoizedState !== null != (r !== null && r.memoizedState !== null) && (hd = Ze()), a & 4 && (t = e.updateQueue, t !== null && (e.updateQueue = null, ku(e, t)));
				break;
			case 22:
				o = e.memoizedState !== null, s = r !== null && r.memoizedState !== null;
				var c = su, l = H, u = cu;
				su = c || o, cu = u || o, H = l || s, Au(t, e, n), H = l, cu = u, su = c, Nu(e), a & 8192 && (t = e.stateNode, t._visibility = o ? t._visibility & -2 : t._visibility | 1, !o || r === null || s || su || H || (t = s || H, n = su, r = H, su = o || su, H = t, Ru(e, 2), su = n, H = r), !o && cu || yu(e, o)), a & 4 && (t = e.updateQueue, t !== null && (n = t.retryQueue, n !== null && (t.retryQueue = null, ku(e, n))));
				break;
			case 19:
				Au(t, e, n), Nu(e), a & 4 && (t = e.updateQueue, t !== null && (e.updateQueue = null, ku(e, t)));
				break;
			case 30:
				a & 512 && (H || r === null || kl(r, r.return)), a = $t(), o = pu, s = (n & 335544064) === n, c = e.memoizedProps, pu = s && Ei(c.default, c.update) !== "none", Au(t, e, n), Nu(e), s && r !== null && M && (e.flags |= 4), pu = o, M = a;
				break;
			case 21: break;
			case 7: a & 512 && (H || r === null || kl(r, r.return)), r && r.stateNode !== null && (r.stateNode._fragmentFiber = e);
			default: Au(t, e, n), Nu(e);
		}
	}
	function Nu(e) {
		var t = e.flags;
		if (t & 2) {
			try {
				for (var n, r = e.return; r !== null;) {
					if (Ll(r)) {
						n = r;
						break;
					}
					r = r.return;
				}
				r = null;
				for (var a = e.return; a !== null;) {
					if (Pl(a)) {
						var o = a.stateNode;
						r === null ? r = [o] : r.push(o);
					}
					if (Nl(a)) break;
					a = a.return;
				}
				var s = r;
				if (n == null) throw Error(i(160));
				switch (n.tag) {
					case 27:
						var c = n.stateNode;
						Bl(e, Rl(e), c, s);
						break;
					case 5:
						var l = n.stateNode;
						n.flags & 32 && (_n(l, ""), n.flags &= -33), Bl(e, Rl(e), l, s);
						break;
					case 3:
					case 4:
						var u = n.stateNode.containerInfo;
						zl(e, Rl(e), u, s);
						break;
					default: throw Error(i(161));
				}
			} catch (t) {
				Z(e, e.return, t);
			}
			e.flags &= -3;
		}
		t & 4096 && (e.flags &= -4097);
	}
	function Pu(e) {
		if (e.subtreeFlags & 1024) for (e = e.child; e !== null;) {
			var t = e;
			Pu(t), t.tag === 5 && t.flags & 1024 && (t = t.stateNode, gh = !0, t.reset(), gh = !1), e = e.sibling;
		}
	}
	function Fu(e, t) {
		if (t.subtreeFlags & 9270) for (t = t.child; t !== null;) Iu(t, e), t = t.sibling;
		else ou(t, !1);
	}
	function Iu(e, t) {
		var n = e.alternate;
		if (n === null) Ql(e, !1);
		else switch (e.tag) {
			case 3:
				if (hu = fu = !1, Kl(), Fu(t, e), !fu && !mu) {
					if (e = Gl, e !== null) for (var r = 0; r < e.length; r += 3) {
						n = e[r];
						var i = e[r + 1];
						Ep(n, e[r + 2]), n = n.ownerDocument.documentElement, n !== null && n.animate({
							opacity: [0, 0],
							pointerEvents: ["none", "none"]
						}, {
							duration: 0,
							fill: "forwards",
							pseudoElement: "::view-transition-group(" + i + ")"
						});
					}
					e = t.containerInfo, e = e.nodeType === 9 ? e.documentElement : e.ownerDocument.documentElement, e !== null && e.style.viewTransitionName === "" && (e.style.viewTransitionName = "none", e.animate({
						opacity: [0, 0],
						pointerEvents: ["none", "none"]
					}, {
						duration: 0,
						fill: "forwards",
						pseudoElement: "::view-transition-group(root)"
					}), e.animate({
						width: [0, 0],
						height: [0, 0]
					}, {
						duration: 0,
						fill: "forwards",
						pseudoElement: "::view-transition"
					})), hu = !0;
				}
				Gl = null;
				break;
			case 5:
				Fu(t, e);
				break;
			case 4:
				r = fu, fu = !1, Fu(t, e), fu && (mu = !0), fu = r;
				break;
			case 22:
				e.memoizedState === null && (n.memoizedState === null ? Fu(t, e) : Ql(e, !1));
				break;
			case 30:
				r = fu, i = Kl(), fu = !1, Fu(t, e), fu && (e.flags |= 4);
				var a = e.memoizedProps, o = e.stateNode;
				t = wi(a, o), o = wi(n.memoizedProps, o);
				var s = Ei(a.default, a.update);
				s === "none" ? t = !1 : (a = n.memoizedState, n.memoizedState = null, n = e.child, ql = 0, t = au(e, n, t, o, s, a, !0), ql !== (a === null ? 0 : a.length) && (e.flags |= 32)), e.flags & 4 && t ? (Nd(e, e.memoizedProps.onUpdate), Gl = i) : i !== null && (i.push.apply(i, Gl), Gl = i), fu = e.flags & 32 ? !0 : r;
				break;
			default: Fu(t, e);
		}
	}
	function Lu(e, t) {
		if (t.subtreeFlags & 8772) for (t = t.child; t !== null;) vu(e, t.alternate, t), t = t.sibling;
	}
	function Ru(e, t) {
		for (e = e.child; e !== null;) {
			var n = e, r = t;
			switch (n.tag) {
				case 0:
				case 11:
				case 14:
				case 15:
					Tl(4, n, n.return), Ru(n, r);
					break;
				case 1:
					kl(n, n.return);
					var i = n.stateNode;
					typeof i.componentWillUnmount == "function" && Dl(n, n.return, i), Ru(n, r);
					break;
				case 27: r & 2 && gm(n.stateNode, n.type, n.memoizedProps);
				case 5:
					kl(n, n.return), n.tag !== 5 && n.tag !== 27 || Ml(n), Ru(n, r);
					break;
				case 6:
					Ml(n);
					break;
				case 26:
					kl(n, n.return), i = n.stateNode, n.memoizedState !== null || i === null || H || i.parentNode.removeChild(i), Ru(n, r);
					break;
				case 22:
					n.memoizedState === null && Ru(n, r);
					break;
				case 30:
					kl(n, n.return), Ru(n, r);
					break;
				case 7: kl(n, n.return);
				default: Ru(n, r);
			}
			e = e.sibling;
		}
	}
	function zu(e, t, n) {
		for (n = t.subtreeFlags & 8772 ? n : n & -2, t = t.child; t !== null;) {
			var r = t.alternate, i = e, a = t, o = a.flags, s = !!(n & 1);
			switch (a.tag) {
				case 0:
				case 11:
				case 15:
					zu(i, a, n), wl(4, a);
					break;
				case 1:
					if (zu(i, a, n), r = a, i = r.stateNode, typeof i.componentDidMount == "function") try {
						i.componentDidMount();
					} catch (e) {
						Z(r, r.return, e);
					}
					if (r = a, i = r.updateQueue, i !== null) {
						var c = r.stateNode;
						try {
							var l = i.shared.hiddenCallbacks;
							if (l !== null) for (i.shared.hiddenCallbacks = null, i = 0; i < l.length; i++) ko(l[i], c);
						} catch (e) {
							Z(r, r.return, e);
						}
					}
					s && o & 64 && El(a), Ol(a, a.return);
					break;
				case 27: n & 2 && Vl(a);
				case 5:
					a.tag !== 5 && a.tag !== 27 || jl(a), zu(i, a, n), s && r === null && o & 4 && Fl(a), Ol(a, a.return);
					break;
				case 6:
					jl(a);
					break;
				case 26:
					c = a.stateNode, a.memoizedState !== null || c === null || su || Km(bm(c.ownerDocument), a.type, c), zu(i, a, n), s && r === null && o & 4 && Fl(a), Ol(a, a.return);
					break;
				case 12:
					zu(i, a, n);
					break;
				case 31:
					zu(i, a, n), s && o & 4 && Eu(i, a);
					break;
				case 13:
					zu(i, a, n), s && o & 4 && Du(i, a);
					break;
				case 22:
					a.memoizedState === null && zu(i, a, n), Ol(a, a.return);
					break;
				case 30:
					zu(i, a, n), Ol(a, a.return);
					break;
				case 7: Ol(a, a.return);
				default: zu(i, a, n);
			}
			t = t.sibling;
		}
	}
	function Bu(e, t) {
		var n = null;
		e !== null && e.memoizedState !== null && e.memoizedState.cachePool !== null && (n = e.memoizedState.cachePool.pool), e = null, t.memoizedState !== null && t.memoizedState.cachePool !== null && (e = t.memoizedState.cachePool.pool), e !== n && (e != null && e.refCount++, n != null && Ra(n));
	}
	function Vu(e, t) {
		e = null, t.alternate !== null && (e = t.alternate.memoizedState.cache), t = t.memoizedState.cache, t !== e && (t.refCount++, e != null && Ra(e));
	}
	function Hu(e, t, n, r) {
		var i = (n & 335544064) === n;
		if (t.subtreeFlags & (i ? 10262 : 10256)) for (t = t.child; t !== null;) Uu(e, t, n, r), t = t.sibling;
		else i && iu(t);
	}
	function Uu(e, t, n, r) {
		var i = (n & 335544064) === n;
		i && t.alternate === null && t.return !== null && t.return.alternate !== null && ru(t);
		var a = t.flags;
		switch (t.tag) {
			case 0:
			case 11:
			case 15:
				Hu(e, t, n, r), a & 2048 && wl(9, t);
				break;
			case 1:
				Hu(e, t, n, r);
				break;
			case 3:
				Hu(e, t, n, r), i && hu && (e = e.containerInfo, e = e.nodeType === 9 ? e.body : e.nodeName === "HTML" ? e.ownerDocument.body : e, e.style.viewTransitionName === "root" && (e.style.viewTransitionName = ""), e = e.ownerDocument.documentElement, e !== null && e.style.viewTransitionName === "none" && (e.style.viewTransitionName = "")), a & 2048 && (a = null, t.alternate !== null && (a = t.alternate.memoizedState.cache), t = t.memoizedState.cache, t !== a && (t.refCount++, a != null && Ra(a)));
				break;
			case 12:
				if (a & 2048) {
					Hu(e, t, n, r), a = t.stateNode;
					try {
						var o = t.memoizedProps, s = o.id, c = o.onPostCommit;
						typeof c == "function" && c(s, t.alternate === null ? "mount" : "update", a.passiveEffectDuration, -0);
					} catch (e) {
						Z(t, t.return, e);
					}
				} else Hu(e, t, n, r);
				break;
			case 31:
				Hu(e, t, n, r);
				break;
			case 13:
				Hu(e, t, n, r);
				break;
			case 23: break;
			case 22:
				o = t.stateNode, s = t.alternate, t.memoizedState === null ? (i && s !== null && s.memoizedState !== null && ru(t), o._visibility & 2 ? Hu(e, t, n, r) : (o._visibility |= 2, Wu(e, t, n, r, !!(t.subtreeFlags & 10256) || !1))) : (i && s !== null && s.memoizedState === null && ru(s), o._visibility & 2 ? Hu(e, t, n, r) : Gu(e, t)), a & 2048 && Bu(s, t);
				break;
			case 24:
				Hu(e, t, n, r), a & 2048 && Vu(t.alternate, t);
				break;
			case 30:
				i && (a = t.alternate, a !== null && (Xl(a.child, !0), Xl(t.child, !0))), Hu(e, t, n, r);
				break;
			default: Hu(e, t, n, r);
		}
	}
	function Wu(e, t, n, r, i) {
		for (i &&= !!(t.subtreeFlags & 10256) || !1, t = t.child; t !== null;) {
			var a = e, o = t, s = n, c = r, l = o.flags;
			switch (o.tag) {
				case 0:
				case 11:
				case 15:
					Wu(a, o, s, c, i), wl(8, o);
					break;
				case 23: break;
				case 22:
					var u = o.stateNode;
					o.memoizedState === null ? (u._visibility |= 2, Wu(a, o, s, c, i)) : u._visibility & 2 ? Wu(a, o, s, c, i) : Gu(a, o), i && l & 2048 && Bu(o.alternate, o);
					break;
				case 24:
					Wu(a, o, s, c, i), i && l & 2048 && Vu(o.alternate, o);
					break;
				default: Wu(a, o, s, c, i);
			}
			t = t.sibling;
		}
	}
	function Gu(e, t) {
		if (t.subtreeFlags & 10256) for (t = t.child; t !== null;) {
			var n = e, r = t, i = r.flags;
			switch (r.tag) {
				case 22:
					Gu(n, r), i & 2048 && Bu(r.alternate, r);
					break;
				case 24:
					Gu(n, r), i & 2048 && Vu(r.alternate, r);
					break;
				default: Gu(n, r);
			}
			t = t.sibling;
		}
	}
	var Ku = 8192;
	function qu(e, t, n) {
		if (e.subtreeFlags & Ku) for (e = e.child; e !== null;) Ju(e, t, n), e = e.sibling;
	}
	function Ju(e, t, n) {
		switch (e.tag) {
			case 26:
				qu(e, t, n), e.flags & Ku && (e.memoizedState === null ? (e = e.stateNode, (t & 335544128) === t && Zm(n, e)) : Qm(n, ju, e.memoizedState, e.memoizedProps));
				break;
			case 5:
				qu(e, t, n), e.flags & Ku && (e = e.stateNode, (t & 335544128) === t && Zm(n, e));
				break;
			case 3:
			case 4:
				var r = ju;
				ju = bm(e.stateNode.containerInfo), qu(e, t, n), ju = r;
				break;
			case 22:
				e.memoizedState === null && (r = e.alternate, r !== null && r.memoizedState !== null ? (r = Ku, Ku = 16777216, qu(e, t, n), Ku = r) : qu(e, t, n));
				break;
			case 30:
				if ((e.flags & Ku) !== 0 && (r = e.memoizedProps.name, r != null && r !== "auto")) {
					var i = e.stateNode;
					i.paired = null, Ul === null && (Ul = /* @__PURE__ */ new Map()), Ul.set(r, i);
				}
				qu(e, t, n);
				break;
			default: qu(e, t, n);
		}
	}
	function Yu(e) {
		var t = e.alternate;
		if (t !== null && (e = t.child, e !== null)) {
			t.child = null;
			do
				t = e.sibling, e.sibling = null, e = t;
			while (e !== null);
		}
	}
	function Xu(e) {
		var t = e.deletions;
		if (e.flags & 16) {
			if (t !== null) for (var n = 0; n < t.length; n++) {
				var r = t[n];
				du = r, $u(r, e);
			}
			Yu(e);
		}
		if (e.subtreeFlags & 10256) for (e = e.child; e !== null;) Zu(e), e = e.sibling;
	}
	function Zu(e) {
		switch (e.tag) {
			case 0:
			case 11:
			case 15:
				Xu(e), e.flags & 2048 && Tl(9, e, e.return);
				break;
			case 3:
				Xu(e);
				break;
			case 12:
				Xu(e);
				break;
			case 22:
				var t = e.stateNode;
				e.memoizedState !== null && t._visibility & 2 && (e.return === null || e.return.tag !== 13) ? (t._visibility &= -3, Qu(e)) : Xu(e);
				break;
			default: Xu(e);
		}
	}
	function Qu(e) {
		var t = e.deletions;
		if (e.flags & 16) {
			if (t !== null) for (var n = 0; n < t.length; n++) {
				var r = t[n];
				du = r, $u(r, e);
			}
			Yu(e);
		}
		for (e = e.child; e !== null;) {
			switch (t = e, t.tag) {
				case 0:
				case 11:
				case 15:
					Tl(8, t, t.return), Qu(t);
					break;
				case 22:
					n = t.stateNode, n._visibility & 2 && (n._visibility &= -3, Qu(t));
					break;
				default: Qu(t);
			}
			e = e.sibling;
		}
	}
	function $u(e, t) {
		for (; du !== null;) {
			var n = du;
			switch (n.tag) {
				case 0:
				case 11:
				case 15:
					Tl(8, n, t);
					break;
				case 23:
				case 22:
					if (n.memoizedState !== null && n.memoizedState.cachePool !== null) {
						var r = n.memoizedState.cachePool.pool;
						r != null && r.refCount++;
					}
					break;
				case 24: Ra(n.memoizedState.cache);
			}
			if (r = n.child, r !== null) r.return = n, du = r;
			else a: for (n = e; du !== null;) {
				r = du;
				var i = r.sibling, a = r.return;
				if (Su(r), r === n) {
					du = null;
					break a;
				}
				if (i !== null) {
					i.return = a, du = i;
					break a;
				}
				du = a;
			}
		}
	}
	var ed = {
		getCacheForType: function(e) {
			var t = ja(F), n = t.data.get(e);
			return n === void 0 && (n = e(), t.data.set(e, n)), n;
		},
		cacheSignal: function() {
			return ja(F).controller.signal;
		}
	}, td = typeof WeakMap == "function" ? WeakMap : Map, W = 0, G = null, K = null, q = 0, J = 0, nd = null, rd = !1, id = !1, ad = !1, od = 0, Y = 0, sd = 0, cd = 0, ld = 0, ud = 0, dd = 0, fd = null, pd = null, md = !1, hd = 0, gd = 0, _d = Infinity, vd = null, yd = null, X = 0, bd = null, xd = null, Sd = 0, Cd = 0, wd = null, Td = null, Ed = null, Dd = null, Od = null, kd = 0, Ad = null;
	function jd() {
		return W & 2 && q !== 0 ? q & -q : T.T === null ? Ot() : Pf();
	}
	function Md() {
		if (ud === 0) {
			if (!(q & 536870912) || P) {
				var e = mt;
				mt <<= 1, !(mt & 3932160) && (mt = 262144), ud = e;
			} else ud = 536870912;
		}
		return e = Io.current, e !== null && (e.flags |= 32), ud;
	}
	function Nd(e, t) {
		if (t != null) {
			var n = e.stateNode, r = n.ref;
			r === null && (r = n.ref = Pp(wi(e.memoizedProps, n))), Dd === null && (Dd = []), Dd.push(t.bind(null, r));
		}
	}
	function Pd(e, t, n) {
		(e === G && (J === 2 || J === 9) || e.cancelPendingCommit !== null) && (Vd(e, 0), Rd(e, q, ud, !1)), xt(e, n), (!(W & 2) || e !== G) && (e === G && (!(W & 2) && (cd |= n), Y === 4 && Rd(e, q, ud, !1)), Ef(e));
	}
	function Fd(e, t, n) {
		if (W & 6) throw Error(i(327));
		var r = !n && !(t & 127) && (t & e.expiredLanes) === 0 || O(e, t), a = r ? Yd(e, t) : qd(e, t, !0), o = r;
		do {
			if (a === 0) {
				id && !r && Rd(e, t, 0, !1);
				break;
			}
			if (n = e.current.alternate, o && !Ld(n)) {
				a = qd(e, t, !1), o = !1;
				continue;
			}
			if (a === 2) {
				if (o = t, e.errorRecoveryDisabledLanes & o) var s = 0;
				else s = e.pendingLanes & -536870913, s = s === 0 ? s & 536870912 ? 536870912 : 0 : s;
				if (s !== 0) {
					t = s;
					a: {
						var c = e;
						a = fd;
						var l = c.current.memoizedState.isDehydrated;
						if (l && (Vd(c, s).flags |= 256), s = qd(c, s, !1), s !== 2 && s !== 6) {
							if (ad && !l) {
								c.errorRecoveryDisabledLanes |= o, cd |= o, a = 4;
								break a;
							}
							o = pd, pd = a, o !== null && (pd === null ? pd = o : pd.push.apply(pd, o));
						}
						a = s;
					}
					if (o = !1, a !== 2) continue;
				}
			}
			if (a === 1) {
				Vd(e, 0), Rd(e, t, 0, !0);
				break;
			}
			a: {
				switch (r = e, o = a, o) {
					case 0:
					case 1: throw Error(i(345));
					case 4: if ((t & 4194048) !== t && (t & 62914560) !== t) break;
					case 6:
						Rd(r, t, ud, !rd);
						break a;
					case 2:
						pd = null;
						break;
					case 3:
					case 5: break;
					default: throw Error(i(329));
				}
				if ((t & 62914560) === t && (a = hd + 300 - Ze(), 10 < a)) {
					if (Rd(r, t, ud, !rd), _t(r, 0, !0) !== 0) break a;
					Sd = t, r.timeoutHandle = gp(Id.bind(null, r, n, pd, vd, md, t, ud, cd, dd, rd, o, "Throttled", -0, 0), a);
					break a;
				}
				Id(r, n, pd, vd, md, t, ud, cd, dd, rd, o, null, -0, 0);
			}
			break;
		} while (1);
		Ef(e);
	}
	function Id(e, t, n, r, i, a, o, s, c, l, u, d, f, p) {
		e.timeoutHandle = -1;
		var m = t.subtreeFlags, h = (a & 335544064) === a;
		if (d = null, (h || m & 8192 || (m & 16785408) == 16785408) && (d = {
			stylesheets: null,
			count: 0,
			imgCount: 0,
			imgBytes: 0,
			suspenseyImages: [],
			waitingForImages: !0,
			waitingForViewTransition: !1,
			unsuspend: Tn
		}, Ul = null, Ju(t, a, d), h && (m = d, h = e.containerInfo, h = (h.nodeType === 9 ? h : h.ownerDocument).__reactViewTransition, h != null && (m.count++, m.waitingForViewTransition = !0, m = nh.bind(m), h.finished.then(m, m))), m = (a & 62914560) === a ? hd - Ze() : (a & 4194048) === a ? gd - Ze() : 0, m = eh(d, m), m !== null)) {
			Sd = a, e.cancelPendingCommit = m(nf.bind(null, e, t, a, n, r, i, o, s, c, l, u, d, null, f, p)), Rd(e, a, o, !l);
			return;
		}
		nf(e, t, a, n, r, i, o, s, c, l, u, d);
	}
	function Ld(e) {
		for (var t = e;;) {
			var n = t.tag;
			if ((n === 0 || n === 11 || n === 15) && t.flags & 16384 && (n = t.updateQueue, n !== null && (n = n.stores, n !== null))) for (var r = 0; r < n.length; r++) {
				var i = n[r], a = i.getSnapshot;
				i = i.value;
				try {
					if (!Jr(a(), i)) return !1;
				} catch {
					return !1;
				}
			}
			if (n = t.child, t.subtreeFlags & 16384 && n !== null) n.return = t, t = n;
			else {
				if (t === e) break;
				for (; t.sibling === null;) {
					if (t.return === null || t.return === e) return !0;
					t = t.return;
				}
				t.sibling.return = t.return, t = t.sibling;
			}
		}
		return !0;
	}
	function Rd(e, t, n, r) {
		t = vt(e, t), t &= ~ld, t &= ~cd, e.suspendedLanes |= t, e.pingedLanes &= ~t, r && (e.warmLanes |= t), r = e.expirationTimes;
		for (var i = t; 0 < i;) {
			var a = 31 - lt(i), o = 1 << a;
			r[a] = -1, i &= ~o;
		}
		n !== 0 && Ct(e, n, t);
	}
	function zd() {
		return W & 6 ? !0 : (Df(0, !1), !1);
	}
	function Bd() {
		if (K !== null) {
			if (J === 0) var e = K.return;
			else e = K, Ca = Sa = null, cs(e), uo = null, fo = 0, e = K;
			for (; e !== null;) Cl(e.alternate, e), e = e.return;
			K = null;
		}
	}
	function Vd(e, t) {
		var n = e.timeoutHandle;
		return n !== -1 && (e.timeoutHandle = -1, _p(n)), n = e.cancelPendingCommit, n !== null && (e.cancelPendingCommit = null, n()), Sd = 0, Bd(), G = e, K = n = Vi(e.current, null), q = t, J = 0, nd = null, rd = !1, id = O(e, t), ad = !1, dd = ud = ld = cd = sd = Y = 0, pd = fd = null, md = !1, od = vt(e, t), ji(), n;
	}
	function Hd(e, t) {
		I = null, T.H = _c, t === eo || t === no ? (t = co(), J = 3) : t === to ? (t = co(), J = 4) : J = t === Fc ? 8 : typeof t == "object" && t && typeof t.then == "function" ? 6 : 1, nd = t, K === null && (Y = 1, kc(e, Yi(t, e.current)));
	}
	function Ud() {
		var e = Io.current;
		return e === null ? !0 : (q & 4194048) === q ? Lo === null : (q & 62914560) === q || q & 536870912 ? e === Lo : !1;
	}
	function Wd() {
		var e = T.H;
		return T.H = _c, e === null ? _c : e;
	}
	function Gd() {
		var e = T.A;
		return T.A = ed, e;
	}
	function Kd() {
		Y = 4, rd || (q & 4194048) !== q && Io.current !== null || (id = !0), !(sd & 134217727) && !(cd & 134217727) || G === null || Rd(G, q, ud, !1);
	}
	function qd(e, t, n) {
		var r = W;
		W |= 2;
		var i = Wd(), a = Gd();
		(G !== e || q !== t) && (vd = null, Vd(e, t)), t = !1;
		var o = Y;
		a: do
			try {
				if (J !== 0 && K !== null) {
					var s = K, c = nd;
					switch (J) {
						case 8:
							Bd(), o = 6;
							break a;
						case 3:
						case 2:
						case 9:
						case 6:
							Io.current === null && (t = !0);
							var l = J;
							if (J = 0, nd = null, $d(e, s, c, l), n && id) {
								o = 0;
								break a;
							}
							break;
						default: l = J, J = 0, nd = null, $d(e, s, c, l);
					}
				}
				Jd(), o = Y;
				break;
			} catch (t) {
				Hd(e, t);
			}
		while (1);
		return t && e.shellSuspendCounter++, Ca = Sa = null, W = r, T.H = i, T.A = a, K === null && (G = null, q = 0, ji()), o;
	}
	function Jd() {
		for (; K !== null;) Zd(K);
	}
	function Yd(e, t) {
		var n = W;
		W |= 2;
		var r = Wd(), a = Gd();
		G !== e || q !== t ? (vd = null, _d = Ze() + 500, Vd(e, t)) : id = O(e, t);
		a: do
			try {
				if (J !== 0 && K !== null) {
					t = K;
					var o = nd;
					b: switch (J) {
						case 1:
							J = 0, nd = null, $d(e, t, o, 1);
							break;
						case 2:
						case 9:
							if (io(o)) {
								J = 0, nd = null, Qd(t);
								break;
							}
							t = function() {
								J !== 2 && J !== 9 || G !== e || (J = 7), Ef(e);
							}, o.then(t, t);
							break a;
						case 3:
							J = 7;
							break a;
						case 4:
							J = 5;
							break a;
						case 7:
							io(o) ? (J = 0, nd = null, Qd(t)) : (J = 0, nd = null, $d(e, t, o, 7));
							break;
						case 5:
							var s = null;
							switch (K.tag) {
								case 26: s = K.memoizedState;
								case 5:
								case 27:
									var c = K;
									if (s ? Ym(s) : c.stateNode.complete) {
										J = 0, nd = null;
										var l = c.sibling;
										if (l !== null) K = l;
										else {
											var u = c.return;
											u === null ? K = null : (K = u, ef(u));
										}
										break b;
									}
							}
							J = 0, nd = null, $d(e, t, o, 5);
							break;
						case 6:
							J = 0, nd = null, $d(e, t, o, 6);
							break;
						case 8:
							Bd(), Y = 6;
							break a;
						default: throw Error(i(462));
					}
				}
				Xd();
				break;
			} catch (t) {
				Hd(e, t);
			}
		while (1);
		return Ca = Sa = null, T.H = r, T.A = a, W = n, K === null ? (G = null, q = 0, ji(), Y) : 0;
	}
	function Xd() {
		for (; K !== null && !Ye();) Zd(K);
	}
	function Zd(e) {
		var t = hl(e.alternate, e, od);
		e.memoizedProps = e.pendingProps, t === null ? ef(e) : K = t;
	}
	function Qd(e) {
		var t = e, n = t.alternate;
		switch (t.tag) {
			case 15:
			case 0:
				t = Yc(n, t, t.pendingProps, t.type, void 0, q);
				break;
			case 11:
				t = Yc(n, t, t.pendingProps, t.type.render, t.ref, q);
				break;
			case 5:
				cs(t);
				var r = t;
				r === ua && (P ? (ga(r), r.tag === 5 && r.stateNode != null && (N = r.stateNode)) : (ga(r), P = !0));
			default: Cl(n, t), t = K = Hi(t, od), t = hl(n, t, od);
		}
		e.memoizedProps = e.pendingProps, t === null ? ef(e) : K = t;
	}
	function $d(e, t, n, r) {
		Ca = Sa = null, cs(t), uo = null, fo = 0;
		var i = t.return;
		try {
			if (Pc(e, i, t, n, q)) {
				Y = 1, kc(e, Yi(n, e.current)), K = null;
				return;
			}
		} catch (t) {
			if (i !== null) throw K = i, t;
			Y = 1, kc(e, Yi(n, e.current)), K = null;
			return;
		}
		t.flags & 32768 ? (P || r === 1 ? e = !0 : id || q & 536870912 ? e = !1 : (rd = e = !0, (r === 2 || r === 9 || r === 3 || r === 6) && (r = Io.current, r !== null && r.tag === 13 && (r.flags |= 16384))), tf(t, e)) : ef(t);
	}
	function ef(e) {
		var t = e;
		do {
			if (t.flags & 32768) {
				tf(t, rd);
				return;
			}
			e = t.return;
			var n = xl(t.alternate, t, od);
			if (n !== null) {
				K = n;
				return;
			}
			if (t = t.sibling, t !== null) {
				K = t;
				return;
			}
			K = t = e;
		} while (t !== null);
		Y === 0 && (Y = 5);
	}
	function tf(e, t) {
		do {
			var n = Sl(e.alternate, e);
			if (n !== null) {
				n.flags &= 32767, K = n;
				return;
			}
			if (n = e.return, n !== null && (n.flags |= 32768, n.subtreeFlags = 0, n.deletions = null), !t && (e = e.sibling, e !== null)) {
				K = e;
				return;
			}
			K = e = n;
		} while (e !== null);
		Y = 6, K = null;
	}
	function nf(e, t, n, r, a, o, s, c, l, u, d, f) {
		e.cancelPendingCommit = null;
		do
			df();
		while (X !== 0);
		if (W & 6) throw Error(i(327));
		if (t !== null) {
			if (t === e.current) throw Error(i(177));
			e === G && (K = G = null, q = 0), xd = t, bd = e, Sd = n, wd = a, Td = r, rf(e, t, n, s, c, l, f);
		}
	}
	function rf(e, t, n, r, i, a, o) {
		var s = t.lanes | t.childLanes;
		if (Cd = s, s |= Ai, St(e, n, s, r, i, a), Dd = null, (n & 335544064) === n ? (Od = Va(e), r = 10262) : (Od = null, r = 10256), (t.subtreeFlags & r) !== 0 || (t.flags & r) !== 0 ? (e.callbackNode = null, e.callbackPriority = 0, yf(tt, function() {
			return ff(), null;
		})) : (e.callbackNode = null, e.callbackPriority = 0), Hl = !1, r = !!(t.flags & 13878), t.subtreeFlags & 13878 || r) {
			r = T.T, T.T = null, i = E.p, E.p = 2, a = W, W |= 4;
			try {
				gu(e, t, n);
			} finally {
				W = a, E.p = i, T.T = r;
			}
		}
		X = 1, Hl ? Ed = Mp(o, e.containerInfo, Od, sf, cf, of, lf, ff, af, null, null) : (sf(), cf(), lf());
	}
	function af(e) {
		if (X !== 0) {
			var t = bd.onRecoverableError;
			t(e, { componentStack: null });
		}
	}
	function of() {
		X === 3 && (X = 0, Iu(xd, bd), X = 4);
	}
	function sf() {
		if (X === 1) {
			X = 0;
			var e = bd, t = xd, n = Sd, r = !!(t.flags & 13878);
			if (t.subtreeFlags & 13878 || r) {
				r = T.T, T.T = null;
				var i = E.p;
				E.p = 2;
				var a = W;
				W |= 4;
				try {
					pu = mu = !1, Mu(t, e, n), n = cp;
					var o = ei(e.containerInfo), s = n.focusedElem, c = n.selectionRange;
					if (o !== s && s && s.ownerDocument && $r(s.ownerDocument.documentElement, s)) {
						if (c !== null && ti(s)) {
							var l = c.start, u = c.end;
							if (u === void 0 && (u = l), "selectionStart" in s) s.selectionStart = l, s.selectionEnd = Math.min(u, s.value.length);
							else {
								var d = s.ownerDocument || document, f = d && d.defaultView || window;
								if (f.getSelection) {
									var p = f.getSelection(), m = s.textContent.length, h = Math.min(c.start, m), g = c.end === void 0 ? h : Math.min(c.end, m);
									!p.extend && h > g && (o = g, g = h, h = o);
									var _ = Qr(s, h), v = Qr(s, g);
									if (_ && v && (p.rangeCount !== 1 || p.anchorNode !== _.node || p.anchorOffset !== _.offset || p.focusNode !== v.node || p.focusOffset !== v.offset)) {
										var y = d.createRange();
										y.setStart(_.node, _.offset), p.removeAllRanges(), h > g ? (p.addRange(y), p.extend(v.node, v.offset)) : (y.setEnd(v.node, v.offset), p.addRange(y));
									}
								}
							}
						}
						for (d = [], p = s; p = p.parentNode;) p.nodeType === 1 && d.push({
							element: p,
							left: p.scrollLeft,
							top: p.scrollTop
						});
						for (typeof s.focus == "function" && s.focus(), s = 0; s < d.length; s++) {
							var b = d[s];
							b.element.scrollLeft = b.left, b.element.scrollTop = b.top;
						}
					}
					gh = !!sp, cp = sp = null;
				} finally {
					W = a, E.p = i, T.T = r;
				}
			}
			e.current = t, X = 2;
		}
	}
	function cf() {
		if (X === 2) {
			X = 0;
			var e = bd, t = xd, n = !!(t.flags & 8772);
			if (t.subtreeFlags & 8772 || n) {
				n = T.T, T.T = null;
				var r = E.p;
				E.p = 2;
				var i = W;
				W |= 4;
				try {
					vu(e, t.alternate, t);
				} finally {
					W = i, E.p = r, T.T = n;
				}
			}
			X = 3;
		}
	}
	function lf() {
		if (X === 4 || X === 3) {
			X = 0;
			var e = Ed;
			Ed = null, Xe();
			var t = bd, n = xd, r = Sd, i = Td, a = (r & 335544064) === r ? 10262 : 10256;
			if ((n.subtreeFlags & a) !== 0 || (n.flags & a) !== 0 ? X = 5 : (X = 0, xd = bd = null, uf(t, t.pendingLanes)), a = t.pendingLanes, a === 0 && (yd = null), Dt(r), n = n.stateNode, st && typeof st.onCommitFiberRoot == "function") try {
				st.onCommitFiberRoot(ot, n, void 0, (n.current.flags & 128) == 128);
			} catch {}
			if (i !== null) {
				n = T.T, a = E.p, E.p = 2, T.T = null;
				try {
					for (var o = t.onRecoverableError, s = 0; s < i.length; s++) {
						var c = i[s];
						o(c.value, { componentStack: c.stack });
					}
				} finally {
					T.T = n, E.p = a;
				}
			}
			if (i = Dd, o = Od, Od = null, i !== null && (Dd = null, o === null && (o = []), e !== null)) for (c = 0; c < i.length; c++) n = (0, i[c])(o), n !== void 0 && e.finished.finally(n);
			Sd & 3 && df(), Ef(t), a = t.pendingLanes, r & 261930 && a & 42 ? t === Ad ? kd++ : (kd = 0, Ad = t) : (kd = 0, Ad = null), Df(0, !1);
		}
	}
	function uf(e, t) {
		(e.pooledCacheLanes &= t) === 0 && (t = e.pooledCache, t != null && (e.pooledCache = null, Ra(t)));
	}
	function df() {
		return Ed !== null && (Ed.skipTransition(), Ed = null), sf(), cf(), lf(), ff();
	}
	function ff() {
		if (X !== 5) return !1;
		var e = bd, t = Cd;
		Cd = 0;
		var n = Dt(Sd), r = T.T, a = E.p;
		try {
			E.p = 32 > n ? 32 : n, T.T = null, n = wd, wd = null;
			var o = bd, s = Sd;
			if (X = 0, xd = bd = null, Sd = 0, W & 6) throw Error(i(331));
			var c = W;
			if (W |= 4, Zu(o.current), Uu(o, o.current, s, n), W = c, Df(0, !1), st && typeof st.onPostCommitFiberRoot == "function") try {
				st.onPostCommitFiberRoot(ot, o);
			} catch {}
			return !0;
		} finally {
			E.p = a, T.T = r, uf(e, t);
		}
	}
	function pf(e, t, n) {
		t = Yi(n, t), t = jc(e.stateNode, t, 2), e = Co(e, t, 2), e !== null && (xt(e, 2), Ef(e));
	}
	function Z(e, t, n) {
		if (e.tag === 3) pf(e, e, n);
		else for (; t !== null;) {
			if (t.tag === 3) {
				pf(t, e, n);
				break;
			}
			if (t.tag === 1) {
				var r = t.stateNode;
				if (typeof t.type.getDerivedStateFromError == "function" || typeof r.componentDidCatch == "function" && (yd === null || !yd.has(r))) {
					e = Yi(n, e), n = Mc(2), r = Co(t, n, 2), r !== null && (Nc(n, r, t, e), xt(r, 2), Ef(r));
					break;
				}
			}
			t = t.return;
		}
	}
	function mf(e, t, n) {
		var r = e.pingCache;
		if (r === null) {
			r = e.pingCache = new td();
			var i = /* @__PURE__ */ new Set();
			r.set(t, i);
		} else i = r.get(t), i === void 0 && (i = /* @__PURE__ */ new Set(), r.set(t, i));
		i.has(n) || (ad = !0, i.add(n), e = hf.bind(null, e, t, n), t.then(e, e));
	}
	function hf(e, t, n) {
		var r = e.pingCache;
		r !== null && r.delete(t), e.pingedLanes |= e.suspendedLanes & n, e.warmLanes &= ~n, G === e && (q & n) === n && (Y === 4 || Y === 3 && (q & 62914560) === q && 300 > Ze() - hd ? W & 2 ? ld |= n : Vd(e, 0) : ld |= n, dd === q && (dd = 0)), Ef(e);
	}
	function gf(e, t) {
		t === 0 && (t = k()), e = Pi(e, t), e !== null && (xt(e, t), Ef(e));
	}
	function _f(e) {
		var t = e.memoizedState, n = 0;
		t !== null && (n = t.retryLane), gf(e, n);
	}
	function vf(e, t) {
		var n = 0;
		switch (e.tag) {
			case 31:
			case 13:
				var r = e.stateNode, a = e.memoizedState;
				a !== null && (n = a.retryLane);
				break;
			case 19:
				r = e.stateNode;
				break;
			case 22:
				r = e.stateNode._retryCache;
				break;
			default: throw Error(i(314));
		}
		r !== null && r.delete(t), gf(e, n);
	}
	function yf(e, t) {
		return qe(e, t);
	}
	var bf = null, xf = null, Sf = !1, Cf = !1, wf = !1, Tf = 0;
	function Ef(e) {
		e !== xf && e.next === null && (xf === null ? bf = xf = e : xf = xf.next = e), Cf = !0, Sf || (Sf = !0, Nf());
	}
	function Df(e, t) {
		if (!wf && Cf) {
			wf = !0;
			do
				for (var n = !1, r = bf; r !== null;) {
					if (!t) {
						if (e !== 0) {
							var i = r.pendingLanes;
							if (i === 0) var a = 0;
							else {
								var o = r.suspendedLanes, s = r.pingedLanes;
								a = (1 << 31 - lt(42 | e) + 1) - 1, a &= i & ~(o & ~s), a = a & 201326741 ? a & 201326741 | 1 : a ? a | 2 : 0;
							}
							a !== 0 && (n = !0, Mf(r, a));
						} else a = q, a = _t(r, r === G ? a : 0, r.cancelPendingCommit !== null || r.timeoutHandle !== -1), !(a & 3) || O(r, a) || (n = !0, Mf(r, a));
					}
					r = r.next;
				}
			while (n);
			wf = !1;
		}
	}
	function Of() {
		kf();
	}
	function kf() {
		Cf = Sf = !1;
		var e = 0;
		Tf !== 0 && hp() && (e = Tf);
		for (var t = Ze(), n = null, r = bf; r !== null;) {
			var i = r.next, a = Af(r, t);
			a === 0 ? (r.next = null, n === null ? bf = i : n.next = i, i === null && (xf = n)) : (n = r, (e !== 0 || a & 3) && (Cf = !0)), r = i;
		}
		X !== 0 && X !== 5 || Df(e, !1), Tf !== 0 && (Tf = 0);
	}
	function Af(e, t) {
		for (var n = e.suspendedLanes, r = e.pingedLanes, i = e.expirationTimes, a = e.pendingLanes & -62914561; 0 < a;) {
			var o = 31 - lt(a), s = 1 << o, c = i[o];
			c === -1 ? ((s & n) === 0 || (s & r) !== 0) && (i[o] = yt(s, t)) : c <= t && (e.expiredLanes |= s), a &= ~s;
		}
		if (t = G, n = q, n = _t(e, e === t ? n : 0, e.cancelPendingCommit !== null || e.timeoutHandle !== -1), r = e.callbackNode, n === 0 || e === t && (J === 2 || J === 9) || e.cancelPendingCommit !== null) return r !== null && r !== null && Je(r), e.callbackNode = null, e.callbackPriority = 0;
		if (!(n & 3) || O(e, n)) {
			if (t = n & -n, t === e.callbackPriority) return t;
			switch (r !== null && Je(r), Dt(n)) {
				case 2:
				case 8:
					n = et;
					break;
				case 32:
					n = tt;
					break;
				case 268435456:
					n = rt;
					break;
				default: n = tt;
			}
			return r = jf.bind(null, e), n = qe(n, r), e.callbackPriority = t, e.callbackNode = n, t;
		}
		return r !== null && r !== null && Je(r), e.callbackPriority = 2, e.callbackNode = null, 2;
	}
	function jf(e, t) {
		if (X !== 0 && X !== 5) return e.callbackNode = null, e.callbackPriority = 0, null;
		var n = e.callbackNode;
		if (df() && e.callbackNode !== n) return null;
		var r = q;
		return r = _t(e, e === G ? r : 0, e.cancelPendingCommit !== null || e.timeoutHandle !== -1), r === 0 ? null : (Fd(e, r, t), Af(e, Ze()), e.callbackNode != null && e.callbackNode === n ? jf.bind(null, e) : null);
	}
	function Mf(e, t) {
		if (df()) return null;
		Fd(e, t, !0);
	}
	function Nf() {
		bp(function() {
			W & 6 ? qe($e, Of) : kf();
		});
	}
	function Pf() {
		if (Tf === 0) {
			var e = Wa;
			e === 0 && (e = pt, pt <<= 1, !(pt & 261888) && (pt = 256)), Tf = e;
		}
		return Tf;
	}
	function Ff(e) {
		return e == null || typeof e == "symbol" || typeof e == "boolean" ? null : typeof e == "function" ? e : wn(e);
	}
	function If(e, t, n, r, i) {
		if (t === "submit" && n && n.stateNode === i) {
			var a = Ff((i[At] || null).action), o = r.submitter;
			o && (t = (t = o[At] || null) ? Ff(t.formAction) : o.getAttribute("formAction"), t !== null && (a = t, o = null));
			var s = new Kn("action", "action", null, r, i);
			e.push({
				event: s,
				listeners: [{
					instance: null,
					listener: function() {
						if (r.defaultPrevented) {
							if (Tf !== 0) {
								var e = new FormData(i, o);
								rc(n, {
									pending: !0,
									data: e,
									method: i.method,
									action: a
								}, null, e);
							}
						} else typeof a == "function" && (s.preventDefault(), e = new FormData(i, o), rc(n, {
							pending: !0,
							data: e,
							method: i.method,
							action: a
						}, a, e));
					},
					currentTarget: i
				}]
			});
		}
	}
	for (var Lf = 0; Lf < xi.length; Lf++) {
		var Rf = xi[Lf];
		Si(Rf.toLowerCase(), "on" + (Rf[0].toUpperCase() + Rf.slice(1)));
	}
	Si(pi, "onAnimationEnd"), Si(mi, "onAnimationIteration"), Si(hi, "onAnimationStart"), Si("dblclick", "onDoubleClick"), Si("focusin", "onFocus"), Si("focusout", "onBlur"), Si(gi, "onTransitionRun"), Si(_i, "onTransitionStart"), Si(vi, "onTransitionCancel"), Si(yi, "onTransitionEnd"), Jt("onMouseEnter", ["mouseout", "mouseover"]), Jt("onMouseLeave", ["mouseout", "mouseover"]), Jt("onPointerEnter", ["pointerout", "pointerover"]), Jt("onPointerLeave", ["pointerout", "pointerover"]), qt("onChange", "change click focusin focusout input keydown keyup selectionchange".split(" ")), qt("onSelect", "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" ")), qt("onBeforeInput", [
		"compositionend",
		"keypress",
		"textInput",
		"paste"
	]), qt("onCompositionEnd", "compositionend focusout keydown keypress keyup mousedown".split(" ")), qt("onCompositionStart", "compositionstart focusout keydown keypress keyup mousedown".split(" ")), qt("onCompositionUpdate", "compositionupdate focusout keydown keypress keyup mousedown".split(" "));
	var zf = "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "), Bf = new Set("beforetoggle cancel close invalid load scroll scrollend toggle".split(" ").concat(zf));
	function Vf(e, t) {
		t = !!(t & 4);
		for (var n = 0; n < e.length; n++) {
			var r = e[n], i = r.event;
			r = r.listeners;
			a: {
				var a = void 0;
				if (t) for (var o = r.length - 1; 0 <= o; o--) {
					var s = r[o], c = s.instance, l = s.currentTarget;
					if (s = s.listener, c !== a && i.isPropagationStopped()) break a;
					a = s, i.currentTarget = l;
					try {
						a(i);
					} catch (e) {
						Di(e);
					}
					i.currentTarget = null, a = c;
				}
				else for (o = 0; o < r.length; o++) {
					if (s = r[o], c = s.instance, l = s.currentTarget, s = s.listener, c !== a && i.isPropagationStopped()) break a;
					a = s, i.currentTarget = l;
					try {
						a(i);
					} catch (e) {
						Di(e);
					}
					i.currentTarget = null, a = c;
				}
			}
		}
	}
	function Q(e, t) {
		var n = t[Mt];
		n === void 0 && (n = t[Mt] = /* @__PURE__ */ new Set());
		var r = e + "__bubble";
		n.has(r) || (Gf(t, e, 2, !1), n.add(r));
	}
	function Hf(e, t, n) {
		var r = 0;
		t && (r |= 4), Gf(n, e, r, t);
	}
	var Uf = "_reactListening" + Math.random().toString(36).slice(2);
	function Wf(e) {
		if (!e[Uf]) {
			e[Uf] = !0, Gt.forEach(function(t) {
				t !== "selectionchange" && (Bf.has(t) || Hf(t, !1, e), Hf(t, !0, e));
			});
			var t = e.nodeType === 9 ? e : e.ownerDocument;
			t === null || t[Uf] || (t[Uf] = !0, Hf("selectionchange", !1, t));
		}
	}
	function Gf(e, t, n, r) {
		switch (Ch(t)) {
			case 2:
				var i = _h;
				break;
			case 8:
				i = vh;
				break;
			default: i = yh;
		}
		n = i.bind(null, t, n, e), i = void 0, !Fn || t !== "touchstart" && t !== "touchmove" && t !== "wheel" || (i = !0), r ? i === void 0 ? e.addEventListener(t, n, !0) : e.addEventListener(t, n, {
			capture: !0,
			passive: i
		}) : i === void 0 ? e.addEventListener(t, n, !1) : e.addEventListener(t, n, { passive: i });
	}
	function Kf(e, t, n, r, i) {
		var a = r;
		if (!(t & 1) && !(t & 2) && r !== null) a: for (;;) {
			if (r === null) return;
			var s = r.tag;
			if (s === 3 || s === 4) {
				var c = r.stateNode.containerInfo;
				if (c === i) break;
				if (s === 4) for (s = r.return; s !== null;) {
					var l = s.tag;
					if ((l === 3 || l === 4) && s.stateNode.containerInfo === i) return;
					s = s.return;
				}
				for (; c !== null;) {
					if (s = zt(c), s === null) return;
					if (l = s.tag, l === 5 || l === 6 || l === 26 || l === 27) {
						r = a = s;
						continue a;
					}
					c = c.parentNode;
				}
			}
			r = r.return;
		}
		Mn(function() {
			var r = a, i = Dn(n), s = [];
			a: {
				var c = bi.get(e);
				if (c !== void 0) {
					var l = Kn, u = e;
					switch (e) {
						case "keypress": if (Vn(n) === 0) break a;
						case "keydown":
						case "keyup":
							l = ur;
							break;
						case "focusin":
							u = "focus", l = tr;
							break;
						case "focusout":
							u = "blur", l = tr;
							break;
						case "beforeblur":
						case "afterblur":
							l = tr;
							break;
						case "click": if (n.button === 2) break a;
						case "auxclick":
						case "dblclick":
						case "mousedown":
						case "mousemove":
						case "mouseup":
						case "mouseout":
						case "mouseover":
						case "contextmenu":
							l = $n;
							break;
						case "drag":
						case "dragend":
						case "dragenter":
						case "dragexit":
						case "dragleave":
						case "dragover":
						case "dragstart":
						case "drop":
							l = er;
							break;
						case "touchcancel":
						case "touchend":
						case "touchmove":
						case "touchstart":
							l = pr;
							break;
						case pi:
						case mi:
						case hi:
							l = nr;
							break;
						case yi:
							l = mr;
							break;
						case "scroll":
						case "scrollend":
							l = Jn;
							break;
						case "wheel":
							l = hr;
							break;
						case "copy":
						case "cut":
						case "paste":
							l = rr;
							break;
						case "gotpointercapture":
						case "lostpointercapture":
						case "pointercancel":
						case "pointerdown":
						case "pointermove":
						case "pointerout":
						case "pointerover":
						case "pointerup":
							l = dr;
							break;
						case "submit":
							l = fr;
							break;
						case "toggle":
						case "beforetoggle": l = gr;
					}
					var d = !!(t & 4), f = !d && (e === "scroll" || e === "scrollend"), p = d ? c === null ? null : c + "Capture" : c;
					d = [];
					for (var m = r, h; m !== null;) {
						var g = m;
						if (h = g.stateNode, g = g.tag, g !== 5 && g !== 26 && g !== 27 || h === null || p === null || (g = Nn(m, p), g != null && d.push(qf(m, g, h))), f) break;
						m = m.return;
					}
					0 < d.length && (c = new l(c, u, null, n, i), s.push({
						event: c,
						listeners: d
					}));
				}
			}
			if (!(t & 7)) {
				a: {
					if (l = e === "mouseover" || e === "pointerover", c = e === "mouseout" || e === "pointerout", l && n !== En && (u = n.relatedTarget || n.fromElement) && (zt(u) || u[jt])) break a;
					(c || l) && (u = i.window === i ? i : (l = i.ownerDocument) ? l.defaultView || l.parentWindow : window, c ? (l = n.relatedTarget || n.toElement, c = r, l = l ? zt(l) : null, l !== null && (f = o(l), d = l.tag, l !== f || d !== 5 && d !== 27 && d !== 6) && (l = null)) : (c = null, l = r), c !== l && (d = $n, g = "onMouseLeave", p = "onMouseEnter", m = "mouse", (e === "pointerout" || e === "pointerover") && (d = dr, g = "onPointerLeave", p = "onPointerEnter", m = "pointer"), f = c == null ? u : Vt(c), h = l == null ? u : Vt(l), u = new d(g, m + "leave", c, n, i), u.target = f, u.relatedTarget = h, g = null, zt(i) === r && (d = new d(p, m + "enter", l, n, i), d.target = h, d.relatedTarget = f, g = d), f = g, d = c && l ? ie(c, l, Yf) : null, c !== null && Xf(s, u, c, d, !1), l !== null && f !== null && Xf(s, f, l, d, !0)));
				}
				a: {
					if (c = r ? Vt(r) : window, l = c.nodeName && c.nodeName.toLowerCase(), l === "select" || l === "input" && c.type === "file") var _ = Ir;
					else if (Ar(c)) {
						if (Lr) _ = Kr;
						else {
							_ = Wr;
							var v = Ur;
						}
					} else l = c.nodeName, !l || l.toLowerCase() !== "input" || c.type !== "checkbox" && c.type !== "radio" ? r && xn(r.elementType) && (_ = Ir) : _ = Gr;
					if (_ &&= _(e, r)) {
						jr(s, _, n, i);
						break a;
					}
					v && v(e, c, r);
				}
				switch (v = r ? Vt(r) : window, e) {
					case "focusin":
						(Ar(v) || v.contentEditable === "true") && (ri = v, ii = r, ai = null);
						break;
					case "focusout":
						ai = ii = ri = null;
						break;
					case "mousedown":
						oi = !0;
						break;
					case "contextmenu":
					case "mouseup":
					case "dragend":
						oi = !1, si(s, n, i);
						break;
					case "selectionchange": if (ni) break;
					case "keydown":
					case "keyup": si(s, n, i);
				}
				var y;
				if (vr) b: {
					switch (e) {
						case "compositionstart":
							var b = "onCompositionStart";
							break b;
						case "compositionend":
							b = "onCompositionEnd";
							break b;
						case "compositionupdate":
							b = "onCompositionUpdate";
							break b;
					}
					b = void 0;
				}
				else Er ? wr(e, n) && (b = "onCompositionEnd") : e === "keydown" && n.keyCode === 229 && (b = "onCompositionStart");
				b && (xr && n.locale !== "ko" && (Er || b !== "onCompositionStart" ? b === "onCompositionEnd" && Er && (y = Bn()) : (Ln = i, Rn = "value" in Ln ? Ln.value : Ln.textContent, Er = !0)), v = Jf(r, b), 0 < v.length && (b = new ir(b, e, null, n, i), s.push({
					event: b,
					listeners: v
				}), y ? b.data = y : (y = Tr(n), y !== null && (b.data = y)))), (y = br ? Dr(e, n) : Or(e, n)) && (b = Jf(r, "onBeforeInput"), 0 < b.length && (v = new ir("onBeforeInput", "beforeinput", null, n, i), s.push({
					event: v,
					listeners: b
				}), v.data = y)), If(s, e, r, n, i);
			}
			Vf(s, t);
		});
	}
	function qf(e, t, n) {
		return {
			instance: e,
			listener: t,
			currentTarget: n
		};
	}
	function Jf(e, t) {
		for (var n = t + "Capture", r = []; e !== null;) {
			var i = e, a = i.stateNode;
			if (i = i.tag, i !== 5 && i !== 26 && i !== 27 || a === null || (i = Nn(e, n), i != null && r.unshift(qf(e, i, a)), i = Nn(e, t), i != null && r.push(qf(e, i, a))), e.tag === 3) return r;
			e = e.return;
		}
		return [];
	}
	function Yf(e) {
		if (e === null) return null;
		do
			e = e.return;
		while (e && e.tag !== 5 && e.tag !== 27);
		return e || null;
	}
	function Xf(e, t, n, r, i) {
		for (var a = t._reactName, o = []; n !== null && n !== r;) {
			var s = n, c = s.alternate, l = s.stateNode;
			if (s = s.tag, c !== null && c === r) break;
			s !== 5 && s !== 26 && s !== 27 || l === null || (c = l, i ? (l = Nn(n, a), l != null && o.unshift(qf(n, l, c))) : i || (l = Nn(n, a), l != null && o.push(qf(n, l, c)))), n = n.return;
		}
		o.length !== 0 && e.push({
			event: t,
			listeners: o
		});
	}
	var Zf = /\r\n?/g, Qf = /\u0000|\uFFFD/g;
	function $f(e) {
		return (typeof e == "string" ? e : "" + e).replace(Zf, "\n").replace(Qf, "");
	}
	function ep(e, t) {
		return t = $f(t), $f(e) === t;
	}
	function $(e, t, n, r, a, o) {
		switch (n) {
			case "children":
				if (typeof r == "string") t === "body" || t === "textarea" && r === "" || _n(e, r);
				else if (typeof r == "number" || typeof r == "bigint") t !== "body" && _n(e, "" + r);
				else return;
				break;
			case "className":
				tn(e, "class", r);
				break;
			case "tabIndex":
				tn(e, "tabindex", r);
				break;
			case "dir":
			case "role":
			case "viewBox":
			case "width":
			case "height":
				tn(e, n, r);
				break;
			case "style":
				bn(e, r, o);
				return;
			case "data": if (t !== "object") {
				tn(e, "data", r);
				break;
			}
			case "src":
			case "href":
				if (r === "" && (t !== "a" || n !== "href")) {
					e.removeAttribute(n);
					break;
				}
				if (r == null || typeof r == "function" || typeof r == "symbol" || typeof r == "boolean") {
					e.removeAttribute(n);
					break;
				}
				r = wn(r), e.setAttribute(n, r);
				break;
			case "action":
			case "formAction":
				if (typeof r == "function") {
					e.setAttribute(n, "javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')");
					break;
				}
				if (typeof o == "function" && (n === "formAction" ? (t !== "input" && $(e, t, "name", a.name, a, null), $(e, t, "formEncType", a.formEncType, a, null), $(e, t, "formMethod", a.formMethod, a, null), $(e, t, "formTarget", a.formTarget, a, null)) : ($(e, t, "encType", a.encType, a, null), $(e, t, "method", a.method, a, null), $(e, t, "target", a.target, a, null))), r == null || typeof r == "symbol" || typeof r == "boolean") {
					e.removeAttribute(n);
					break;
				}
				r = wn(r), e.setAttribute(n, r);
				break;
			case "onClick":
				r != null && (e.onclick = Tn);
				return;
			case "onScroll":
				r != null && Q("scroll", e);
				return;
			case "onScrollEnd":
				r != null && Q("scrollend", e);
				return;
			case "dangerouslySetInnerHTML":
				if (r != null) {
					if (typeof r != "object" || !("__html" in r)) throw Error(i(61));
					if (n = r.__html, n != null) {
						if (a.children != null) throw Error(i(60));
						o?.__html !== n && (e.innerHTML = n);
					}
				}
				break;
			case "multiple":
				e.multiple = r && typeof r != "function" && typeof r != "symbol";
				break;
			case "muted":
				e.muted = r && typeof r != "function" && typeof r != "symbol";
				break;
			case "suppressContentEditableWarning":
			case "suppressHydrationWarning":
			case "defaultValue":
			case "defaultChecked":
			case "innerHTML":
			case "ref": break;
			case "autoFocus": break;
			case "xlinkHref":
				if (r == null || typeof r == "function" || typeof r == "boolean" || typeof r == "symbol") {
					e.removeAttribute("xlink:href");
					break;
				}
				n = wn(r), e.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", n);
				break;
			case "contentEditable":
			case "spellCheck":
			case "draggable":
			case "value":
			case "autoReverse":
			case "externalResourcesRequired":
			case "focusable":
			case "preserveAlpha":
				r != null && typeof r != "function" && typeof r != "symbol" ? e.setAttribute(n, r) : e.removeAttribute(n);
				break;
			case "inert":
			case "allowFullScreen":
			case "async":
			case "autoPlay":
			case "controls":
			case "credentialless":
			case "default":
			case "defer":
			case "disabled":
			case "disablePictureInPicture":
			case "disableRemotePlayback":
			case "formNoValidate":
			case "hidden":
			case "loop":
			case "noModule":
			case "noValidate":
			case "open":
			case "playsInline":
			case "readOnly":
			case "required":
			case "reversed":
			case "scoped":
			case "seamless":
			case "itemScope":
				r && typeof r != "function" && typeof r != "symbol" ? e.setAttribute(n, "") : e.removeAttribute(n);
				break;
			case "capture":
			case "download":
				!0 === r ? e.setAttribute(n, "") : !1 !== r && r != null && typeof r != "function" && typeof r != "symbol" ? e.setAttribute(n, r) : e.removeAttribute(n);
				break;
			case "cols":
			case "rows":
			case "size":
			case "span":
				r != null && typeof r != "function" && typeof r != "symbol" && !isNaN(r) && 1 <= r ? e.setAttribute(n, r) : e.removeAttribute(n);
				break;
			case "rowSpan":
			case "start":
				r == null || typeof r == "function" || typeof r == "symbol" || isNaN(r) ? e.removeAttribute(n) : e.setAttribute(n, r);
				break;
			case "popover":
				Q("beforetoggle", e), Q("toggle", e), en(e, "popover", r);
				break;
			case "xlinkActuate":
				nn(e, "http://www.w3.org/1999/xlink", "xlink:actuate", r);
				break;
			case "xlinkArcrole":
				nn(e, "http://www.w3.org/1999/xlink", "xlink:arcrole", r);
				break;
			case "xlinkRole":
				nn(e, "http://www.w3.org/1999/xlink", "xlink:role", r);
				break;
			case "xlinkShow":
				nn(e, "http://www.w3.org/1999/xlink", "xlink:show", r);
				break;
			case "xlinkTitle":
				nn(e, "http://www.w3.org/1999/xlink", "xlink:title", r);
				break;
			case "xlinkType":
				nn(e, "http://www.w3.org/1999/xlink", "xlink:type", r);
				break;
			case "xmlBase":
				nn(e, "http://www.w3.org/XML/1998/namespace", "xml:base", r);
				break;
			case "xmlLang":
				nn(e, "http://www.w3.org/XML/1998/namespace", "xml:lang", r);
				break;
			case "xmlSpace":
				nn(e, "http://www.w3.org/XML/1998/namespace", "xml:space", r);
				break;
			case "is":
				en(e, "is", r);
				break;
			case "innerText":
			case "textContent": return;
			default: if (!(2 < n.length) || n[0] !== "o" && n[0] !== "O" || n[1] !== "n" && n[1] !== "N") n = Sn.get(n) || n, en(e, n, r);
			else return;
		}
		M = !0;
	}
	function tp(e, t, n, r, a, o) {
		switch (n) {
			case "style":
				bn(e, r, o);
				return;
			case "dangerouslySetInnerHTML":
				if (r != null) {
					if (typeof r != "object" || !("__html" in r)) throw Error(i(61));
					if (n = r.__html, n != null) {
						if (a.children != null) throw Error(i(60));
						o?.__html !== n && (e.innerHTML = n);
					}
				}
				break;
			case "children":
				if (typeof r == "string") _n(e, r);
				else if (typeof r == "number" || typeof r == "bigint") _n(e, "" + r);
				else return;
				break;
			case "onScroll":
				r != null && Q("scroll", e);
				return;
			case "onScrollEnd":
				r != null && Q("scrollend", e);
				return;
			case "onClick":
				r != null && (e.onclick = Tn);
				return;
			case "suppressContentEditableWarning":
			case "suppressHydrationWarning":
			case "innerHTML":
			case "ref": return;
			case "innerText":
			case "textContent": return;
			default:
				if (!Kt.hasOwnProperty(n)) a: {
					if (n[0] === "o" && n[1] === "n" && (a = n.endsWith("Capture"), o = n.slice(2, a ? n.length - 7 : void 0), t = e[At] || null, t = t == null ? null : t[n], typeof t == "function" && e.removeEventListener(o, t, a), typeof r == "function")) {
						typeof t != "function" && t !== null && (n in e ? e[n] = null : e.hasAttribute(n) && e.removeAttribute(n)), e.addEventListener(o, r, a);
						break a;
					}
					M = !0, n in e ? e[n] = r : !0 === r ? e.setAttribute(n, "") : en(e, n, r);
				}
				return;
		}
		M = !0;
	}
	function np(e, t, n) {
		switch (t) {
			case "div":
			case "span":
			case "svg":
			case "path":
			case "a":
			case "g":
			case "p":
			case "li": break;
			case "img":
				Q("error", e), Q("load", e);
				var r = !1, a = !1, o;
				for (o in n) if (n.hasOwnProperty(o)) {
					var s = n[o];
					if (s != null) switch (o) {
						case "src":
							r = !0;
							break;
						case "srcSet":
							a = !0;
							break;
						case "children":
						case "dangerouslySetInnerHTML": throw Error(i(137, t));
						default: $(e, t, o, s, n, null);
					}
				}
				a && $(e, t, "srcSet", n.srcSet, n, null), r && $(e, t, "src", n.src, n, null);
				return;
			case "input":
				Q("invalid", e);
				var c = o = s = a = null, l = null, u = null;
				for (r in n) if (n.hasOwnProperty(r)) {
					var d = n[r];
					if (d != null) switch (r) {
						case "name":
							a = d;
							break;
						case "type":
							s = d;
							break;
						case "checked":
							l = d;
							break;
						case "defaultChecked":
							u = d;
							break;
						case "value":
							o = d;
							break;
						case "defaultValue":
							c = d;
							break;
						case "children":
						case "dangerouslySetInnerHTML":
							if (d != null) throw Error(i(137, t));
							break;
						default: $(e, t, r, d, n, null);
					}
				}
				fn(e, o, c, l, u, s, a, !1);
				return;
			case "select":
				for (a in Q("invalid", e), r = s = o = null, n) if (n.hasOwnProperty(a) && (c = n[a], c != null)) switch (a) {
					case "value":
						o = c;
						break;
					case "defaultValue":
						s = c;
						break;
					case "multiple": r = c;
					default: $(e, t, a, c, n, null);
				}
				t = o, n = s, e.multiple = !!r, t == null ? n != null && mn(e, !!r, n, !0) : mn(e, !!r, t, !1);
				return;
			case "textarea":
				for (s in Q("invalid", e), o = a = r = null, n) if (n.hasOwnProperty(s) && (c = n[s], c != null)) switch (s) {
					case "value":
						r = c;
						break;
					case "defaultValue":
						a = c;
						break;
					case "children":
						o = c;
						break;
					case "dangerouslySetInnerHTML":
						if (c != null) throw Error(i(91));
						break;
					default: $(e, t, s, c, n, null);
				}
				gn(e, r, a, o);
				return;
			case "option":
				for (l in n) if (n.hasOwnProperty(l) && (r = n[l], r != null)) switch (l) {
					case "selected":
						e.selected = r && typeof r != "function" && typeof r != "symbol";
						break;
					default: $(e, t, l, r, n, null);
				}
				return;
			case "dialog":
				Q("beforetoggle", e), Q("toggle", e), Q("cancel", e), Q("close", e);
				break;
			case "iframe":
			case "object":
				Q("load", e);
				break;
			case "video":
			case "audio":
				for (r = 0; r < zf.length; r++) Q(zf[r], e);
				break;
			case "image":
				Q("error", e), Q("load", e);
				break;
			case "details":
				Q("toggle", e);
				break;
			case "embed":
			case "source":
			case "link": Q("error", e), Q("load", e);
			case "area":
			case "base":
			case "br":
			case "col":
			case "hr":
			case "keygen":
			case "meta":
			case "param":
			case "track":
			case "wbr":
			case "menuitem":
				for (u in n) if (n.hasOwnProperty(u) && (r = n[u], r != null)) switch (u) {
					case "children":
					case "dangerouslySetInnerHTML": throw Error(i(137, t));
					default: $(e, t, u, r, n, null);
				}
				return;
			default: if (xn(t)) {
				for (d in n) n.hasOwnProperty(d) && (r = n[d], r !== void 0 && tp(e, t, d, r, n, void 0));
				return;
			}
		}
		for (c in n) n.hasOwnProperty(c) && (r = n[c], r != null && $(e, t, c, r, n, null));
	}
	var rp = {};
	function ip(e, t, n, r) {
		switch (t) {
			case "div":
			case "span":
			case "svg":
			case "path":
			case "a":
			case "g":
			case "p":
			case "li": break;
			case "input":
				var a = null, o = null, s = null, c = null, l = null, u = null, d = null;
				for (m in n) {
					var f = n[m];
					if (n.hasOwnProperty(m) && f != null) switch (m) {
						case "checked": break;
						case "value": break;
						case "defaultValue": l = f;
						default: r.hasOwnProperty(m) || $(e, t, m, null, r, f);
					}
				}
				for (var p in r) {
					var m = r[p];
					if (f = n[p], r.hasOwnProperty(p) && (m != null || f != null)) switch (p) {
						case "type":
							m !== f && (M = !0), o = m;
							break;
						case "name":
							m !== f && (M = !0), a = m;
							break;
						case "checked":
							m !== f && (M = !0), u = m;
							break;
						case "defaultChecked":
							m !== f && (M = !0), d = m;
							break;
						case "value":
							m !== f && (M = !0), s = m;
							break;
						case "defaultValue":
							m !== f && (M = !0), c = m;
							break;
						case "children":
						case "dangerouslySetInnerHTML":
							if (m != null) throw Error(i(137, t));
							break;
						default: m !== f && $(e, t, p, m, r, f);
					}
				}
				dn(e, s, c, l, u, d, o, a);
				return;
			case "select":
				for (o in m = s = c = p = null, n) if (l = n[o], n.hasOwnProperty(o) && l != null) switch (o) {
					case "value": break;
					case "multiple": m = l;
					default: r.hasOwnProperty(o) || $(e, t, o, null, r, l);
				}
				for (a in r) if (o = r[a], l = n[a], r.hasOwnProperty(a) && (o != null || l != null)) switch (a) {
					case "value":
						o !== l && (M = !0), p = o;
						break;
					case "defaultValue":
						o !== l && (M = !0), c = o;
						break;
					case "multiple": o !== l && (M = !0), s = o;
					default: o !== l && $(e, t, a, o, r, l);
				}
				t = c, n = s, r = m, p == null ? !!r != !!n && (t == null ? mn(e, !!n, n ? [] : "", !1) : mn(e, !!n, t, !0)) : mn(e, !!n, p, !1);
				return;
			case "textarea":
				for (c in m = p = null, n) if (a = n[c], n.hasOwnProperty(c) && a != null && !r.hasOwnProperty(c)) switch (c) {
					case "value": break;
					case "children": break;
					default: $(e, t, c, null, r, a);
				}
				for (s in r) if (a = r[s], o = n[s], r.hasOwnProperty(s) && (a != null || o != null)) switch (s) {
					case "value":
						a !== o && (M = !0), p = a;
						break;
					case "defaultValue":
						a !== o && (M = !0), m = a;
						break;
					case "children": break;
					case "dangerouslySetInnerHTML":
						if (a != null) throw Error(i(91));
						break;
					default: a !== o && $(e, t, s, a, r, o);
				}
				hn(e, p, m);
				return;
			case "option":
				for (var h in n) if (p = n[h], n.hasOwnProperty(h) && p != null && !r.hasOwnProperty(h)) switch (h) {
					case "selected":
						e.selected = !1;
						break;
					default: $(e, t, h, null, r, p);
				}
				for (l in r) if (p = r[l], m = n[l], r.hasOwnProperty(l) && p !== m && (p != null || m != null)) switch (l) {
					case "selected":
						p !== m && (M = !0), e.selected = p && typeof p != "function" && typeof p != "symbol";
						break;
					default: $(e, t, l, p, r, m);
				}
				return;
			case "img":
			case "link":
			case "area":
			case "base":
			case "br":
			case "col":
			case "embed":
			case "hr":
			case "keygen":
			case "meta":
			case "param":
			case "source":
			case "track":
			case "wbr":
			case "menuitem":
				for (var g in n) p = n[g], n.hasOwnProperty(g) && p != null && !r.hasOwnProperty(g) && $(e, t, g, null, r, p);
				for (u in r) if (p = r[u], m = n[u], r.hasOwnProperty(u) && p !== m && (p != null || m != null)) switch (u) {
					case "children":
					case "dangerouslySetInnerHTML":
						if (p != null) throw Error(i(137, t));
						break;
					default: $(e, t, u, p, r, m);
				}
				return;
			default: if (xn(t)) {
				for (var _ in n) p = n[_], n.hasOwnProperty(_) && p !== void 0 && !r.hasOwnProperty(_) && tp(e, t, _, void 0, r, p);
				for (d in r) p = r[d], m = n[d], !r.hasOwnProperty(d) || p === m || p === void 0 && m === void 0 || tp(e, t, d, p, r, m);
				return;
			}
		}
		for (var v in n) p = n[v], n.hasOwnProperty(v) && p != null && !r.hasOwnProperty(v) && $(e, t, v, null, r, p);
		for (f in r) p = r[f], m = n[f], !r.hasOwnProperty(f) || p === m || p == null && m == null || $(e, t, f, p, r, m);
	}
	function ap(e) {
		switch (e) {
			case "css":
			case "script":
			case "font":
			case "img":
			case "image":
			case "input":
			case "link": return !0;
			default: return !1;
		}
	}
	function op() {
		if (typeof performance.getEntriesByType == "function") {
			for (var e = 0, t = 0, n = performance.getEntriesByType("resource"), r = 0; r < n.length; r++) {
				var i = n[r], a = i.transferSize, o = i.initiatorType, s = i.duration;
				if (a && s && ap(o)) {
					for (o = 0, s = i.responseEnd, r += 1; r < n.length; r++) {
						var c = n[r], l = c.startTime;
						if (l > s) break;
						var u = c.transferSize, d = c.initiatorType;
						u && ap(d) && (c = c.responseEnd, o += u * (c < s ? 1 : (s - l) / (c - l)));
					}
					if (--r, t += 8 * (a + o) / (i.duration / 1e3), e++, 10 < e) break;
				}
			}
			if (0 < e) return t / e / 1e6;
		}
		return navigator.connection && (e = navigator.connection.downlink, typeof e == "number") ? e : 5;
	}
	var sp = null, cp = null;
	function lp(e) {
		return e.nodeType === 9 ? e : e.ownerDocument;
	}
	function up(e) {
		switch (e) {
			case "http://www.w3.org/2000/svg": return 1;
			case "http://www.w3.org/1998/Math/MathML": return 2;
			default: return 0;
		}
	}
	function dp(e, t) {
		if (e === 0) switch (t) {
			case "svg": return 1;
			case "math": return 2;
			default: return 0;
		}
		return e === 1 && t === "foreignObject" ? 0 : e;
	}
	function fp(e, t, n, r) {
		return n = lp(n).createElement(e), n[j] = r, n[At] = t, np(n, e, t), Ut(n), n;
	}
	function pp(e, t) {
		return e === "textarea" || e === "noscript" || typeof t.children == "string" || typeof t.children == "number" || typeof t.children == "bigint" || typeof t.dangerouslySetInnerHTML == "object" && t.dangerouslySetInnerHTML !== null && t.dangerouslySetInnerHTML.__html != null;
	}
	var mp = null;
	function hp() {
		var e = window.event;
		return e && e.type === "popstate" ? e !== mp && (mp = e, !0) : (mp = null, !1);
	}
	var gp = typeof setTimeout == "function" ? setTimeout : void 0, _p = typeof clearTimeout == "function" ? clearTimeout : void 0, vp = typeof Promise == "function" ? Promise : void 0, yp = typeof requestAnimationFrame == "function" ? requestAnimationFrame : gp, bp = typeof queueMicrotask == "function" ? queueMicrotask : vp === void 0 ? gp : function(e) {
		return vp.resolve(null).then(e).catch(xp);
	};
	function xp(e) {
		setTimeout(function() {
			throw e;
		});
	}
	function Sp(e) {
		return e === "head";
	}
	function Cp(e, t) {
		var n = t, r = 0;
		do {
			var i = n.nextSibling;
			if (e.removeChild(n), i && i.nodeType === 8) {
				if (n = i.data, n === "/$" || n === "/&") {
					if (r === 0) {
						e.removeChild(i), Hh(t);
						return;
					}
					r--;
				} else if (n === "$" || n === "$?" || n === "$~" || n === "$!" || n === "&") r++;
				else if (n === "html") _m(e.ownerDocument.documentElement);
				else if (n === "head") {
					n = e.ownerDocument.head, _m(n);
					for (var a = n.firstChild; a;) {
						var o = a.nextSibling, s = a.nodeName;
						a[It] || s === "SCRIPT" || s === "STYLE" || s === "LINK" && a.rel.toLowerCase() === "stylesheet" || n.removeChild(a), a = o;
					}
				} else n === "body" && _m(e.ownerDocument.body);
			}
			n = i;
		} while (n);
		Hh(t);
	}
	function wp(e, t) {
		var n = e;
		e = 0;
		do {
			var r = n.nextSibling;
			if (n.nodeType === 1 ? t ? (n._stashedDisplay = n.style.display, n.style.display = "none") : (n.style.display = n._stashedDisplay || "", n.getAttribute("style") === "" && n.removeAttribute("style")) : n.nodeType === 3 && (t ? (n._stashedText = n.nodeValue, n.nodeValue = "") : n.nodeValue = n._stashedText || ""), r && r.nodeType === 8) {
				if (n = r.data, n === "/$") {
					if (e === 0) break;
					e--;
				} else n !== "$" && n !== "$?" && n !== "$~" && n !== "$!" || e++;
			}
			n = r;
		} while (n);
	}
	function Tp(e, t, n) {
		if (t = CSS.escape(t) === t ? t : "r-" + btoa(t).replace(/=/g, ""), e.style.viewTransitionName = t, n != null && (e.style.viewTransitionClass = n), n = getComputedStyle(e), n.display === "inline") {
			if (t = e.getClientRects(), t.length === 1) var r = 1;
			else for (var i = r = 0; i < t.length; i++) {
				var a = t[i];
				0 < a.width && 0 < a.height && r++;
			}
			r === 1 && (e = e.style, e.display = t.length === 1 ? "inline-block" : "block", e.marginTop = "-" + n.paddingTop, e.marginBottom = "-" + n.paddingBottom);
		}
	}
	function Ep(e, t) {
		e = e.style, t = t.style;
		var n = t == null ? null : t.hasOwnProperty("viewTransitionName") ? t.viewTransitionName : t.hasOwnProperty("view-transition-name") ? t["view-transition-name"] : null;
		e.viewTransitionName = n == null || typeof n == "boolean" ? "" : ("" + n).trim(), n = t == null ? null : t.hasOwnProperty("viewTransitionClass") ? t.viewTransitionClass : t.hasOwnProperty("view-transition-class") ? t["view-transition-class"] : null, e.viewTransitionClass = n == null || typeof n == "boolean" ? "" : ("" + n).trim(), e.display === "inline-block" && (t == null ? e.display = e.margin = "" : (n = t.display, e.display = n == null || typeof n == "boolean" ? "" : n, n = t.margin, n == null ? (n = t.hasOwnProperty("marginTop") ? t.marginTop : t["margin-top"], e.marginTop = n == null || typeof n == "boolean" ? "" : n, t = t.hasOwnProperty("marginBottom") ? t.marginBottom : t["margin-bottom"], e.marginBottom = t == null || typeof t == "boolean" ? "" : t) : e.margin = n));
	}
	function Dp(e, t, n) {
		return n = n.ownerDocument.defaultView, {
			rect: e,
			abs: t.position === "absolute" || t.position === "fixed",
			clip: t.clipPath !== "none" || t.overflow !== "visible" || t.filter !== "none" || t.mask !== "none" || t.mask !== "none" || t.borderRadius !== "0px",
			view: 0 <= e.bottom && 0 <= e.right && e.top <= n.innerHeight && e.left <= n.innerWidth
		};
	}
	function Op(e) {
		return Dp(e.getBoundingClientRect(), getComputedStyle(e), e);
	}
	function kp(e) {
		var t = e.getBoundingClientRect();
		t = new DOMRect(t.x + 2e4, t.y + 2e4, t.width, t.height);
		var n = getComputedStyle(e);
		return Dp(t, n, e);
	}
	function Ap(e) {
		return e.documentElement.clientHeight;
	}
	function jp(e) {
		this.addEventListener("load", e), this.addEventListener("error", e);
	}
	function Mp(e, t, n, r, i, a, o, s, c) {
		var l = t.nodeType === 9 ? t : t.ownerDocument;
		try {
			var u = l.startViewTransition({
				update: function() {
					var t = l.defaultView, n = t.navigation && t.navigation.transition, o = l.fonts.status;
					r();
					var s = [];
					if (o === "loaded" && (Ap(l), l.fonts.status === "loading" && s.push(l.fonts.ready)), o = s.length, e !== null) for (var c = e.suspenseyImages, u = 0, d = 0; d < c.length; d++) {
						var f = c[d];
						if (!f.complete) {
							var p = f.getBoundingClientRect();
							if (0 < p.bottom && 0 < p.right && p.top < t.innerHeight && p.left < t.innerWidth) {
								if (u += Xm(f), u > $m) {
									s.length = o;
									break;
								}
								f = new Promise(jp.bind(f)), s.push(f);
							}
						}
					}
					if (0 < s.length) return t = Promise.race([Promise.all(s), new Promise(function(e) {
						return setTimeout(e, 500);
					})]).then(i, i), (n ? Promise.allSettled([n.finished, t]) : t).then(a, a);
					if (i(), n) return n.finished.then(a, a);
					a();
				},
				types: n
			});
			l.__reactViewTransition = u;
			var d = [];
			return u.ready.then(function() {
				for (var e = l.documentElement.getAnimations({ subtree: !0 }), t = 0; t < e.length; t++) {
					var n = e[t], r = n.effect, i = r.pseudoElement;
					if (i != null && i.startsWith("::view-transition")) {
						d.push(n), n = r.getKeyframes();
						for (var a = i = void 0, s = !0, c = 0; c < n.length; c++) {
							var u = n[c], f = u.width;
							if (i === void 0) i = f;
							else if (i !== f) {
								s = !1;
								break;
							}
							if (f = u.height, a === void 0) a = f;
							else if (a !== f) {
								s = !1;
								break;
							}
							delete u.width, delete u.height, u.transform === "none" && delete u.transform;
						}
						s && i !== void 0 && a !== void 0 && (r.setKeyframes(n), s = getComputedStyle(r.target, r.pseudoElement), s.width !== i || s.height !== a) && (s = n[0], s.width = i, s.height = a, s = n[n.length - 1], s.width = i, s.height = a, r.setKeyframes(n));
					}
				}
				o();
			}, function(e) {
				l.__reactViewTransition === u && (l.__reactViewTransition = null);
				try {
					if (typeof e == "object" && e) switch (e.name) {
						case "InvalidStateError": (e.message === "View transition was skipped because document visibility state is hidden." || e.message === "Skipping view transition because document visibility state has become hidden." || e.message === "Skipping view transition because viewport size changed." || e.message === "Transition was aborted because of invalid state") && (e = null);
					}
					e !== null && c(e);
				} finally {
					r(), i(), o();
				}
			}), u.finished.finally(function() {
				for (var e = 0; e < d.length; e++) d[e].cancel();
				l.__reactViewTransition === u && (l.__reactViewTransition = null), s();
			}), u;
		} catch {
			return r(), i(), o(), null;
		}
	}
	function Np(e, t) {
		this._scope = document.documentElement, this._selector = "::view-transition-" + e + "(" + t + ")";
	}
	Np.prototype.animate = function(e, t) {
		return t = typeof t == "number" ? { duration: t } : S({}, t), t.pseudoElement = this._selector, this._scope.animate(e, t);
	}, Np.prototype.getAnimations = function() {
		for (var e = this._scope, t = this._selector, n = e.getAnimations({ subtree: !0 }), r = [], i = 0; i < n.length; i++) {
			var a = n[i].effect;
			a !== null && a.target === e && a.pseudoElement === t && r.push(n[i]);
		}
		return r;
	}, Np.prototype.getComputedStyle = function() {
		return getComputedStyle(this._scope, this._selector);
	};
	function Pp(e) {
		return {
			name: e,
			group: new Np("group", e),
			imagePair: new Np("image-pair", e),
			old: new Np("old", e),
			new: new Np("new", e)
		};
	}
	function Fp(e) {
		this._fragmentFiber = e, this._observers = this._eventListeners = null;
	}
	Fp.prototype.addEventListener = function(e, t, n) {
		var r = null, i = null;
		if (!(n != null && typeof n != "boolean" && (r = n.signal || null, r !== null && r.aborted))) {
			this._eventListeners === null && (this._eventListeners = []);
			var a = this._eventListeners;
			if (Bp(a, e, t, n) === -1) {
				var o = this, s = t;
				n != null && typeof n != "boolean" && !0 === n.once && (s = function(r) {
					o.removeEventListener(e, t, n), typeof t == "function" ? t.call(this, r) : t.handleEvent(r);
				}), r !== null && (i = o.removeEventListener.bind(o, e, t, n), r.addEventListener("abort", i, { once: !0 }), i = r.removeEventListener.bind(r, "abort", i)), r = Rp(n), a.push({
					type: e,
					listener: t,
					optionsOrUseCapture: n,
					attachedListener: s,
					cleanup: i
				}), h(this._fragmentFiber.child, !1, Ip, e, s, r);
			}
			this._eventListeners = a;
		}
	};
	function Ip(e, t, n, r) {
		return b(e).addEventListener(t, n, r), !1;
	}
	Fp.prototype.removeEventListener = function(e, t, n) {
		var r = this._eventListeners;
		if (r !== null && (t = Bp(r, e, t, n), t !== -1)) {
			var i = r[t];
			n = i.attachedListener;
			var a = i.cleanup;
			i = Rp(i.optionsOrUseCapture), h(this._fragmentFiber.child, !1, Lp, e, n, i), r.splice(t, 1), a !== null && a();
		}
	};
	function Lp(e, t, n, r) {
		return b(e).removeEventListener(t, n, r), !1;
	}
	function Rp(e) {
		return e != null && typeof e != "boolean" && (!0 === e.once || e.signal instanceof AbortSignal) ? {
			capture: e.capture,
			passive: e.passive
		} : e;
	}
	function zp(e) {
		return e == null ? "c=0" : typeof e == "boolean" ? "c=" + (e ? "1" : "0") : "c=" + (e.capture ? "1" : "0");
	}
	function Bp(e, t, n, r) {
		if (e.length === 0) return -1;
		r = zp(r);
		for (var i = 0; i < e.length; i++) {
			var a = e[i];
			if (a.type === t && a.listener === n && zp(a.optionsOrUseCapture) === r) return i;
		}
		return -1;
	}
	Fp.prototype.dispatchEvent = function(e) {
		var t = g(this._fragmentFiber);
		if (t === null) return !0;
		t = b(t);
		var n = this._eventListeners;
		if (n !== null && 0 < n.length || !e.bubbles) {
			var r = t.nodeType === 9 ? t.createComment("") : document.createTextNode("");
			if (n) for (var i = 0; i < n.length; i++) {
				var a = n[i];
				r.addEventListener(a.type, a.attachedListener, Rp(a.optionsOrUseCapture));
			}
			if (t.appendChild(r), e = r.dispatchEvent(e), n) for (i = 0; i < n.length; i++) a = n[i], r.removeEventListener(a.type, a.attachedListener, Rp(a.optionsOrUseCapture));
			return t.removeChild(r), e;
		}
		return t.dispatchEvent(e);
	}, Fp.prototype.focus = function(e) {
		h(this._fragmentFiber.child, !0, Vp, e, void 0, void 0);
	};
	function Vp(e, t) {
		return e.tag !== 6 && (e = b(e), pm(e, t));
	}
	Fp.prototype.focusLast = function(e) {
		var t = [];
		h(this._fragmentFiber.child, !0, Hp, t, void 0, void 0);
		for (var n = t.length - 1; 0 <= n && !Vp(t[n], e); n--);
	};
	function Hp(e, t) {
		return t.push(e), !1;
	}
	Fp.prototype.blur = function() {
		var e = g(this._fragmentFiber);
		e !== null && (e = b(e), e = lp(e).activeElement, e !== null && h(this._fragmentFiber.child, !1, Up, e, void 0, void 0));
	};
	function Up(e, t) {
		return e.tag !== 6 && (e = b(e), e === t || e.contains(t) ? (t.blur(), !0) : !1);
	}
	Fp.prototype.observeUsing = function(e) {
		this._observers === null && (this._observers = /* @__PURE__ */ new Set()), this._observers.add(e), h(this._fragmentFiber.child, !1, Wp, e, void 0, void 0);
	};
	function Wp(e, t) {
		return e.tag !== 6 && (e = b(e), t.observe(e), !1);
	}
	Fp.prototype.unobserveUsing = function(e) {
		var t = this._observers;
		if (t !== null && t.has(e)) {
			t.delete(e), h(this._fragmentFiber.child, !1, Gp, e, void 0, void 0);
			for (var n = t = 0; n < Kp.length; n++) {
				var r = Kp[n];
				r.fragmentInstance === this && r.observer === e ? e.unobserve(r.instance) : Kp[t++] = r;
			}
			Kp.length = t;
		}
	};
	function Gp(e, t) {
		return e.tag !== 6 && (e = b(e), t.unobserve(e), !1);
	}
	var Kp = [], qp = !1;
	function Jp(e, t, n) {
		Kp.push({
			fragmentInstance: e,
			observer: t,
			instance: n
		}), qp || (qp = !0, mm(function() {
			qp = !1;
			var e = Kp;
			Kp = [];
			for (var t = 0; t < e.length; t++) {
				var n = e[t];
				n.observer.unobserve(n.instance);
			}
		}));
	}
	Fp.prototype.getClientRects = function() {
		var e = [];
		return h(this._fragmentFiber.child, !1, Yp, e, void 0, void 0), e;
	};
	function Yp(e, t) {
		if (e.tag === 6) {
			e = e.stateNode;
			var n = e.ownerDocument.createRange();
			n.selectNodeContents(e), t.push.apply(t, n.getClientRects());
		} else e = b(e), t.push.apply(t, e.getClientRects());
		return !1;
	}
	Fp.prototype.getRootNode = function(e) {
		var t = g(this._fragmentFiber);
		return t === null ? this : b(t).getRootNode(e);
	}, Fp.prototype.compareDocumentPosition = function(e) {
		var t = g(this._fragmentFiber);
		if (t === null) return Node.DOCUMENT_POSITION_DISCONNECTED;
		var n = [];
		h(this._fragmentFiber.child, !1, Hp, n, void 0, void 0);
		var r = b(t);
		if (n.length === 0) {
			if (n = r, _(this._fragmentFiber)) {
				a: {
					for (t = this._fragmentFiber.return; t !== null;) {
						if (t.tag === 4) {
							t = t.stateNode.containerInfo;
							break a;
						}
						if (t.tag === 3 || t.tag === 5 || t.tag === 27) break;
						t = t.return;
					}
					t = null;
				}
				t != null && (n = t);
			}
			t = this._fragmentFiber;
			var i = r = n.compareDocumentPosition(e);
			return n === e ? i = Node.DOCUMENT_POSITION_CONTAINS : r & Node.DOCUMENT_POSITION_CONTAINED_BY && (n = v(t)[1], n === null ? i = Node.DOCUMENT_POSITION_PRECEDING : (e = b(n).compareDocumentPosition(e), i = e === 0 || e & Node.DOCUMENT_POSITION_FOLLOWING ? Node.DOCUMENT_POSITION_FOLLOWING : Node.DOCUMENT_POSITION_PRECEDING)), i |= Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC;
		}
		t = b(n[0]), i = b(n[n.length - 1]);
		var a = _(this._fragmentFiber) ? t.parentElement : r;
		if (a == null) return Node.DOCUMENT_POSITION_DISCONNECTED;
		r = a.compareDocumentPosition(t) & Node.DOCUMENT_POSITION_CONTAINED_BY, a = a.compareDocumentPosition(i) & Node.DOCUMENT_POSITION_CONTAINED_BY;
		var o = t.compareDocumentPosition(e), s = i.compareDocumentPosition(e), c = o & Node.DOCUMENT_POSITION_CONTAINED_BY || s & Node.DOCUMENT_POSITION_CONTAINED_BY;
		return s = r && a && o & Node.DOCUMENT_POSITION_FOLLOWING && s & Node.DOCUMENT_POSITION_PRECEDING, t = r && t === e || a && i === e || c || s ? Node.DOCUMENT_POSITION_CONTAINED_BY : !r && t === e || !a && i === e ? Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC : o, t & Node.DOCUMENT_POSITION_DISCONNECTED || t & Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC || Xp(t, this._fragmentFiber, n[0], n[n.length - 1], e) ? t : Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC;
	};
	function Xp(e, t, n, r, i) {
		var a = zt(i);
		if (e & Node.DOCUMENT_POSITION_CONTAINED_BY) {
			if (n = !!a) a: {
				for (; a !== null;) {
					if (a.tag === 7 && (a === t || a.alternate === t)) {
						n = !0;
						break a;
					}
					a = a.return;
				}
				n = !1;
			}
			return n;
		}
		if (e & Node.DOCUMENT_POSITION_CONTAINS) {
			if (a === null) return a = i.ownerDocument, i === a || i === a.documentElement || i === a.body;
			a: {
				for (a = t, t = g(t); a !== null;) {
					if (!(a.tag !== 5 && a.tag !== 3 && a.tag !== 27 || a !== t && a.alternate !== t)) {
						a = !0;
						break a;
					}
					a = a.return;
				}
				a = !1;
			}
			return a;
		}
		return e & Node.DOCUMENT_POSITION_PRECEDING ? ((t = !!a) && !(t = a === n) && (t = ie(n, a, x), t === null ? t = !1 : (h(t, !0, ne, a, n), a = ee, ee = null, t = a !== null)), t) : e & Node.DOCUMENT_POSITION_FOLLOWING ? ((t = !!a) && !(t = a === r) && (t = ie(r, a, x), t === null ? t = !1 : (h(t, !0, re, a, r), a = ee, te = ee = null, t = a !== null)), t) : !1;
	}
	function Zp(e, t) {
		var n = e.ownerDocument.createRange();
		n.selectNodeContents(e), e = n.getBoundingClientRect(), window.scrollTo(window.scrollX + e.left, t ? window.scrollY + e.top : window.scrollY + e.bottom - window.innerHeight);
	}
	Fp.prototype.scrollIntoView = function(e) {
		if (typeof e == "object") throw Error(i(566));
		var t = [];
		h(this._fragmentFiber.child, !1, Hp, t, void 0, void 0);
		var n = !1 !== e;
		if (t.length === 0) {
			var r = v(this._fragmentFiber);
			if (r = n ? r[1] || r[0] || g(this._fragmentFiber) : r[0] || r[1], r === null) return;
			if (r.tag === 6) {
				e = b(r), Zp(e, n);
				return;
			}
			if (r = b(r), r.nodeType !== 9) {
				if (r.nodeType === 11) {
					n = "host" in r ? r.host : null, n !== null && n.scrollIntoView(e);
					return;
				}
				r.scrollIntoView(e);
			}
		}
		for (r = n ? t.length - 1 : 0; r !== (n ? -1 : t.length);) {
			var a = t[r];
			a.tag === 6 ? (a = b(a), Zp(a, n)) : b(a).scrollIntoView(e), r += n ? -1 : 1;
		}
	};
	function Qp(e, t) {
		return e = b(e), $p(e, t), !1;
	}
	function $p(e, t) {
		e.reactFragments ??= /* @__PURE__ */ new Set(), e.reactFragments.add(t);
	}
	function em(e, t) {
		var n = t._eventListeners;
		if (n !== null) for (var r = 0; r < n.length; r++) {
			var i = n[r];
			e.addEventListener(i.type, i.attachedListener, Rp(i.optionsOrUseCapture));
		}
		e.nodeType !== 3 && (n = t._observers, n !== null && n.forEach(function(n) {
			for (var r = 0, i = 0; i < Kp.length; i++) {
				var a = Kp[i];
				(a.fragmentInstance !== t || a.observer !== n || a.instance !== e) && (Kp[r++] = a);
			}
			Kp.length = r, n.observe(e);
		}), $p(e, t));
	}
	function tm(e, t) {
		var n = t._eventListeners;
		if (n !== null) for (var r = 0; r < n.length; r++) {
			var i = n[r];
			e.removeEventListener(i.type, i.attachedListener, Rp(i.optionsOrUseCapture));
		}
		e.nodeType !== 3 && (n = t._observers, n !== null && n.forEach(function(n) {
			typeof n.rootMargin == "string" ? Jp(t, n, e) : n.unobserve(e);
		}), e.reactFragments != null && e.reactFragments.delete(t));
	}
	function nm(e) {
		var t = e.firstChild;
		for (t && t.nodeType === 10 && (t = t.nextSibling); t;) {
			var n = t;
			switch (t = t.nextSibling, n.nodeName) {
				case "HTML":
				case "HEAD":
				case "BODY":
					nm(n), Rt(n);
					continue;
				case "SCRIPT":
				case "STYLE": continue;
				case "LINK": if (n.rel.toLowerCase() === "stylesheet") continue;
			}
			e.removeChild(n);
		}
	}
	function rm(e, t, n, r) {
		for (; e.nodeType === 1;) {
			var i = n;
			if (e.nodeName.toLowerCase() !== t.toLowerCase()) {
				if (!r && (e.nodeName !== "INPUT" || e.type !== "hidden")) break;
			} else if (!r) {
				if (t === "input" && e.type === "hidden") {
					var a = i.name == null ? null : "" + i.name;
					if (i.type === "hidden" && e.getAttribute("name") === a) return e;
				} else return e;
			} else if (!e[It]) switch (t) {
				case "meta":
					if (!e.hasAttribute("itemprop")) break;
					return e;
				case "link":
					if (a = e.getAttribute("rel"), a === "stylesheet" && e.hasAttribute("data-precedence") || a !== i.rel || e.getAttribute("href") !== (i.href == null || i.href === "" ? null : i.href) || e.getAttribute("crossorigin") !== (i.crossOrigin == null ? null : i.crossOrigin) || e.getAttribute("title") !== (i.title == null ? null : i.title)) break;
					return e;
				case "style":
					if (e.hasAttribute("data-precedence")) break;
					return e;
				case "script":
					if (a = e.getAttribute("src"), (a !== (i.src == null ? null : i.src) || e.getAttribute("type") !== (i.type == null ? null : i.type) || e.getAttribute("crossorigin") !== (i.crossOrigin == null ? null : i.crossOrigin)) && a && e.hasAttribute("async") && !e.hasAttribute("itemprop")) break;
					return e;
				default: return e;
			}
			if (e = lm(e.nextSibling), e === null) break;
		}
		return null;
	}
	function im(e, t, n) {
		if (t === "") return null;
		for (; e.nodeType !== 3;) if ((e.nodeType !== 1 || e.nodeName !== "INPUT" || e.type !== "hidden") && !n || (e = lm(e.nextSibling), e === null)) return null;
		return e;
	}
	function am(e, t) {
		for (; e.nodeType !== 8;) if ((e.nodeType !== 1 || e.nodeName !== "INPUT" || e.type !== "hidden") && !t || (e = lm(e.nextSibling), e === null)) return null;
		return e;
	}
	function om(e) {
		return e.data === "$?" || e.data === "$~";
	}
	function sm(e) {
		return e.data === "$!" || e.data === "$?" && e.ownerDocument.readyState !== "loading";
	}
	function cm(e, t) {
		var n = e.ownerDocument;
		if (e.data === "$~") e._reactRetry = t;
		else if (e.data !== "$?" || n.readyState !== "loading") t();
		else {
			var r = function() {
				t(), n.removeEventListener("DOMContentLoaded", r);
			};
			n.addEventListener("DOMContentLoaded", r), e._reactRetry = r;
		}
	}
	function lm(e) {
		for (; e != null; e = e.nextSibling) {
			var t = e.nodeType;
			if (t === 1 || t === 3) break;
			if (t === 8) {
				if (t = e.data, t === "$" || t === "$!" || t === "$?" || t === "$~" || t === "&" || t === "F!" || t === "F") break;
				if (t === "/$" || t === "/&") return null;
			}
		}
		return e;
	}
	var um = null;
	function dm(e) {
		e = e.nextSibling;
		for (var t = 0; e;) {
			if (e.nodeType === 8) {
				var n = e.data;
				if (n === "/$" || n === "/&") {
					if (t === 0) return lm(e.nextSibling);
					t--;
				} else n !== "$" && n !== "$!" && n !== "$?" && n !== "$~" && n !== "&" || t++;
			}
			e = e.nextSibling;
		}
		return null;
	}
	function fm(e) {
		e = e.previousSibling;
		for (var t = 0; e;) {
			if (e.nodeType === 8) {
				var n = e.data;
				if (n === "$" || n === "$!" || n === "$?" || n === "$~" || n === "&") {
					if (t === 0) return e;
					t--;
				} else n !== "/$" && n !== "/&" || t++;
			}
			e = e.previousSibling;
		}
		return null;
	}
	function pm(e, t) {
		function n() {
			r = !0;
		}
		if (e.ownerDocument.activeElement === e) return !0;
		var r = !1;
		try {
			e.ownerDocument.addEventListener("focus", n, !0), (e.focus || HTMLElement.prototype.focus).call(e, t);
		} finally {
			e.ownerDocument.removeEventListener("focus", n, !0);
		}
		return r;
	}
	function mm(e) {
		yp(function() {
			yp(function(t) {
				return e(t);
			});
		});
	}
	function hm(e, t, n) {
		switch (t = lp(n), e) {
			case "html":
				if (e = t.documentElement, !e) throw Error(i(452));
				return e;
			case "head":
				if (e = t.head, !e) throw Error(i(453));
				return e;
			case "body":
				if (e = t.body, !e) throw Error(i(454));
				return e;
			default: throw Error(i(451));
		}
	}
	function gm(e, t, n) {
		for (var r in n) {
			var i = n[r];
			n.hasOwnProperty(r) && i != null && $(e, t, r, null, rp, i);
		}
		n.dangerouslySetInnerHTML != null && (e.textContent = ""), e.onclick === Tn && (e.onclick = null), Rt(e);
	}
	function _m(e) {
		for (var t = e.attributes; t.length;) e.removeAttributeNode(t[0]);
		Rt(e);
	}
	var vm = /* @__PURE__ */ new Map(), ym = /* @__PURE__ */ new Set();
	function bm(e) {
		if (typeof e.getRootNode == "function") {
			var t = e.getRootNode();
			if (t.nodeType === 9 || t.nodeType === 11) return t;
		}
		return e.nodeType === 9 ? e : e.ownerDocument;
	}
	var xm = E.d;
	E.d = {
		f: Sm,
		r: Cm,
		D: Em,
		C: Dm,
		L: Om,
		m: km,
		X: jm,
		S: Am,
		M: Mm
	};
	function Sm() {
		var e = xm.f(), t = zd();
		return e || t;
	}
	function Cm(e) {
		var t = Bt(e);
		t !== null && t.tag === 5 && t.type === "form" ? ac(t) : xm.r(e);
	}
	var wm = typeof document > "u" ? null : document;
	function Tm(e, t, n) {
		var r = wm;
		if (r && typeof t == "string" && t) {
			var i = un(t);
			i = "link[rel=\"" + e + "\"][href=\"" + i + "\"]", typeof n == "string" && (i += "[crossorigin=\"" + n + "\"]"), ym.has(i) || (ym.add(i), e = {
				rel: e,
				crossOrigin: n,
				href: t
			}, r.querySelector(i) === null && (t = r.createElement("link"), np(t, "link", e), Ut(t), r.head.appendChild(t)));
		}
	}
	function Em(e) {
		xm.D(e), Tm("dns-prefetch", e, null);
	}
	function Dm(e, t) {
		xm.C(e, t), Tm("preconnect", e, t);
	}
	function Om(e, t, n) {
		xm.L(e, t, n);
		var r = wm;
		if (r && e && t) {
			var i = "link[rel=\"preload\"][as=\"" + un(t) + "\"]";
			t === "image" && n && n.imageSrcSet ? (i += "[imagesrcset=\"" + un(n.imageSrcSet) + "\"]", typeof n.imageSizes == "string" && (i += "[imagesizes=\"" + un(n.imageSizes) + "\"]")) : i += "[href=\"" + un(e) + "\"]";
			var a = i;
			switch (t) {
				case "style":
					a = Pm(e);
					break;
				case "script": a = Rm(e);
			}
			if (!(vm.has(a) || (e = S({
				rel: "preload",
				href: t === "image" && n && n.imageSrcSet ? void 0 : e,
				as: t
			}, n), vm.set(a, e), r.querySelector(i) !== null || t === "style" && r.querySelector(Fm(a)) || t === "script" && r.querySelector(zm(a))))) {
				var o = r.createElement("link");
				np(o, "link", e), t === "style" && (o[Lt] = !0, o.onload = o.onerror = function() {
					Wt(o);
				}), Ut(o), r.head.appendChild(o);
			}
		}
	}
	function km(e, t) {
		xm.m(e, t);
		var n = wm;
		if (n && e) {
			var r = t && typeof t.as == "string" ? t.as : "script", i = "link[rel=\"modulepreload\"][as=\"" + un(r) + "\"][href=\"" + un(e) + "\"]", a = i;
			switch (r) {
				case "audioworklet":
				case "paintworklet":
				case "serviceworker":
				case "sharedworker":
				case "worker":
				case "script": a = Rm(e);
			}
			if (!vm.has(a) && (e = S({
				rel: "modulepreload",
				href: e
			}, t), vm.set(a, e), n.querySelector(i) === null)) {
				switch (r) {
					case "audioworklet":
					case "paintworklet":
					case "serviceworker":
					case "sharedworker":
					case "worker":
					case "script": if (n.querySelector(zm(a))) return;
				}
				r = n.createElement("link"), np(r, "link", e), Ut(r), n.head.appendChild(r);
			}
		}
	}
	function Am(e, t, n) {
		xm.S(e, t, n);
		var r = wm;
		if (r && e) {
			var i = Ht(r).hoistableStyles, a = Pm(e);
			t ||= "default";
			var o = i.get(a);
			if (!o) {
				var s = {
					loading: 0,
					preload: null
				};
				if (o = r.querySelector(Fm(a))) s.loading = 5;
				else {
					e = S({
						rel: "stylesheet",
						href: e,
						"data-precedence": t
					}, n), (n = vm.get(a)) && Hm(e, n);
					var c = o = r.createElement("link");
					Ut(c), np(c, "link", e), c._p = new Promise(function(e, t) {
						c.onload = e, c.onerror = t;
					}), c.addEventListener("load", function() {
						s.loading |= 1;
					}), c.addEventListener("error", function() {
						s.loading |= 2;
					}), s.loading |= 4, Vm(o, t, r);
				}
				o = {
					type: "stylesheet",
					instance: o,
					count: 1,
					state: s
				}, i.set(a, o);
			}
		}
	}
	function jm(e, t) {
		xm.X(e, t);
		var n = wm;
		if (n && e) {
			var r = Ht(n).hoistableScripts, i = Rm(e), a = r.get(i);
			a || (a = n.querySelector(zm(i)), a || (e = S({
				src: e,
				async: !0
			}, t), (t = vm.get(i)) && Um(e, t), a = n.createElement("script"), Ut(a), np(a, "link", e), n.head.appendChild(a)), a = {
				type: "script",
				instance: a,
				count: 1,
				state: null
			}, r.set(i, a));
		}
	}
	function Mm(e, t) {
		xm.M(e, t);
		var n = wm;
		if (n && e) {
			var r = Ht(n).hoistableScripts, i = Rm(e), a = r.get(i);
			a || (a = n.querySelector(zm(i)), a || (e = S({
				src: e,
				async: !0,
				type: "module"
			}, t), (t = vm.get(i)) && Um(e, t), a = n.createElement("script"), Ut(a), np(a, "link", e), n.head.appendChild(a)), a = {
				type: "script",
				instance: a,
				count: 1,
				state: null
			}, r.set(i, a));
		}
	}
	function Nm(e, t, n, r) {
		var a = (a = Ne.current) ? bm(a) : null;
		if (!a) throw Error(i(446));
		switch (e) {
			case "meta":
			case "title": return null;
			case "style": return typeof n.precedence == "string" && typeof n.href == "string" ? (n = Pm(n.href), t = Ht(a).hoistableStyles, r = t.get(n), r || (r = {
				type: "style",
				instance: null,
				count: 0,
				state: null
			}, t.set(n, r)), r) : {
				type: "void",
				instance: null,
				count: 0,
				state: null
			};
			case "link":
				if (n.rel === "stylesheet" && typeof n.href == "string" && typeof n.precedence == "string") {
					e = Pm(n.href);
					var o = Ht(a).hoistableStyles, s = o.get(e);
					if (s || (a = a.ownerDocument || a, s = {
						type: "stylesheet",
						instance: null,
						count: 0,
						state: {
							loading: 0,
							preload: null
						}
					}, o.set(e, s), (o = a.querySelector(Fm(e))) ? o._p || (s.instance = o, s.state.loading = 5) : (o = vm.get(e), o || (o = {
						rel: "preload",
						as: "style",
						href: n.href,
						crossOrigin: n.crossOrigin,
						integrity: n.integrity,
						media: n.media,
						hrefLang: n.hrefLang,
						referrerPolicy: n.referrerPolicy
					}, vm.set(e, o)), Lm(a, e, o, s.state))), t && r === null) throw Error(i(528, ""));
					return s;
				}
				if (t && r !== null) throw Error(i(529, ""));
				return null;
			case "script": return t = n.async, n = n.src, typeof n == "string" && t && typeof t != "function" && typeof t != "symbol" ? (n = Rm(n), t = Ht(a).hoistableScripts, r = t.get(n), r || (r = {
				type: "script",
				instance: null,
				count: 0,
				state: null
			}, t.set(n, r)), r) : {
				type: "void",
				instance: null,
				count: 0,
				state: null
			};
			default: throw Error(i(444, e));
		}
	}
	function Pm(e) {
		return "href=\"" + un(e) + "\"";
	}
	function Fm(e) {
		return "link[rel=\"stylesheet\"][" + e + "]";
	}
	function Im(e) {
		return S({}, e, {
			"data-precedence": e.precedence,
			precedence: null
		});
	}
	function Lm(e, t, n, r) {
		if (t = e.querySelector("link[rel=\"preload\"][as=\"style\"][" + t + "]")) {
			if (!0 !== t[Lt]) {
				r.loading = 1;
				return;
			}
		} else t = e.createElement("link"), t[Lt] = !0, t.onload = t.onerror = Wt.bind(null, t), np(t, "link", n), Ut(t), e.head.appendChild(t);
		r.preload = t, t.addEventListener("load", function() {
			return r.loading |= 1;
		}), t.addEventListener("error", function() {
			return r.loading |= 2;
		});
	}
	function Rm(e) {
		return "[src=\"" + un(e) + "\"]";
	}
	function zm(e) {
		return "script[async]" + e;
	}
	function Bm(e, t, n) {
		if (t.count++, t.instance === null) switch (t.type) {
			case "style":
				var r = e.querySelector("style[data-href~=\"" + un(n.href) + "\"]");
				if (r) return t.instance = r, Ut(r), r;
				var a = S({}, n, {
					"data-href": n.href,
					"data-precedence": n.precedence,
					href: null,
					precedence: null
				});
				return r = (e.ownerDocument || e).createElement("style"), Ut(r), np(r, "style", a), Vm(r, n.precedence, e), t.instance = r;
			case "stylesheet":
				a = Pm(n.href);
				var o = e.querySelector(Fm(a));
				if (o) return t.state.loading |= 4, t.instance = o, Ut(o), o;
				r = Im(n), (a = vm.get(a)) && Hm(r, a), o = (e.ownerDocument || e).createElement("link"), Ut(o);
				var s = o;
				return s._p = new Promise(function(e, t) {
					s.onload = e, s.onerror = t;
				}), np(o, "link", r), t.state.loading |= 4, Vm(o, n.precedence, e), t.instance = o;
			case "script": return o = Rm(n.src), (a = e.querySelector(zm(o))) ? (t.instance = a, Ut(a), a) : (r = n, (a = vm.get(o)) && (r = S({}, n), Um(r, a)), e = e.ownerDocument || e, a = e.createElement("script"), Ut(a), np(a, "link", r), e.head.appendChild(a), t.instance = a);
			case "void": return null;
			default: throw Error(i(443, t.type));
		}
		else t.type === "stylesheet" && !(t.state.loading & 4) && (r = t.instance, t.state.loading |= 4, Vm(r, n.precedence, e));
		return t.instance;
	}
	function Vm(e, t, n) {
		for (var r = n.querySelectorAll("link[rel=\"stylesheet\"][data-precedence],style[data-precedence]"), i = r.length ? r[r.length - 1] : null, a = i, o = 0; o < r.length; o++) {
			var s = r[o];
			if (s.dataset.precedence === t) a = s;
			else if (a !== i) break;
		}
		a ? a.parentNode.insertBefore(e, a.nextSibling) : (t = n.nodeType === 9 ? n.head : n, t.insertBefore(e, t.firstChild));
	}
	function Hm(e, t) {
		e.crossOrigin ??= t.crossOrigin, e.referrerPolicy ??= t.referrerPolicy, e.title ??= t.title;
	}
	function Um(e, t) {
		e.crossOrigin ??= t.crossOrigin, e.referrerPolicy ??= t.referrerPolicy, e.integrity ??= t.integrity;
	}
	var Wm = null;
	function Gm(e, t, n) {
		if (Wm === null) {
			var r = /* @__PURE__ */ new Map(), i = Wm = /* @__PURE__ */ new Map();
			i.set(n, r);
		} else i = Wm, r = i.get(n), r || (r = /* @__PURE__ */ new Map(), i.set(n, r));
		if (r.has(e)) return r;
		for (r.set(e, null), n = n.getElementsByTagName(e), i = 0; i < n.length; i++) {
			var a = n[i];
			if (!(a[It] || a[j] || e === "link" && a.getAttribute("rel") === "stylesheet") && a.namespaceURI !== "http://www.w3.org/2000/svg") {
				var o = a.getAttribute(t) || "";
				o = e + o;
				var s = r.get(o);
				s ? s.push(a) : r.set(o, [a]);
			}
		}
		return r;
	}
	function Km(e, t, n) {
		e = e.ownerDocument || e, e.head.insertBefore(n, t === "title" ? e.querySelector("head > title") : null);
	}
	function qm(e, t, n) {
		if (n === 1 || t.itemProp != null) return !1;
		switch (e) {
			case "meta":
			case "title": return !0;
			case "style":
				if (typeof t.precedence != "string" || typeof t.href != "string" || t.href === "") break;
				return !0;
			case "link":
				if (typeof t.rel != "string" || typeof t.href != "string" || t.href === "" || t.onLoad || t.onError) break;
				switch (t.rel) {
					case "stylesheet": return e = t.disabled, typeof t.precedence == "string" && e == null;
					default: return !0;
				}
			case "script": if (t.async && typeof t.async != "function" && typeof t.async != "symbol" && !t.onLoad && !t.onError && t.src && typeof t.src == "string") return !0;
		}
		return !1;
	}
	function Jm(e, t) {
		return e === "img" && t.src != null && t.src !== "" && t.onLoad == null && t.loading !== "lazy";
	}
	function Ym(e) {
		return !(e.type === "stylesheet" && !(e.state.loading & 3));
	}
	function Xm(e) {
		return (e.width || 100) * (e.height || 100) * (typeof devicePixelRatio == "number" ? devicePixelRatio : 1) * .25;
	}
	function Zm(e, t) {
		typeof t.decode == "function" && (e.imgCount++, t.complete || (e.imgBytes += Xm(t), e.suspenseyImages.push(t)), e = rh.bind(e), t.decode().then(e, e));
	}
	function Qm(e, t, n, r) {
		if (n.type === "stylesheet" && (typeof r.media != "string" || !1 !== matchMedia(r.media).matches) && !(n.state.loading & 4)) {
			if (n.instance === null) {
				var i = Pm(r.href), a = t.querySelector(Fm(i));
				if (a) {
					t = a._p, typeof t == "object" && t && typeof t.then == "function" && (e.count++, e = nh.bind(e), t.then(e, e)), n.state.loading |= 4, n.instance = a, Ut(a);
					return;
				}
				a = t.ownerDocument || t, r = Im(r), (i = vm.get(i)) && Hm(r, i), a = a.createElement("link"), Ut(a);
				var o = a;
				o._p = new Promise(function(e, t) {
					o.onload = e, o.onerror = t;
				}), np(a, "link", r), n.instance = a;
			}
			e.stylesheets === null && (e.stylesheets = /* @__PURE__ */ new Map()), e.stylesheets.set(n, t), (t = n.state.preload) && !(n.state.loading & 3) && (e.count++, n = nh.bind(e), t.addEventListener("load", n), t.addEventListener("error", n));
		}
	}
	var $m = 0;
	function eh(e, t) {
		return e.stylesheets && e.count === 0 && ah(e, e.stylesheets), 0 < e.count || 0 < e.imgCount ? function(n) {
			var r = setTimeout(function() {
				if (e.stylesheets && ah(e, e.stylesheets), e.unsuspend) {
					var t = e.unsuspend;
					e.unsuspend = null, t();
				}
			}, 6e4 + t);
			0 < e.imgBytes && $m === 0 && ($m = 62500 * op());
			var i = setTimeout(function() {
				if (e.waitingForImages = !1, e.count === 0 && (e.stylesheets && ah(e, e.stylesheets), e.unsuspend)) {
					var t = e.unsuspend;
					e.unsuspend = null, t();
				}
			}, (e.imgBytes > $m ? 50 : 800) + t);
			return e.unsuspend = n, function() {
				e.unsuspend = null, clearTimeout(r), clearTimeout(i);
			};
		} : null;
	}
	function th(e) {
		if (e.count === 0 && (e.imgCount === 0 || !e.waitingForImages)) {
			if (e.stylesheets) ah(e, e.stylesheets);
			else if (e.unsuspend) {
				var t = e.unsuspend;
				e.unsuspend = null, t();
			}
		}
	}
	function nh() {
		this.count--, th(this);
	}
	function rh() {
		this.imgCount--, th(this);
	}
	var ih = null;
	function ah(e, t) {
		e.stylesheets = null, e.unsuspend !== null && (e.count++, ih = /* @__PURE__ */ new Map(), t.forEach(oh, e), ih = null, nh.call(e));
	}
	function oh(e, t) {
		if (!(t.state.loading & 4)) {
			var n = ih.get(e);
			if (n) var r = n.get(null);
			else {
				n = /* @__PURE__ */ new Map(), ih.set(e, n);
				for (var i = e.querySelectorAll("link[data-precedence],style[data-precedence]"), a = 0; a < i.length; a++) {
					var o = i[a];
					(o.nodeName === "LINK" || o.getAttribute("media") !== "not all") && (n.set(o.dataset.precedence, o), r = o);
				}
				r && n.set(null, r);
			}
			i = t.instance, o = i.getAttribute("data-precedence"), a = n.get(o) || r, a === r && n.set(null, i), n.set(o, i), this.count++, r = nh.bind(this), i.addEventListener("load", r), i.addEventListener("error", r), a ? a.parentNode.insertBefore(i, a.nextSibling) : (e = e.nodeType === 9 ? e.head : e, e.insertBefore(i, e.firstChild)), t.state.loading |= 4;
		}
	}
	var sh = {
		$$typeof: ue,
		Provider: null,
		Consumer: null,
		_currentValue: Ee,
		_currentValue2: Ee,
		_threadCount: 0
	};
	function ch(e, t, n, r, i, a, o, s, c) {
		this.tag = 1, this.containerInfo = e, this.pingCache = this.current = this.pendingChildren = null, this.timeoutHandle = -1, this.callbackNode = this.next = this.pendingContext = this.context = this.cancelPendingCommit = null, this.callbackPriority = 0, this.expirationTimes = bt(-1), this.entangledLanes = this.shellSuspendCounter = this.errorRecoveryDisabledLanes = this.expiredLanes = this.warmLanes = this.pingedLanes = this.suspendedLanes = this.pendingLanes = 0, this.entanglements = bt(0), this.hiddenUpdates = bt(null), this.identifierPrefix = r, this.onUncaughtError = i, this.onCaughtError = a, this.onRecoverableError = o, this.pooledCache = null, this.pooledCacheLanes = 0, this.formState = c, this.transitionTypes = null, this.incompleteTransitions = /* @__PURE__ */ new Map();
	}
	function lh(e, t, n, r, i, a, o, s, c, l, u, d) {
		return e = new ch(e, t, n, o, c, l, u, d, s), t = 1, !0 === a && (t |= 24), a = zi(3, null, null, t), e.current = a, a.stateNode = e, t = La(), t.refCount++, e.pooledCache = t, t.refCount++, a.memoizedState = {
			element: r,
			isDehydrated: n,
			cache: t
		}, bo(a), e;
	}
	function uh(e) {
		return e ? (e = Li, e) : Li;
	}
	function dh(e, t, n, r, i, a) {
		i = uh(i), r.context === null ? r.context = i : r.pendingContext = i, r = So(t), r.payload = { element: n }, a = a === void 0 ? null : a, a !== null && (r.callback = a), n = Co(e, r, t), n !== null && (Pd(n, e, t), wo(n, e, t));
	}
	function fh(e, t) {
		if (e = e.memoizedState, e !== null && e.dehydrated !== null) {
			var n = e.retryLane;
			e.retryLane = n !== 0 && n < t ? n : t;
		}
	}
	function ph(e, t) {
		fh(e, t), (e = e.alternate) && fh(e, t);
	}
	function mh(e) {
		if (e.tag === 13 || e.tag === 31) {
			var t = Pi(e, 67108864);
			t !== null && Pd(t, e, 67108864), ph(e, 67108864);
		}
	}
	function hh(e) {
		if (e.tag === 13 || e.tag === 31) {
			var t = jd();
			t = Et(t);
			var n = Pi(e, t);
			n !== null && Pd(n, e, t), ph(e, t);
		}
	}
	var gh = !0;
	function _h(e, t, n, r) {
		var i = T.T;
		T.T = null;
		var a = E.p;
		try {
			E.p = 2, yh(e, t, n, r);
		} finally {
			E.p = a, T.T = i;
		}
	}
	function vh(e, t, n, r) {
		var i = T.T;
		T.T = null;
		var a = E.p;
		try {
			E.p = 8, yh(e, t, n, r);
		} finally {
			E.p = a, T.T = i;
		}
	}
	function yh(e, t, n, r) {
		if (gh) {
			var i = bh(r);
			if (i === null) Kf(e, t, r, xh, n), Mh(e, r);
			else if (Ph(i, e, t, n, r)) r.stopPropagation();
			else if (Mh(e, r), t & 4 && -1 < jh.indexOf(e)) {
				for (; i !== null;) {
					var a = Bt(i);
					if (a !== null) switch (a.tag) {
						case 3:
							if (a = a.stateNode, a.current.memoizedState.isDehydrated) {
								var o = gt(a.pendingLanes);
								if (o !== 0) {
									var s = a;
									for (s.pendingLanes |= 2, s.entangledLanes |= 2; o;) {
										var c = 1 << 31 - lt(o);
										s.entanglements[1] |= c, o &= ~c;
									}
									Ef(a), !(W & 6) && (_d = Ze() + 500, Df(0, !1));
								}
							}
							break;
						case 31:
						case 13: s = Pi(a, 2), s !== null && Pd(s, a, 2), zd(), ph(a, 2);
					}
					if (a = bh(r), a === null && Kf(e, t, r, xh, n), a === i) break;
					i = a;
				}
				i !== null && r.stopPropagation();
			} else Kf(e, t, r, null, n);
		}
	}
	function bh(e) {
		return e = Dn(e), Sh(e);
	}
	var xh = null;
	function Sh(e) {
		if (xh = null, e = zt(e), e !== null) {
			var t = o(e);
			if (t === null) e = null;
			else {
				var n = t.tag;
				if (n === 13) {
					if (e = s(t), e !== null) return e;
					e = null;
				} else if (n === 31) {
					if (e = c(t), e !== null) return e;
					e = null;
				} else if (n === 3) {
					if (t.stateNode.current.memoizedState.isDehydrated) return t.tag === 3 ? t.stateNode.containerInfo : null;
					e = null;
				} else t !== e && (e = null);
			}
		}
		return xh = e, null;
	}
	function Ch(e) {
		switch (e) {
			case "beforetoggle":
			case "cancel":
			case "click":
			case "close":
			case "contextmenu":
			case "copy":
			case "cut":
			case "auxclick":
			case "dblclick":
			case "dragend":
			case "dragstart":
			case "drop":
			case "focusin":
			case "focusout":
			case "input":
			case "invalid":
			case "keydown":
			case "keypress":
			case "keyup":
			case "mousedown":
			case "mouseup":
			case "paste":
			case "pause":
			case "play":
			case "pointercancel":
			case "pointerdown":
			case "pointerup":
			case "ratechange":
			case "reset":
			case "seeked":
			case "submit":
			case "toggle":
			case "touchcancel":
			case "touchend":
			case "touchstart":
			case "volumechange":
			case "change":
			case "selectionchange":
			case "textInput":
			case "compositionstart":
			case "compositionend":
			case "compositionupdate":
			case "beforeblur":
			case "afterblur":
			case "beforeinput":
			case "blur":
			case "fullscreenchange":
			case "fullscreenerror":
			case "focus":
			case "hashchange":
			case "popstate":
			case "select":
			case "selectstart": return 2;
			case "drag":
			case "dragenter":
			case "dragexit":
			case "dragleave":
			case "dragover":
			case "mousemove":
			case "mouseout":
			case "mouseover":
			case "pointermove":
			case "pointerout":
			case "pointerover":
			case "resize":
			case "scroll":
			case "touchmove":
			case "wheel":
			case "mouseenter":
			case "mouseleave":
			case "pointerenter":
			case "pointerleave": return 8;
			case "message": switch (Qe()) {
				case $e: return 2;
				case et: return 8;
				case tt:
				case nt: return 32;
				case rt: return 268435456;
				default: return 32;
			}
			default: return 32;
		}
	}
	var wh = !1, Th = null, Eh = null, Dh = null, Oh = /* @__PURE__ */ new Map(), kh = /* @__PURE__ */ new Map(), Ah = [], jh = "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset".split(" ");
	function Mh(e, t) {
		switch (e) {
			case "focusin":
			case "focusout":
				Th = null;
				break;
			case "dragenter":
			case "dragleave":
				Eh = null;
				break;
			case "mouseover":
			case "mouseout":
				Dh = null;
				break;
			case "pointerover":
			case "pointerout":
				Oh.delete(t.pointerId);
				break;
			case "gotpointercapture":
			case "lostpointercapture": kh.delete(t.pointerId);
		}
	}
	function Nh(e, t, n, r, i, a) {
		return e === null || e.nativeEvent !== a ? (e = {
			blockedOn: t,
			domEventName: n,
			eventSystemFlags: r,
			nativeEvent: a,
			targetContainers: [i]
		}, t !== null && (t = Bt(t), t !== null && mh(t)), e) : (e.eventSystemFlags |= r, t = e.targetContainers, i !== null && t.indexOf(i) === -1 && t.push(i), e);
	}
	function Ph(e, t, n, r, i) {
		switch (t) {
			case "focusin": return Th = Nh(Th, e, t, n, r, i), !0;
			case "dragenter": return Eh = Nh(Eh, e, t, n, r, i), !0;
			case "mouseover": return Dh = Nh(Dh, e, t, n, r, i), !0;
			case "pointerover":
				var a = i.pointerId;
				return Oh.set(a, Nh(Oh.get(a) || null, e, t, n, r, i)), !0;
			case "gotpointercapture": return a = i.pointerId, kh.set(a, Nh(kh.get(a) || null, e, t, n, r, i)), !0;
		}
		return !1;
	}
	function Fh(e) {
		var t = zt(e.target);
		if (t !== null) {
			var n = o(t);
			if (n !== null) {
				if (t = n.tag, t === 13) {
					if (t = s(n), t !== null) {
						e.blockedOn = t, A(e.priority, function() {
							hh(n);
						});
						return;
					}
				} else if (t === 31) {
					if (t = c(n), t !== null) {
						e.blockedOn = t, A(e.priority, function() {
							hh(n);
						});
						return;
					}
				} else if (t === 3 && n.stateNode.current.memoizedState.isDehydrated) {
					e.blockedOn = n.tag === 3 ? n.stateNode.containerInfo : null;
					return;
				}
			}
		}
		e.blockedOn = null;
	}
	function Ih(e) {
		if (e.blockedOn !== null) return !1;
		for (var t = e.targetContainers; 0 < t.length;) {
			var n = bh(e.nativeEvent);
			if (n === null) {
				n = e.nativeEvent;
				var r = new n.constructor(n.type, n);
				En = r, n.target.dispatchEvent(r), En = null;
			} else return t = Bt(n), t !== null && mh(t), e.blockedOn = n, !1;
			t.shift();
		}
		return !0;
	}
	function Lh(e, t, n) {
		Ih(e) && n.delete(t);
	}
	function Rh() {
		wh = !1, Th !== null && Ih(Th) && (Th = null), Eh !== null && Ih(Eh) && (Eh = null), Dh !== null && Ih(Dh) && (Dh = null), Oh.forEach(Lh), kh.forEach(Lh);
	}
	function zh(e, n) {
		e.blockedOn === n && (e.blockedOn = null, wh || (wh = !0, t.unstable_scheduleCallback(t.unstable_NormalPriority, Rh)));
	}
	var Bh = null;
	function Vh(e) {
		Bh !== e && (Bh = e, t.unstable_scheduleCallback(t.unstable_NormalPriority, function() {
			Bh === e && (Bh = null);
			for (var t = 0; t < e.length; t += 3) {
				var n = e[t], r = e[t + 1], i = e[t + 2];
				if (typeof r != "function") {
					if (Sh(r || n) === null) continue;
					break;
				}
				var a = Bt(n);
				a !== null && (e.splice(t, 3), t -= 3, rc(a, {
					pending: !0,
					data: i,
					method: n.method,
					action: r
				}, r, i));
			}
		}));
	}
	function Hh(e) {
		function t(t) {
			return zh(t, e);
		}
		Th !== null && zh(Th, e), Eh !== null && zh(Eh, e), Dh !== null && zh(Dh, e), Oh.forEach(t), kh.forEach(t);
		for (var n = 0; n < Ah.length; n++) {
			var r = Ah[n];
			r.blockedOn === e && (r.blockedOn = null);
		}
		for (; 0 < Ah.length && (n = Ah[0], n.blockedOn === null);) Fh(n), n.blockedOn === null && Ah.shift();
		if (n = (e.ownerDocument || e).$$reactFormReplay, n != null) for (r = 0; r < n.length; r += 3) {
			var i = n[r], a = n[r + 1], o = i[At] || null;
			if (typeof a == "function") o || Vh(n);
			else if (o) {
				var s = null;
				if (a && a.hasAttribute("formAction")) {
					if (i = a, o = a[At] || null) s = o.formAction;
					else if (Sh(i) !== null) continue;
				} else s = o.action;
				typeof s == "function" ? n[r + 1] = s : (n.splice(r, 3), r -= 3), Vh(n);
			}
		}
	}
	function Uh() {
		function e(e) {
			e.canIntercept && e.info === "react-transition" && e.intercept({
				handler: function() {
					return new Promise(function(e) {
						return i = e;
					});
				},
				focusReset: "manual",
				scroll: "manual"
			});
		}
		function t() {
			i !== null && (i(), i = null), r || setTimeout(n, 20);
		}
		function n() {
			if (!r && !navigation.transition) {
				var e = navigation.currentEntry;
				e && e.url != null && navigation.navigate(e.url, {
					state: e.getState(),
					info: "react-transition",
					history: "replace"
				});
			}
		}
		if (typeof navigation == "object") {
			var r = !1, i = null;
			return navigation.addEventListener("navigate", e), navigation.addEventListener("navigatesuccess", t), navigation.addEventListener("navigateerror", t), setTimeout(n, 100), function() {
				r = !0, navigation.removeEventListener("navigate", e), navigation.removeEventListener("navigatesuccess", t), navigation.removeEventListener("navigateerror", t), i !== null && (i(), i = null);
			};
		}
	}
	function Wh(e) {
		this._internalRoot = e;
	}
	Gh.prototype.render = Wh.prototype.render = function(e) {
		var t = this._internalRoot;
		if (t === null) throw Error(i(409));
		var n = t.current;
		dh(n, jd(), e, t, null, null);
	}, Gh.prototype.unmount = Wh.prototype.unmount = function() {
		var e = this._internalRoot;
		if (e !== null) {
			this._internalRoot = null;
			var t = e.containerInfo;
			dh(e.current, 2, null, e, null, null), zd(), t[jt] = null;
		}
	};
	function Gh(e) {
		this._internalRoot = e;
	}
	Gh.prototype.unstable_scheduleHydration = function(e) {
		if (e) {
			var t = Ot();
			e = {
				blockedOn: null,
				target: e,
				priority: t
			};
			for (var n = 0; n < Ah.length && t !== 0 && t < Ah[n].priority; n++);
			Ah.splice(n, 0, e), n === 0 && Fh(e);
		}
	};
	var Kh = n.version;
	if (Kh !== "19.3.0") throw Error(i(527, Kh, "19.3.0"));
	E.findDOMNode = function(e) {
		var t = e._reactInternals;
		if (t === void 0) throw typeof e.render == "function" ? Error(i(188)) : (e = Object.keys(e).join(","), Error(i(268, e)));
		return e = d(t), e = e === null ? null : p(e), e = e === null ? null : e.stateNode, e;
	};
	var qh = {
		bundleType: 0,
		version: "19.3.0",
		rendererPackageName: "react-dom",
		currentDispatcherRef: T,
		reconcilerVersion: "19.3.0"
	};
	if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u") {
		var Jh = __REACT_DEVTOOLS_GLOBAL_HOOK__;
		if (!Jh.isDisabled && Jh.supportsFiber) try {
			ot = Jh.inject(qh), st = Jh;
		} catch {}
	}
	e.createRoot = function(e, t) {
		if (!a(e)) throw Error(i(299));
		var n = !1, r = "", o = Ec, s = Dc, c = Oc;
		return t != null && (!0 === t.unstable_strictMode && (n = !0), t.identifierPrefix !== void 0 && (r = t.identifierPrefix), t.onUncaughtError !== void 0 && (o = t.onUncaughtError), t.onCaughtError !== void 0 && (s = t.onCaughtError), t.onRecoverableError !== void 0 && (c = t.onRecoverableError)), t = lh(e, 1, !1, null, null, n, r, null, o, s, c, Uh), e[jt] = t.current, Wf(e), new Wh(t);
	};
})), g = /* @__PURE__ */ o(((e, t) => {
	function n() {
		if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE == "function") try {
			__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(n);
		} catch (e) {
			console.error(e);
		}
	}
	n(), t.exports = h();
})), _ = /* @__PURE__ */ o(((e) => {
	var t = Symbol.for("react.transitional.element"), n = Symbol.for("react.fragment");
	function r(e, n, r) {
		var i = null;
		if (r !== void 0 && (i = "" + r), n.key !== void 0 && (i = "" + n.key), "key" in n) for (var a in r = {}, n) a !== "key" && (r[a] = n[a]);
		else r = n;
		return n = r.ref, {
			$$typeof: t,
			type: e,
			key: i,
			ref: n === void 0 ? null : n,
			props: r
		};
	}
	e.Fragment = n, e.jsx = r, e.jsxs = r;
})), v = /* @__PURE__ */ o(((e, t) => {
	t.exports = _();
})), y = /* @__PURE__ */ c(u(), 1), b = v(), ee = y.createContext(void 0), te = (e) => {
	let t = y.useContext(ee);
	if (e) return e;
	if (!t) throw Error("No QueryClient set, use QueryClientProvider to set one");
	return t;
}, ne = ({ client: e, children: t }) => (y.useEffect(() => (e.mount(), () => {
	e.unmount();
}), [e]), /* @__PURE__ */ (0, b.jsx)(ee.Provider, {
	value: e,
	children: t
})), re = {
	setTimeout: (e, t) => setTimeout(e, t),
	clearTimeout: (e) => clearTimeout(e),
	setInterval: (e, t) => setInterval(e, t),
	clearInterval: (e) => clearInterval(e)
}, x = new class {
	#e = re;
	setTimeoutProvider(e) {
		this.#e = e;
	}
	setTimeout(e, t) {
		return this.#e.setTimeout(e, t);
	}
	clearTimeout(e) {
		this.#e.clearTimeout(e);
	}
	setInterval(e, t) {
		return this.#e.setInterval(e, t);
	}
	clearInterval(e) {
		this.#e.clearInterval(e);
	}
}();
function ie(e) {
	setTimeout(e, 0);
}
//#endregion
//#region node_modules/.pnpm/@tanstack+query-core@5.104.1/node_modules/@tanstack/query-core/build/modern/utils.js
var S = typeof window > "u" || "Deno" in globalThis;
function C() {}
function ae(e, t) {
	return typeof e == "function" ? e(t) : e;
}
function oe(e) {
	return typeof e == "number" && e >= 0 && e !== Infinity;
}
function se(e, t) {
	return Math.max(e + (t || 0) - Date.now(), 0);
}
function w(e, t) {
	return typeof e == "function" ? e(t) : e;
}
function ce(e, t) {
	let { type: n = "all", exact: r, fetchStatus: i, predicate: a, queryKey: o, stale: s } = e;
	if (o) {
		if (r) {
			if (t.queryHash !== ue(o, t.options)) return !1;
		} else if (!fe(t.queryKey, o)) return !1;
	}
	if (n !== "all") {
		let e = t.isActive();
		if (n === "active" && !e || n === "inactive" && e) return !1;
	}
	return !(typeof s == "boolean" && t.isStale() !== s || i && i !== t.state.fetchStatus || a && !a(t));
}
function le(e, t) {
	let { exact: n, status: r, predicate: i, mutationKey: a } = e;
	if (a) {
		if (!t.options.mutationKey) return !1;
		if (n) {
			if (de(t.options.mutationKey) !== de(a)) return !1;
		} else if (!fe(t.options.mutationKey, a)) return !1;
	}
	return !(r && t.state.status !== r || i && !i(t));
}
function ue(e, t) {
	return (t?.queryKeyHashFn || de)(e);
}
function de(e) {
	return JSON.stringify(e, (e, t) => _e(t) ? Object.keys(t).sort().reduce((e, n) => (e[n] = t[n], e), {}) : t);
}
function fe(e, t) {
	if (e === t) return !0;
	if (typeof e != typeof t) return !1;
	if (e && t && typeof e == "object" && typeof t == "object") {
		if (Array.isArray(e) && Array.isArray(t)) {
			if (t.length > e.length) return !1;
			for (let n = 0; n < t.length; n++) if (!fe(e[n], t[n])) return !1;
			return !0;
		}
		let n = Object.keys(t);
		for (let r of n) if (!fe(e[r], t[r])) return !1;
		return !0;
	}
	return !1;
}
var pe = Object.prototype.hasOwnProperty;
function me(e, t, n = 0) {
	if (e === t) return e;
	if (n > 500) return t;
	let r = ge(e) && ge(t);
	if (!r && !(_e(e) && _e(t))) return t;
	let i = (r ? e : Object.keys(e)).length, a = r ? t : Object.keys(t), o = a.length, s = r ? Array(o) : {}, c = 0;
	for (let l = 0; l < o; l++) {
		let o = r ? l : a[l], u = e[o], d = t[o];
		if (u === d) {
			s[o] = u, (r ? l < i : pe.call(e, o)) && c++;
			continue;
		}
		if (u === null || d === null || typeof u != "object" || typeof d != "object") {
			s[o] = d;
			continue;
		}
		let f = me(u, d, n + 1);
		s[o] = f, f === u && c++;
	}
	return i === o && c === i ? e : s;
}
function he(e, t) {
	if (!t || Object.keys(e).length !== Object.keys(t).length) return !1;
	for (let n in e) if (e[n] !== t[n]) return !1;
	return !0;
}
function ge(e) {
	return Array.isArray(e) && e.length === Object.keys(e).length;
}
function _e(e) {
	if (!ve(e)) return !1;
	let t = Object.getPrototypeOf(e), n = t?.constructor;
	if (n === void 0) return !0;
	if (typeof n != "function") return !1;
	let r = n.prototype;
	return !(!ve(r) || !r.hasOwnProperty("isPrototypeOf") || t !== Object.prototype);
}
function ve(e) {
	return Object.prototype.toString.call(e) === "[object Object]";
}
function ye(e) {
	return new Promise((t) => {
		x.setTimeout(t, e);
	});
}
function be(e, t, n) {
	return typeof n.structuralSharing == "function" ? n.structuralSharing(e, t) : n.structuralSharing === !1 ? t : me(e, t);
}
function xe(e, t, n = 0) {
	let r = [...e, t];
	return n && r.length > n ? r.slice(1) : r;
}
function Se(e, t, n = 0) {
	let r = [t, ...e];
	return n && r.length > n ? r.slice(0, -1) : r;
}
var Ce = Symbol();
function we(e, t) {
	return !e.queryFn && t?.initialPromise ? () => t.initialPromise : !e.queryFn || e.queryFn === Ce ? () => Promise.reject(/* @__PURE__ */ Error(`Missing queryFn: '${e.queryHash}'`)) : e.queryFn;
}
function Te(e, t) {
	return typeof e == "function" ? e(...t) : !!e;
}
function T(e, t, n) {
	let r = !1, i;
	return Object.defineProperty(e, "signal", {
		enumerable: !0,
		get: () => (i ??= t(), r ? i : (r = !0, i.aborted ? n() : i.addEventListener("abort", n, { once: !0 }), i))
	}), e;
}
//#endregion
//#region node_modules/.pnpm/@tanstack+query-core@5.104.1/node_modules/@tanstack/query-core/build/modern/environmentManager.js
var E = () => S, Ee = () => E(), De = class {
	constructor() {
		this.listeners = /* @__PURE__ */ new Set(), this.subscribe = this.subscribe.bind(this);
	}
	subscribe(e) {
		return this.listeners.add(e), this.onSubscribe(), () => {
			this.listeners.delete(e), this.onUnsubscribe();
		};
	}
	hasListeners() {
		return this.listeners.size > 0;
	}
	onSubscribe() {}
	onUnsubscribe() {}
}, Oe = new class extends De {
	#e;
	#t;
	#n;
	constructor() {
		super(), this.#n = (e) => {
			if (typeof window < "u" && window.addEventListener) {
				let t = () => e();
				return window.addEventListener("visibilitychange", t, !1), () => {
					window.removeEventListener("visibilitychange", t);
				};
			}
		};
	}
	onSubscribe() {
		this.#t || this.setEventListener(this.#n);
	}
	onUnsubscribe() {
		this.hasListeners() || (this.#t?.(), this.#t = void 0);
	}
	setEventListener(e) {
		this.#n = e, this.#t?.(), this.#t = e((e) => {
			typeof e == "boolean" ? this.setFocused(e) : this.onFocus();
		});
	}
	setFocused(e) {
		this.#e !== e && (this.#e = e, this.onFocus());
	}
	onFocus() {
		let e = this.isFocused();
		this.listeners.forEach((t) => {
			t(e);
		});
	}
	isFocused() {
		return typeof this.#e == "boolean" ? this.#e : globalThis.document?.visibilityState !== "hidden";
	}
}(), ke = ie;
function Ae() {
	let e = [], t = 0, n = (e) => {
		e();
	}, r = (e) => {
		e();
	}, i = ke, a = (r) => {
		t ? e.push(r) : i(() => {
			n(r);
		});
	}, o = () => {
		let t = e;
		e = [], t.length && i(() => {
			r(() => {
				t.forEach((e) => {
					n(e);
				});
			});
		});
	};
	return {
		batch: (e) => {
			let n;
			t++;
			try {
				n = e();
			} finally {
				t--, t || o();
			}
			return n;
		},
		batchCalls: (e) => (...t) => {
			a(() => {
				e(...t);
			});
		},
		schedule: a,
		setNotifyFunction: (e) => {
			n = e;
		},
		setBatchNotifyFunction: (e) => {
			r = e;
		},
		setScheduler: (e) => {
			i = e;
		}
	};
}
var D = Ae(), je = new class extends De {
	#e = !0;
	#t;
	#n;
	constructor() {
		super(), this.#n = (e) => {
			if (typeof window < "u" && window.addEventListener) {
				let t = () => e(!0), n = () => e(!1);
				return window.addEventListener("online", t, !1), window.addEventListener("offline", n, !1), () => {
					window.removeEventListener("online", t), window.removeEventListener("offline", n);
				};
			}
		};
	}
	onSubscribe() {
		this.#t || this.setEventListener(this.#n);
	}
	onUnsubscribe() {
		this.hasListeners() || (this.#t?.(), this.#t = void 0);
	}
	setEventListener(e) {
		this.#n = e, this.#t?.(), this.#t = e(this.setOnline.bind(this));
	}
	setOnline(e) {
		this.#e !== e && (this.#e = e, this.listeners.forEach((t) => {
			t(e);
		}));
	}
	isOnline() {
		return this.#e;
	}
}();
//#endregion
//#region node_modules/.pnpm/@tanstack+query-core@5.104.1/node_modules/@tanstack/query-core/build/modern/retryer.js
function Me(e) {
	return Math.min(1e3 * 2 ** e, 3e4);
}
function Ne(e) {
	return (e ?? "online") !== "online" || je.isOnline();
}
var Pe = class extends Error {
	constructor(e) {
		super("CancelledError"), this.revert = e?.revert, this.silent = e?.silent;
	}
};
function Fe(e) {
	let t = !1, n = 0, r, i = "pending", a, o, s = new Promise((e, t) => {
		a = e, o = t;
	});
	s.catch(C);
	let c = () => i !== "pending", l = (t) => {
		if (!c()) {
			let n = new Pe(t);
			h(n), e.onCancel?.(n);
		}
	}, u = () => {
		t = !0;
	}, d = () => {
		t = !1;
	}, f = () => Oe.isFocused() && (e.networkMode === "always" || je.isOnline()) && e.canRun(), p = () => Ne(e.networkMode) && e.canRun(), m = (e) => {
		c() || (r?.(), i = "resolved", a(e));
	}, h = (e) => {
		c() || (r?.(), i = "rejected", o(e));
	}, g = () => new Promise((t) => {
		r = (e) => {
			(c() || f()) && t(e);
		}, e.onPause?.();
	}).then(() => {
		r = void 0, c() || e.onContinue?.();
	}), _ = () => {
		if (c()) return;
		let r, i = n === 0 ? e.initialPromise : void 0;
		try {
			r = i ?? e.fn();
		} catch (e) {
			r = Promise.reject(e);
		}
		Promise.resolve(r).then(m).catch((r) => {
			if (c()) return;
			let i = e.retry ?? (Ee() ? 0 : 3), a = e.retryDelay ?? Me, o = typeof a == "function" ? a(n, r) : a, s = i === !0 || typeof i == "number" && n < i || typeof i == "function" && i(n, r);
			if (t || !s) {
				h(r);
				return;
			}
			n++, e.onFail?.(n, r), ye(o).then(() => f() ? void 0 : g()).then(() => {
				t ? h(r) : _();
			});
		});
	};
	return {
		promise: s,
		status: () => i,
		cancel: l,
		continue: () => (r?.(), s),
		cancelRetry: u,
		continueRetry: d,
		canStart: p,
		start: () => (p() ? _() : g().then(_), s)
	};
}
//#endregion
//#region node_modules/.pnpm/@tanstack+query-core@5.104.1/node_modules/@tanstack/query-core/build/modern/removable.js
var Ie = class {
	#e;
	destroy() {
		this.clearGcTimeout();
	}
	scheduleGc() {
		this.clearGcTimeout(), oe(this.gcTime) && (this.#e = x.setTimeout(() => {
			this.optionalRemove();
		}, this.gcTime));
	}
	updateGcTime(e) {
		this.gcTime = Math.max(this.gcTime || 0, e ?? (Ee() ? Infinity : 3e5));
	}
	clearGcTimeout() {
		this.#e !== void 0 && (x.clearTimeout(this.#e), this.#e = void 0);
	}
};
//#endregion
//#region node_modules/.pnpm/@tanstack+query-core@5.104.1/node_modules/@tanstack/query-core/build/modern/infiniteQueryBehavior.js
function Le(e) {
	return { onFetch: (t, n) => {
		let r = t.options, i = t.fetchOptions?.meta?.fetchMore?.direction, a = t.state.data?.pages || [], o = t.state.data?.pageParams || [], s = {
			pages: [],
			pageParams: []
		}, c = 0, l = async () => {
			let n = !1, l = (e) => {
				T(e, () => t.signal, () => n = !0);
			}, u = we(t.options, t.fetchOptions), d = async (e, r, i) => {
				if (n) return Promise.reject(t.signal.reason);
				if (r == null && e.pages.length) return Promise.resolve(e);
				let a = (() => {
					let e = {
						client: t.client,
						queryKey: t.queryKey,
						pageParam: r,
						direction: i ? "backward" : "forward",
						meta: t.options.meta
					};
					return l(e), e;
				})(), o = await u(a), { maxPages: s } = t.options, c = i ? Se : xe;
				return {
					pages: c(e.pages, o, s),
					pageParams: c(e.pageParams, r, s)
				};
			};
			if (i && a.length) {
				let e = i === "backward", t = e ? ze : Re, n = {
					pages: a,
					pageParams: o
				};
				s = await d(n, t(r, n), e);
			} else {
				let t = e ?? a.length;
				do {
					let e = c === 0 ? o[0] ?? r.initialPageParam : Re(r, s);
					if (c > 0 && e == null) break;
					s = await d(s, e), c++;
				} while (c < t);
			}
			return s;
		};
		t.fetchFn = t.options.persister ? () => t.options.persister?.(l, {
			client: t.client,
			queryKey: t.queryKey,
			meta: t.options.meta,
			signal: t.signal
		}, n) : l;
	} };
}
function Re(e, { pages: t, pageParams: n }) {
	let r = t.length - 1;
	return t.length > 0 ? e.getNextPageParam(t[r], t, n[r], n) : void 0;
}
function ze(e, { pages: t, pageParams: n }) {
	return t.length > 0 ? e.getPreviousPageParam?.(t[0], t, n[0], n) : void 0;
}
//#endregion
//#region node_modules/.pnpm/@tanstack+query-core@5.104.1/node_modules/@tanstack/query-core/build/modern/query.js
var Be = class extends Ie {
	#e;
	#t;
	#n;
	#r;
	#i;
	#a;
	#o;
	#s;
	constructor(e) {
		super(), this.#s = !1, this.#o = e.defaultOptions, this.setOptions(e.options), this.observers = [], this.#i = e.client, this.#r = this.#i.getQueryCache(), this.queryKey = e.queryKey, this.queryHash = e.queryHash, this.#t = Ue(this.options), this.state = e.state ?? this.#t, this.scheduleGc();
	}
	get meta() {
		return this.options.meta;
	}
	get queryType() {
		return this.#e;
	}
	get promise() {
		return this.#a?.promise;
	}
	setOptions(e) {
		if (this.options = {
			...this.#o,
			...e
		}, e?._type && (this.#e = e._type), this.updateGcTime(this.options.gcTime), this.state && this.state.data === void 0) {
			let e = Ue(this.options);
			e.data !== void 0 && (this.setState(He(e.data, e.dataUpdatedAt)), this.#t = e);
		}
	}
	optionalRemove() {
		!this.observers.length && this.state.fetchStatus === "idle" && this.#r.remove(this);
	}
	setData(e, t) {
		let n = be(this.state.data, e, this.options);
		return this.#c({
			data: n,
			type: "success",
			dataUpdatedAt: t?.updatedAt,
			manual: t?.manual
		}), n;
	}
	setState(e) {
		this.#c({
			type: "setState",
			state: e
		});
	}
	cancel(e) {
		let t = this.#a?.promise;
		return this.#a?.cancel(e), t ? t.then(C).catch(C) : Promise.resolve();
	}
	destroy() {
		super.destroy(), this.cancel({ silent: !0 });
	}
	get resetState() {
		return this.#t;
	}
	reset() {
		this.destroy(), this.setState(this.resetState);
	}
	isActive() {
		return this.observers.some((e) => w(e.options.enabled, this) !== !1);
	}
	isDisabled() {
		return this.getObserversCount() > 0 ? !this.isActive() : this.options.queryFn === Ce || !this.isFetched();
	}
	isFetched() {
		return this.state.dataUpdateCount + this.state.errorUpdateCount > 0;
	}
	isStatic() {
		return this.getObserversCount() > 0 && this.observers.some((e) => w(e.options.staleTime, this) === "static");
	}
	isStale() {
		return this.getObserversCount() > 0 ? this.observers.some((e) => e.getCurrentResult().isStale) : this.state.data === void 0 || this.state.isInvalidated;
	}
	isStaleByTime(e = 0) {
		return this.state.data === void 0 ? !0 : e === "static" ? !1 : this.state.isInvalidated ? !0 : !se(this.state.dataUpdatedAt, e);
	}
	onFocus() {
		this.observers.find((e) => e.shouldFetchOnWindowFocus())?.refetch({ cancelRefetch: !1 }), this.#a?.continue();
	}
	onOnline() {
		this.observers.find((e) => e.shouldFetchOnReconnect())?.refetch({ cancelRefetch: !1 }), this.#a?.continue();
	}
	addObserver(e) {
		this.observers.includes(e) || (this.observers.push(e), this.clearGcTimeout(), this.#r.notify({
			type: "observerAdded",
			query: this,
			observer: e
		}));
	}
	removeObserver(e) {
		let t = this.observers.indexOf(e);
		t !== -1 && (this.observers.splice(t, 1), this.observers.length || (this.#a && (this.#s || this.state.fetchStatus === "paused" && this.state.status === "pending" ? this.#a.cancel({ revert: !0 }) : this.#a.cancelRetry()), this.scheduleGc()), this.#r.notify({
			type: "observerRemoved",
			query: this,
			observer: e
		}));
	}
	getObserversCount() {
		return this.observers.length;
	}
	invalidate() {
		this.state.isInvalidated || this.#c({ type: "invalidate" });
	}
	async fetch(e, t) {
		if (this.state.fetchStatus !== "idle" && this.#a?.status() !== "rejected") {
			if (this.state.data !== void 0 && t?.cancelRefetch) this.cancel({ silent: !0 });
			else if (this.#a) return this.#a.continueRetry(), this.#a.promise;
		}
		if (e && this.setOptions(e), !this.options.queryFn) {
			let e = this.observers.find((e) => e.options.queryFn);
			e && this.setOptions(e.options);
		}
		let n = new AbortController(), r = (e) => {
			Object.defineProperty(e, "signal", {
				enumerable: !0,
				get: () => (this.#s = !0, n.signal)
			});
		}, i = () => {
			let e = we(this.options, t), n = (() => {
				let e = {
					client: this.#i,
					queryKey: this.queryKey,
					meta: this.meta
				};
				return r(e), e;
			})();
			return this.#s = !1, this.options.persister ? this.options.persister(e, n, this) : e(n);
		}, a = (() => {
			let e = {
				fetchOptions: t,
				options: this.options,
				queryKey: this.queryKey,
				client: this.#i,
				state: this.state,
				fetchFn: i
			};
			return r(e), e;
		})();
		(this.#e === "infinite" ? Le(this.options.pages) : this.options.behavior)?.onFetch(a, this), this.#n = this.state, (this.state.fetchStatus === "idle" || this.state.fetchMeta !== a.fetchOptions?.meta) && this.#c({
			type: "fetch",
			meta: a.fetchOptions?.meta
		});
		let o = this.#a = Fe({
			initialPromise: t?.initialPromise,
			fn: a.fetchFn,
			onCancel: (e) => {
				e instanceof Pe && e.revert && this.setState({
					...this.#n,
					fetchStatus: "idle"
				}), n.abort();
			},
			onFail: (e, t) => {
				this.#c({
					type: "failed",
					failureCount: e,
					error: t
				});
			},
			onPause: () => {
				this.#c({ type: "pause" });
			},
			onContinue: () => {
				this.#c({ type: "continue" });
			},
			retry: a.options.retry,
			retryDelay: a.options.retryDelay,
			networkMode: a.options.networkMode,
			canRun: () => !0
		});
		try {
			let e = await o.start();
			if (e === void 0) throw Error(`${this.queryHash} data is undefined`);
			return this.setData(e), this.#r.config.onSuccess?.(e, this), this.#r.config.onSettled?.(e, this.state.error, this), e;
		} catch (e) {
			if (e instanceof Pe) {
				if (e.silent) return this.#a.promise;
				if (e.revert) {
					if (this.state.data === void 0) throw e;
					return this.state.data;
				}
			}
			throw this.#c({
				type: "error",
				error: e
			}), this.#r.config.onError?.(e, this), this.#r.config.onSettled?.(this.state.data, e, this), e;
		} finally {
			this.#a === o && (this.#a = void 0), this.scheduleGc();
		}
	}
	#c(e) {
		let t = (t) => {
			switch (e.type) {
				case "failed": return {
					...t,
					fetchFailureCount: e.failureCount,
					fetchFailureReason: e.error
				};
				case "pause": return {
					...t,
					fetchStatus: "paused"
				};
				case "continue": return {
					...t,
					fetchStatus: "fetching"
				};
				case "fetch": return {
					...t,
					...Ve(t.data, this.options),
					fetchMeta: e.meta ?? null
				};
				case "success":
					let n = {
						...t,
						...He(e.data, e.dataUpdatedAt),
						dataUpdateCount: t.dataUpdateCount + 1,
						...!e.manual && {
							fetchStatus: "idle",
							fetchFailureCount: 0,
							fetchFailureReason: null
						}
					};
					return this.#n = e.manual ? n : void 0, n;
				case "error":
					let r = e.error;
					return {
						...t,
						error: r,
						errorUpdateCount: t.errorUpdateCount + 1,
						errorUpdatedAt: Date.now(),
						fetchFailureCount: t.fetchFailureCount + 1,
						fetchFailureReason: r,
						fetchStatus: "idle",
						status: "error",
						isInvalidated: !0
					};
				case "invalidate": return {
					...t,
					isInvalidated: !0
				};
				case "setState": return {
					...t,
					...e.state
				};
			}
		};
		this.state = t(this.state), D.batch(() => {
			this.observers.slice().forEach((e) => {
				e.onQueryUpdate();
			}), this.#r.notify({
				query: this,
				type: "updated",
				action: e
			});
		});
	}
};
function Ve(e, t) {
	return {
		fetchFailureCount: 0,
		fetchFailureReason: null,
		fetchStatus: Ne(t.networkMode) ? "fetching" : "paused",
		...e === void 0 && {
			error: null,
			status: "pending"
		}
	};
}
function He(e, t) {
	return {
		data: e,
		dataUpdatedAt: t ?? Date.now(),
		error: null,
		isInvalidated: !1,
		status: "success"
	};
}
function Ue(e) {
	let t = typeof e.initialData == "function" ? e.initialData() : e.initialData, n = t !== void 0, r = n ? typeof e.initialDataUpdatedAt == "function" ? e.initialDataUpdatedAt() : e.initialDataUpdatedAt : 0;
	return {
		data: t,
		dataUpdateCount: 0,
		dataUpdatedAt: n ? r ?? Date.now() : 0,
		error: null,
		errorUpdateCount: 0,
		errorUpdatedAt: 0,
		fetchFailureCount: 0,
		fetchFailureReason: null,
		fetchMeta: null,
		isInvalidated: !1,
		status: n ? "success" : "pending",
		fetchStatus: "idle"
	};
}
//#endregion
//#region node_modules/.pnpm/@tanstack+query-core@5.104.1/node_modules/@tanstack/query-core/build/modern/queryObserver.js
var We = class extends De {
	#e;
	#t = void 0;
	#n = void 0;
	#r = void 0;
	#i;
	#a;
	#o;
	#s;
	#c;
	#l;
	#u;
	#d;
	#f;
	#p = /* @__PURE__ */ new Set();
	constructor(e, t) {
		super(), this.options = t, this.#e = e, this.#o = null, this.bindMethods(), this.setOptions(t);
	}
	bindMethods() {
		this.refetch = this.refetch.bind(this);
	}
	onSubscribe() {
		this.listeners.size === 1 && (this.#t.addObserver(this), Ke(this.#t, this.options) ? this.#m() : this.updateResult(), this.#y());
	}
	onUnsubscribe() {
		this.hasListeners() || this.destroy();
	}
	shouldFetchOnReconnect() {
		return qe(this.#t, this.options, this.options.refetchOnReconnect);
	}
	shouldFetchOnWindowFocus() {
		return qe(this.#t, this.options, this.options.refetchOnWindowFocus);
	}
	destroy() {
		this.listeners = /* @__PURE__ */ new Set(), this.#b(), this.#x(), this.#t.removeObserver(this);
	}
	setOptions(e) {
		let t = this.options, n = this.#t;
		if (this.options = this.#e.defaultQueryOptions(e), this.options.enabled !== void 0 && typeof this.options.enabled != "boolean" && typeof this.options.enabled != "function" && typeof w(this.options.enabled, this.#t) != "boolean") throw Error("Expected enabled to be a boolean or a callback that returns a boolean");
		this.#S(), this.#t.setOptions(this.options), t._defaulted && !he(this.options, t) && this.#e.getQueryCache().notify({
			type: "observerOptionsUpdated",
			query: this.#t,
			observer: this
		});
		let r = this.hasListeners();
		r && Je(this.#t, n, this.options, t) && this.#m(), this.updateResult(), r && (this.#t !== n || w(this.options.enabled, this.#t) !== w(t.enabled, this.#t) || w(this.options.staleTime, this.#t) !== w(t.staleTime, this.#t)) && this.#g();
		let i = this.#_();
		r && (this.#t !== n || w(this.options.enabled, this.#t) !== w(t.enabled, this.#t) || i !== this.#f) && this.#v(i);
	}
	getOptimisticResult(e) {
		let t = this.#e.getQueryCache().build(this.#e, e), n = this.createResult(t, e);
		return he(this.getCurrentResult(), n) || (this.#r = n, this.#a = this.options, this.#i = this.#t.state), n;
	}
	getCurrentResult() {
		return this.#r;
	}
	trackResult(e, t) {
		return new Proxy(e, { get: (e, n) => (this.trackProp(n), t?.(n), Reflect.get(e, n)) });
	}
	trackProp(e) {
		this.#p.add(e);
	}
	getCurrentQuery() {
		return this.#t;
	}
	refetch({ ...e } = {}) {
		return this.fetch({ ...e });
	}
	fetchOptimistic(e) {
		let t = this.#e.defaultQueryOptions(e), n = this.#e.getQueryCache().build(this.#e, t), r = () => {}, i, a = new Promise((e) => {
			i = e, r = this.#e.getQueryCache().subscribe((i) => {
				i.type === "updated" && i.query.queryHash === n.queryHash && n.state.data !== void 0 && (r(), e(this.createResult(n, t)));
			});
		});
		return Promise.race([n.fetch().then(() => {
			let e = this.createResult(n, t);
			return i?.(e), e;
		}).finally(() => {
			r();
		}), a]);
	}
	fetch(e) {
		return this.#m({
			...e,
			cancelRefetch: e.cancelRefetch ?? !0
		}).then(() => (this.updateResult(), this.#r));
	}
	#m(e) {
		this.#S();
		let t = this.#t.fetch(this.options, e);
		return e?.throwOnError || (t = t.catch(C)), t;
	}
	#h(e) {
		return !Ee() && w(this.options.enabled, this.#t) !== !1 && oe(e);
	}
	#g() {
		this.#b();
		let e = w(this.options.staleTime, this.#t);
		if (this.#r.isStale || !this.#h(e)) return;
		let t = se(this.#r.dataUpdatedAt, e) + 1;
		this.#u = x.setTimeout(() => {
			this.#r.isStale || this.updateResult();
		}, t);
	}
	#_() {
		return w(this.options.refetchInterval, this.#t) ?? !1;
	}
	#v(e) {
		this.#x(), this.#f = e, this.#f !== 0 && this.#h(this.#f) && (this.#d = x.setInterval(() => {
			(this.options.refetchIntervalInBackground || Oe.isFocused()) && this.#m();
		}, this.#f));
	}
	#y() {
		this.#g(), this.#v(this.#_());
	}
	#b() {
		this.#u !== void 0 && (x.clearTimeout(this.#u), this.#u = void 0);
	}
	#x() {
		this.#d !== void 0 && (x.clearInterval(this.#d), this.#d = void 0);
	}
	createResult(e, t) {
		let n = this.#t, r = this.options, i = this.#r, a = this.#i, o = this.#a, s = e === n ? this.#n : e.state, { state: c } = e, l = { ...c }, u = !1, d;
		if (t._optimisticResults) {
			let i = this.hasListeners(), a = !i && Ke(e, t), o = i && Je(e, n, t, r);
			(a || o) && (l = {
				...l,
				...Ve(c.data, e.options)
			}), t._optimisticResults === "isRestoring" && (l.fetchStatus = "idle");
		}
		let { error: f, errorUpdatedAt: p, status: m } = l;
		d = l.data;
		let h = !1;
		if (t.placeholderData !== void 0 && d === void 0 && m === "pending") {
			let e;
			i?.isPlaceholderData && t.placeholderData === o?.placeholderData ? (e = i.data, h = !0) : e = typeof t.placeholderData == "function" ? t.placeholderData(this.#l?.state.data, this.#l) : t.placeholderData, e !== void 0 && (m = "success", d = be(i?.data, e, t), u = !0);
		}
		if (t.select && d !== void 0 && !h) {
			if (i && d === a?.data && t.select === this.#s) d = this.#c;
			else try {
				this.#s = t.select, d = t.select(d), d = be(i?.data, d, t), this.#c = d, this.#o = null;
			} catch (e) {
				this.#o = e;
			}
		} else d === void 0 && (this.#o = null);
		this.#o && (f = this.#o, d = this.#c, p = Date.now(), m = "error", u = !1);
		let g = l.fetchStatus === "fetching", _ = m === "pending", v = m === "error", y = _ && g, b = d !== void 0;
		return {
			status: m,
			fetchStatus: l.fetchStatus,
			isPending: _,
			isSuccess: m === "success",
			isError: v,
			isInitialLoading: y,
			isLoading: y,
			data: d,
			dataUpdatedAt: l.dataUpdatedAt,
			error: f,
			errorUpdatedAt: p,
			failureCount: l.fetchFailureCount,
			failureReason: l.fetchFailureReason,
			errorUpdateCount: l.errorUpdateCount,
			isFetched: e.isFetched(),
			isFetchedAfterMount: l.dataUpdateCount > s.dataUpdateCount || l.errorUpdateCount > s.errorUpdateCount,
			isFetching: g,
			isRefetching: g && !_,
			isLoadingError: v && !b,
			isPaused: l.fetchStatus === "paused",
			isPlaceholderData: u,
			isRefetchError: v && b,
			isStale: Ye(e, t),
			refetch: this.refetch,
			isEnabled: w(t.enabled, e) !== !1
		};
	}
	updateResult() {
		let e = this.#r, t = this.createResult(this.#t, this.options);
		if (this.#i = this.#t.state, this.#a = this.options, this.#i.data !== void 0 && (this.#l = this.#t), he(t, e)) return;
		this.#r = t;
		let n = (() => {
			if (!e) return !0;
			let { notifyOnChangeProps: t } = this.options, n = typeof t == "function" ? t() : t;
			if (n === "all" || !n && !this.#p.size) return !0;
			let r = new Set(n ?? this.#p);
			return this.options.throwOnError && r.add("error"), Object.keys(this.#r).some((t) => {
				let n = t;
				return this.#r[n] !== e[n] && r.has(n);
			});
		})();
		D.batch(() => {
			n && this.listeners.forEach((e) => {
				e(this.#r);
			}), this.#e.getQueryCache().notify({
				query: this.#t,
				type: "observerResultsUpdated"
			});
		});
	}
	#S() {
		let e = this.#e.getQueryCache().build(this.#e, this.options);
		if (e === this.#t) return;
		let t = this.#t;
		this.#t = e, this.#n = e.state, this.hasListeners() && (t?.removeObserver(this), e.addObserver(this));
	}
	onQueryUpdate() {
		this.updateResult(), this.hasListeners() && this.#y();
	}
};
function Ge(e, t) {
	return w(t.enabled, e) !== !1 && e.state.data === void 0 && (e.state.status !== "error" || w(t.retryOnMount, e) !== !1);
}
function Ke(e, t) {
	return Ge(e, t) || e.state.data !== void 0 && qe(e, t, t.refetchOnMount);
}
function qe(e, t, n) {
	if (w(t.enabled, e) !== !1 && w(t.staleTime, e) !== "static") {
		let r = w(n, e);
		return r === "always" || r !== !1 && Ye(e, t);
	}
	return !1;
}
function Je(e, t, n, r) {
	return (e !== t || w(r.enabled, e) === !1) && (!n.suspense || e.state.status !== "error") && Ye(e, n);
}
function Ye(e, t) {
	return w(t.enabled, e) !== !1 && e.isStaleByTime(w(t.staleTime, e));
}
//#endregion
//#region node_modules/.pnpm/@tanstack+query-core@5.104.1/node_modules/@tanstack/query-core/build/modern/mutation.js
var Xe = class extends Ie {
	#e;
	#t;
	#n;
	#r;
	constructor(e) {
		super(), this.#e = e.client, this.mutationId = e.mutationId, this.#n = e.mutationCache, this.#t = [], this.state = e.state || Ze(), this.setOptions(e.options), this.scheduleGc();
	}
	setOptions(e) {
		this.options = e, this.updateGcTime(this.options.gcTime);
	}
	get meta() {
		return this.options.meta;
	}
	addObserver(e) {
		this.#t.includes(e) || (this.#t.push(e), this.clearGcTimeout(), this.#n.notify({
			type: "observerAdded",
			mutation: this,
			observer: e
		}));
	}
	removeObserver(e) {
		this.#t = this.#t.filter((t) => t !== e), this.scheduleGc(), this.#n.notify({
			type: "observerRemoved",
			mutation: this,
			observer: e
		});
	}
	optionalRemove() {
		this.#t.length || (this.state.status === "pending" ? this.scheduleGc() : this.#n.remove(this));
	}
	continue() {
		return this.#r?.continue() ?? (this.state.status === "pending" ? this.execute(this.state.variables) : Promise.resolve());
	}
	async execute(e) {
		let t = () => {
			this.#i({ type: "continue" });
		}, n = {
			client: this.#e,
			meta: this.options.meta,
			mutationKey: this.options.mutationKey
		}, r = this.#r = Fe({
			fn: () => this.options.mutationFn ? this.options.mutationFn(e, n) : Promise.reject(/* @__PURE__ */ Error("No mutationFn found")),
			onFail: (e, t) => {
				this.#i({
					type: "failed",
					failureCount: e,
					error: t
				});
			},
			onPause: () => {
				this.#i({ type: "pause" });
			},
			onContinue: t,
			retry: this.options.retry ?? 0,
			retryDelay: this.options.retryDelay,
			networkMode: this.options.networkMode,
			canRun: () => this.#n.canRun(this)
		}), i = this.state.status === "pending", a = !r.canStart();
		try {
			if (i) t();
			else {
				this.#i({
					type: "pending",
					variables: e,
					isPaused: a
				}), this.#n.config.onMutate && await this.#n.config.onMutate(e, this, n);
				let t = await this.options.onMutate?.(e, n);
				t !== this.state.context && this.#i({
					type: "pending",
					context: t,
					variables: e,
					isPaused: a
				});
			}
			let o = await r.start();
			return await this.#n.config.onSuccess?.(o, e, this.state.context, this, n), await this.options.onSuccess?.(o, e, this.state.context, n), await this.#n.config.onSettled?.(o, null, this.state.variables, this.state.context, this, n), await this.options.onSettled?.(o, null, e, this.state.context, n), this.#i({
				type: "success",
				data: o
			}), o;
		} catch (t) {
			try {
				await this.#n.config.onError?.(t, e, this.state.context, this, n);
			} catch (e) {
				Promise.reject(e);
			}
			try {
				await this.options.onError?.(t, e, this.state.context, n);
			} catch (e) {
				Promise.reject(e);
			}
			try {
				await this.#n.config.onSettled?.(void 0, t, this.state.variables, this.state.context, this, n);
			} catch (e) {
				Promise.reject(e);
			}
			try {
				await this.options.onSettled?.(void 0, t, e, this.state.context, n);
			} catch (e) {
				Promise.reject(e);
			}
			throw this.#i({
				type: "error",
				error: t
			}), t;
		} finally {
			this.#r === r && (this.#r = void 0), this.#n.runNext(this);
		}
	}
	#i(e) {
		let t = (t) => {
			switch (e.type) {
				case "failed": return {
					...t,
					failureCount: e.failureCount,
					failureReason: e.error
				};
				case "pause": return {
					...t,
					isPaused: !0
				};
				case "continue": return {
					...t,
					isPaused: !1
				};
				case "pending": return {
					...t,
					context: e.context,
					data: void 0,
					failureCount: 0,
					failureReason: null,
					error: null,
					isPaused: e.isPaused,
					status: "pending",
					variables: e.variables,
					submittedAt: Date.now()
				};
				case "success": return {
					...t,
					data: e.data,
					failureCount: 0,
					failureReason: null,
					error: null,
					status: "success",
					isPaused: !1
				};
				case "error": return {
					...t,
					data: void 0,
					error: e.error,
					failureCount: t.failureCount + 1,
					failureReason: e.error,
					isPaused: !1,
					status: "error"
				};
			}
		};
		this.state = t(this.state), D.batch(() => {
			this.#t.forEach((t) => {
				t.onMutationUpdate(e);
			}), this.#n.notify({
				mutation: this,
				type: "updated",
				action: e
			});
		});
	}
};
function Ze() {
	return {
		context: void 0,
		data: void 0,
		error: null,
		failureCount: 0,
		failureReason: null,
		isPaused: !1,
		status: "idle",
		variables: void 0,
		submittedAt: 0
	};
}
//#endregion
//#region node_modules/.pnpm/@tanstack+query-core@5.104.1/node_modules/@tanstack/query-core/build/modern/mutationCache.js
var Qe = class extends De {
	#e;
	#t;
	#n;
	constructor(e = {}) {
		super(), this.config = e, this.#e = /* @__PURE__ */ new Set(), this.#t = /* @__PURE__ */ new Map(), this.#n = 0;
	}
	build(e, t, n) {
		let r = new Xe({
			client: e,
			mutationCache: this,
			mutationId: ++this.#n,
			options: e.defaultMutationOptions(t),
			state: n
		});
		return this.add(r), r;
	}
	add(e) {
		this.#e.add(e);
		let t = $e(e);
		if (typeof t == "string") {
			let n = this.#t.get(t);
			n ? n.push(e) : this.#t.set(t, [e]);
		}
		this.notify({
			type: "added",
			mutation: e
		});
	}
	remove(e) {
		if (this.#e.delete(e)) {
			let t = $e(e);
			if (typeof t == "string") {
				let n = this.#t.get(t);
				if (n) {
					if (n.length > 1) {
						let t = n.indexOf(e);
						t !== -1 && n.splice(t, 1);
					} else n[0] === e && this.#t.delete(t);
				}
			}
		}
		this.notify({
			type: "removed",
			mutation: e
		});
	}
	canRun(e) {
		let t = $e(e);
		if (typeof t == "string") {
			let n = this.#t.get(t)?.find((e) => e.state.status === "pending");
			return !n || n === e;
		}
		return !0;
	}
	runNext(e) {
		let t = $e(e);
		return typeof t == "string" ? (this.#t.get(t)?.find((t) => t !== e && t.state.isPaused))?.continue() ?? Promise.resolve() : Promise.resolve();
	}
	clear() {
		D.batch(() => {
			this.#e.forEach((e) => {
				this.notify({
					type: "removed",
					mutation: e
				});
			}), this.#e.clear(), this.#t.clear();
		});
	}
	getAll() {
		return Array.from(this.#e);
	}
	find(e) {
		let t = {
			exact: !0,
			...e
		};
		return this.getAll().find((e) => le(t, e));
	}
	findAll(e = {}) {
		return this.getAll().filter((t) => le(e, t));
	}
	notify(e) {
		D.batch(() => {
			this.listeners.forEach((t) => {
				t(e);
			});
		});
	}
	resumePausedMutations() {
		let e = this.getAll().filter((e) => e.state.isPaused);
		return D.batch(() => Promise.all(e.map((e) => e.continue().catch(C))));
	}
};
function $e(e) {
	return e.options.scope?.id;
}
//#endregion
//#region node_modules/.pnpm/@tanstack+query-core@5.104.1/node_modules/@tanstack/query-core/build/modern/mutationObserver.js
var et = class extends De {
	#e;
	#t = void 0;
	#n;
	#r;
	constructor(e, t) {
		super(), this.#e = e, this.setOptions(t), this.bindMethods(), this.#i();
	}
	bindMethods() {
		this.mutate = this.mutate.bind(this), this.reset = this.reset.bind(this);
	}
	setOptions(e) {
		let t = this.options;
		this.options = this.#e.defaultMutationOptions(e), he(this.options, t) || this.#e.getMutationCache().notify({
			type: "observerOptionsUpdated",
			mutation: this.#n,
			observer: this
		}), t?.mutationKey && this.options.mutationKey && de(t.mutationKey) !== de(this.options.mutationKey) ? this.reset() : this.#n?.state.status === "pending" && this.#n.setOptions(this.options);
	}
	onSubscribe() {
		this.listeners.size === 1 && this.#n && (this.#n.addObserver(this), this.#i());
	}
	onUnsubscribe() {
		this.hasListeners() || this.#n?.removeObserver(this);
	}
	onMutationUpdate(e) {
		this.#i(), this.#a(e);
	}
	getCurrentResult() {
		return this.#t;
	}
	reset() {
		this.#n?.removeObserver(this), this.#n = void 0, this.#i(), this.#a();
	}
	mutate(e, t) {
		return this.#r = t, this.#n?.removeObserver(this), this.#n = this.#e.getMutationCache().build(this.#e, this.options), this.#n.addObserver(this), this.#n.execute(e);
	}
	#i() {
		let e = this.#n?.state ?? Ze();
		this.#t = {
			...e,
			isPending: e.status === "pending",
			isSuccess: e.status === "success",
			isError: e.status === "error",
			isIdle: e.status === "idle",
			mutate: this.mutate,
			reset: this.reset
		};
	}
	#a(e) {
		D.batch(() => {
			if (this.#r && this.hasListeners()) {
				let t = this.#t.variables, n = this.#t.context, r = {
					client: this.#e,
					meta: this.options.meta,
					mutationKey: this.options.mutationKey
				};
				if (e?.type === "success") {
					try {
						this.#r.onSuccess?.(e.data, t, n, r);
					} catch (e) {
						Promise.reject(e);
					}
					try {
						this.#r.onSettled?.(e.data, null, t, n, r);
					} catch (e) {
						Promise.reject(e);
					}
				} else if (e?.type === "error") {
					try {
						this.#r.onError?.(e.error, t, n, r);
					} catch (e) {
						Promise.reject(e);
					}
					try {
						this.#r.onSettled?.(void 0, e.error, t, n, r);
					} catch (e) {
						Promise.reject(e);
					}
				}
			}
			this.listeners.forEach((e) => {
				e(this.#t);
			});
		});
	}
};
//#endregion
//#region node_modules/.pnpm/@tanstack+query-core@5.104.1/node_modules/@tanstack/query-core/build/modern/queriesObserver.js
function tt(e, t) {
	let n = new Set(t);
	return e.filter((e) => !n.has(e));
}
var nt = class extends De {
	#e;
	#t;
	#n;
	#r;
	#i;
	#a;
	#o;
	#s;
	#c;
	#l = [];
	constructor(e, t, n) {
		super(), this.#e = e, this.#r = n, this.#n = [], this.#i = [], this.#t = [], this.setQueries(t);
	}
	onSubscribe() {
		this.listeners.size === 1 && this.#i.forEach((e) => {
			e.subscribe((t) => {
				this.#m(e, t);
			});
		});
	}
	onUnsubscribe() {
		this.listeners.size || this.destroy();
	}
	destroy() {
		this.listeners = /* @__PURE__ */ new Set(), this.#i.forEach((e) => {
			e.destroy();
		});
	}
	setQueries(e, t) {
		this.#n = e, this.#r = t, D.batch(() => {
			let e = this.#i, t = this.#p(this.#n);
			t.forEach((e) => e.observer.setOptions(e.defaultedQueryOptions));
			let n = t.map((e) => e.observer), r = n.map((e) => e.getCurrentResult()), i = e.length !== n.length, a = n.some((t, n) => t !== e[n]), o = i || a, s = o ? !0 : r.some((e, t) => {
				let n = this.#t[t];
				return !n || !he(e, n);
			});
			(o || s) && (o && (this.#l = t, this.#i = n), this.#t = r, this.hasListeners() && (o && (tt(e, n).forEach((e) => {
				e.destroy();
			}), tt(n, e).forEach((e) => {
				e.subscribe((t) => {
					this.#m(e, t);
				});
			})), this.#h()));
		});
	}
	getCurrentResult() {
		return this.#t;
	}
	getQueries() {
		return this.#i.map((e) => e.getCurrentQuery());
	}
	getObservers() {
		return this.#i;
	}
	getOptimisticResult(e, t) {
		let n = this.#p(e), r = n.map((e) => e.observer.getOptimisticResult(e.defaultedQueryOptions)), i = n.map((e) => e.defaultedQueryOptions.queryHash);
		return [
			r,
			(e) => this.#d(e ?? r, t, i),
			() => this.#u(r, n)
		];
	}
	#u(e, t) {
		let n = /* @__PURE__ */ new Set();
		return t.map((r, i) => {
			let a = e[i];
			return r.defaultedQueryOptions.notifyOnChangeProps ? a : r.observer.trackResult(a, (e) => {
				n.has(e) || (n.add(e), t.forEach((t) => {
					t.observer.trackProp(e);
				}));
			});
		});
	}
	#d(e, t, n) {
		if (t) {
			let r = this.#c, i = n !== void 0 && r !== void 0 && (r.length !== n.length || n.some((e, t) => e !== r[t]));
			return (this.#t !== this.#s || i || t !== this.#o) && (this.#o = t, this.#s = this.#t, n !== void 0 && (this.#c = n), this.#a = me(this.#a, t(e))), this.#a;
		}
		return e;
	}
	#f() {
		return !this.#r?.combine || this.#i.some((e, t) => e.options.suspense && this.#t[t]?.data === void 0);
	}
	#p(e) {
		let t = /* @__PURE__ */ new Map();
		this.#i.forEach((e) => {
			let n = e.options.queryHash;
			if (!n) return;
			let r = t.get(n);
			r ? r.push(e) : t.set(n, [e]);
		});
		let n = [];
		return e.forEach((e) => {
			let r = this.#e.defaultQueryOptions(e), i = t.get(r.queryHash)?.shift() ?? new We(this.#e, r);
			n.push({
				defaultedQueryOptions: r,
				observer: i
			});
		}), n;
	}
	#m(e, t) {
		let n = this.#i.indexOf(e);
		n !== -1 && (this.#t = this.#t.slice(), this.#t[n] = t, this.#h());
	}
	#h() {
		if (this.hasListeners()) {
			let e = this.#f(), t = this.#a, n = e ? t : this.#d(this.#u(this.#t, this.#l), this.#r?.combine);
			(e || t !== n) && D.batch(() => {
				this.listeners.forEach((e) => {
					e(this.#t);
				});
			});
		}
	}
}, rt = class extends De {
	#e;
	constructor(e = {}) {
		super(), this.config = e, this.#e = /* @__PURE__ */ new Map();
	}
	build(e, t, n) {
		let r = t.queryKey, i = t.queryHash ?? ue(r, t), a = this.get(i);
		return a || (a = new Be({
			client: e,
			queryKey: r,
			queryHash: i,
			options: e.defaultQueryOptions(t),
			state: n,
			defaultOptions: e.getQueryDefaults(r)
		}), this.add(a)), a;
	}
	add(e) {
		this.#e.has(e.queryHash) || (this.#e.set(e.queryHash, e), this.notify({
			type: "added",
			query: e
		}));
	}
	remove(e) {
		this.#e.get(e.queryHash) === e && (e.destroy(), this.#e.delete(e.queryHash), this.notify({
			type: "removed",
			query: e
		}));
	}
	clear() {
		D.batch(() => {
			this.getAll().forEach((e) => {
				this.remove(e);
			});
		});
	}
	get(e) {
		return this.#e.get(e);
	}
	getAll() {
		return [...this.#e.values()];
	}
	find(e) {
		let t = {
			exact: !0,
			...e
		};
		return this.getAll().find((e) => ce(t, e));
	}
	findAll(e = {}) {
		let t = this.getAll();
		return Object.keys(e).length > 0 ? t.filter((t) => ce(e, t)) : t;
	}
	notify(e) {
		D.batch(() => {
			this.listeners.forEach((t) => {
				t(e);
			});
		});
	}
	onFocus() {
		D.batch(() => {
			this.getAll().forEach((e) => {
				e.onFocus();
			});
		});
	}
	onOnline() {
		D.batch(() => {
			this.getAll().forEach((e) => {
				e.onOnline();
			});
		});
	}
}, it = class {
	#e;
	#t;
	#n;
	#r;
	#i;
	#a;
	#o;
	#s;
	constructor(e = {}) {
		this.#e = e.queryCache || new rt(), this.#t = e.mutationCache || new Qe(), this.#n = e.defaultOptions || {}, this.#r = /* @__PURE__ */ new Map(), this.#i = /* @__PURE__ */ new Map(), this.#a = 0;
	}
	mount() {
		this.#a++, this.#a === 1 && (this.#o = Oe.subscribe(async (e) => {
			e && (await this.resumePausedMutations(), this.#e.onFocus());
		}), this.#s = je.subscribe(async (e) => {
			e && (await this.resumePausedMutations(), this.#e.onOnline());
		}));
	}
	unmount() {
		this.#a--, this.#a === 0 && (this.#o?.(), this.#o = void 0, this.#s?.(), this.#s = void 0);
	}
	isFetching(e) {
		return this.#e.findAll({
			...e,
			fetchStatus: "fetching"
		}).length;
	}
	isMutating(e) {
		return this.#t.findAll({
			...e,
			status: "pending"
		}).length;
	}
	getQueryData(e) {
		let t = this.defaultQueryOptions({ queryKey: e });
		return this.#e.get(t.queryHash)?.state.data;
	}
	ensureQueryData(e) {
		let t = this.defaultQueryOptions(e), n = this.#e.build(this, t), r = n.state.data;
		return r === void 0 ? this.fetchQuery(e) : (e.revalidateIfStale && n.isStaleByTime(w(t.staleTime, n)) && this.prefetchQuery(t), Promise.resolve(r));
	}
	getQueriesData(e) {
		return this.#e.findAll(e).map(({ queryKey: e, state: t }) => [e, t.data]);
	}
	setQueryData(e, t, n) {
		let r = this.defaultQueryOptions({ queryKey: e }), i = this.#e.get(r.queryHash)?.state.data, a = ae(t, i);
		if (a !== void 0) return this.#e.build(this, r).setData(a, {
			...n,
			manual: !0
		});
	}
	setQueriesData(e, t, n) {
		return D.batch(() => this.#e.findAll(e).map(({ queryKey: e }) => [e, this.setQueryData(e, t, n)]));
	}
	getQueryState(e) {
		let t = this.defaultQueryOptions({ queryKey: e });
		return this.#e.get(t.queryHash)?.state;
	}
	removeQueries(e) {
		let t = this.#e;
		D.batch(() => {
			t.findAll(e).forEach((e) => {
				t.remove(e);
			});
		});
	}
	resetQueries(e, t) {
		let n = this.#e;
		return D.batch(() => {
			let r = n.findAll(e), i = new Set(r);
			return r.forEach((e) => {
				e.reset();
			}), this.refetchQueries({
				type: "active",
				predicate: (e) => i.has(e)
			}, t);
		});
	}
	cancelQueries(e, t = {}) {
		let n = {
			revert: !0,
			...t
		}, r = D.batch(() => this.#e.findAll(e).map((e) => e.cancel(n)));
		return Promise.all(r).then(C).catch(C);
	}
	invalidateQueries(e, t = {}) {
		return D.batch(() => (this.#e.findAll(e).forEach((e) => {
			e.invalidate();
		}), e?.refetchType === "none" ? Promise.resolve() : this.refetchQueries({
			...e,
			type: e?.refetchType ?? e?.type ?? "active"
		}, t)));
	}
	refetchQueries(e, t = {}) {
		let n = {
			...t,
			cancelRefetch: t.cancelRefetch ?? !0
		}, r = D.batch(() => this.#e.findAll(e).filter((e) => !e.isDisabled() && !e.isStatic()).map((e) => {
			let t = e.fetch(void 0, n);
			return n.throwOnError || (t = t.catch(C)), e.state.fetchStatus === "paused" ? Promise.resolve() : t;
		}));
		return Promise.all(r).then(C);
	}
	async query(e) {
		let t = this.defaultQueryOptions(e);
		t.retry === void 0 && (t.retry = !1);
		let n = this.#e.build(this, t), r = n.isStaleByTime(w(t.staleTime, n)) ? await n.fetch(t) : n.state.data, i = t.select;
		return i ? i(r) : r;
	}
	fetchQuery(e) {
		let t = this.defaultQueryOptions(e);
		t.retry === void 0 && (t.retry = !1);
		let n = this.#e.build(this, t);
		return n.isStaleByTime(w(t.staleTime, n)) ? n.fetch(t) : Promise.resolve(n.state.data);
	}
	prefetchQuery(e) {
		return this.fetchQuery(e).then(C).catch(C);
	}
	infiniteQuery(e) {
		return e._type = "infinite", this.query(e);
	}
	fetchInfiniteQuery(e) {
		return e._type = "infinite", this.fetchQuery(e);
	}
	prefetchInfiniteQuery(e) {
		return this.fetchInfiniteQuery(e).then(C).catch(C);
	}
	ensureInfiniteQueryData(e) {
		return e._type = "infinite", this.ensureQueryData(e);
	}
	resumePausedMutations() {
		return je.isOnline() ? this.#t.resumePausedMutations() : Promise.resolve();
	}
	getQueryCache() {
		return this.#e;
	}
	getMutationCache() {
		return this.#t;
	}
	getDefaultOptions() {
		return this.#n;
	}
	setDefaultOptions(e) {
		this.#n = e;
	}
	setQueryDefaults(e, t) {
		this.#r.set(de(e), {
			queryKey: e,
			defaultOptions: t
		});
	}
	getQueryDefaults(e) {
		let t = [...this.#r.values()], n = {};
		return t.forEach((t) => {
			fe(e, t.queryKey) && Object.assign(n, t.defaultOptions);
		}), n;
	}
	setMutationDefaults(e, t) {
		this.#i.set(de(e), {
			mutationKey: e,
			defaultOptions: t
		});
	}
	getMutationDefaults(e) {
		let t = [...this.#i.values()], n = {};
		return t.forEach((t) => {
			fe(e, t.mutationKey) && Object.assign(n, t.defaultOptions);
		}), n;
	}
	defaultQueryOptions(e) {
		if (e._defaulted) return e;
		let t = {
			...this.#n.queries,
			...this.getQueryDefaults(e.queryKey),
			...e,
			_defaulted: !0
		};
		return t.queryHash ||= ue(t.queryKey, t), t.refetchOnReconnect === void 0 && (t.refetchOnReconnect = t.networkMode !== "always"), t.throwOnError === void 0 && (t.throwOnError = !!t.suspense), !t.networkMode && t.persister && (t.networkMode = "offlineFirst"), t.queryFn === Ce && (t.enabled = !1), t;
	}
	defaultMutationOptions(e) {
		return e?._defaulted ? e : {
			...this.#n.mutations,
			...e?.mutationKey && this.getMutationDefaults(e.mutationKey),
			...e,
			_defaulted: !0
		};
	}
	clear() {
		this.#e.clear(), this.#t.clear();
	}
}, at = y.createContext(!1), ot = () => y.useContext(at);
at.Provider;
//#endregion
//#region node_modules/.pnpm/@tanstack+react-query@5.104.1_react@19.3.0/node_modules/@tanstack/react-query/build/modern/QueryErrorResetBoundary.js
function st() {
	let e = !1;
	return {
		clearReset: () => {
			e = !1;
		},
		reset: () => {
			e = !0;
		},
		isReset: () => e
	};
}
var ct = y.createContext(st()), lt = () => y.useContext(ct), ut = (e, t, n) => {
	let r = n?.state.error && typeof e.throwOnError == "function" ? Te(e.throwOnError, [n.state.error, n]) : e.throwOnError;
	(e.suspense || r) && (t.isReset() || (e.retryOnMount = !1));
}, dt = (e) => {
	y.useEffect(() => {
		e.clearReset();
	}, [e]);
}, ft = ({ result: e, errorResetBoundary: t, throwOnError: n, query: r, suspense: i }) => e.isError && !t.isReset() && !e.isFetching && r && (i && e.data === void 0 || Te(n, [e.error, r])), pt = (e) => {
	if (e.suspense) {
		let t = 1e3, n = (e) => e === "static" ? e : Math.max(e ?? t, t), r = e.staleTime;
		e.staleTime = typeof r == "function" ? (...e) => n(r(...e)) : n(r), typeof e.gcTime == "number" && (e.gcTime = Math.max(e.gcTime, t));
	}
}, mt = (e, t) => e?.suspense && t.isPending, ht = (e, t, n) => t.fetchOptimistic(e).catch(() => {
	n.clearReset();
});
//#endregion
//#region node_modules/.pnpm/@tanstack+react-query@5.104.1_react@19.3.0/node_modules/@tanstack/react-query/build/modern/useQueries.js
function gt({ queries: e, ...t }, n) {
	let r = te(n), i = ot(), a = lt(), o = t.subscribed !== !1, s = y.useMemo(() => e.map((e) => {
		let t = r.defaultQueryOptions(e);
		return t._optimisticResults = i ? "isRestoring" : o ? "optimistic" : void 0, t;
	}), [
		e,
		r,
		i,
		o
	]);
	s.forEach((e) => {
		pt(e);
		let t = r.getQueryCache().get(e.queryHash);
		ut(e, a, t);
	}), dt(a);
	let [c] = y.useState(() => new nt(r, s, t)), [l, u, d] = c.getOptimisticResult(s, t.combine), f = !i && o;
	y.useSyncExternalStore(y.useCallback((e) => f ? c.subscribe(D.batchCalls(e)) : C, [c, f]), () => c.getCurrentResult(), () => c.getCurrentResult()), y.useEffect(() => {
		c.setQueries(s, t);
	}, [
		s,
		t,
		c
	]);
	let p = l.some((e, t) => mt(s[t], e)) ? l.flatMap((e, t) => {
		let n = s[t];
		return n && mt(n, e) ? ht(n, new We(r, n), a) : [];
	}) : [];
	if (p.length > 0) throw Promise.all(p);
	let m = l.find((e, t) => {
		let n = s[t];
		return n && ft({
			result: e,
			errorResetBoundary: a,
			throwOnError: n.throwOnError,
			query: r.getQueryCache().get(n.queryHash),
			suspense: n.suspense
		});
	});
	if (m) throw m.error;
	return u(d());
}
//#endregion
//#region node_modules/.pnpm/@tanstack+react-query@5.104.1_react@19.3.0/node_modules/@tanstack/react-query/build/modern/useBaseQuery.js
function _t(e, t, n) {
	let r = ot(), i = lt(), a = te(n), o = a.defaultQueryOptions(e), s = a.getQueryCache().get(o.queryHash), c = e.subscribed !== !1;
	o._optimisticResults = r ? "isRestoring" : c ? "optimistic" : void 0, pt(o), ut(o, i, s), dt(i);
	let [l] = y.useState(() => new t(a, o)), u = l.getOptimisticResult(o), d = !r && c;
	if (y.useSyncExternalStore(y.useCallback((e) => {
		let t = d ? l.subscribe(D.batchCalls(e)) : C;
		return l.updateResult(), t;
	}, [l, d]), () => l.getCurrentResult(), () => l.getCurrentResult()), y.useEffect(() => {
		l.setOptions(o);
	}, [o, l]), mt(o, u)) throw ht(o, l, i);
	if (ft({
		result: u,
		errorResetBoundary: i,
		throwOnError: o.throwOnError,
		query: s,
		suspense: o.suspense
	})) throw u.error;
	return o.notifyOnChangeProps ? u : l.trackResult(u);
}
//#endregion
//#region node_modules/.pnpm/@tanstack+react-query@5.104.1_react@19.3.0/node_modules/@tanstack/react-query/build/modern/useQuery.js
function O(e, t) {
	return _t(e, We, t);
}
//#endregion
//#region node_modules/.pnpm/@tanstack+react-query@5.104.1_react@19.3.0/node_modules/@tanstack/react-query/build/modern/useMutation.js
function vt(e, t) {
	let n = te(t), [r] = y.useState(() => new et(n, e));
	y.useEffect(() => {
		r.setOptions(e);
	}, [r, e]);
	let i = y.useSyncExternalStore(y.useCallback((e) => r.subscribe(D.batchCalls(e)), [r]), () => r.getCurrentResult(), () => r.getCurrentResult()), a = y.useCallback((...e) => {
		r.mutate(e[0], e[1]).catch(C);
	}, [r]);
	if (i.error && Te(r.options.throwOnError, [i.error])) throw i.error;
	return {
		...i,
		mutate: a,
		mutateAsync: i.mutate
	};
}
//#endregion
//#region src/api.ts
var yt = g();
async function k(e, t) {
	let n = await fetch(e, { signal: t });
	if (!n.ok) throw Error(n.status === 404 ? "This snapshot could not be found." : "The workspace request failed (HTTP " + n.status + ").");
	return n.json();
}
//#endregion
//#region src/comparison.ts
function bt(e, t) {
	let n = [];
	for (let [r, i] of [
		["mode", "Data mode"],
		["dataset_sha256", "Dataset fingerprint"],
		["target", "Prediction target"],
		["horizon_days", "Forecast horizon"]
	]) e[r] !== t[r] && n.push(i);
	for (let r of [
		"train",
		"calibration",
		"test"
	]) [
		"count",
		"first",
		"last"
	].some((n) => e.splits[r][n] !== t.splits[r][n]) && n.push(r + " partition");
	return n;
}
var xt = [
	[
		"average_precision",
		"Average precision",
		"Higher is better"
	],
	[
		"brier_score",
		"Brier score",
		"Lower is better"
	],
	[
		"recall_at_50",
		"Recall at 50",
		"Higher is better"
	]
];
function St(e) {
	return (e > 0 ? "+" : "") + e.toFixed(4);
}
//#endregion
//#region src/route.ts
function Ct() {
	let [e, t = ""] = location.hash.slice(1).split("?"), [n, r = ""] = e.split("/"), i = new URLSearchParams(t), a = Number(i.get("page"));
	return {
		active: n === "experiments",
		id: r,
		search: (i.get("q") || "").slice(0, 128),
		page: Number.isSafeInteger(a) && a >= 0 ? a : 0,
		selected: [...new Set((i.get("compare") || "").split(",").filter(Boolean))].slice(0, 2)
	};
}
function wt(e) {
	let t = {
		...Ct(),
		...e
	}, n = new URLSearchParams();
	t.search && n.set("q", t.search), t.page && n.set("page", String(t.page)), t.selected.length && n.set("compare", t.selected.join(",")), location.hash = "experiments" + (t.id ? "/" + t.id : "") + (n.size ? "?" + n : "");
}
//#endregion
//#region src/Lab.tsx
var Tt = {
	average_precision: "Average precision",
	brier_score: "Brier score",
	recall_at_50: "Recall at 50"
}, Et = (e) => (e * 100).toFixed(1) + "%";
function Dt() {
	let [e, t = ""] = location.hash.slice(1).split("?")[0].split("/");
	return {
		view: e,
		id: t
	};
}
function Ot() {
	let [e, t] = (0, y.useState)(Dt);
	return (0, y.useEffect)(() => {
		let e = () => t(Dt());
		return window.addEventListener("hashchange", e), window.addEventListener("signalrank:view", e), () => {
			window.removeEventListener("hashchange", e), window.removeEventListener("signalrank:view", e);
		};
	}, []), e;
}
function A({ label: e, children: t }) {
	return /* @__PURE__ */ (0, b.jsx)("div", {
		className: "table-wrap lab-table",
		role: "region",
		"aria-label": e + ", scroll horizontally if needed",
		tabIndex: 0,
		children: t
	});
}
function kt({ text: e = "Loading model evidence…" }) {
	return /* @__PURE__ */ (0, b.jsx)("p", {
		role: "status",
		className: "experiment-empty",
		children: e
	});
}
function j({ error: e, retry: t }) {
	return /* @__PURE__ */ (0, b.jsxs)("div", {
		role: "alert",
		className: "experiment-error",
		children: [/* @__PURE__ */ (0, b.jsxs)("div", { children: [/* @__PURE__ */ (0, b.jsx)("strong", { children: "Unable to load this evidence" }), /* @__PURE__ */ (0, b.jsx)("p", { children: e.message })] }), /* @__PURE__ */ (0, b.jsx)("button", {
			className: "button",
			onClick: t,
			children: "Try again"
		})]
	});
}
function At({ label: e, value: t, note: n }) {
	return /* @__PURE__ */ (0, b.jsxs)("div", {
		className: "metric",
		children: [
			/* @__PURE__ */ (0, b.jsx)("span", {
				className: "metric-label",
				children: e
			}),
			/* @__PURE__ */ (0, b.jsx)("strong", {
				className: "metric-value",
				children: t
			}),
			/* @__PURE__ */ (0, b.jsx)("span", {
				className: "metric-note",
				children: n
			})
		]
	});
}
function jt({ value: e }) {
	return /* @__PURE__ */ (0, b.jsxs)("div", {
		className: "interval-evidence",
		children: [e.status === "unavailable" ? /* @__PURE__ */ (0, b.jsxs)("p", {
			className: "notice subtle",
			children: ["Intervals unavailable: ", e.reason]
		}) : /* @__PURE__ */ (0, b.jsxs)(b.Fragment, { children: [/* @__PURE__ */ (0, b.jsx)("div", {
			className: "interval-grid",
			children: e.metrics.map((e) => /* @__PURE__ */ (0, b.jsxs)("div", { children: [
				/* @__PURE__ */ (0, b.jsxs)("span", {
					className: "caption",
					children: [Tt[e.metric] ?? e.metric, " · B − A"]
				}),
				/* @__PURE__ */ (0, b.jsx)("strong", { children: St(e.delta_b_minus_a) }),
				/* @__PURE__ */ (0, b.jsxs)("span", {
					className: "interval-range",
					children: [
						"[",
						St(e.lower),
						", ",
						St(e.upper),
						"]"
					]
				}),
				/* @__PURE__ */ (0, b.jsx)("small", { children: "Exploratory 95% percentile interval" })
			] }, e.metric))
		}), /* @__PURE__ */ (0, b.jsxs)("p", {
			className: "caption",
			children: [
				e.valid_repetitions,
				" valid paired resamples · ",
				e.block_days,
				"-day moving blocks · fixed fitted models."
			]
		})] }), /* @__PURE__ */ (0, b.jsx)("p", {
			className: "caption",
			children: e.warning
		})]
	});
}
function Mt({ a: e, b: t }) {
	let n = O({
		queryKey: [
			"uncertainty",
			e,
			t
		],
		queryFn: ({ signal: n }) => k("/api/comparison?" + new URLSearchParams({
			a: e,
			b: t
		}), n),
		staleTime: Infinity
	});
	return /* @__PURE__ */ (0, b.jsxs)("details", {
		className: "provenance-details",
		open: !0,
		children: [/* @__PURE__ */ (0, b.jsx)("summary", { children: "How uncertain is this difference?" }), n.error ? /* @__PURE__ */ (0, b.jsx)(j, {
			error: n.error,
			retry: () => void n.refetch()
		}) : n.data ? /* @__PURE__ */ (0, b.jsxs)(b.Fragment, { children: [/* @__PURE__ */ (0, b.jsx)(jt, { value: n.data }), /* @__PURE__ */ (0, b.jsx)("a", {
			className: "text-button",
			href: "/api/comparison?" + new URLSearchParams({
				a: e,
				b: t
			}),
			download: "signalrank-uncertainty.json",
			children: "Export interval evidence →"
		})] }) : /* @__PURE__ */ (0, b.jsx)(kt, { text: "Resampling paired 30-day blocks…" })]
	});
}
function Nt({ raw: e, calibrated: t }) {
	let n = [[
		"Raw",
		e,
		"var(--muted)"
	], [
		"Calibrated",
		t,
		"var(--accent)"
	]];
	return /* @__PURE__ */ (0, b.jsxs)("article", {
		className: "panel",
		children: [
			/* @__PURE__ */ (0, b.jsxs)("div", {
				className: "panel-head",
				children: [/* @__PURE__ */ (0, b.jsx)("h2", { children: "Calibration, before and after" }), /* @__PURE__ */ (0, b.jsx)("span", {
					className: "caption",
					children: "Same held-out cohort"
				})]
			}),
			/* @__PURE__ */ (0, b.jsxs)("div", {
				className: "calibration-layout",
				children: [/* @__PURE__ */ (0, b.jsxs)("div", { children: [
					/* @__PURE__ */ (0, b.jsxs)("svg", {
						viewBox: "0 0 460 280",
						role: "img",
						"aria-label": "Raw and calibrated mean probability versus observed positive rate. Dashed diagonal marks perfect calibration; points represent nonempty bins.",
						children: [
							/* @__PURE__ */ (0, b.jsx)("line", {
								x1: "48",
								y1: "236",
								x2: "430",
								y2: "24",
								stroke: "var(--muted)",
								strokeDasharray: "5 5"
							}),
							/* @__PURE__ */ (0, b.jsx)("path", {
								d: "M48 24V236H430",
								fill: "none",
								stroke: "var(--line)"
							}),
							[
								0,
								.25,
								.5,
								.75,
								1
							].map((e) => /* @__PURE__ */ (0, b.jsxs)("g", { children: [/* @__PURE__ */ (0, b.jsx)("text", {
								x: 48 + e * 382,
								y: "253",
								textAnchor: "middle",
								children: e
							}), /* @__PURE__ */ (0, b.jsx)("text", {
								x: "35",
								y: 240 - e * 212,
								textAnchor: "end",
								children: e
							})] }, e)),
							n.map(([e, t, n]) => t.filter((e) => e.count && e.predicted !== null && e.observed !== null).map((t) => /* @__PURE__ */ (0, b.jsx)("circle", {
								cx: 48 + t.predicted * 382,
								cy: 236 - t.observed * 212,
								r: Math.min(10, 3 + Math.log2(t.count + 1) / 2),
								fill: n,
								fillOpacity: ".75",
								children: /* @__PURE__ */ (0, b.jsxs)("title", { children: [
									e,
									": ",
									t.count,
									" records; forecast ",
									Et(t.predicted),
									"; observed ",
									Et(t.observed)
								] })
							}, e + t.lower))),
							/* @__PURE__ */ (0, b.jsx)("text", {
								x: "239",
								y: "276",
								textAnchor: "middle",
								children: "Mean predicted probability"
							})
						]
					}),
					/* @__PURE__ */ (0, b.jsxs)("div", {
						className: "plot-key",
						children: [
							/* @__PURE__ */ (0, b.jsx)("span", { children: "● Raw" }),
							/* @__PURE__ */ (0, b.jsx)("span", { children: "● Calibrated" }),
							/* @__PURE__ */ (0, b.jsx)("span", { children: "Dashed: ideal calibration" })
						]
					}),
					/* @__PURE__ */ (0, b.jsx)("p", {
						className: "caption",
						children: "Vertical axis: observed positive rate. Dot size reflects bin count; empty bins have no point. This is not a significance test."
					})
				] }), /* @__PURE__ */ (0, b.jsxs)("div", {
					className: "calibration-note",
					children: [
						/* @__PURE__ */ (0, b.jsx)("span", {
							className: "overline",
							children: "READ THE SUPPORT"
						}),
						/* @__PURE__ */ (0, b.jsx)("h3", { children: "Small bins can look convincing." }),
						/* @__PURE__ */ (0, b.jsx)("p", { children: "Check the record counts before interpreting a dot. A lower Brier score alone does not prove improved calibration." }),
						/* @__PURE__ */ (0, b.jsx)("p", {
							className: "caption",
							children: "Calibration is fitted on the earlier calibration partition, never these evaluation outcomes."
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, b.jsx)(A, {
				label: "Calibration bin support",
				children: /* @__PURE__ */ (0, b.jsxs)("table", { children: [/* @__PURE__ */ (0, b.jsx)("thead", { children: /* @__PURE__ */ (0, b.jsxs)("tr", { children: [
					/* @__PURE__ */ (0, b.jsx)("th", { children: "Bin" }),
					/* @__PURE__ */ (0, b.jsx)("th", {
						className: "numeric",
						children: "Raw n"
					}),
					/* @__PURE__ */ (0, b.jsx)("th", {
						className: "numeric",
						children: "Raw forecast / observed"
					}),
					/* @__PURE__ */ (0, b.jsx)("th", {
						className: "numeric",
						children: "Calibrated n"
					}),
					/* @__PURE__ */ (0, b.jsx)("th", {
						className: "numeric",
						children: "Calibrated forecast / observed"
					})
				] }) }), /* @__PURE__ */ (0, b.jsx)("tbody", { children: e.map((e, n) => /* @__PURE__ */ (0, b.jsxs)("tr", { children: [
					/* @__PURE__ */ (0, b.jsxs)("td", { children: [
						Et(e.lower),
						"–",
						Et(e.upper)
					] }),
					/* @__PURE__ */ (0, b.jsx)("td", {
						className: "numeric",
						children: e.count
					}),
					/* @__PURE__ */ (0, b.jsx)("td", {
						className: "numeric",
						children: e.predicted === null ? "No support" : Et(e.predicted) + " / " + Et(e.observed)
					}),
					/* @__PURE__ */ (0, b.jsx)("td", {
						className: "numeric",
						children: t[n].count
					}),
					/* @__PURE__ */ (0, b.jsx)("td", {
						className: "numeric",
						children: t[n].predicted === null ? "No support" : Et(t[n].predicted) + " / " + Et(t[n].observed)
					})
				] }, e.lower)) })] })
			})
		]
	});
}
function Pt({ active: e }) {
	let t = O({
		queryKey: ["benchmark"],
		queryFn: ({ signal: e }) => k("/api/benchmark", e),
		enabled: e
	}), [n, r] = (0, y.useState)("calibrated");
	return /* @__PURE__ */ (0, b.jsxs)("article", {
		className: "panel",
		children: [/* @__PURE__ */ (0, b.jsxs)("div", {
			className: "panel-head",
			children: [/* @__PURE__ */ (0, b.jsxs)("div", { children: [/* @__PURE__ */ (0, b.jsx)("p", {
				className: "overline",
				children: "FIXED / NO WINNER SELECTION"
			}), /* @__PURE__ */ (0, b.jsx)("h2", { children: "Architecture benchmark" })] }), /* @__PURE__ */ (0, b.jsxs)("label", { children: ["Probability variant", /* @__PURE__ */ (0, b.jsxs)("select", {
				value: n,
				onChange: (e) => r(e.target.value),
				children: [/* @__PURE__ */ (0, b.jsx)("option", {
					value: "calibrated",
					children: "Calibrated"
				}), /* @__PURE__ */ (0, b.jsx)("option", {
					value: "raw",
					children: "Raw"
				})]
			})] })]
		}), t.error ? /* @__PURE__ */ (0, b.jsx)(j, {
			error: t.error,
			retry: () => void t.refetch()
		}) : t.data ? t.data.items.length ? /* @__PURE__ */ (0, b.jsxs)(b.Fragment, { children: [
			/* @__PURE__ */ (0, b.jsx)(A, {
				label: "Fixed model benchmark",
				children: /* @__PURE__ */ (0, b.jsxs)("table", { children: [/* @__PURE__ */ (0, b.jsx)("thead", { children: /* @__PURE__ */ (0, b.jsxs)("tr", { children: [
					/* @__PURE__ */ (0, b.jsx)("th", { children: "Candidate / inputs" }),
					/* @__PURE__ */ (0, b.jsx)("th", {
						className: "numeric",
						children: "AP ↑"
					}),
					/* @__PURE__ */ (0, b.jsx)("th", {
						className: "numeric",
						children: "Brier ↓"
					}),
					/* @__PURE__ */ (0, b.jsx)("th", {
						className: "numeric",
						children: "Recall@50 ↑"
					}),
					/* @__PURE__ */ (0, b.jsx)("th", {
						className: "numeric",
						children: "Fit / calibration"
					}),
					/* @__PURE__ */ (0, b.jsx)("th", {
						className: "numeric",
						children: "Batch inference"
					})
				] }) }), /* @__PURE__ */ (0, b.jsx)("tbody", { children: t.data.items.map((e) => /* @__PURE__ */ (0, b.jsxs)("tr", { children: [
					/* @__PURE__ */ (0, b.jsxs)("td", { children: [/* @__PURE__ */ (0, b.jsx)("strong", { children: e.name }), /* @__PURE__ */ (0, b.jsx)("span", {
						className: "caption",
						children: e.features.join(" · ")
					})] }),
					/* @__PURE__ */ (0, b.jsx)("td", {
						className: "numeric",
						children: e[n].average_precision.toFixed(4)
					}),
					/* @__PURE__ */ (0, b.jsx)("td", {
						className: "numeric",
						children: e[n].brier_score.toFixed(4)
					}),
					/* @__PURE__ */ (0, b.jsx)("td", {
						className: "numeric",
						children: Et(e[n].recall_at_50)
					}),
					/* @__PURE__ */ (0, b.jsxs)("td", {
						className: "numeric",
						children: [
							e.fit_seconds.toFixed(3),
							"s / ",
							e.calibration_seconds === null ? "included" : e.calibration_seconds.toFixed(3) + "s"
						]
					}),
					/* @__PURE__ */ (0, b.jsxs)("td", {
						className: "numeric",
						children: [
							e.inference_ms.toFixed(2),
							"ms",
							/* @__PURE__ */ (0, b.jsxs)("span", {
								className: "caption",
								children: [e.inference_records, " records"]
							})
						]
					})
				] }, e.name)) })] })
			}),
			/* @__PURE__ */ (0, b.jsxs)("p", {
				className: "caption",
				children: [
					"Training-prevalence baseline: AP ",
					t.data.training_prevalence?.average_precision.toFixed(4),
					" · Brier ",
					t.data.training_prevalence?.brier_score.toFixed(4),
					"."
				]
			}),
			/* @__PURE__ */ (0, b.jsxs)("details", {
				className: "provenance-details",
				children: [
					/* @__PURE__ */ (0, b.jsx)("summary", { children: "Prespecified parameters and timing scope" }),
					/* @__PURE__ */ (0, b.jsx)("pre", { children: JSON.stringify(t.data.items.map(({ name: e, parameters: t }) => ({
						name: e,
						parameters: t
					})), null, 2) }),
					/* @__PURE__ */ (0, b.jsx)("p", {
						className: "caption",
						children: t.data.warning
					})
				]
			}),
			t.data.contrast && /* @__PURE__ */ (0, b.jsxs)(b.Fragment, { children: [
				/* @__PURE__ */ (0, b.jsx)("h3", { children: "Controlled contrast: structured inputs only" }),
				/* @__PURE__ */ (0, b.jsxs)("p", {
					className: "caption",
					children: [
						"A: ",
						t.data.contrast.a,
						" · B: ",
						t.data.contrast.b,
						" · calibrated probabilities"
					]
				}),
				/* @__PURE__ */ (0, b.jsx)(jt, { value: t.data.contrast })
			] }),
			/* @__PURE__ */ (0, b.jsx)("a", {
				className: "text-button",
				href: "/api/benchmark",
				download: "signalrank-benchmark.json",
				children: "Export complete benchmark →"
			})
		] }) : /* @__PURE__ */ (0, b.jsx)("p", {
			className: "notice subtle",
			children: t.data.warning
		}) : /* @__PURE__ */ (0, b.jsx)(kt, {})]
	});
}
function Ft() {
	let e = Ot(), t = O({
		queryKey: ["diagnostics"],
		queryFn: ({ signal: e }) => k("/api/diagnostics", e),
		enabled: e.view === "diagnostics"
	}), [n, r] = (0, y.useState)("Severity"), [i, a] = (0, y.useState)("all");
	if (t.error) return /* @__PURE__ */ (0, b.jsx)(j, {
		error: t.error,
		retry: () => void t.refetch()
	});
	if (!t.data) return /* @__PURE__ */ (0, b.jsx)(kt, {});
	let o = t.data;
	return /* @__PURE__ */ (0, b.jsxs)("div", {
		className: "lab-workspace",
		children: [
			/* @__PURE__ */ (0, b.jsxs)("div", {
				className: "lab-intro",
				children: [
					/* @__PURE__ */ (0, b.jsx)("span", {
						className: "badge warning",
						children: "SYNTHETIC / EXPLORATORY"
					}),
					/* @__PURE__ */ (0, b.jsx)("p", { children: "Inspect the failures. Check the support. Keep the context." }),
					/* @__PURE__ */ (0, b.jsx)("a", {
						href: "#experiments/" + o.snapshot_id,
						children: "Snapshot provenance →"
					})
				]
			}),
			/* @__PURE__ */ (0, b.jsxs)("div", {
				className: "metrics lab-metrics",
				children: [
					/* @__PURE__ */ (0, b.jsx)(At, {
						label: "Evaluation records",
						value: o.population,
						note: o.positives + " observed positives"
					}),
					/* @__PURE__ */ (0, b.jsx)(At, {
						label: "Captured positives",
						value: o.captured,
						note: "Global review budget: " + o.budget
					}),
					/* @__PURE__ */ (0, b.jsx)(At, {
						label: "Selected negatives",
						value: o.selected_negatives,
						note: "Negative outcomes inside the review budget"
					}),
					/* @__PURE__ */ (0, b.jsx)(At, {
						label: "Missed positives",
						value: o.missed_positives,
						note: "Positive outcomes outside the review budget"
					})
				]
			}),
			/* @__PURE__ */ (0, b.jsxs)("article", {
				className: "panel",
				children: [
					/* @__PURE__ */ (0, b.jsxs)("div", {
						className: "panel-head",
						children: [/* @__PURE__ */ (0, b.jsxs)("div", { children: [/* @__PURE__ */ (0, b.jsx)("p", {
							className: "overline",
							children: "WHERE / SUBGROUP PERFORMANCE"
						}), /* @__PURE__ */ (0, b.jsx)("h2", { children: "Slice explorer" })] }), /* @__PURE__ */ (0, b.jsxs)("label", { children: ["Group by", /* @__PURE__ */ (0, b.jsx)("select", {
							value: n,
							onChange: (e) => r(e.target.value),
							children: [
								"Severity",
								"Period",
								"Description category",
								"Remote"
							].map((e) => /* @__PURE__ */ (0, b.jsx)("option", { children: e }, e))
						})] })]
					}),
					/* @__PURE__ */ (0, b.jsx)("p", {
						className: "caption",
						children: o.scope
					}),
					/* @__PURE__ */ (0, b.jsx)(A, {
						label: "Diagnostic slices",
						children: /* @__PURE__ */ (0, b.jsxs)("table", { children: [/* @__PURE__ */ (0, b.jsx)("thead", { children: /* @__PURE__ */ (0, b.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, b.jsx)("th", { children: "Group / evidence" }),
							/* @__PURE__ */ (0, b.jsx)("th", {
								className: "numeric",
								children: "n / positives"
							}),
							/* @__PURE__ */ (0, b.jsx)("th", {
								className: "numeric",
								children: "AP ↑"
							}),
							/* @__PURE__ */ (0, b.jsx)("th", {
								className: "numeric",
								children: "Brier ↓"
							}),
							/* @__PURE__ */ (0, b.jsx)("th", {
								className: "numeric",
								children: "Selected / captured"
							}),
							/* @__PURE__ */ (0, b.jsx)("th", {
								className: "numeric",
								children: "Global-budget recall"
							})
						] }) }), /* @__PURE__ */ (0, b.jsx)("tbody", { children: o.slices.filter((e) => e.dimension === n).map((e) => /* @__PURE__ */ (0, b.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, b.jsxs)("td", { children: [e.group, /* @__PURE__ */ (0, b.jsx)("span", {
								className: "caption " + (e.metrics ? "" : "slice-unavailable"),
								children: e.status
							})] }),
							/* @__PURE__ */ (0, b.jsxs)("td", {
								className: "numeric",
								children: [
									e.count,
									" / ",
									e.positives
								]
							}),
							/* @__PURE__ */ (0, b.jsx)("td", {
								className: "numeric",
								children: e.metrics?.average_precision.toFixed(4) ?? "Unavailable"
							}),
							/* @__PURE__ */ (0, b.jsx)("td", {
								className: "numeric",
								children: e.metrics?.brier_score.toFixed(4) ?? "Unavailable"
							}),
							/* @__PURE__ */ (0, b.jsxs)("td", {
								className: "numeric",
								children: [
									e.selected,
									" / ",
									e.captured
								]
							}),
							/* @__PURE__ */ (0, b.jsx)("td", {
								className: "numeric",
								children: e.global_budget_recall === null ? "Unavailable" : Et(e.global_budget_recall)
							})
						] }, e.group)) })] })
					}),
					/* @__PURE__ */ (0, b.jsx)("p", {
						className: "caption",
						children: o.display_gate
					}),
					/* @__PURE__ */ (0, b.jsxs)("details", {
						className: "provenance-details",
						children: [
							/* @__PURE__ */ (0, b.jsx)("summary", { children: "Missing-feature accounting" }),
							/* @__PURE__ */ (0, b.jsx)("p", {
								className: "caption",
								children: "The original generator has no missing inputs. We do not fabricate a missing-data subgroup."
							}),
							o.missingness.map((e) => /* @__PURE__ */ (0, b.jsxs)("p", {
								className: "caption",
								children: [
									e.feature,
									": ",
									e.missing,
									" missing"
								]
							}, e.feature))
						]
					})
				]
			}),
			/* @__PURE__ */ (0, b.jsxs)("article", {
				className: "panel",
				children: [
					/* @__PURE__ */ (0, b.jsxs)("div", {
						className: "panel-head",
						children: [/* @__PURE__ */ (0, b.jsxs)("div", { children: [/* @__PURE__ */ (0, b.jsx)("p", {
							className: "overline",
							children: "WHY / RECORD-LEVEL FACTORS"
						}), /* @__PURE__ */ (0, b.jsx)("h2", { children: "Error inspection" })] }), /* @__PURE__ */ (0, b.jsxs)("label", { children: ["Example type", /* @__PURE__ */ (0, b.jsxs)("select", {
							value: i,
							onChange: (e) => a(e.target.value),
							children: [
								/* @__PURE__ */ (0, b.jsx)("option", {
									value: "all",
									children: "Both types"
								}),
								/* @__PURE__ */ (0, b.jsx)("option", { children: "selected negative" }),
								/* @__PURE__ */ (0, b.jsx)("option", { children: "missed positive" })
							]
						})] })]
					}),
					/* @__PURE__ */ (0, b.jsx)("p", {
						className: "caption",
						children: "Up to 12 highest-scored examples of each type; not the full error population. These are ranking-budget errors, not classifications at a probability threshold."
					}),
					/* @__PURE__ */ (0, b.jsx)(A, {
						label: "Error inspection examples",
						children: /* @__PURE__ */ (0, b.jsxs)("table", { children: [/* @__PURE__ */ (0, b.jsx)("thead", { children: /* @__PURE__ */ (0, b.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, b.jsx)("th", { children: "Record / category" }),
							/* @__PURE__ */ (0, b.jsx)("th", { children: "Error type" }),
							/* @__PURE__ */ (0, b.jsx)("th", {
								className: "numeric",
								children: "Rank"
							}),
							/* @__PURE__ */ (0, b.jsx)("th", {
								className: "numeric",
								children: "Forecast"
							}),
							/* @__PURE__ */ (0, b.jsx)("th", { children: "Linear factors" })
						] }) }), /* @__PURE__ */ (0, b.jsx)("tbody", { children: o.examples.filter((e) => i === "all" || e.kind === i).map((e) => /* @__PURE__ */ (0, b.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, b.jsxs)("td", { children: [/* @__PURE__ */ (0, b.jsx)("code", { children: e.id }), /* @__PURE__ */ (0, b.jsx)("span", {
								className: "caption",
								children: e.description
							})] }),
							/* @__PURE__ */ (0, b.jsx)("td", { children: /* @__PURE__ */ (0, b.jsx)("span", {
								className: "badge warning",
								children: e.kind
							}) }),
							/* @__PURE__ */ (0, b.jsx)("td", {
								className: "numeric",
								children: e.rank
							}),
							/* @__PURE__ */ (0, b.jsx)("td", {
								className: "numeric",
								children: Et(e.probability)
							}),
							/* @__PURE__ */ (0, b.jsx)("td", { children: /* @__PURE__ */ (0, b.jsxs)("details", { children: [/* @__PURE__ */ (0, b.jsx)("summary", { children: "Inspect factors" }), /* @__PURE__ */ (0, b.jsx)("ul", {
								className: "factor-list",
								children: e.contributions.map((e) => /* @__PURE__ */ (0, b.jsxs)("li", { children: [/* @__PURE__ */ (0, b.jsx)("code", { children: e.feature }), /* @__PURE__ */ (0, b.jsx)("span", { children: St(e.value) })] }, e.feature))
							})] }) })
						] }, e.id)) })] })
					}),
					!o.examples.filter((e) => i === "all" || e.kind === i).length && /* @__PURE__ */ (0, b.jsx)(kt, { text: "No examples of this type in the cohort." }),
					/* @__PURE__ */ (0, b.jsx)("p", {
						className: "caption",
						children: "Factors are exact base-linear-model log-odds contributions, not causal explanations or contributions to the calibrated probability."
					})
				]
			}),
			/* @__PURE__ */ (0, b.jsx)(Nt, { ...o.calibration }),
			/* @__PURE__ */ (0, b.jsx)(Pt, { active: e.view === "diagnostics" }),
			/* @__PURE__ */ (0, b.jsx)("p", {
				className: "caption",
				children: o.warning
			})
		]
	});
}
async function It(e) {
	let t = await fetch("/api/batches", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(e)
	});
	if (!t.ok) {
		let e = await t.json().catch(() => ({ detail: "Request failed" })), n = Array.isArray(e.detail) ? e.detail.slice(0, 6).map((e) => e.loc.join(".") + ": " + e.msg).join("; ") : String(e.detail);
		throw Error("Batch not saved (HTTP " + t.status + "). " + n);
	}
	return t.json();
}
function Lt({ value: e }) {
	(0, y.useEffect)(() => {
		let e = document.querySelector("#inference .batch-result h2");
		e && (e.tabIndex = -1, e.focus());
	}, [e.id]);
	let [t, n] = (0, y.useState)(0), [r, i] = (0, y.useState)(""), a = e.items.filter((e) => (e.id + " " + e.description).toLowerCase().includes(r.toLowerCase()));
	return (0, y.useEffect)(() => {
		n(0), i("");
	}, [e.id]), /* @__PURE__ */ (0, b.jsxs)("article", {
		className: "panel batch-result",
		children: [
			/* @__PURE__ */ (0, b.jsxs)("div", {
				className: "panel-head",
				children: [/* @__PURE__ */ (0, b.jsxs)("div", { children: [/* @__PURE__ */ (0, b.jsxs)("p", {
					className: "overline",
					children: ["RECEIPT / ", e.id.slice(0, 12)]
				}), /* @__PURE__ */ (0, b.jsx)("h2", { children: "Saved batch predictions" })] }), /* @__PURE__ */ (0, b.jsx)("a", {
					className: "button",
					href: "/api/batches/" + e.id,
					download: "signalrank-batch.json",
					children: "Export receipt"
				})]
			}),
			/* @__PURE__ */ (0, b.jsxs)("p", { children: [
				e.count,
				" fictional records · ",
				new Date(e.created_at).toLocaleString()
			] }),
			e.input_contract && /* @__PURE__ */ (0, b.jsxs)("p", {
				className: "notice subtle",
				children: [
					"Input contract: ",
					e.input_contract.schema_version,
					" · Dataset version: ",
					e.input_contract.dataset_version || "not supplied",
					" · ",
					e.input_contract.versioning,
					". ",
					e.input_contract.warnings.join(" ")
				]
			}),
			/* @__PURE__ */ (0, b.jsxs)("div", {
				className: "batch-lineage",
				children: [
					/* @__PURE__ */ (0, b.jsxs)("div", { children: [
						/* @__PURE__ */ (0, b.jsx)("span", {
							className: "caption",
							children: "Model version"
						}),
						/* @__PURE__ */ (0, b.jsx)("code", { children: e.model.artifact_id.slice(0, 16) }),
						/* @__PURE__ */ (0, b.jsxs)("span", {
							className: "caption",
							children: [
								"Seed ",
								e.model.configuration.seed,
								" · C ",
								e.model.configuration.regularization_c
							]
						})
					] }),
					/* @__PURE__ */ (0, b.jsx)("span", {
						"aria-hidden": "true",
						children: "→"
					}),
					/* @__PURE__ */ (0, b.jsxs)("div", { children: [/* @__PURE__ */ (0, b.jsx)("span", {
						className: "caption",
						children: "Input SHA-256"
					}), /* @__PURE__ */ (0, b.jsx)("code", { children: e.input_sha256.slice(0, 16) })] }),
					/* @__PURE__ */ (0, b.jsx)("span", {
						"aria-hidden": "true",
						children: "→"
					}),
					/* @__PURE__ */ (0, b.jsxs)("div", { children: [/* @__PURE__ */ (0, b.jsx)("span", {
						className: "caption",
						children: "Prediction receipt"
					}), /* @__PURE__ */ (0, b.jsx)("code", { children: e.receipt_sha256.slice(0, 16) })] })
				]
			}),
			/* @__PURE__ */ (0, b.jsxs)("div", {
				className: "filters",
				children: [/* @__PURE__ */ (0, b.jsxs)("label", { children: ["Search this batch", /* @__PURE__ */ (0, b.jsx)("input", {
					type: "search",
					value: r,
					onChange: (e) => {
						i(e.target.value), n(0);
					}
				})] }), /* @__PURE__ */ (0, b.jsxs)("span", {
					className: "caption",
					role: "status",
					children: [a.length, " matching predictions"]
				})]
			}),
			/* @__PURE__ */ (0, b.jsx)(A, {
				label: "Saved batch predictions",
				children: /* @__PURE__ */ (0, b.jsxs)("table", { children: [/* @__PURE__ */ (0, b.jsx)("thead", { children: /* @__PURE__ */ (0, b.jsxs)("tr", { children: [
					/* @__PURE__ */ (0, b.jsx)("th", { children: "Rank" }),
					/* @__PURE__ */ (0, b.jsx)("th", { children: "Identifier / fictional category" }),
					/* @__PURE__ */ (0, b.jsx)("th", {
						className: "numeric",
						children: "Severity"
					}),
					/* @__PURE__ */ (0, b.jsx)("th", { children: "Remote / auth required" }),
					/* @__PURE__ */ (0, b.jsx)("th", {
						className: "numeric",
						children: "Forecast"
					})
				] }) }), /* @__PURE__ */ (0, b.jsx)("tbody", { children: a.slice(t * 15, (t + 1) * 15).map((e) => /* @__PURE__ */ (0, b.jsxs)("tr", { children: [
					/* @__PURE__ */ (0, b.jsx)("td", { children: e.rank }),
					/* @__PURE__ */ (0, b.jsxs)("td", { children: [/* @__PURE__ */ (0, b.jsx)("code", { children: e.id }), /* @__PURE__ */ (0, b.jsx)("span", {
						className: "caption",
						children: e.description
					})] }),
					/* @__PURE__ */ (0, b.jsx)("td", {
						className: "numeric",
						children: e.severity
					}),
					/* @__PURE__ */ (0, b.jsxs)("td", { children: [
						e.remote ? "Yes" : "No",
						" / ",
						e.authentication_required ? "Yes" : "No"
					] }),
					/* @__PURE__ */ (0, b.jsx)("td", {
						className: "numeric",
						children: Et(e.probability)
					})
				] }, e.id)) })] })
			}),
			!a.length && /* @__PURE__ */ (0, b.jsx)(kt, { text: "No predictions match this search." }),
			/* @__PURE__ */ (0, b.jsxs)("div", {
				className: "pagination",
				children: [
					/* @__PURE__ */ (0, b.jsx)("button", {
						className: "button",
						disabled: !t,
						onClick: () => n(t - 1),
						children: "Previous predictions"
					}),
					/* @__PURE__ */ (0, b.jsxs)("span", {
						className: "caption",
						children: [
							"Page ",
							t + 1,
							" of ",
							Math.max(1, Math.ceil(a.length / 15))
						]
					}),
					/* @__PURE__ */ (0, b.jsx)("button", {
						className: "button",
						disabled: (t + 1) * 15 >= a.length,
						onClick: () => n(t + 1),
						children: "Next predictions"
					})
				]
			}),
			/* @__PURE__ */ (0, b.jsxs)("details", {
				className: "provenance-details",
				children: [
					/* @__PURE__ */ (0, b.jsx)("summary", { children: "Full model and receipt provenance" }),
					/* @__PURE__ */ (0, b.jsxs)("dl", {
						className: "evidence-facts",
						children: [
							/* @__PURE__ */ (0, b.jsx)("dt", { children: "Artifact ID" }),
							/* @__PURE__ */ (0, b.jsx)("dd", { children: e.model.artifact_id }),
							/* @__PURE__ */ (0, b.jsx)("dt", { children: "Training run ID" }),
							/* @__PURE__ */ (0, b.jsx)("dd", { children: e.model.run_id }),
							/* @__PURE__ */ (0, b.jsx)("dt", { children: "Training dataset SHA-256" }),
							/* @__PURE__ */ (0, b.jsx)("dd", { children: e.model.dataset_sha256 }),
							/* @__PURE__ */ (0, b.jsx)("dt", { children: "Input SHA-256" }),
							/* @__PURE__ */ (0, b.jsx)("dd", { children: e.input_sha256 }),
							/* @__PURE__ */ (0, b.jsx)("dt", { children: "Receipt SHA-256" }),
							/* @__PURE__ */ (0, b.jsx)("dd", { children: e.receipt_sha256 }),
							/* @__PURE__ */ (0, b.jsx)("dt", { children: "Target" }),
							/* @__PURE__ */ (0, b.jsx)("dd", { children: e.target })
						]
					}),
					/* @__PURE__ */ (0, b.jsx)("pre", { children: JSON.stringify({
						runtime: e.model.runtime,
						code_sha256: e.model.code_sha256,
						input_contract: e.input_contract
					}, null, 2) })
				]
			}),
			/* @__PURE__ */ (0, b.jsx)("p", {
				className: "caption",
				children: e.warning
			})
		]
	});
}
function Rt() {
	let e = Ot(), t = e.view === "inference", n = te(), r = O({
		queryKey: ["inference-models"],
		queryFn: ({ signal: e }) => k("/api/inference/models", e),
		enabled: t
	}), [i, a] = (0, y.useState)(""), [o, s] = (0, y.useState)(""), [c, l] = (0, y.useState)(""), [u, d] = (0, y.useState)(0), f = (0, y.useRef)(!1), p = O({
		queryKey: ["inference-sample"],
		queryFn: ({ signal: e }) => k("/api/inference/sample", e),
		enabled: t
	}), m = O({
		queryKey: ["batches", u],
		queryFn: ({ signal: e }) => k("/api/batches?limit=10&offset=" + u * 10, e),
		enabled: t
	}), h = O({
		queryKey: ["batch", e.id],
		queryFn: ({ signal: t }) => k("/api/batches/" + encodeURIComponent(e.id), t),
		enabled: t && !!e.id,
		staleTime: Infinity
	}), g = i || r.data?.items[0]?.artifact_id || "";
	(0, y.useEffect)(() => {
		p.data && !f.current && (s(JSON.stringify(p.data, null, 2)), f.current = !0);
	}, [p.data]);
	let _ = vt({
		mutationFn: It,
		retry: !1,
		onSuccess: (e) => {
			n.setQueryData(["batch", e.id], e), n.invalidateQueries({ queryKey: ["batches"] }), location.hash = "inference/" + e.id;
		},
		onError: (e) => l(e.message)
	});
	function v() {
		l("");
		try {
			let e = JSON.parse(o);
			if (!e || !Array.isArray(e.records) || !e.records.length || e.records.length > 500) throw Error("Provide between 1 and 500 fictional records.");
			if (Object.keys(e).some((e) => ![
				"source",
				"records",
				"schema_version",
				"dataset_version"
			].includes(e))) throw Error("The input envelope accepts source, records, schema_version and dataset_version; model selection is separate.");
			_.mutate({
				...e,
				model_id: g
			});
		} catch (e) {
			l(e instanceof Error ? e.message : "Invalid JSON");
		}
	}
	return /* @__PURE__ */ (0, b.jsxs)("div", {
		className: "lab-workspace",
		children: [
			/* @__PURE__ */ (0, b.jsxs)("div", {
				className: "lab-intro",
				children: [/* @__PURE__ */ (0, b.jsx)("span", {
					className: "badge warning",
					children: "FICTIONAL INPUTS ONLY"
				}), /* @__PURE__ */ (0, b.jsx)("p", { children: "Use a saved model. Preserve the inputs. Inspect the receipt." })]
			}),
			/* @__PURE__ */ (0, b.jsxs)("article", {
				className: "panel batch-composer",
				children: [
					/* @__PURE__ */ (0, b.jsxs)("div", {
						className: "panel-head",
						children: [/* @__PURE__ */ (0, b.jsxs)("div", { children: [/* @__PURE__ */ (0, b.jsx)("p", {
							className: "overline",
							children: "01 / VALIDATE & PREDICT"
						}), /* @__PURE__ */ (0, b.jsx)("h2", { children: "New prediction batch" })] }), /* @__PURE__ */ (0, b.jsx)("span", {
							className: "badge",
							children: "No request-time training"
						})]
					}),
					r.error ? /* @__PURE__ */ (0, b.jsx)(j, {
						error: r.error,
						retry: () => void r.refetch()
					}) : r.data ? r.data.items.length ? /* @__PURE__ */ (0, b.jsxs)("label", { children: ["Trusted saved model", /* @__PURE__ */ (0, b.jsx)("select", {
						value: g,
						disabled: _.isPending,
						onChange: (e) => a(e.target.value),
						children: r.data.items.map((e) => /* @__PURE__ */ (0, b.jsxs)("option", {
							value: e.artifact_id,
							children: [
								"Seed ",
								e.configuration.seed,
								" · C ",
								e.configuration.regularization_c,
								" · ",
								e.artifact_id.slice(0, 12)
							]
						}, e.artifact_id))
					})] }) : /* @__PURE__ */ (0, b.jsxs)("div", {
						className: "notice subtle",
						children: [r.data.warning || "No trusted saved model is available.", " Run the local workbench for saved batches. The browser cannot load artifact paths or upload models."]
					}) : /* @__PURE__ */ (0, b.jsx)(kt, { text: "Checking explicitly trusted models…" }),
					/* @__PURE__ */ (0, b.jsxs)("div", {
						className: "input-toolbar",
						children: [/* @__PURE__ */ (0, b.jsx)("label", {
							htmlFor: "batch-input",
							children: "Fictional input JSON"
						}), /* @__PURE__ */ (0, b.jsx)("button", {
							className: "text-button",
							disabled: !p.data || _.isPending,
							onClick: () => {
								s(JSON.stringify(p.data, null, 2)), l("");
							},
							children: "Load generated example"
						})]
					}),
					p.error && /* @__PURE__ */ (0, b.jsx)(j, {
						error: p.error,
						retry: () => void p.refetch()
					}),
					/* @__PURE__ */ (0, b.jsx)("textarea", {
						id: "batch-input",
						spellCheck: !1,
						value: o,
						maxLength: 25e4,
						disabled: _.isPending,
						onChange: (e) => s(e.target.value),
						"aria-describedby": "batch-schema"
					}),
					/* @__PURE__ */ (0, b.jsx)("p", {
						id: "batch-schema",
						className: "caption",
						children: "1–500 records · SYN-BATCH identifiers · severity 1–10 · strict booleans · five original fictional description categories. Extra fields, outcome labels, external descriptions and duplicate IDs are rejected. Maximum request size: 256 KiB. Optional dataset_version names immutable inputs; choose a new version after editing. Unversioned legacy inputs remain accepted without that guarantee."
					}),
					c && /* @__PURE__ */ (0, b.jsx)("div", {
						role: "alert",
						className: "experiment-error",
						children: c
					}),
					/* @__PURE__ */ (0, b.jsxs)("div", {
						className: "batch-submit",
						children: [/* @__PURE__ */ (0, b.jsx)("button", {
							className: "button primary",
							disabled: !g || !o || _.isPending,
							onClick: v,
							children: _.isPending ? "Validating and saving…" : "Run & save predictions →"
						}), /* @__PURE__ */ (0, b.jsx)("p", {
							className: "caption",
							children: "Each successful submission creates a distinct receipt. Failed requests are not retried automatically; if a response is lost, refresh history before submitting again."
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, b.jsxs)("article", {
				className: "panel",
				children: [
					/* @__PURE__ */ (0, b.jsxs)("div", {
						className: "panel-head",
						children: [/* @__PURE__ */ (0, b.jsxs)("div", { children: [/* @__PURE__ */ (0, b.jsx)("p", {
							className: "overline",
							children: "02 / APPEND-ONLY LOCAL HISTORY"
						}), /* @__PURE__ */ (0, b.jsx)("h2", { children: "Prediction receipts" })] }), /* @__PURE__ */ (0, b.jsx)("button", {
							className: "button",
							disabled: m.isFetching,
							onClick: () => void m.refetch(),
							children: "Refresh receipts"
						})]
					}),
					m.error ? /* @__PURE__ */ (0, b.jsx)(j, {
						error: m.error,
						retry: () => void m.refetch()
					}) : m.data ? m.data.items.length ? /* @__PURE__ */ (0, b.jsx)(A, {
						label: "Prediction receipt history",
						children: /* @__PURE__ */ (0, b.jsxs)("table", { children: [/* @__PURE__ */ (0, b.jsx)("thead", { children: /* @__PURE__ */ (0, b.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, b.jsx)("th", { children: "Receipt / created" }),
							/* @__PURE__ */ (0, b.jsx)("th", { children: "Model version" }),
							/* @__PURE__ */ (0, b.jsx)("th", {
								className: "numeric",
								children: "Records"
							}),
							/* @__PURE__ */ (0, b.jsx)("th", { children: "Inputs / evidence" })
						] }) }), /* @__PURE__ */ (0, b.jsx)("tbody", { children: m.data.items.map((e) => /* @__PURE__ */ (0, b.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, b.jsxs)("td", { children: [/* @__PURE__ */ (0, b.jsx)("code", { children: e.id.slice(0, 12) }), /* @__PURE__ */ (0, b.jsx)("span", {
								className: "caption",
								children: new Date(e.created_at).toLocaleString()
							})] }),
							/* @__PURE__ */ (0, b.jsxs)("td", { children: [
								"Seed ",
								e.model.configuration.seed,
								" · C ",
								e.model.configuration.regularization_c,
								/* @__PURE__ */ (0, b.jsx)("span", {
									className: "caption",
									children: e.model.artifact_id.slice(0, 12)
								})
							] }),
							/* @__PURE__ */ (0, b.jsx)("td", {
								className: "numeric",
								children: e.count
							}),
							/* @__PURE__ */ (0, b.jsxs)("td", { children: [/* @__PURE__ */ (0, b.jsx)("code", { children: e.input_sha256.slice(0, 12) }), /* @__PURE__ */ (0, b.jsx)("button", {
								className: "row-link",
								"aria-label": "Inspect receipt " + e.id.slice(0, 12),
								onClick: () => {
									location.hash = "inference/" + e.id;
								},
								children: "Inspect →"
							})] })
						] }, e.id)) })] })
					}) : /* @__PURE__ */ (0, b.jsx)(kt, { text: u ? "This page has no receipts. Use Previous receipts." : "No batches saved yet. Run a generated example to create the first receipt." }) : /* @__PURE__ */ (0, b.jsx)(kt, { text: "Loading batch history…" }),
					/* @__PURE__ */ (0, b.jsxs)("div", {
						className: "pagination",
						children: [
							/* @__PURE__ */ (0, b.jsx)("button", {
								className: "button",
								disabled: !u,
								onClick: () => d(u - 1),
								children: "Previous receipts"
							}),
							/* @__PURE__ */ (0, b.jsxs)("span", {
								className: "caption",
								children: ["Page ", u + 1]
							}),
							/* @__PURE__ */ (0, b.jsx)("button", {
								className: "button",
								disabled: !m.data || (u + 1) * 10 >= m.data.total,
								onClick: () => d(u + 1),
								children: "Next receipts"
							})
						]
					})
				]
			}),
			e.id && (h.error ? /* @__PURE__ */ (0, b.jsx)(j, {
				error: h.error,
				retry: () => void h.refetch()
			}) : h.data ? /* @__PURE__ */ (0, b.jsx)(Lt, { value: h.data }) : /* @__PURE__ */ (0, b.jsx)(kt, { text: "Loading saved receipt…" })),
			/* @__PURE__ */ (0, b.jsx)("p", {
				className: "caption",
				children: "Local single-user workbench, not a publicly secured prediction service. Receipt hashes detect accidental changes, not malicious database rewrites. Batch inference does not establish model accuracy."
			})
		]
	});
}
//#endregion
//#region src/Experiments.tsx
function zt({ label: e, children: t }) {
	return /* @__PURE__ */ (0, b.jsx)("div", {
		className: "table-wrap",
		tabIndex: 0,
		role: "region",
		"aria-label": e + ", scroll horizontally if needed",
		children: t
	});
}
function Bt({ error: e, retry: t }) {
	return /* @__PURE__ */ (0, b.jsxs)("div", {
		className: "experiment-error",
		role: "alert",
		children: [/* @__PURE__ */ (0, b.jsxs)("div", { children: [/* @__PURE__ */ (0, b.jsx)("strong", { children: "Unable to load experiment data" }), /* @__PURE__ */ (0, b.jsx)("p", { children: e.message })] }), /* @__PURE__ */ (0, b.jsx)("button", {
			className: "button",
			onClick: t,
			children: "Try again"
		})]
	});
}
function Vt({ children: e }) {
	return /* @__PURE__ */ (0, b.jsx)("p", {
		className: "experiment-empty",
		role: "status",
		children: e
	});
}
function Ht({ left: e, right: t }) {
	let n = bt(e.report, t.report);
	function r() {
		let r = {
			snapshot_a: e.id,
			snapshot_b: t.id,
			comparable: !n.length,
			incompatibilities: n,
			metrics: xt.map(([r]) => ({
				metric: r,
				a: e.report.model[r],
				b: t.report.model[r],
				delta_b_minus_a: n.length ? null : t.report.model[r] - e.report.model[r]
			})),
			interpretation: "Descriptive synthetic development results; deltas are not statistical evidence of improvement."
		}, i = URL.createObjectURL(new Blob([JSON.stringify(r, null, 2)], { type: "application/json" })), a = document.createElement("a");
		a.href = i, a.download = "signalrank-comparison.json", a.click(), setTimeout(() => URL.revokeObjectURL(i), 1e3);
	}
	return /* @__PURE__ */ (0, b.jsxs)(b.Fragment, { children: [
		/* @__PURE__ */ (0, b.jsxs)("div", {
			className: "comparison-verdict " + (n.length ? "incompatible" : ""),
			children: [/* @__PURE__ */ (0, b.jsx)("span", {
				className: "badge warning",
				children: n.length ? "Different evaluation conditions" : "Matched evaluation conditions"
			}), /* @__PURE__ */ (0, b.jsx)("p", { children: n.length ? "Differences: " + n.join(", ") + ". Metric deltas are unavailable." : "The dataset, target, horizon and temporal partitions match. Configurations and code may differ." })]
		}),
		/* @__PURE__ */ (0, b.jsx)(zt, {
			label: "Selected experiment comparison",
			children: /* @__PURE__ */ (0, b.jsxs)("table", { children: [/* @__PURE__ */ (0, b.jsx)("thead", { children: /* @__PURE__ */ (0, b.jsxs)("tr", { children: [
				/* @__PURE__ */ (0, b.jsx)("th", { children: "Metric" }),
				/* @__PURE__ */ (0, b.jsxs)("th", {
					className: "numeric",
					children: ["A · ", e.id.slice(0, 8)]
				}),
				/* @__PURE__ */ (0, b.jsxs)("th", {
					className: "numeric",
					children: ["B · ", t.id.slice(0, 8)]
				}),
				/* @__PURE__ */ (0, b.jsx)("th", {
					className: "numeric",
					children: "B − A"
				})
			] }) }), /* @__PURE__ */ (0, b.jsx)("tbody", { children: xt.map(([r, i, a]) => /* @__PURE__ */ (0, b.jsxs)("tr", { children: [
				/* @__PURE__ */ (0, b.jsxs)("td", { children: [i, /* @__PURE__ */ (0, b.jsx)("span", {
					className: "caption",
					children: a
				})] }),
				/* @__PURE__ */ (0, b.jsx)("td", {
					className: "numeric",
					children: e.report.model[r].toFixed(4)
				}),
				/* @__PURE__ */ (0, b.jsx)("td", {
					className: "numeric",
					children: t.report.model[r].toFixed(4)
				}),
				/* @__PURE__ */ (0, b.jsx)("td", {
					className: "numeric",
					children: n.length ? "Unavailable" : St(t.report.model[r] - e.report.model[r])
				})
			] }, r)) })] })
		}),
		/* @__PURE__ */ (0, b.jsxs)("div", {
			className: "comparison-foot",
			children: [/* @__PURE__ */ (0, b.jsx)("p", {
				className: "caption",
				children: "A delta is descriptive. These explored synthetic results do not establish real-world predictive value or statistical significance."
			}), /* @__PURE__ */ (0, b.jsx)("button", {
				className: "button",
				onClick: r,
				children: "Export comparison"
			})]
		})
	] });
}
function Ut({ selected: e, active: t }) {
	let n = gt({ queries: e.map((e) => ({
		queryKey: ["snapshot", e],
		queryFn: ({ signal: t }) => k("/api/experiments/" + encodeURIComponent(e), t),
		enabled: t,
		staleTime: Infinity
	})) }), r = n.find((e) => e.error)?.error;
	return /* @__PURE__ */ (0, b.jsxs)("article", {
		className: "panel comparison-panel",
		children: [
			/* @__PURE__ */ (0, b.jsxs)("div", {
				className: "panel-head",
				children: [/* @__PURE__ */ (0, b.jsxs)("div", { children: [/* @__PURE__ */ (0, b.jsxs)("p", {
					className: "overline",
					children: [
						"COMPARE / ",
						e.length,
						" OF 2 SELECTED"
					]
				}), /* @__PURE__ */ (0, b.jsx)("h2", { children: "Compare experiments" })] }), e.length > 0 && /* @__PURE__ */ (0, b.jsx)("button", {
					className: "button",
					onClick: () => wt({ selected: [] }),
					children: "Clear selection"
				})]
			}),
			/* @__PURE__ */ (0, b.jsx)("div", {
				className: "selection-slots",
				children: [0, 1].map((t) => /* @__PURE__ */ (0, b.jsxs)("div", {
					className: e[t] ? "filled" : "",
					children: [/* @__PURE__ */ (0, b.jsx)("span", { children: t === 0 ? "A" : "B" }), e[t] ? /* @__PURE__ */ (0, b.jsxs)(b.Fragment, { children: [/* @__PURE__ */ (0, b.jsxs)("div", { children: [/* @__PURE__ */ (0, b.jsx)("code", { children: e[t].slice(0, 12) }), n[t]?.data && /* @__PURE__ */ (0, b.jsxs)("p", {
						className: "caption",
						children: [
							"Seed ",
							n[t].data.report.seed,
							" · C ",
							n[t].data.report.configuration?.regularization_c ?? "unrecorded"
						]
					})] }), /* @__PURE__ */ (0, b.jsx)("button", {
						"aria-label": "Remove selection " + (t === 0 ? "A" : "B"),
						onClick: () => wt({ selected: e.filter((e, n) => n !== t) }),
						children: "×"
					})] }) : /* @__PURE__ */ (0, b.jsx)("p", { children: "Choose a snapshot from the table" })]
				}, t))
			}),
			r ? /* @__PURE__ */ (0, b.jsx)(Bt, {
				error: r,
				retry: () => n.forEach((e) => void e.refetch())
			}) : e.length === 2 ? n.every((e) => e.data) ? /* @__PURE__ */ (0, b.jsx)(Ht, {
				left: n[0].data,
				right: n[1].data
			}) : /* @__PURE__ */ (0, b.jsx)(Vt, { children: "Loading selected experiments…" }) : /* @__PURE__ */ (0, b.jsx)("p", {
				className: "caption",
				children: "Select any two snapshots, including snapshots on different pages. The selection is saved in the page URL."
			}),
			t && e.length === 2 && n.every((e) => e.data) && !r && /* @__PURE__ */ (0, b.jsx)(Mt, {
				a: e[0],
				b: e[1]
			})
		]
	});
}
function Wt({ id: e, active: t }) {
	let n = O({
		queryKey: ["snapshot", e],
		queryFn: ({ signal: t }) => k("/api/experiments/" + encodeURIComponent(e), t),
		enabled: t && !!e,
		staleTime: Infinity
	}), r = (0, y.useRef)(null);
	return (0, y.useEffect)(() => {
		t && n.data && r.current?.focus();
	}, [t, n.data]), e ? /* @__PURE__ */ (0, b.jsx)("article", {
		className: "panel snapshot-detail",
		"aria-label": "Snapshot details",
		children: n.error ? /* @__PURE__ */ (0, b.jsxs)(b.Fragment, { children: [/* @__PURE__ */ (0, b.jsx)(Bt, {
			error: n.error,
			retry: () => void n.refetch()
		}), /* @__PURE__ */ (0, b.jsx)("button", {
			className: "text-button",
			onClick: () => wt({ id: "" }),
			children: "Return to experiment list →"
		})] }) : n.data ? /* @__PURE__ */ (0, b.jsxs)(b.Fragment, { children: [
			/* @__PURE__ */ (0, b.jsxs)("div", {
				className: "panel-head",
				children: [/* @__PURE__ */ (0, b.jsxs)("div", { children: [/* @__PURE__ */ (0, b.jsxs)("p", {
					className: "overline",
					children: ["SNAPSHOT / ", e.slice(0, 12)]
				}), /* @__PURE__ */ (0, b.jsx)("h2", {
					ref: r,
					tabIndex: -1,
					children: "Experiment evidence"
				})] }), /* @__PURE__ */ (0, b.jsx)("button", {
					className: "button",
					onClick: () => wt({ id: "" }),
					children: "Close details"
				})]
			}),
			/* @__PURE__ */ (0, b.jsxs)("div", {
				className: "experiment-summary",
				children: [/* @__PURE__ */ (0, b.jsxs)("div", { children: [
					/* @__PURE__ */ (0, b.jsxs)("span", {
						className: "badge warning",
						children: [n.data.report.mode, " benchmark"]
					}),
					/* @__PURE__ */ (0, b.jsx)("h3", { children: n.data.report.target }),
					/* @__PURE__ */ (0, b.jsxs)("p", { children: ["First saved ", new Date(n.data.created_at).toLocaleString()] })
				] }), /* @__PURE__ */ (0, b.jsxs)("div", {
					className: "experiment-actions",
					children: [/* @__PURE__ */ (0, b.jsx)("a", {
						className: "button primary",
						href: "#forecasts/" + e,
						children: "Inspect saved forecasts →"
					}), /* @__PURE__ */ (0, b.jsx)("a", {
						className: "button",
						href: "/api/experiments/" + e,
						download: "signalrank-snapshot.json",
						children: "Export snapshot"
					})]
				})]
			}),
			/* @__PURE__ */ (0, b.jsx)("div", {
				className: "metrics",
				children: xt.map(([e, t, r]) => /* @__PURE__ */ (0, b.jsxs)("div", {
					className: "metric",
					children: [
						/* @__PURE__ */ (0, b.jsx)("span", {
							className: "metric-label",
							children: t
						}),
						/* @__PURE__ */ (0, b.jsx)("strong", {
							className: "metric-value",
							children: e === "recall_at_50" ? (n.data.report.model[e] * 100).toFixed(1) + "%" : n.data.report.model[e].toFixed(3)
						}),
						/* @__PURE__ */ (0, b.jsxs)("span", {
							className: "metric-note",
							children: [r, " · synthetic"]
						})
					]
				}, e))
			}),
			/* @__PURE__ */ (0, b.jsx)("h3", { children: "Configuration and temporal partitions" }),
			/* @__PURE__ */ (0, b.jsxs)("div", {
				className: "configuration-grid",
				children: [
					/* @__PURE__ */ (0, b.jsxs)("div", { children: [/* @__PURE__ */ (0, b.jsx)("span", { children: "Seed" }), /* @__PURE__ */ (0, b.jsx)("strong", { children: n.data.report.seed })] }),
					/* @__PURE__ */ (0, b.jsxs)("div", { children: [/* @__PURE__ */ (0, b.jsx)("span", { children: "Generated records" }), /* @__PURE__ */ (0, b.jsx)("strong", { children: n.data.report.configuration?.count ?? "Unrecorded" })] }),
					/* @__PURE__ */ (0, b.jsxs)("div", { children: [/* @__PURE__ */ (0, b.jsx)("span", { children: "Logistic regression C" }), /* @__PURE__ */ (0, b.jsx)("strong", { children: n.data.report.configuration?.regularization_c ?? "Unrecorded" })] }),
					/* @__PURE__ */ (0, b.jsxs)("div", { children: [/* @__PURE__ */ (0, b.jsx)("span", { children: "Forecast horizon" }), /* @__PURE__ */ (0, b.jsxs)("strong", { children: [n.data.report.horizon_days, " days"] })] })
				]
			}),
			/* @__PURE__ */ (0, b.jsx)(zt, {
				label: "Saved temporal partitions",
				children: /* @__PURE__ */ (0, b.jsxs)("table", { children: [/* @__PURE__ */ (0, b.jsx)("thead", { children: /* @__PURE__ */ (0, b.jsxs)("tr", { children: [
					/* @__PURE__ */ (0, b.jsx)("th", { children: "Partition" }),
					/* @__PURE__ */ (0, b.jsx)("th", { children: "First observation" }),
					/* @__PURE__ */ (0, b.jsx)("th", { children: "Last observation" }),
					/* @__PURE__ */ (0, b.jsx)("th", {
						className: "numeric",
						children: "Records"
					})
				] }) }), /* @__PURE__ */ (0, b.jsx)("tbody", { children: [
					"train",
					"calibration",
					"test"
				].map((e) => /* @__PURE__ */ (0, b.jsxs)("tr", { children: [
					/* @__PURE__ */ (0, b.jsx)("td", { children: e }),
					/* @__PURE__ */ (0, b.jsx)("td", { children: n.data.report.splits[e].first }),
					/* @__PURE__ */ (0, b.jsx)("td", { children: n.data.report.splits[e].last }),
					/* @__PURE__ */ (0, b.jsx)("td", {
						className: "numeric",
						children: n.data.report.splits[e].count
					})
				] }, e)) })] })
			}),
			n.data.report.temporal_evaluation && /* @__PURE__ */ (0, b.jsxs)("p", {
				className: "caption",
				children: [
					n.data.report.temporal_evaluation.folds.length,
					" archived temporal windows · ",
					n.data.report.temporal_evaluation.protocol,
					". Full window results are in the snapshot export."
				]
			}),
			/* @__PURE__ */ (0, b.jsxs)("details", {
				className: "provenance-details",
				children: [/* @__PURE__ */ (0, b.jsx)("summary", { children: "Dataset, model and runtime provenance" }), /* @__PURE__ */ (0, b.jsx)("dl", {
					className: "evidence-facts",
					children: [
						["Snapshot ID", n.data.id],
						["Dataset SHA-256", n.data.report.dataset_sha256],
						["Model code SHA-256", n.data.provenance.core_sha256],
						["Model", n.data.provenance.model],
						["Runtime", "Python " + n.data.provenance.python + " · NumPy " + n.data.provenance.numpy + " · scikit-learn " + n.data.provenance.scikit_learn],
						["Forecast evidence", n.data.provenance.forecast_scope]
					].map(([e, t]) => /* @__PURE__ */ (0, b.jsxs)(y.Fragment, { children: [/* @__PURE__ */ (0, b.jsx)("dt", { children: e }), /* @__PURE__ */ (0, b.jsx)("dd", { children: t })] }, e))
				})]
			}),
			/* @__PURE__ */ (0, b.jsx)("p", {
				className: "caption",
				children: n.data.report.warning
			})
		] }) : /* @__PURE__ */ (0, b.jsx)(Vt, { children: "Loading snapshot evidence…" })
	}) : null;
}
function Gt() {
	let [e, t] = (0, y.useState)(Ct), [n, r] = (0, y.useState)(e.search);
	(0, y.useEffect)(() => {
		let e = () => t(Ct());
		return window.addEventListener("hashchange", e), window.addEventListener("signalrank:view", e), () => {
			window.removeEventListener("hashchange", e), window.removeEventListener("signalrank:view", e);
		};
	}, []), (0, y.useEffect)(() => r(e.search), [e.search]);
	let i = O({
		queryKey: [
			"experiments",
			e.page,
			e.search
		],
		queryFn: ({ signal: t }) => k("/api/experiments?" + new URLSearchParams({
			limit: "10",
			offset: String(e.page * 10),
			search: e.search
		}), t),
		enabled: e.active,
		staleTime: 3e4
	});
	function a(t) {
		wt({ selected: e.selected.includes(t) ? e.selected.filter((e) => e !== t) : [...e.selected, t].slice(0, 2) });
	}
	return /* @__PURE__ */ (0, b.jsxs)("div", {
		className: "react-experiments",
		children: [
			/* @__PURE__ */ (0, b.jsxs)("div", {
				className: "experiment-intro",
				children: [/* @__PURE__ */ (0, b.jsx)("span", {
					className: "badge",
					children: "LOCAL SNAPSHOT LIBRARY"
				}), /* @__PURE__ */ (0, b.jsx)("p", { children: "Explore saved results, compare configurations, and follow each prediction back to its evidence." })]
			}),
			/* @__PURE__ */ (0, b.jsx)(Ut, {
				selected: e.selected,
				active: e.active
			}),
			/* @__PURE__ */ (0, b.jsxs)("article", {
				className: "panel",
				children: [
					/* @__PURE__ */ (0, b.jsxs)("div", {
						className: "panel-head",
						children: [/* @__PURE__ */ (0, b.jsx)("h2", { children: "Saved experiments" }), /* @__PURE__ */ (0, b.jsx)("span", {
							className: "caption",
							role: "status",
							children: i.data ? i.data.total + " matching snapshots" : "Loading library…"
						})]
					}),
					/* @__PURE__ */ (0, b.jsxs)("form", {
						className: "filters experiment-filters",
						onSubmit: (e) => {
							e.preventDefault(), wt({
								search: n.trim(),
								page: 0
							});
						},
						children: [
							/* @__PURE__ */ (0, b.jsxs)("label", { children: ["Search snapshots", /* @__PURE__ */ (0, b.jsx)("input", {
								type: "search",
								maxLength: 128,
								value: n,
								onChange: (e) => r(e.target.value),
								placeholder: "Snapshot, dataset hash, seed or date"
							})] }),
							/* @__PURE__ */ (0, b.jsx)("button", {
								className: "button",
								type: "submit",
								children: "Apply search"
							}),
							e.search && /* @__PURE__ */ (0, b.jsx)("button", {
								className: "text-button",
								type: "button",
								onClick: () => wt({
									search: "",
									page: 0
								}),
								children: "Clear search"
							}),
							/* @__PURE__ */ (0, b.jsx)("button", {
								className: "button refresh-library",
								type: "button",
								disabled: i.isFetching,
								onClick: () => void i.refetch(),
								children: i.isFetching ? "Refreshing…" : "Refresh library"
							})
						]
					}),
					i.error ? /* @__PURE__ */ (0, b.jsx)(Bt, {
						error: i.error,
						retry: () => void i.refetch()
					}) : i.data ? /* @__PURE__ */ (0, b.jsxs)(b.Fragment, { children: [
						/* @__PURE__ */ (0, b.jsx)(zt, {
							label: "Saved experiments",
							children: /* @__PURE__ */ (0, b.jsxs)("table", { children: [/* @__PURE__ */ (0, b.jsx)("thead", { children: /* @__PURE__ */ (0, b.jsxs)("tr", { children: [
								/* @__PURE__ */ (0, b.jsx)("th", { children: "Compare" }),
								/* @__PURE__ */ (0, b.jsx)("th", { children: "Snapshot / first saved" }),
								/* @__PURE__ */ (0, b.jsx)("th", { children: "Configuration" }),
								/* @__PURE__ */ (0, b.jsx)("th", {
									className: "numeric",
									children: "AP ↑"
								}),
								/* @__PURE__ */ (0, b.jsx)("th", {
									className: "numeric",
									children: "Brier ↓"
								}),
								/* @__PURE__ */ (0, b.jsx)("th", { children: "Evidence" })
							] }) }), /* @__PURE__ */ (0, b.jsx)("tbody", { children: i.data.items.map((t) => /* @__PURE__ */ (0, b.jsxs)("tr", {
								className: e.selected.includes(t.id) ? "selected-row" : "",
								children: [
									/* @__PURE__ */ (0, b.jsx)("td", { children: /* @__PURE__ */ (0, b.jsx)("input", {
										type: "checkbox",
										"aria-label": "Compare snapshot " + t.id.slice(0, 10),
										checked: e.selected.includes(t.id),
										disabled: !e.selected.includes(t.id) && e.selected.length === 2,
										onChange: () => a(t.id)
									}) }),
									/* @__PURE__ */ (0, b.jsxs)("td", { children: [
										/* @__PURE__ */ (0, b.jsx)("code", { children: t.id.slice(0, 10) }),
										t.id === i.data.current_id && /* @__PURE__ */ (0, b.jsx)("span", {
											className: "badge current-badge",
											children: "Current"
										}),
										/* @__PURE__ */ (0, b.jsx)("span", {
											className: "caption",
											children: new Date(t.created_at).toLocaleString()
										})
									] }),
									/* @__PURE__ */ (0, b.jsxs)("td", { children: [
										"Seed ",
										t.seed,
										" · C ",
										t.configuration?.regularization_c ?? "unrecorded",
										/* @__PURE__ */ (0, b.jsxs)("span", {
											className: "caption",
											children: [
												t.configuration?.count?.toLocaleString() ?? "Unknown count",
												" records · ",
												t.temporal_windows,
												" temporal windows"
											]
										})
									] }),
									/* @__PURE__ */ (0, b.jsx)("td", {
										className: "numeric",
										children: t.model.average_precision.toFixed(3)
									}),
									/* @__PURE__ */ (0, b.jsx)("td", {
										className: "numeric",
										children: t.model.brier_score.toFixed(3)
									}),
									/* @__PURE__ */ (0, b.jsx)("td", { children: /* @__PURE__ */ (0, b.jsx)("button", {
										className: "row-link",
										"aria-label": "Inspect snapshot " + t.id.slice(0, 10),
										onClick: () => wt({ id: t.id }),
										children: "Inspect →"
									}) })
								]
							}, t.id)) })] })
						}),
						!i.data.items.length && /* @__PURE__ */ (0, b.jsx)(Vt, { children: e.search ? "No snapshots match this search." : e.page ? "This page has no snapshots. Return to the first page." : "No snapshots have been saved yet." }),
						/* @__PURE__ */ (0, b.jsxs)("div", {
							className: "pagination",
							children: [
								/* @__PURE__ */ (0, b.jsx)("button", {
									className: "button",
									disabled: e.page === 0,
									onClick: () => wt({ page: Math.max(0, e.page - 1) }),
									children: "Previous"
								}),
								/* @__PURE__ */ (0, b.jsxs)("span", {
									className: "caption",
									children: [
										"Page ",
										e.page + 1,
										" of ",
										Math.max(1, Math.ceil(i.data.total / 10))
									]
								}),
								/* @__PURE__ */ (0, b.jsx)("button", {
									className: "button",
									disabled: (e.page + 1) * 10 >= i.data.total,
									onClick: () => wt({ page: e.page + 1 }),
									children: "Next"
								}),
								e.page > 0 && !i.data.items.length && /* @__PURE__ */ (0, b.jsx)("button", {
									className: "button",
									onClick: () => wt({ page: 0 }),
									children: "First page"
								})
							]
						})
					] }) : /* @__PURE__ */ (0, b.jsx)(Vt, { children: "Loading saved experiments…" })
				]
			}),
			/* @__PURE__ */ (0, b.jsx)(Wt, {
				id: e.id,
				active: e.active
			}),
			/* @__PURE__ */ (0, b.jsx)("p", {
				className: "caption",
				children: "Snapshots preserve their first-save time. Identical payloads are saved once; each offline training execution has its own run record."
			})
		]
	});
}
//#endregion
//#region src/Reliability.tsx
var Kt = (e) => (e * 100).toFixed(1) + "%", qt = (e) => e === void 0 ? "Unavailable" : e.toFixed(4), Jt = (e) => (e >= 0 ? "+" : "") + e.toFixed(4), Yt = {
	description: "Description category",
	severity: "Severity",
	remote: "Remote",
	authentication_required: "Authentication required"
};
function Xt({ items: e, metric: t }) {
	let n = Math.max(.001, ...e.map((e) => Math.abs(e[t])));
	return /* @__PURE__ */ (0, b.jsxs)("svg", {
		className: "reliability-chart",
		viewBox: "0 0 660 228",
		role: "img",
		"aria-label": "Signed permutation importance; positive values mean worse performance after shuffling",
		children: [
			/* @__PURE__ */ (0, b.jsx)("line", {
				x1: "420",
				y1: "15",
				x2: "420",
				y2: "185",
				stroke: "var(--control)"
			}),
			e.map((e, r) => {
				let i = Math.abs(e[t]) / n * 155;
				return /* @__PURE__ */ (0, b.jsxs)("g", { children: [/* @__PURE__ */ (0, b.jsx)("text", {
					x: "12",
					y: 40 + r * 42,
					children: Yt[e.feature]
				}), /* @__PURE__ */ (0, b.jsx)("rect", {
					x: e[t] >= 0 ? 420 : 420 - i,
					y: 25 + r * 42,
					width: i,
					height: "22",
					rx: "0",
					fill: e[t] >= 0 ? "var(--accent)" : "var(--muted)",
					children: /* @__PURE__ */ (0, b.jsxs)("title", { children: [
						Yt[e.feature],
						": ",
						Jt(e[t])
					] })
				})] }, e.feature);
			}),
			/* @__PURE__ */ (0, b.jsxs)("text", {
				x: "250",
				y: "211",
				textAnchor: "middle",
				children: ["−", n.toFixed(4)]
			}),
			/* @__PURE__ */ (0, b.jsx)("text", {
				x: "420",
				y: "211",
				textAnchor: "middle",
				children: "0"
			}),
			/* @__PURE__ */ (0, b.jsxs)("text", {
				x: "590",
				y: "211",
				textAnchor: "middle",
				children: ["+", n.toFixed(4)]
			})
		]
	});
}
function Zt({ control: e, scenario: t }) {
	let n = [{
		name: "Control",
		bins: e.calibration_bins,
		color: "var(--muted)"
	}, {
		name: "Selected scenario",
		bins: t.calibration_bins,
		color: "var(--accent)"
	}];
	return /* @__PURE__ */ (0, b.jsxs)("article", {
		className: "panel",
		children: [
			/* @__PURE__ */ (0, b.jsxs)("div", {
				className: "panel-head",
				children: [/* @__PURE__ */ (0, b.jsxs)("div", { children: [/* @__PURE__ */ (0, b.jsx)("p", {
					className: "overline",
					children: "CALIBRATION / FIXED SAVED CALIBRATOR"
				}), /* @__PURE__ */ (0, b.jsx)("h2", { children: "Control versus selected scenario" })] }), /* @__PURE__ */ (0, b.jsx)("span", {
					className: "caption",
					children: t.name
				})]
			}),
			/* @__PURE__ */ (0, b.jsxs)("svg", {
				className: "reliability-chart",
				viewBox: "0 0 540 300",
				role: "img",
				"aria-label": "Control and selected scenario mean predicted probability versus observed positive rate",
				children: [
					/* @__PURE__ */ (0, b.jsx)("path", {
						d: "M55 25V240H510",
						fill: "none",
						stroke: "var(--control)"
					}),
					/* @__PURE__ */ (0, b.jsx)("line", {
						x1: "55",
						y1: "240",
						x2: "510",
						y2: "25",
						stroke: "var(--muted)",
						strokeDasharray: "5 5"
					}),
					[
						0,
						.25,
						.5,
						.75,
						1
					].map((e) => /* @__PURE__ */ (0, b.jsxs)("g", { children: [/* @__PURE__ */ (0, b.jsx)("text", {
						x: 55 + e * 455,
						y: "259",
						textAnchor: "middle",
						children: e
					}), /* @__PURE__ */ (0, b.jsx)("text", {
						x: "42",
						y: 244 - e * 215,
						textAnchor: "end",
						children: e
					})] }, e)),
					n.map(({ name: e, bins: t, color: n }) => t.filter((e) => e.count && e.predicted !== null && e.observed !== null).map((t) => /* @__PURE__ */ (0, b.jsx)("circle", {
						cx: 55 + t.predicted * 455,
						cy: 240 - t.observed * 215,
						r: Math.min(10, 3 + Math.log2(t.count + 1) / 2),
						fill: n,
						fillOpacity: ".7",
						children: /* @__PURE__ */ (0, b.jsxs)("title", { children: [
							e,
							": ",
							t.count,
							" records; predicted ",
							Kt(t.predicted),
							"; observed ",
							Kt(t.observed)
						] })
					}, e + t.lower))),
					/* @__PURE__ */ (0, b.jsx)("text", {
						x: "280",
						y: "289",
						textAnchor: "middle",
						children: "Mean predicted probability"
					})
				]
			}),
			/* @__PURE__ */ (0, b.jsxs)("div", {
				className: "plot-key",
				children: [
					/* @__PURE__ */ (0, b.jsx)("span", { children: "● Unchanged control" }),
					/* @__PURE__ */ (0, b.jsx)("span", { children: "● Selected scenario" }),
					/* @__PURE__ */ (0, b.jsx)("span", { children: "Dashed: ideal calibration" })
				]
			}),
			/* @__PURE__ */ (0, b.jsx)("p", {
				className: "caption",
				children: "Vertical axis: observed positive rate. Dot size reflects bin support, not confidence. Both series use the same saved calibrator. Composition scenarios have different sampled cohorts; no recalibration is performed."
			}),
			/* @__PURE__ */ (0, b.jsx)(A, {
				label: "Scenario calibration support",
				children: /* @__PURE__ */ (0, b.jsxs)("table", { children: [/* @__PURE__ */ (0, b.jsx)("thead", { children: /* @__PURE__ */ (0, b.jsxs)("tr", { children: [
					/* @__PURE__ */ (0, b.jsx)("th", { children: "Probability bin" }),
					/* @__PURE__ */ (0, b.jsx)("th", {
						className: "numeric",
						children: "Control n"
					}),
					/* @__PURE__ */ (0, b.jsx)("th", {
						className: "numeric",
						children: "Control predicted / observed"
					}),
					/* @__PURE__ */ (0, b.jsx)("th", {
						className: "numeric",
						children: "Scenario n"
					}),
					/* @__PURE__ */ (0, b.jsx)("th", {
						className: "numeric",
						children: "Scenario predicted / observed"
					})
				] }) }), /* @__PURE__ */ (0, b.jsx)("tbody", { children: e.calibration_bins.map((e, n) => {
					let r = t.calibration_bins[n];
					return /* @__PURE__ */ (0, b.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, b.jsxs)("td", { children: [
							Kt(e.lower),
							"–",
							Kt(e.upper)
						] }),
						/* @__PURE__ */ (0, b.jsx)("td", {
							className: "numeric",
							children: e.count
						}),
						/* @__PURE__ */ (0, b.jsx)("td", {
							className: "numeric",
							children: e.predicted === null ? "No support" : Kt(e.predicted) + " / " + Kt(e.observed)
						}),
						/* @__PURE__ */ (0, b.jsx)("td", {
							className: "numeric",
							children: r.count
						}),
						/* @__PURE__ */ (0, b.jsx)("td", {
							className: "numeric",
							children: r.predicted === null ? "No support" : Kt(r.predicted) + " / " + Kt(r.observed)
						})
					] }, e.lower);
				}) })] })
			})
		]
	});
}
function Qt({ points: e, metric: t }) {
	let n = e.filter((e) => e.status === "evaluated" && e.evaluation && e.training);
	if (!n.length) return /* @__PURE__ */ (0, b.jsx)("p", {
		className: "notice subtle",
		children: "No supported learning-curve points in this fold."
	});
	let r = Math.max(1, ...e.map((e) => e.train_count)), i = Math.max(.05, ...n.flatMap((e) => [e.training[t], e.evaluation[t]])) * 1.1, a = (e) => 55 + e.train_count / r * 510, o = (e) => 235 - e / i * 195;
	return /* @__PURE__ */ (0, b.jsxs)(b.Fragment, { children: [/* @__PURE__ */ (0, b.jsxs)("svg", {
		className: "reliability-chart",
		viewBox: "0 0 620 300",
		role: "img",
		"aria-label": "Temporal learning curve comparing in-sample training and later evaluation scores",
		children: [
			[
				0,
				.5,
				1
			].map((e) => /* @__PURE__ */ (0, b.jsxs)("g", { children: [/* @__PURE__ */ (0, b.jsx)("line", {
				x1: "55",
				y1: o(i * e),
				x2: "565",
				y2: o(i * e),
				stroke: "var(--line)"
			}), /* @__PURE__ */ (0, b.jsx)("text", {
				x: "45",
				y: o(i * e) + 4,
				textAnchor: "end",
				children: (i * e).toFixed(3)
			})] }, e)),
			["training", "evaluation"].map((e) => /* @__PURE__ */ (0, b.jsxs)("g", { children: [/* @__PURE__ */ (0, b.jsx)("polyline", {
				points: n.map((n) => `${a(n)},${o(n[e][t])}`).join(" "),
				fill: "none",
				stroke: e === "evaluation" ? "var(--accent)" : "var(--muted)",
				strokeWidth: "2",
				strokeDasharray: e === "training" ? "5 4" : void 0
			}), n.map((n) => /* @__PURE__ */ (0, b.jsx)("circle", {
				cx: a(n),
				cy: o(n[e][t]),
				r: "4",
				fill: e === "evaluation" ? "var(--accent)" : "var(--muted)",
				children: /* @__PURE__ */ (0, b.jsxs)("title", { children: [
					e,
					": ",
					n.train_count,
					" training records, ",
					qt(n[e][t])
				] })
			}, n.fraction))] }, e)),
			e.map((e) => /* @__PURE__ */ (0, b.jsx)("text", {
				x: a(e),
				y: "260",
				textAnchor: "middle",
				children: e.train_count
			}, e.fraction)),
			/* @__PURE__ */ (0, b.jsx)("text", {
				x: "310",
				y: "287",
				textAnchor: "middle",
				children: "Historical training records"
			})
		]
	}), /* @__PURE__ */ (0, b.jsxs)("div", {
		className: "plot-key",
		children: [/* @__PURE__ */ (0, b.jsx)("span", { children: "Dashed: retrospective training" }), /* @__PURE__ */ (0, b.jsx)("span", { children: "Solid: later evaluation" })]
	})] });
}
function M() {
	return /* @__PURE__ */ (0, b.jsxs)("article", {
		className: "panel reliability-walkthrough",
		children: [
			/* @__PURE__ */ (0, b.jsxs)("div", {
				className: "panel-head",
				children: [/* @__PURE__ */ (0, b.jsxs)("div", { children: [/* @__PURE__ */ (0, b.jsx)("p", {
					className: "overline",
					children: "REPRODUCE / NO EXTERNAL DATA"
				}), /* @__PURE__ */ (0, b.jsx)("h2", { children: "Run it. Trace it. Explain it." })] }), /* @__PURE__ */ (0, b.jsx)("a", {
					className: "button",
					href: "/api/export/report",
					download: "signalrank-experiment.md",
					children: "Download research report"
				})]
			}),
			/* @__PURE__ */ (0, b.jsx)("p", {
				className: "caption",
				children: "From an installed project environment, one command trains a new fictional run, saves the model and report, and starts this loopback-only workbench. Each run has its own artifact directory; existing runs are preserved."
			}),
			/* @__PURE__ */ (0, b.jsx)("pre", { children: /* @__PURE__ */ (0, b.jsxs)("code", { children: [
				"python -m signalrank.demo",
				"\n",
				"# Export without starting a server:",
				"\n",
				"python -m signalrank.demo --no-serve"
			] }) }),
			/* @__PURE__ */ (0, b.jsxs)("ol", {
				className: "reliability-pipeline",
				children: [
					/* @__PURE__ */ (0, b.jsxs)("li", { children: [
						/* @__PURE__ */ (0, b.jsx)("span", { children: "01" }),
						/* @__PURE__ */ (0, b.jsx)("strong", { children: "Generate" }),
						/* @__PURE__ */ (0, b.jsx)("p", { children: "Seeded original fictional records. No downloads, uploaded datasets or pretrained weights." })
					] }),
					/* @__PURE__ */ (0, b.jsxs)("li", { children: [
						/* @__PURE__ */ (0, b.jsx)("span", { children: "02" }),
						/* @__PURE__ */ (0, b.jsx)("strong", { children: "Fit & calibrate" }),
						/* @__PURE__ */ (0, b.jsx)("p", { children: "Past-only TF-IDF and structured model; a later partition fits sigmoid calibration." })
					] }),
					/* @__PURE__ */ (0, b.jsxs)("li", { children: [
						/* @__PURE__ */ (0, b.jsx)("span", { children: "03" }),
						/* @__PURE__ */ (0, b.jsx)("strong", { children: "Evaluate & probe" }),
						/* @__PURE__ */ (0, b.jsx)("p", { children: "Mature later labels. Fixed stress cases, raw-input shuffles and temporal learning curves." })
					] }),
					/* @__PURE__ */ (0, b.jsxs)("li", { children: [
						/* @__PURE__ */ (0, b.jsx)("span", { children: "04" }),
						/* @__PURE__ */ (0, b.jsx)("strong", { children: "Save & inspect" }),
						/* @__PURE__ */ (0, b.jsx)("p", { children: "Model artifact, configuration, hashes and report. API reads offline results; the browser cannot train." })
					] })
				]
			}),
			/* @__PURE__ */ (0, b.jsxs)("p", {
				className: "caption",
				children: [
					"A fresh clone first needs Python 3.11+ and ",
					/* @__PURE__ */ (0, b.jsx)("code", { children: "python -m pip install -e '.[test]'" }),
					" in a virtual environment. Compiled React assets are included; Node is needed only to change the UI. Setup can download software dependencies; the demo itself makes no data-source requests. Stop the server with Ctrl+C."
				]
			})
		]
	});
}
function $t() {
	let [e, t] = (0, y.useState)(() => location.hash.slice(1).split("/")[0].split("?")[0] === "reliability");
	(0, y.useEffect)(() => {
		let e = () => t(location.hash.slice(1).split("/")[0].split("?")[0] === "reliability");
		return window.addEventListener("hashchange", e), window.addEventListener("signalrank:view", e), () => {
			window.removeEventListener("hashchange", e), window.removeEventListener("signalrank:view", e);
		};
	}, []);
	let n = O({
		queryKey: ["reliability"],
		queryFn: ({ signal: e }) => k("/api/reliability", e),
		enabled: e
	}), [r, i] = (0, y.useState)("control"), [a, o] = (0, y.useState)("average_precision_drop"), [s, c] = (0, y.useState)(1), [l, u] = (0, y.useState)("average_precision");
	if (n.error) return /* @__PURE__ */ (0, b.jsxs)("div", {
		className: "experiment-error",
		role: "alert",
		children: [/* @__PURE__ */ (0, b.jsxs)("div", { children: [/* @__PURE__ */ (0, b.jsx)("strong", { children: "Unable to load reliability evidence" }), /* @__PURE__ */ (0, b.jsx)("p", { children: n.error.message })] }), /* @__PURE__ */ (0, b.jsx)("button", {
			className: "button",
			onClick: () => void n.refetch(),
			children: "Try again"
		})]
	});
	if (!n.data) return /* @__PURE__ */ (0, b.jsx)("p", {
		className: "experiment-empty",
		role: "status",
		children: "Loading offline reliability evidence…"
	});
	let d = n.data;
	if (d.status === "unavailable" || !d.stress || !d.importance || !d.learning_curves) return /* @__PURE__ */ (0, b.jsxs)("div", {
		className: "lab-workspace",
		children: [/* @__PURE__ */ (0, b.jsx)("p", {
			className: "notice subtle",
			children: d.warning
		}), /* @__PURE__ */ (0, b.jsx)(M, {})]
	});
	let f = d.stress.items.find((e) => e.id === r) ?? d.stress.items[0], p = d.stress.items.find((e) => e.id === "control"), m = d.learning_curves.folds.find((e) => e.fold === s) ?? d.learning_curves.folds[0];
	return /* @__PURE__ */ (0, b.jsxs)("div", {
		className: "lab-workspace reliability-workspace",
		children: [
			/* @__PURE__ */ (0, b.jsxs)("div", {
				className: "lab-intro",
				children: [
					/* @__PURE__ */ (0, b.jsx)("span", {
						className: "badge warning",
						children: "SYNTHETIC / DEVELOPMENT"
					}),
					/* @__PURE__ */ (0, b.jsx)("p", { children: "How does the model behave when the conditions change?" }),
					/* @__PURE__ */ (0, b.jsx)("a", {
						href: "#experiments/" + d.snapshot_id,
						children: "Snapshot provenance →"
					})
				]
			}),
			/* @__PURE__ */ (0, b.jsxs)("div", {
				className: "reliability-summary",
				children: [
					/* @__PURE__ */ (0, b.jsxs)("div", { children: [
						/* @__PURE__ */ (0, b.jsx)("span", {
							className: "overline",
							children: "FIXED STRESS CASES"
						}),
						/* @__PURE__ */ (0, b.jsx)("strong", { children: d.stress.items.length }),
						/* @__PURE__ */ (0, b.jsx)("p", { children: "One seed. No adaptive tuning." })
					] }),
					/* @__PURE__ */ (0, b.jsxs)("div", { children: [
						/* @__PURE__ */ (0, b.jsx)("span", {
							className: "overline",
							children: "RAW INPUT GROUPS"
						}),
						/* @__PURE__ */ (0, b.jsx)("strong", { children: d.importance.items.length }),
						/* @__PURE__ */ (0, b.jsx)("p", { children: "20 shuffles per input." })
					] }),
					/* @__PURE__ */ (0, b.jsxs)("div", { children: [
						/* @__PURE__ */ (0, b.jsx)("span", {
							className: "overline",
							children: "PAST-ONLY WINDOWS"
						}),
						/* @__PURE__ */ (0, b.jsx)("strong", { children: d.learning_curves.folds.length }),
						/* @__PURE__ */ (0, b.jsx)("p", { children: "Four training sizes per fold." })
					] })
				]
			}),
			/* @__PURE__ */ (0, b.jsxs)("article", {
				className: "panel",
				children: [
					/* @__PURE__ */ (0, b.jsxs)("div", {
						className: "panel-head",
						children: [/* @__PURE__ */ (0, b.jsxs)("div", { children: [/* @__PURE__ */ (0, b.jsx)("p", {
							className: "overline",
							children: "01 / STRESS TESTS"
						}), /* @__PURE__ */ (0, b.jsx)("h2", { children: "Controlled changes. Visible consequences." })] }), /* @__PURE__ */ (0, b.jsxs)("label", { children: ["Inspect scenario", /* @__PURE__ */ (0, b.jsx)("select", {
							value: f?.id ?? "",
							onChange: (e) => i(e.target.value),
							children: d.stress.items.map((e) => /* @__PURE__ */ (0, b.jsx)("option", {
								value: e.id,
								children: e.name
							}, e.id))
						})] })]
					}),
					/* @__PURE__ */ (0, b.jsx)(A, {
						label: "Robustness scenario metrics",
						children: /* @__PURE__ */ (0, b.jsxs)("table", { children: [/* @__PURE__ */ (0, b.jsx)("thead", { children: /* @__PURE__ */ (0, b.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, b.jsx)("th", { children: "Scenario / type" }),
							/* @__PURE__ */ (0, b.jsx)("th", {
								className: "numeric",
								children: "n / unique / positives"
							}),
							/* @__PURE__ */ (0, b.jsx)("th", {
								className: "numeric",
								children: "Calibrated AP ↑"
							}),
							/* @__PURE__ */ (0, b.jsx)("th", {
								className: "numeric",
								children: "Calibrated Brier ↓"
							}),
							/* @__PURE__ */ (0, b.jsx)("th", {
								className: "numeric",
								children: "Recall@50 ↑"
							}),
							/* @__PURE__ */ (0, b.jsx)("th", {
								className: "numeric",
								children: "AP change"
							})
						] }) }), /* @__PURE__ */ (0, b.jsx)("tbody", { children: d.stress.items.map((e) => /* @__PURE__ */ (0, b.jsxs)("tr", {
							className: e.id === f?.id ? "reliability-selected" : "",
							children: [
								/* @__PURE__ */ (0, b.jsxs)("td", { children: [/* @__PURE__ */ (0, b.jsx)("button", {
									className: "row-link",
									onClick: () => i(e.id),
									"aria-label": "Inspect " + e.name,
									children: e.name
								}), /* @__PURE__ */ (0, b.jsx)("span", {
									className: "caption",
									children: e.kind
								})] }),
								/* @__PURE__ */ (0, b.jsxs)("td", {
									className: "numeric",
									children: [
										e.support.count,
										" / ",
										e.support.unique_records,
										" / ",
										e.support.positives
									]
								}),
								/* @__PURE__ */ (0, b.jsx)("td", {
									className: "numeric",
									children: qt(e.calibrated?.average_precision)
								}),
								/* @__PURE__ */ (0, b.jsx)("td", {
									className: "numeric",
									children: qt(e.calibrated?.brier_score)
								}),
								/* @__PURE__ */ (0, b.jsx)("td", {
									className: "numeric",
									children: e.calibrated ? Kt(e.calibrated.recall_at_50) : "Unavailable"
								}),
								/* @__PURE__ */ (0, b.jsx)("td", {
									className: "numeric",
									children: e.delta_from_control ? Jt(e.delta_from_control.average_precision) : "Unavailable"
								})
							]
						}, e.id)) })] })
					}),
					f && /* @__PURE__ */ (0, b.jsxs)("div", {
						className: "reliability-detail",
						children: [/* @__PURE__ */ (0, b.jsxs)("div", { children: [
							/* @__PURE__ */ (0, b.jsxs)("span", {
								className: "overline",
								children: [
									f.kind.toUpperCase(),
									" / SEED ",
									d.stress.seed
								]
							}),
							/* @__PURE__ */ (0, b.jsx)("h3", { children: f.name }),
							/* @__PURE__ */ (0, b.jsx)("p", { children: f.definition }),
							f.reason && /* @__PURE__ */ (0, b.jsx)("p", {
								role: "status",
								children: f.reason
							}),
							/* @__PURE__ */ (0, b.jsxs)("p", {
								className: "caption",
								children: [
									"Mean severity ",
									f.support.mean_severity.toFixed(2),
									" · remote measurements ",
									Kt(f.support.remote_rate),
									" · positive prevalence ",
									Kt(f.support.prevalence),
									". Outcomes are retained, never regenerated."
								]
							}),
							/* @__PURE__ */ (0, b.jsxs)("p", {
								className: "caption",
								children: [
									"Raw AP ",
									qt(f.raw?.average_precision),
									" · raw Brier ",
									qt(f.raw?.brier_score),
									"."
								]
							})
						] }), /* @__PURE__ */ (0, b.jsxs)("div", { children: [/* @__PURE__ */ (0, b.jsx)("span", {
							className: "overline",
							children: "COMPOSITION / RECORD COUNTS"
						}), Object.entries(f.support.categories).map(([e, t]) => /* @__PURE__ */ (0, b.jsxs)("div", {
							className: "composition-row",
							children: [/* @__PURE__ */ (0, b.jsx)("span", { children: e }), /* @__PURE__ */ (0, b.jsx)("strong", { children: t })]
						}, e))] })]
					}),
					/* @__PURE__ */ (0, b.jsx)("p", {
						className: "caption",
						children: d.stress.warning
					})
				]
			}),
			f?.calibration_bins && p?.calibration_bins && /* @__PURE__ */ (0, b.jsx)(Zt, {
				control: p,
				scenario: f
			}),
			/* @__PURE__ */ (0, b.jsxs)("article", {
				className: "panel",
				children: [
					/* @__PURE__ */ (0, b.jsxs)("div", {
						className: "panel-head",
						children: [/* @__PURE__ */ (0, b.jsxs)("div", { children: [/* @__PURE__ */ (0, b.jsx)("p", {
							className: "overline",
							children: "02 / MODEL DEPENDENCE"
						}), /* @__PURE__ */ (0, b.jsx)("h2", { children: "Which inputs does the model rely on?" })] }), /* @__PURE__ */ (0, b.jsxs)("label", { children: ["Importance measure", /* @__PURE__ */ (0, b.jsxs)("select", {
							value: a,
							onChange: (e) => o(e.target.value),
							children: [/* @__PURE__ */ (0, b.jsx)("option", {
								value: "average_precision_drop",
								children: "Average precision drop"
							}), /* @__PURE__ */ (0, b.jsx)("option", {
								value: "brier_increase",
								children: "Brier score increase"
							})]
						})] })]
					}),
					d.importance.status === "unavailable" ? /* @__PURE__ */ (0, b.jsx)("p", {
						className: "notice subtle",
						children: d.importance.reason
					}) : /* @__PURE__ */ (0, b.jsxs)(b.Fragment, { children: [/* @__PURE__ */ (0, b.jsx)(Xt, {
						items: d.importance.items,
						metric: a
					}), /* @__PURE__ */ (0, b.jsx)(A, {
						label: "Global permutation importance",
						children: /* @__PURE__ */ (0, b.jsxs)("table", { children: [/* @__PURE__ */ (0, b.jsx)("thead", { children: /* @__PURE__ */ (0, b.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, b.jsx)("th", { children: "Raw input group" }),
							/* @__PURE__ */ (0, b.jsx)("th", {
								className: "numeric",
								children: "Mean AP drop"
							}),
							/* @__PURE__ */ (0, b.jsx)("th", {
								className: "numeric",
								children: "Shuffle SD"
							}),
							/* @__PURE__ */ (0, b.jsx)("th", {
								className: "numeric",
								children: "Mean Brier increase"
							}),
							/* @__PURE__ */ (0, b.jsx)("th", {
								className: "numeric",
								children: "Shuffle SD"
							}),
							/* @__PURE__ */ (0, b.jsx)("th", {
								className: "numeric",
								children: "Repeats"
							})
						] }) }), /* @__PURE__ */ (0, b.jsx)("tbody", { children: d.importance.items.map((e) => /* @__PURE__ */ (0, b.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, b.jsx)("td", { children: Yt[e.feature] }),
							/* @__PURE__ */ (0, b.jsx)("td", {
								className: "numeric",
								children: Jt(e.average_precision_drop)
							}),
							/* @__PURE__ */ (0, b.jsx)("td", {
								className: "numeric",
								children: qt(e.average_precision_drop_sd)
							}),
							/* @__PURE__ */ (0, b.jsx)("td", {
								className: "numeric",
								children: Jt(e.brier_increase)
							}),
							/* @__PURE__ */ (0, b.jsx)("td", {
								className: "numeric",
								children: qt(e.brier_increase_sd)
							}),
							/* @__PURE__ */ (0, b.jsx)("td", {
								className: "numeric",
								children: e.repeats
							})
						] }, e.feature)) })] })
					})] }),
					/* @__PURE__ */ (0, b.jsx)("p", {
						className: "caption",
						children: d.importance.warning
					})
				]
			}),
			/* @__PURE__ */ (0, b.jsxs)("article", {
				className: "panel",
				children: [
					/* @__PURE__ */ (0, b.jsxs)("div", {
						className: "panel-head",
						children: [/* @__PURE__ */ (0, b.jsxs)("div", { children: [/* @__PURE__ */ (0, b.jsx)("p", {
							className: "overline",
							children: "03 / DATA VOLUME & TIME"
						}), /* @__PURE__ */ (0, b.jsx)("h2", { children: "Does more history help?" })] }), /* @__PURE__ */ (0, b.jsxs)("div", {
							className: "reliability-controls",
							children: [/* @__PURE__ */ (0, b.jsxs)("label", { children: ["Temporal fold", /* @__PURE__ */ (0, b.jsx)("select", {
								value: m?.fold ?? 1,
								onChange: (e) => c(Number(e.target.value)),
								children: d.learning_curves.folds.map((e) => /* @__PURE__ */ (0, b.jsxs)("option", {
									value: e.fold,
									children: ["Fold ", e.fold]
								}, e.fold))
							})] }), /* @__PURE__ */ (0, b.jsxs)("label", { children: ["Curve metric", /* @__PURE__ */ (0, b.jsxs)("select", {
								value: l,
								onChange: (e) => u(e.target.value),
								children: [
									/* @__PURE__ */ (0, b.jsx)("option", {
										value: "average_precision",
										children: "Average precision ↑"
									}),
									/* @__PURE__ */ (0, b.jsx)("option", {
										value: "brier_score",
										children: "Brier score ↓"
									}),
									/* @__PURE__ */ (0, b.jsx)("option", {
										value: "recall_at_50",
										children: "Recall at 50 ↑"
									})
								]
							})] })]
						})]
					}),
					m && /* @__PURE__ */ (0, b.jsxs)(b.Fragment, { children: [
						/* @__PURE__ */ (0, b.jsxs)("p", {
							className: "caption",
							children: [
								"Fixed later calibration: ",
								m.calibration.count,
								" records, ",
								m.calibration.positives,
								" positives. Mature evaluation: ",
								m.evaluation_first,
								" to ",
								m.evaluation_last,
								", ",
								m.evaluation.count,
								" records, ",
								m.evaluation.positives,
								" positives."
							]
						}),
						/* @__PURE__ */ (0, b.jsx)(Qt, {
							points: m.points,
							metric: l
						}),
						/* @__PURE__ */ (0, b.jsx)(A, {
							label: "Temporal learning curve evidence",
							children: /* @__PURE__ */ (0, b.jsxs)("table", { children: [/* @__PURE__ */ (0, b.jsx)("thead", { children: /* @__PURE__ */ (0, b.jsxs)("tr", { children: [
								/* @__PURE__ */ (0, b.jsx)("th", { children: "Training days / support" }),
								/* @__PURE__ */ (0, b.jsx)("th", { children: "Training period" }),
								/* @__PURE__ */ (0, b.jsx)("th", {
									className: "numeric",
									children: "In-sample score"
								}),
								/* @__PURE__ */ (0, b.jsx)("th", {
									className: "numeric",
									children: "Later evaluation score"
								}),
								/* @__PURE__ */ (0, b.jsx)("th", { children: "Evidence status" })
							] }) }), /* @__PURE__ */ (0, b.jsx)("tbody", { children: m.points.map((e) => /* @__PURE__ */ (0, b.jsxs)("tr", { children: [
								/* @__PURE__ */ (0, b.jsxs)("td", { children: [Kt(e.fraction), /* @__PURE__ */ (0, b.jsxs)("span", {
									className: "caption",
									children: [
										e.train_count,
										" records · ",
										e.train_positives,
										" positives"
									]
								})] }),
								/* @__PURE__ */ (0, b.jsxs)("td", { children: [e.train_first, /* @__PURE__ */ (0, b.jsxs)("span", {
									className: "caption",
									children: ["to ", e.train_last]
								})] }),
								/* @__PURE__ */ (0, b.jsx)("td", {
									className: "numeric",
									children: qt(e.training?.[l])
								}),
								/* @__PURE__ */ (0, b.jsx)("td", {
									className: "numeric",
									children: qt(e.evaluation?.[l])
								}),
								/* @__PURE__ */ (0, b.jsxs)("td", { children: [e.status, e.reason && /* @__PURE__ */ (0, b.jsx)("span", {
									className: "caption",
									children: e.reason
								})] })
							] }, e.fraction)) })] })
						})
					] }),
					/* @__PURE__ */ (0, b.jsx)("p", {
						className: "caption",
						children: d.learning_curves.warning
					})
				]
			}),
			/* @__PURE__ */ (0, b.jsx)(M, {}),
			/* @__PURE__ */ (0, b.jsxs)("details", {
				className: "panel provenance-details",
				children: [
					/* @__PURE__ */ (0, b.jsx)("summary", { children: "Protocol, configuration and full evidence" }),
					/* @__PURE__ */ (0, b.jsxs)("p", { children: ["Protocol: ", /* @__PURE__ */ (0, b.jsx)("code", { children: d.protocol })] }),
					/* @__PURE__ */ (0, b.jsxs)("p", {
						className: "caption",
						children: ["Dataset SHA-256: ", d.dataset_sha256]
					}),
					/* @__PURE__ */ (0, b.jsx)("pre", { children: JSON.stringify(d.configuration, null, 2) }),
					/* @__PURE__ */ (0, b.jsx)("a", {
						href: "/api/reliability",
						download: "signalrank-reliability.json",
						children: "Download complete reliability JSON →"
					})
				]
			}),
			/* @__PURE__ */ (0, b.jsx)("p", {
				className: "caption",
				children: d.warning
			})
		]
	});
}
//#endregion
//#region src/Replay.tsx
var en = (e) => e == null ? "Unavailable" : e.toFixed(4), tn = (e) => e == null ? "Unavailable" : (e * 100).toFixed(1) + "%", nn = {
	severity: "Severity",
	description: "Description category",
	remote: "Remote",
	authentication_required: "Authentication required",
	prediction: "Predicted probability"
};
function rn(e) {
	let t = () => location.hash.slice(1).split(/[/?]/)[0] === e, [n, r] = (0, y.useState)(t);
	return (0, y.useEffect)(() => {
		let e = () => r(t());
		return window.addEventListener("hashchange", e), window.addEventListener("signalrank:view", e), () => {
			window.removeEventListener("hashchange", e), window.removeEventListener("signalrank:view", e);
		};
	}, [e]), n;
}
function an({ run: e, metric: t, index: n, threshold: r }) {
	let i = e.checkpoints.map((e, r) => ({
		i: r,
		value: r > n ? null : t === "brier" ? e.metrics?.brier_score ?? null : Math.max(...e.drift.filter((e) => e.feature !== "prediction" && e.distance !== null).map((e) => e.distance), 0)
	})), a = (e) => 55 + e / Math.max(1, i.length - 1) * 545, o = (e) => 240 - e * 200;
	return /* @__PURE__ */ (0, b.jsxs)("svg", {
		className: "replay-chart",
		viewBox: "0 0 640 295",
		role: "img",
		"aria-label": t === "drift" ? "Maximum input distance by simulated week" : "Cumulative Brier score on mature outcomes by simulated week",
		children: [
			[
				0,
				.25,
				.5,
				.75,
				1
			].map((e) => /* @__PURE__ */ (0, b.jsxs)("g", { children: [/* @__PURE__ */ (0, b.jsx)("line", {
				x1: "55",
				x2: "600",
				y1: o(e),
				y2: o(e),
				stroke: "var(--line)"
			}), /* @__PURE__ */ (0, b.jsx)("text", {
				x: "42",
				y: o(e) + 4,
				textAnchor: "end",
				children: e
			})] }, e)),
			t === "drift" && /* @__PURE__ */ (0, b.jsx)("line", {
				x1: "55",
				x2: "600",
				y1: o(r),
				y2: o(r),
				stroke: "var(--muted)",
				strokeDasharray: "5 4"
			}),
			e.change_at && e.change_at <= e.checkpoints[n].as_of && /* @__PURE__ */ (0, b.jsx)("line", {
				x1: a(e.checkpoints.findIndex((t) => t.as_of >= e.change_at)),
				x2: a(e.checkpoints.findIndex((t) => t.as_of >= e.change_at)),
				y1: "30",
				y2: "240",
				stroke: "var(--control)",
				strokeDasharray: "2 4"
			}),
			/* @__PURE__ */ (0, b.jsx)("polyline", {
				points: i.filter((e) => e.value !== null).map((e) => `${a(e.i)},${o(e.value)}`).join(" "),
				fill: "none",
				stroke: "var(--accent)",
				strokeWidth: "2"
			}),
			i.filter((e) => e.value !== null).map((t) => /* @__PURE__ */ (0, b.jsx)("circle", {
				cx: a(t.i),
				cy: o(t.value),
				r: t.i === n ? 6 : 3,
				fill: t.i === n ? "var(--hero-accent)" : "var(--accent)",
				children: /* @__PURE__ */ (0, b.jsxs)("title", { children: [
					e.checkpoints[t.i].as_of,
					": ",
					en(t.value)
				] })
			}, t.i)),
			/* @__PURE__ */ (0, b.jsx)("text", {
				x: "55",
				y: "267",
				children: e.checkpoints[0].as_of
			}),
			/* @__PURE__ */ (0, b.jsx)("text", {
				x: "600",
				y: "267",
				textAnchor: "end",
				children: e.checkpoints.at(-1).as_of
			}),
			/* @__PURE__ */ (0, b.jsx)("text", {
				x: "325",
				y: "290",
				textAnchor: "middle",
				children: "Simulated checkpoint date · not wall-clock time"
			})
		]
	});
}
function on() {
	let e = rn("replay"), t = O({
		queryKey: ["replay"],
		queryFn: ({ signal: e }) => k("/api/replay", e),
		enabled: e
	}), [n, r] = (0, y.useState)("stable"), [i, a] = (0, y.useState)(2718), [o, s] = (0, y.useState)(-1), [c, l] = (0, y.useState)(0), [u, d] = (0, y.useState)("drift"), f = t.data, p = f?.runs?.find((e) => e.id === n && e.seed === i), m = p ? o < 0 ? p.checkpoints.length - 1 : Math.min(o, p.checkpoints.length - 1) : 0, h = new URLSearchParams({
		scenario: n,
		seed: String(i),
		checkpoint: String(m)
	}), g = O({
		queryKey: [
			"replay-checkpoint",
			n,
			i,
			m,
			c
		],
		queryFn: ({ signal: e }) => k("/api/replay/checkpoint?" + h + "&offset=" + c * 25 + "&limit=25", e),
		enabled: e && !!p
	});
	if (t.error) return /* @__PURE__ */ (0, b.jsx)(cn, {
		message: t.error.message,
		retry: () => void t.refetch()
	});
	if (!f) return /* @__PURE__ */ (0, b.jsx)("p", {
		className: "experiment-empty",
		role: "status",
		children: "Loading saved replay evidence…"
	});
	if (f.status !== "available" || !p || !f.configuration) return /* @__PURE__ */ (0, b.jsxs)("p", {
		className: "notice subtle",
		children: [
			f.warning,
			" ",
			/* @__PURE__ */ (0, b.jsx)("code", { children: "python -m signalrank.demo" })
		]
	});
	let _ = p.checkpoints[m];
	return /* @__PURE__ */ (0, b.jsxs)("div", {
		className: "lab-workspace replay-workspace",
		children: [
			/* @__PURE__ */ (0, b.jsx)("p", {
				className: "notice subtle",
				children: f.warning
			}),
			/* @__PURE__ */ (0, b.jsxs)("article", {
				className: "panel",
				children: [
					/* @__PURE__ */ (0, b.jsxs)("div", {
						className: "panel-head",
						children: [/* @__PURE__ */ (0, b.jsxs)("div", { children: [/* @__PURE__ */ (0, b.jsx)("p", {
							className: "overline",
							children: "FROZEN MODEL / SIMULATED CLOCK"
						}), /* @__PURE__ */ (0, b.jsx)("h2", { children: "Rewind the evidence." })] }), /* @__PURE__ */ (0, b.jsx)("a", {
							className: "button",
							href: "/api/replay/export?" + h,
							download: !0,
							children: "Export this checkpoint"
						})]
					}),
					/* @__PURE__ */ (0, b.jsxs)("div", {
						className: "replay-controls",
						children: [
							/* @__PURE__ */ (0, b.jsxs)("label", { children: ["Replay scenario", /* @__PURE__ */ (0, b.jsx)("select", {
								value: n,
								onChange: (e) => {
									r(e.target.value), l(0);
								},
								children: Array.from(new Map(f.runs.map((e) => [e.id, e.name]))).map(([e, t]) => /* @__PURE__ */ (0, b.jsx)("option", {
									value: e,
									children: t
								}, e))
							})] }),
							/* @__PURE__ */ (0, b.jsxs)("label", { children: ["Simulation seed", /* @__PURE__ */ (0, b.jsx)("select", {
								value: i,
								onChange: (e) => {
									a(Number(e.target.value)), l(0);
								},
								children: f.configuration.seeds.map((e) => /* @__PURE__ */ (0, b.jsx)("option", { children: e }, e))
							})] }),
							/* @__PURE__ */ (0, b.jsxs)("label", { children: ["Timeline metric", /* @__PURE__ */ (0, b.jsxs)("select", {
								value: u,
								onChange: (e) => d(e.target.value),
								children: [/* @__PURE__ */ (0, b.jsx)("option", {
									value: "drift",
									children: "Maximum input distance"
								}), /* @__PURE__ */ (0, b.jsx)("option", {
									value: "brier",
									children: "Mature cumulative Brier ↓"
								})]
							})] })
						]
					}),
					/* @__PURE__ */ (0, b.jsx)(an, {
						run: p,
						metric: u,
						index: m,
						threshold: f.configuration.drift_threshold
					}),
					/* @__PURE__ */ (0, b.jsxs)("label", {
						className: "replay-slider",
						htmlFor: "replay-position",
						children: [
							"Simulated checkpoint ",
							/* @__PURE__ */ (0, b.jsx)("output", { children: _.as_of }),
							/* @__PURE__ */ (0, b.jsx)("input", {
								id: "replay-position",
								type: "range",
								min: "0",
								max: p.checkpoints.length - 1,
								value: m,
								onChange: (e) => {
									s(Number(e.target.value)), l(0);
								}
							})
						]
					}),
					/* @__PURE__ */ (0, b.jsxs)("p", {
						className: "caption",
						children: [
							u === "drift" ? "Dashed horizontal line: illustrative input-alert threshold. Prediction drift is reported separately below." : "Only matured outcomes contribute. Cumulative scores can hide or lag recent degradation; they are not a performance alarm.",
							" ",
							p.change_at ? `Dotted vertical line: scheduled generator change at ${p.change_at}.` : "No generator change is scheduled in this control."
						]
					}),
					/* @__PURE__ */ (0, b.jsxs)("div", {
						className: "metrics replay-metrics",
						children: [
							/* @__PURE__ */ (0, b.jsx)(sn, {
								label: "Records seen",
								value: _.seen
							}),
							/* @__PURE__ */ (0, b.jsx)(sn, {
								label: "Mature outcomes",
								value: _.mature
							}),
							/* @__PURE__ */ (0, b.jsx)(sn, {
								label: "Pending outcomes",
								value: _.pending
							}),
							/* @__PURE__ */ (0, b.jsx)(sn, {
								label: "Mature average precision",
								value: en(_.metrics?.average_precision)
							})
						]
					}),
					/* @__PURE__ */ (0, b.jsxs)("p", {
						className: "caption",
						children: [
							"Labels are withheld for ",
							f.configuration.horizon_days,
							" days, including early positives. No future records or immature outcomes appear in the checkpoint ledger. Metrics require ",
							f.configuration.minimum_support,
							" mature records and both classes—a display guard, not proof of statistical adequacy."
						]
					})
				]
			}),
			/* @__PURE__ */ (0, b.jsxs)("article", {
				className: "panel",
				children: [
					/* @__PURE__ */ (0, b.jsxs)("div", {
						className: "panel-head",
						children: [/* @__PURE__ */ (0, b.jsxs)("div", { children: [/* @__PURE__ */ (0, b.jsx)("p", {
							className: "overline",
							children: "FIXED REFERENCE / CURRENT WEEK"
						}), /* @__PURE__ */ (0, b.jsx)("h2", { children: "A shift is a question, not a verdict." })] }), /* @__PURE__ */ (0, b.jsxs)("span", {
							className: "badge",
							children: [
								_.window_first,
								" → ",
								_.as_of
							]
						})]
					}),
					/* @__PURE__ */ (0, b.jsx)(A, {
						label: "Checkpoint distribution drift",
						children: /* @__PURE__ */ (0, b.jsxs)("table", { children: [/* @__PURE__ */ (0, b.jsx)("thead", { children: /* @__PURE__ */ (0, b.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, b.jsx)("th", { children: "Distribution" }),
							/* @__PURE__ */ (0, b.jsx)("th", {
								className: "numeric",
								children: "Reference / current n"
							}),
							/* @__PURE__ */ (0, b.jsx)("th", {
								className: "numeric",
								children: "JS distance"
							}),
							/* @__PURE__ */ (0, b.jsx)("th", { children: "Indicator" })
						] }) }), /* @__PURE__ */ (0, b.jsx)("tbody", { children: _.drift.map((e) => /* @__PURE__ */ (0, b.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, b.jsx)("td", { children: nn[e.feature] }),
							/* @__PURE__ */ (0, b.jsxs)("td", {
								className: "numeric",
								children: [
									e.reference_count,
									" / ",
									e.current_count
								]
							}),
							/* @__PURE__ */ (0, b.jsx)("td", {
								className: "numeric",
								children: en(e.distance)
							}),
							/* @__PURE__ */ (0, b.jsx)("td", { children: e.alert === null ? "Insufficient support" : e.alert ? "Distribution warning" : "Below threshold" })
						] }, e.feature)) })] })
					}),
					/* @__PURE__ */ (0, b.jsxs)("p", {
						className: "caption",
						children: [
							"Training inputs are the fixed reference. Severity uses nine fixed bins; probabilities use ten. Jensen-Shannon distance uses base 2. Threshold ",
							f.configuration.drift_threshold.toFixed(2),
							" is prespecified for this demonstration; it is not a calibrated false-alarm guarantee. Unchanged inputs can coexist with a changed outcome relationship."
						]
					}),
					/* @__PURE__ */ (0, b.jsxs)("details", { children: [/* @__PURE__ */ (0, b.jsx)("summary", { children: "Full-run alert accounting — retrospective simulation evidence" }), /* @__PURE__ */ (0, b.jsxs)("p", {
						className: "caption",
						children: [
							p.alert_evidence.prechange_input_alerts,
							" input-warning windows out of ",
							p.alert_evidence.prechange_windows,
							" no-change/pre-change windows. Input-warning delay: ",
							p.alert_evidence.detection_delay_days === null ? "Not detected / not applicable" : p.alert_evidence.detection_delay_days + " simulated days",
							". ",
							p.alert_evidence.interpretation,
							" This accounting uses the whole saved run, not only the selected checkpoint."
						]
					})] })
				]
			}),
			/* @__PURE__ */ (0, b.jsxs)("article", {
				className: "panel",
				children: [
					/* @__PURE__ */ (0, b.jsxs)("div", {
						className: "panel-head",
						children: [/* @__PURE__ */ (0, b.jsxs)("div", { children: [/* @__PURE__ */ (0, b.jsx)("p", {
							className: "overline",
							children: "WEEK-CLOSE RANKING / MATURE COHORTS ONLY"
						}), /* @__PURE__ */ (0, b.jsx)("h2", { children: "What did the review budget capture?" })] }), /* @__PURE__ */ (0, b.jsxs)("span", {
							className: "badge",
							children: [_.closed_weeks, " mature weeks"]
						})]
					}),
					/* @__PURE__ */ (0, b.jsxs)("p", {
						className: "caption",
						children: [
							"Up to ",
							f.configuration.weekly_budget,
							" records per seven-day replay cohort, selected at week close without outcomes. A cohort enters this table only when its final record has matured. This is a simulated weekly policy—not the older whole-test top-50 metric."
						]
					}),
					/* @__PURE__ */ (0, b.jsx)(A, {
						label: "Mature weekly review policies",
						children: /* @__PURE__ */ (0, b.jsxs)("table", { children: [/* @__PURE__ */ (0, b.jsx)("thead", { children: /* @__PURE__ */ (0, b.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, b.jsx)("th", { children: "Policy" }),
							/* @__PURE__ */ (0, b.jsx)("th", {
								className: "numeric",
								children: "Reviewed / population"
							}),
							/* @__PURE__ */ (0, b.jsx)("th", {
								className: "numeric",
								children: "Captured / positives"
							}),
							/* @__PURE__ */ (0, b.jsx)("th", {
								className: "numeric",
								children: "Missed"
							}),
							/* @__PURE__ */ (0, b.jsx)("th", {
								className: "numeric",
								children: "Precision"
							}),
							/* @__PURE__ */ (0, b.jsx)("th", {
								className: "numeric",
								children: "Recall"
							})
						] }) }), /* @__PURE__ */ (0, b.jsx)("tbody", { children: _.policies.map((e) => /* @__PURE__ */ (0, b.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, b.jsx)("td", { children: e.name === "model" ? "Frozen model" : "Severity baseline" }),
							/* @__PURE__ */ (0, b.jsxs)("td", {
								className: "numeric",
								children: [
									e.reviewed,
									" / ",
									e.population
								]
							}),
							/* @__PURE__ */ (0, b.jsx)("td", {
								className: "numeric",
								children: _.closed_weeks ? e.captured + " / " + e.positives : "Pending"
							}),
							/* @__PURE__ */ (0, b.jsx)("td", {
								className: "numeric",
								children: _.closed_weeks ? e.missed : "Pending"
							}),
							/* @__PURE__ */ (0, b.jsx)("td", {
								className: "numeric",
								children: tn(e.precision)
							}),
							/* @__PURE__ */ (0, b.jsx)("td", {
								className: "numeric",
								children: tn(e.recall)
							})
						] }, e.name)) })] })
					}),
					/* @__PURE__ */ (0, b.jsxs)("p", {
						className: "caption",
						children: [
							"Random selection expected captured positives: ",
							_.random_expected_captured === null ? "Pending" : _.random_expected_captured.toFixed(2),
							". Analytical expectation over the same mature weeks, not an observed run."
						]
					})
				]
			}),
			/* @__PURE__ */ (0, b.jsxs)("article", {
				className: "panel",
				children: [
					/* @__PURE__ */ (0, b.jsxs)("div", {
						className: "panel-head",
						children: [/* @__PURE__ */ (0, b.jsx)("h2", { children: "Prediction ledger at this checkpoint" }), /* @__PURE__ */ (0, b.jsx)("span", {
							className: "caption",
							children: "Saved before label disclosure"
						})]
					}),
					g.error ? /* @__PURE__ */ (0, b.jsx)(cn, {
						message: g.error.message,
						retry: () => void g.refetch()
					}) : g.data ? /* @__PURE__ */ (0, b.jsxs)(b.Fragment, { children: [/* @__PURE__ */ (0, b.jsx)(A, {
						label: "As-of prediction ledger",
						children: /* @__PURE__ */ (0, b.jsxs)("table", { children: [/* @__PURE__ */ (0, b.jsx)("thead", { children: /* @__PURE__ */ (0, b.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, b.jsx)("th", { children: "Fictional record" }),
							/* @__PURE__ */ (0, b.jsx)("th", { children: "Predicted at" }),
							/* @__PURE__ */ (0, b.jsx)("th", {
								className: "numeric",
								children: "Probability"
							}),
							/* @__PURE__ */ (0, b.jsx)("th", { children: "Label available at" }),
							/* @__PURE__ */ (0, b.jsx)("th", { children: "As-of outcome" })
						] }) }), /* @__PURE__ */ (0, b.jsx)("tbody", { children: g.data.records.map((e) => /* @__PURE__ */ (0, b.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, b.jsx)("td", { children: e.id }),
							/* @__PURE__ */ (0, b.jsx)("td", { children: e.observed_at }),
							/* @__PURE__ */ (0, b.jsx)("td", {
								className: "numeric",
								children: tn(e.probability)
							}),
							/* @__PURE__ */ (0, b.jsx)("td", { children: e.outcome_available_at }),
							/* @__PURE__ */ (0, b.jsx)("td", { children: e.outcome === null ? "Pending" : e.outcome ? "Positive" : "Negative" })
						] }, e.id)) })] })
					}), /* @__PURE__ */ (0, b.jsxs)("div", {
						className: "pagination",
						children: [
							/* @__PURE__ */ (0, b.jsx)("button", {
								className: "button",
								disabled: c === 0,
								onClick: () => l(c - 1),
								children: "Previous records"
							}),
							/* @__PURE__ */ (0, b.jsxs)("span", {
								className: "caption",
								children: [
									g.data.total,
									" seen · page ",
									c + 1
								]
							}),
							/* @__PURE__ */ (0, b.jsx)("button", {
								className: "button",
								disabled: (c + 1) * 25 >= g.data.total,
								onClick: () => l(c + 1),
								children: "Next records"
							})
						]
					})] }) : /* @__PURE__ */ (0, b.jsx)("p", {
						role: "status",
						children: "Loading checkpoint ledger…"
					}),
					/* @__PURE__ */ (0, b.jsxs)("p", {
						className: "caption replay-fingerprint",
						children: [
							"Prediction ledger SHA-256: ",
							p.prediction_sha256,
							". Fingerprint covers the whole input-only prediction run, not authenticity or tamper-proof storage. Snapshot: ",
							f.snapshot_id,
							"."
						]
					})
				]
			})
		]
	});
}
function sn({ label: e, value: t }) {
	return /* @__PURE__ */ (0, b.jsxs)("div", {
		className: "metric",
		children: [/* @__PURE__ */ (0, b.jsx)("span", {
			className: "metric-label",
			children: e
		}), /* @__PURE__ */ (0, b.jsx)("strong", {
			className: "metric-value",
			children: t
		})]
	});
}
function cn({ message: e, retry: t }) {
	return /* @__PURE__ */ (0, b.jsxs)("div", {
		className: "experiment-error",
		role: "alert",
		children: [/* @__PURE__ */ (0, b.jsxs)("div", { children: [/* @__PURE__ */ (0, b.jsx)("strong", { children: "Saved evidence unavailable" }), /* @__PURE__ */ (0, b.jsx)("p", { children: e })] }), /* @__PURE__ */ (0, b.jsx)("button", {
			className: "button",
			onClick: t,
			children: "Try again"
		})]
	});
}
var ln = {
	logistic: "Standardized logistic",
	trees: "Histogram boosted trees",
	prevalence: "Training prevalence"
};
function un() {
	let e = O({
		queryKey: ["challenge"],
		queryFn: ({ signal: e }) => k("/api/challenge", e),
		enabled: rn("challenge")
	}), [t, n] = (0, y.useState)("linear");
	if (e.error) return /* @__PURE__ */ (0, b.jsx)(cn, {
		message: e.error.message,
		retry: () => void e.refetch()
	});
	if (!e.data) return /* @__PURE__ */ (0, b.jsx)("p", {
		className: "experiment-empty",
		role: "status",
		children: "Loading offline challenge evidence…"
	});
	let r = e.data;
	return r.status !== "available" || !r.configuration || !r.items || !r.summary ? /* @__PURE__ */ (0, b.jsxs)("p", {
		className: "notice subtle",
		children: [
			r.warning,
			" ",
			/* @__PURE__ */ (0, b.jsx)("code", { children: "python -m signalrank.demo" })
		]
	}) : /* @__PURE__ */ (0, b.jsxs)("div", {
		className: "lab-workspace",
		children: [
			/* @__PURE__ */ (0, b.jsx)("p", {
				className: "notice subtle",
				children: r.warning
			}),
			/* @__PURE__ */ (0, b.jsxs)("article", {
				className: "panel",
				children: [
					/* @__PURE__ */ (0, b.jsxs)("div", {
						className: "panel-head",
						children: [/* @__PURE__ */ (0, b.jsxs)("div", { children: [/* @__PURE__ */ (0, b.jsx)("p", {
							className: "overline",
							children: "FOUR CASES / THREE SEEDS / FIXED CANDIDATES"
						}), /* @__PURE__ */ (0, b.jsx)("h2", { children: "Challenge the assumptions." })] }), /* @__PURE__ */ (0, b.jsx)("a", {
							className: "button",
							href: "/api/challenge",
							download: "signalrank-challenges.json",
							children: "Export all evidence"
						})]
					}),
					/* @__PURE__ */ (0, b.jsxs)("label", { children: ["Challenge case", /* @__PURE__ */ (0, b.jsx)("select", {
						value: t,
						onChange: (e) => n(e.target.value),
						children: Array.from(new Map(r.items.map((e) => [e.case, e.name]))).map(([e, t]) => /* @__PURE__ */ (0, b.jsx)("option", {
							value: e,
							children: t
						}, e))
					})] }),
					/* @__PURE__ */ (0, b.jsx)("p", {
						className: "caption",
						children: r.configuration.definitions[t]
					}),
					/* @__PURE__ */ (0, b.jsx)(A, {
						label: "Challenge seed summary",
						children: /* @__PURE__ */ (0, b.jsxs)("table", { children: [/* @__PURE__ */ (0, b.jsx)("thead", { children: /* @__PURE__ */ (0, b.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, b.jsx)("th", { children: "Candidate" }),
							/* @__PURE__ */ (0, b.jsx)("th", {
								className: "numeric",
								children: "Seeds"
							}),
							/* @__PURE__ */ (0, b.jsx)("th", {
								className: "numeric",
								children: "Mean AP"
							}),
							/* @__PURE__ */ (0, b.jsx)("th", {
								className: "numeric",
								children: "AP seed SD"
							}),
							/* @__PURE__ */ (0, b.jsx)("th", {
								className: "numeric",
								children: "Mean Brier ↓"
							}),
							/* @__PURE__ */ (0, b.jsx)("th", {
								className: "numeric",
								children: "Mean recall@50"
							})
						] }) }), /* @__PURE__ */ (0, b.jsx)("tbody", { children: r.summary.filter((e) => e.case === t).map((e) => /* @__PURE__ */ (0, b.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, b.jsx)("td", { children: ln[e.candidate] }),
							/* @__PURE__ */ (0, b.jsxs)("td", {
								className: "numeric",
								children: [e.evaluated_seeds, " / 3"]
							}),
							/* @__PURE__ */ (0, b.jsx)("td", {
								className: "numeric",
								children: en(e.metrics?.average_precision.mean)
							}),
							/* @__PURE__ */ (0, b.jsx)("td", {
								className: "numeric",
								children: en(e.metrics?.average_precision.seed_sd)
							}),
							/* @__PURE__ */ (0, b.jsx)("td", {
								className: "numeric",
								children: en(e.metrics?.brier_score.mean)
							}),
							/* @__PURE__ */ (0, b.jsx)("td", {
								className: "numeric",
								children: e.metrics ? tn(e.metrics.recall_at_50.mean) : "Unavailable"
							})
						] }, e.candidate)) })] })
					}),
					/* @__PURE__ */ (0, b.jsx)("p", {
						className: "caption",
						children: "Every seed is retained. Seed SD is variability over three fictional datasets, not a confidence interval. No best-model badge or automatic promotion. These numeric categories do not test natural-language generalization."
					})
				]
			}),
			r.items.filter((e) => e.case === t).map((e) => /* @__PURE__ */ (0, b.jsxs)("article", {
				className: "panel",
				children: [
					/* @__PURE__ */ (0, b.jsxs)("div", {
						className: "panel-head",
						children: [/* @__PURE__ */ (0, b.jsxs)("h2", { children: ["Seed ", e.seed] }), /* @__PURE__ */ (0, b.jsx)("span", {
							className: "badge",
							children: e.status
						})]
					}),
					/* @__PURE__ */ (0, b.jsx)("div", {
						className: "replay-splits",
						children: Object.entries(e.splits).map(([e, t]) => /* @__PURE__ */ (0, b.jsxs)("div", { children: [
							/* @__PURE__ */ (0, b.jsx)("span", {
								className: "overline",
								children: e
							}),
							/* @__PURE__ */ (0, b.jsxs)("strong", { children: [
								t.count,
								" records · ",
								t.positives,
								" positives"
							] }),
							/* @__PURE__ */ (0, b.jsxs)("p", {
								className: "caption",
								children: [
									t.first,
									" → ",
									t.last
								]
							})
						] }, e))
					}),
					e.reason ? /* @__PURE__ */ (0, b.jsx)("p", {
						className: "notice subtle",
						children: e.reason
					}) : /* @__PURE__ */ (0, b.jsx)(A, {
						label: "Challenge seed " + e.seed,
						children: /* @__PURE__ */ (0, b.jsxs)("table", { children: [/* @__PURE__ */ (0, b.jsx)("thead", { children: /* @__PURE__ */ (0, b.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, b.jsx)("th", { children: "Candidate" }),
							/* @__PURE__ */ (0, b.jsx)("th", {
								className: "numeric",
								children: "Calibrated AP"
							}),
							/* @__PURE__ */ (0, b.jsx)("th", {
								className: "numeric",
								children: "Calibrated Brier ↓"
							}),
							/* @__PURE__ */ (0, b.jsx)("th", {
								className: "numeric",
								children: "Recall@50"
							})
						] }) }), /* @__PURE__ */ (0, b.jsx)("tbody", { children: e.items.map((e) => /* @__PURE__ */ (0, b.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, b.jsx)("td", { children: ln[e.candidate] }),
							/* @__PURE__ */ (0, b.jsx)("td", {
								className: "numeric",
								children: en(e.calibrated.average_precision)
							}),
							/* @__PURE__ */ (0, b.jsx)("td", {
								className: "numeric",
								children: en(e.calibrated.brier_score)
							}),
							/* @__PURE__ */ (0, b.jsx)("td", {
								className: "numeric",
								children: tn(e.calibrated.recall_at_50)
							})
						] }, e.candidate)) })] })
					}),
					/* @__PURE__ */ (0, b.jsxs)("p", {
						className: "caption replay-fingerprint",
						children: ["Dataset SHA-256: ", e.dataset_sha256]
					})
				]
			}, e.seed)),
			/* @__PURE__ */ (0, b.jsxs)("details", {
				className: "panel",
				children: [
					/* @__PURE__ */ (0, b.jsx)("summary", { children: "Fixed inputs, candidate parameters and protocol" }),
					/* @__PURE__ */ (0, b.jsxs)("p", {
						className: "caption",
						children: [
							"Both learned candidates receive ",
							r.configuration.features.join(", "),
							". Preprocessing/classifiers fit on earlier training rows; separate sigmoid calibration fits on later calibration rows. Thirty-day maturity gaps separate partitions. Budget 50 applies to the entire mature evaluation cohort."
						]
					}),
					/* @__PURE__ */ (0, b.jsx)("pre", { children: JSON.stringify(r.configuration.parameters, null, 2) }),
					/* @__PURE__ */ (0, b.jsxs)("p", {
						className: "caption",
						children: [
							"Protocol: ",
							r.protocol,
							". This public explored suite is development evidence, not a final untouched test."
						]
					})
				]
			})
		]
	});
}
//#endregion
//#region src/Workbench.tsx
var dn = {
	category: 1,
	severity: 5,
	remote: !0,
	authentication_required: !1
}, fn = "signalrank-studio-examples-v1", pn = (e) => e == null ? "Unavailable" : e.toFixed(4), mn = (e) => e == null ? "Unavailable" : (100 * e).toFixed(1) + "%", hn = (e) => (e >= 0 ? "+" : "") + e.toFixed(3), gn = (e) => ({
	numeric__x1: "Severity (standardized)",
	numeric__x2: "Remote (standardized)",
	numeric__x3: "Authentication (standardized)"
})[e] || e.replace(/^text__/, "Text: ");
function _n(e) {
	let t = () => location.hash.slice(1).split(/[/?]/)[0] === e, [n, r] = (0, y.useState)(t);
	return (0, y.useEffect)(() => {
		let e = () => r(t());
		return window.addEventListener("hashchange", e), window.addEventListener("signalrank:view", e), () => {
			window.removeEventListener("hashchange", e), window.removeEventListener("signalrank:view", e);
		};
	}, [e]), n;
}
function vn(e) {
	let [t, n] = (0, y.useState)(e);
	return (0, y.useEffect)(() => {
		let t = window.setTimeout(() => n(e), 200);
		return () => window.clearTimeout(t);
	}, [e]), t;
}
function yn({ error: e, retry: t }) {
	return /* @__PURE__ */ (0, b.jsxs)("div", {
		className: "experiment-error",
		role: "alert",
		children: [/* @__PURE__ */ (0, b.jsx)("p", { children: e.message }), /* @__PURE__ */ (0, b.jsx)("button", {
			className: "button",
			onClick: t,
			children: "Try again"
		})]
	});
}
function bn({ label: e, value: t }) {
	return /* @__PURE__ */ (0, b.jsxs)("div", {
		className: "metric",
		children: [/* @__PURE__ */ (0, b.jsx)("span", {
			className: "metric-label",
			children: e
		}), /* @__PURE__ */ (0, b.jsx)("strong", {
			className: "metric-value",
			children: t
		})]
	});
}
function xn(e, t) {
	let n = URL.createObjectURL(new Blob([JSON.stringify(e, null, 2)], { type: "application/json" })), r = document.createElement("a");
	r.href = n, r.download = t, r.click(), window.setTimeout(() => URL.revokeObjectURL(n), 0);
}
function Sn(e) {
	let t = e;
	return !!t && Number.isInteger(t.category) && t.category >= 0 && t.category <= 4 && Number.isFinite(t.severity) && t.severity >= 1 && t.severity <= 10 && typeof t.remote == "boolean" && typeof t.authentication_required == "boolean";
}
function Cn() {
	try {
		let e = localStorage.getItem(fn);
		if (!e || e.length > 2e4) return [];
		let t = JSON.parse(e);
		return Array.isArray(t) ? t.filter((e) => Sn(e.original) && Sn(e.modified) && /^[a-f0-9]{64}$/.test(e.model_id)).slice(0, 8) : [];
	} catch {
		return [];
	}
}
function wn(e, t) {
	return new URLSearchParams({
		category: String(e.category),
		severity: String(e.severity),
		remote: String(e.remote),
		authentication_required: String(e.authentication_required),
		model_id: t
	}).toString();
}
function Tn({ prediction: e }) {
	let t = [
		{
			feature: "Intercept",
			value: e.intercept,
			start: 0,
			end: e.intercept
		},
		...e.contributions.filter((e) => Math.abs(e.value) > 1e-12),
		{
			feature: "Total raw log-odds",
			value: e.logit,
			start: 0,
			end: e.logit
		}
	], n = Math.min(0, ...t.flatMap((e) => [e.start, e.end])), r = Math.max(0, ...t.flatMap((e) => [e.start, e.end])), i = (e) => 270 + (e - n) / Math.max(.1, r - n) * 370;
	return /* @__PURE__ */ (0, b.jsx)("div", {
		className: "waterfall-scroll",
		role: "region",
		"aria-label": "Complete log-odds waterfall, scroll for all nonzero factors",
		tabIndex: 0,
		children: /* @__PURE__ */ (0, b.jsxs)("svg", {
			viewBox: `0 0 760 ${t.length * 28 + 36}`,
			style: { height: t.length * 28 + 36 },
			role: "img",
			"aria-label": "Intercept plus all feature contributions reconstructs the raw model score",
			children: [
				/* @__PURE__ */ (0, b.jsx)("line", {
					x1: i(0),
					x2: i(0),
					y1: "0",
					y2: t.length * 28,
					stroke: "var(--control)"
				}),
				t.map((e, n) => /* @__PURE__ */ (0, b.jsxs)("g", { children: [
					/* @__PURE__ */ (0, b.jsx)("text", {
						x: "255",
						y: n * 28 + 18,
						textAnchor: "end",
						children: gn(e.feature).slice(0, 35)
					}),
					/* @__PURE__ */ (0, b.jsx)("rect", {
						x: Math.min(i(e.start), i(e.end)),
						y: n * 28 + 5,
						width: Math.max(1, Math.abs(i(e.end) - i(e.start))),
						height: "18",
						rx: "0",
						fill: n === t.length - 1 ? "var(--hero-accent)" : e.value >= 0 ? "var(--accent)" : "var(--muted)"
					}),
					/* @__PURE__ */ (0, b.jsx)("text", {
						x: "655",
						y: n * 28 + 18,
						children: hn(e.value)
					}),
					/* @__PURE__ */ (0, b.jsxs)("title", { children: [
						gn(e.feature),
						": ",
						hn(e.value),
						"; cumulative ",
						pn(e.end)
					] })
				] }, n)),
				/* @__PURE__ */ (0, b.jsx)("text", {
					x: "270",
					y: t.length * 28 + 24,
					children: "Log-odds, not probability percentage points"
				})
			]
		})
	});
}
function En() {
	let e = _n("studio"), t = O({
		queryKey: ["studio-options"],
		queryFn: ({ signal: e }) => k("/api/studio/options", e),
		enabled: e
	}), [n, r] = (0, y.useState)(dn), [i, a] = (0, y.useState)(dn), [o, s] = (0, y.useState)(""), [c, l] = (0, y.useState)(Cn), [u, d] = (0, y.useState)(""), f = o || t.data?.models[0]?.artifact_id || "", p = vn(i), m = O({
		queryKey: [
			"studio",
			f,
			n
		],
		queryFn: ({ signal: e }) => k("/api/studio/predict?" + wn(n, f), e),
		enabled: e && !!f
	}), h = O({
		queryKey: [
			"studio",
			f,
			p
		],
		queryFn: ({ signal: e }) => k("/api/studio/predict?" + wn(p, f), e),
		enabled: e && !!f
	}), g = p !== i || h.isFetching;
	function _() {
		let e = [...c, {
			original: n,
			modified: i,
			model_id: f
		}].slice(-8);
		try {
			localStorage.setItem(fn, JSON.stringify(e)), l(e), d("Saved on this browser only, pinned to this model version.");
		} catch {
			d("Browser storage is unavailable; predictions still work.");
		}
	}
	function v(e) {
		if (!t.data?.models.some((t) => t.artifact_id === e.model_id)) {
			d("That saved model version is not available. The example was not reassigned to another model.");
			return;
		}
		s(e.model_id), r(e.original), a(e.modified), d("Restored the original model version and inputs.");
	}
	return t.error ? /* @__PURE__ */ (0, b.jsx)(yn, {
		error: t.error,
		retry: () => void t.refetch()
	}) : t.data ? t.data.models.length ? /* @__PURE__ */ (0, b.jsxs)("div", {
		className: "lab-workspace",
		children: [
			/* @__PURE__ */ (0, b.jsx)("p", {
				className: "notice subtle",
				children: "Original fictional records only. Change inputs to inspect model sensitivity—not a causal intervention or real-world risk estimate."
			}),
			/* @__PURE__ */ (0, b.jsxs)("article", {
				className: "panel",
				children: [
					/* @__PURE__ */ (0, b.jsxs)("div", {
						className: "panel-head",
						children: [/* @__PURE__ */ (0, b.jsxs)("div", { children: [/* @__PURE__ */ (0, b.jsx)("p", {
							className: "overline",
							children: "INPUT / MODEL / EXPLANATION"
						}), /* @__PURE__ */ (0, b.jsx)("h2", { children: "Change one assumption." })] }), /* @__PURE__ */ (0, b.jsx)("span", {
							className: "badge",
							children: "Frozen saved model"
						})]
					}),
					/* @__PURE__ */ (0, b.jsxs)("div", {
						className: "studio-controls",
						children: [
							/* @__PURE__ */ (0, b.jsxs)("label", { children: ["Saved model version", /* @__PURE__ */ (0, b.jsx)("select", {
								value: f,
								onChange: (e) => {
									s(e.target.value), d("");
								},
								children: t.data.models.map((e) => /* @__PURE__ */ (0, b.jsxs)("option", {
									value: e.artifact_id,
									children: [
										"Seed ",
										e.configuration.seed,
										" · ",
										e.artifact_id.slice(0, 12)
									]
								}, e.artifact_id))
							})] }),
							/* @__PURE__ */ (0, b.jsxs)("label", { children: ["Fictional category", /* @__PURE__ */ (0, b.jsx)("select", {
								value: i.category,
								onChange: (e) => a({
									...i,
									category: Number(e.target.value)
								}),
								children: t.data.categories.map((e, t) => /* @__PURE__ */ (0, b.jsx)("option", {
									value: t,
									children: e
								}, e))
							})] }),
							/* @__PURE__ */ (0, b.jsxs)("label", {
								htmlFor: "studio-severity",
								children: [
									"Severity ",
									/* @__PURE__ */ (0, b.jsx)("output", { children: i.severity.toFixed(1) }),
									/* @__PURE__ */ (0, b.jsx)("input", {
										id: "studio-severity",
										"aria-label": "Severity",
										type: "range",
										min: "1",
										max: "10",
										step: ".1",
										value: i.severity,
										onChange: (e) => a({
											...i,
											severity: Number(e.target.value)
										})
									})
								]
							}),
							/* @__PURE__ */ (0, b.jsxs)("label", { children: ["Remote access", /* @__PURE__ */ (0, b.jsxs)("select", {
								value: String(i.remote),
								onChange: (e) => a({
									...i,
									remote: e.target.value === "true"
								}),
								children: [/* @__PURE__ */ (0, b.jsx)("option", {
									value: "true",
									children: "Yes"
								}), /* @__PURE__ */ (0, b.jsx)("option", {
									value: "false",
									children: "No"
								})]
							})] }),
							/* @__PURE__ */ (0, b.jsxs)("label", { children: ["Authentication required", /* @__PURE__ */ (0, b.jsxs)("select", {
								value: String(i.authentication_required),
								onChange: (e) => a({
									...i,
									authentication_required: e.target.value === "true"
								}),
								children: [/* @__PURE__ */ (0, b.jsx)("option", {
									value: "true",
									children: "Yes"
								}), /* @__PURE__ */ (0, b.jsx)("option", {
									value: "false",
									children: "No"
								})]
							})] })
						]
					}),
					/* @__PURE__ */ (0, b.jsxs)("div", {
						className: "studio-actions",
						children: [
							/* @__PURE__ */ (0, b.jsx)("button", {
								className: "button",
								onClick: () => r({ ...i }),
								children: "Use current inputs as baseline"
							}),
							/* @__PURE__ */ (0, b.jsx)("button", {
								className: "button",
								onClick: () => {
									r(dn), a(dn);
								},
								children: "Reset fictional example"
							}),
							/* @__PURE__ */ (0, b.jsx)("button", {
								className: "button",
								disabled: g || !m.data || !!m.error || !h.data || !!h.error,
								onClick: _,
								children: "Save comparison locally"
							})
						]
					}),
					u && /* @__PURE__ */ (0, b.jsx)("p", {
						role: "status",
						className: "notice subtle",
						children: u
					}),
					/* @__PURE__ */ (0, b.jsx)("div", {
						className: "studio-comparison",
						"aria-busy": g,
						children: [{
							name: "Original",
							value: m.data,
							input: n
						}, {
							name: "Modified",
							value: g ? void 0 : h.data,
							input: i
						}].map((e) => /* @__PURE__ */ (0, b.jsxs)("div", {
							className: "prediction-card",
							children: [
								/* @__PURE__ */ (0, b.jsx)("span", {
									className: "overline",
									children: e.name
								}),
								/* @__PURE__ */ (0, b.jsx)("strong", { children: e.value ? mn(e.value.calibrated_probability) : "Updating…" }),
								/* @__PURE__ */ (0, b.jsxs)("p", { children: ["Calibrated probability · raw ", e.value ? mn(e.value.raw_probability) : "—"] }),
								/* @__PURE__ */ (0, b.jsxs)("p", {
									className: "caption",
									children: [
										t.data.categories[e.input.category],
										" · severity ",
										e.input.severity,
										" · remote ",
										e.input.remote ? "yes" : "no",
										" · auth ",
										e.input.authentication_required ? "yes" : "no"
									]
								})
							]
						}, e.name))
					}),
					m.error && /* @__PURE__ */ (0, b.jsx)(yn, {
						error: m.error,
						retry: () => void m.refetch()
					}),
					h.error && /* @__PURE__ */ (0, b.jsx)(yn, {
						error: h.error,
						retry: () => void h.refetch()
					}),
					!g && m.data && h.data && !m.error && !h.error && /* @__PURE__ */ (0, b.jsxs)("p", {
						className: "prediction-delta",
						children: [
							"Calibrated change: ",
							hn(100 * (h.data.calibrated_probability - m.data.calibrated_probability)),
							" percentage points. Model sensitivity only."
						]
					})
				]
			}),
			!g && h.data && !h.error && /* @__PURE__ */ (0, b.jsxs)("article", {
				className: "panel",
				children: [
					/* @__PURE__ */ (0, b.jsxs)("div", {
						className: "panel-head",
						children: [/* @__PURE__ */ (0, b.jsxs)("div", { children: [/* @__PURE__ */ (0, b.jsx)("p", {
							className: "overline",
							children: "COMPLETE LINEAR DECOMPOSITION"
						}), /* @__PURE__ */ (0, b.jsx)("h2", { children: "From intercept to score." })] }), /* @__PURE__ */ (0, b.jsx)("button", {
							className: "button",
							disabled: !m.data || !!m.error,
							onClick: () => xn({
								original: m.data,
								modified: h.data
							}, "signalrank-prediction-comparison.json"),
							children: "Export explanation"
						})]
					}),
					/* @__PURE__ */ (0, b.jsx)(Tn, { prediction: h.data }),
					/* @__PURE__ */ (0, b.jsx)("p", {
						className: "caption",
						children: "All nonzero contributions are drawn; zero contributions remain in the complete table. The intercept plus every feature reconstructs raw log-odds. Calibration is a separate transform, not a redistribution of these bars."
					}),
					/* @__PURE__ */ (0, b.jsxs)("div", {
						className: "calibration-equation",
						children: [
							/* @__PURE__ */ (0, b.jsxs)("span", { children: ["Raw log-odds ", pn(h.data.logit)] }),
							/* @__PURE__ */ (0, b.jsx)("span", {
								"aria-hidden": "true",
								children: "→"
							}),
							/* @__PURE__ */ (0, b.jsxs)("span", { children: [
								"Sigmoid(",
								pn(h.data.calibration.slope),
								" × log-odds ",
								hn(h.data.calibration.intercept),
								")"
							] }),
							/* @__PURE__ */ (0, b.jsx)("span", {
								"aria-hidden": "true",
								children: "→"
							}),
							/* @__PURE__ */ (0, b.jsx)("strong", { children: mn(h.data.calibrated_probability) })
						]
					}),
					/* @__PURE__ */ (0, b.jsxs)("details", { children: [
						/* @__PURE__ */ (0, b.jsx)("summary", { children: "Every factor and reconstruction check" }),
						/* @__PURE__ */ (0, b.jsx)(A, {
							label: "All raw linear contributions",
							children: /* @__PURE__ */ (0, b.jsxs)("table", { children: [/* @__PURE__ */ (0, b.jsx)("thead", { children: /* @__PURE__ */ (0, b.jsxs)("tr", { children: [
								/* @__PURE__ */ (0, b.jsx)("th", { children: "Factor" }),
								/* @__PURE__ */ (0, b.jsx)("th", { children: "Contribution" }),
								/* @__PURE__ */ (0, b.jsx)("th", { children: "Cumulative log-odds" })
							] }) }), /* @__PURE__ */ (0, b.jsxs)("tbody", { children: [/* @__PURE__ */ (0, b.jsxs)("tr", { children: [
								/* @__PURE__ */ (0, b.jsx)("td", { children: "Intercept" }),
								/* @__PURE__ */ (0, b.jsx)("td", { children: pn(h.data.intercept) }),
								/* @__PURE__ */ (0, b.jsx)("td", { children: pn(h.data.intercept) })
							] }), h.data.contributions.map((e) => /* @__PURE__ */ (0, b.jsxs)("tr", { children: [
								/* @__PURE__ */ (0, b.jsx)("td", { children: gn(e.feature) }),
								/* @__PURE__ */ (0, b.jsx)("td", { children: hn(e.value) }),
								/* @__PURE__ */ (0, b.jsx)("td", { children: pn(e.end) })
							] }, e.feature))] })] })
						}),
						/* @__PURE__ */ (0, b.jsxs)("p", {
							className: "caption",
							children: [
								"Reconstruction error: ",
								h.data.reconstruction_error.toExponential(2),
								". Raw log-odds: ",
								pn(h.data.logit),
								"."
							]
						})
					] }),
					/* @__PURE__ */ (0, b.jsxs)("p", {
						className: "caption replay-fingerprint",
						children: [
							"Model ",
							h.data.model.artifact_id,
							" · input SHA-256 ",
							h.data.input_sha256,
							" · snapshot ",
							h.data.snapshot_id
						]
					}),
					/* @__PURE__ */ (0, b.jsx)("p", {
						className: "caption",
						children: h.data.warning
					})
				]
			}),
			/* @__PURE__ */ (0, b.jsxs)("article", {
				className: "panel",
				children: [
					/* @__PURE__ */ (0, b.jsx)("h2", { children: "Browser-local examples" }),
					/* @__PURE__ */ (0, b.jsx)("p", {
						className: "caption",
						children: "Up to eight input comparisons, pinned to their saved model version. No server receipt or visitor account is created."
					}),
					c.length ? /* @__PURE__ */ (0, b.jsx)("div", {
						className: "studio-actions",
						children: c.map((e, t) => /* @__PURE__ */ (0, b.jsxs)("button", {
							className: "button",
							onClick: () => v(e),
							children: [
								"Restore example ",
								t + 1,
								" · ",
								e.model_id.slice(0, 8)
							]
						}, t))
					}) : /* @__PURE__ */ (0, b.jsx)("p", { children: "No saved examples yet." })
				]
			})
		]
	}) : /* @__PURE__ */ (0, b.jsx)("p", {
		className: "notice subtle",
		children: "Prediction Studio needs an explicitly trusted saved model. Run the current local demo; it never trains or loads a browser-supplied artifact."
	}) : /* @__PURE__ */ (0, b.jsx)("p", {
		role: "status",
		children: "Loading saved model choices…"
	});
}
function Dn({ labels: e, series: t, title: n, xTitle: r, numericX: i }) {
	let a = Math.max(.01, ...t.flatMap((e) => e.values.filter((e) => e !== null))), o = a <= 1 ? Math.max(.1, Math.ceil(a * 10) / 10) : Math.ceil(a / 4) * 4, s = (t) => 65 + (i ? i[t] / Math.max(1, i.at(-1)) : t / Math.max(1, e.length - 1)) * 625, c = (e) => 210 - e / o * 165, l = (e) => {
		let t = [], n = !0;
		return e.forEach((e, r) => {
			if (e === null) {
				n = !0;
				return;
			}
			t.push(`${n ? "M" : "L"} ${s(r)} ${c(e)}`), n = !1;
		}), t.join(" ");
	};
	return /* @__PURE__ */ (0, b.jsxs)(b.Fragment, { children: [/* @__PURE__ */ (0, b.jsxs)("svg", {
		className: "workbench-chart",
		viewBox: "0 0 760 275",
		role: "img",
		"aria-label": n,
		children: [
			[
				0,
				1,
				2,
				3,
				4
			].map((e) => /* @__PURE__ */ (0, b.jsxs)("g", { children: [/* @__PURE__ */ (0, b.jsx)("line", {
				x1: "65",
				x2: "690",
				y1: c(o * e / 4),
				y2: c(o * e / 4),
				stroke: "var(--line)"
			}), /* @__PURE__ */ (0, b.jsx)("text", {
				x: "53",
				y: c(o * e / 4) + 4,
				textAnchor: "end",
				children: o <= 1 ? (o * e / 4).toFixed(2) : (o * e / 4).toFixed(0)
			})] }, e)),
			t.map((t) => /* @__PURE__ */ (0, b.jsxs)("g", { children: [/* @__PURE__ */ (0, b.jsx)("path", {
				d: l(t.values),
				fill: "none",
				stroke: t.color,
				strokeWidth: "2.5",
				strokeDasharray: t.dashed ? "6 4" : void 0
			}), t.values.map((n, r) => n === null ? null : /* @__PURE__ */ (0, b.jsx)("circle", {
				cx: s(r),
				cy: c(n),
				r: "3",
				fill: t.color,
				children: /* @__PURE__ */ (0, b.jsxs)("title", { children: [
					t.name,
					" · ",
					e[r],
					": ",
					pn(n)
				] })
			}, r))] }, t.name)),
			/* @__PURE__ */ (0, b.jsx)("text", {
				x: "65",
				y: "239",
				children: e[0]
			}),
			/* @__PURE__ */ (0, b.jsx)("text", {
				x: "690",
				y: "239",
				textAnchor: "end",
				children: e.at(-1)
			}),
			/* @__PURE__ */ (0, b.jsx)("text", {
				x: "375",
				y: "267",
				textAnchor: "middle",
				children: r
			})
		]
	}), /* @__PURE__ */ (0, b.jsx)("div", {
		className: "chart-key",
		children: t.map((e) => /* @__PURE__ */ (0, b.jsxs)("span", { children: [
			/* @__PURE__ */ (0, b.jsx)("i", {
				style: { background: e.color },
				"aria-hidden": "true"
			}),
			e.name,
			e.dashed ? " · dashed" : " · solid"
		] }, e.name))
	})] });
}
function On() {
	let e = O({
		queryKey: ["recovery"],
		queryFn: ({ signal: e }) => k("/api/recovery", e),
		enabled: _n("recovery")
	}), [t, n] = (0, y.useState)("concept_shift"), [r, i] = (0, y.useState)(2718), [a, o] = (0, y.useState)("brier_score"), [s, c] = (0, y.useState)("postchange_mature");
	if (e.error) return /* @__PURE__ */ (0, b.jsx)(yn, {
		error: e.error,
		retry: () => void e.refetch()
	});
	if (!e.data) return /* @__PURE__ */ (0, b.jsx)("p", {
		role: "status",
		children: "Loading fixed-schedule recovery evidence…"
	});
	let l = e.data, u = l.runs?.find((e) => e.scenario === t && e.seed === r);
	if (l.status !== "available" || !l.configuration || !u) return /* @__PURE__ */ (0, b.jsx)("p", {
		className: "notice subtle",
		children: l.warning
	});
	let d = u.results[s];
	return /* @__PURE__ */ (0, b.jsxs)("div", {
		className: "lab-workspace",
		children: [
			/* @__PURE__ */ (0, b.jsx)("p", {
				className: "notice subtle",
				children: l.warning
			}),
			/* @__PURE__ */ (0, b.jsxs)("article", {
				className: "panel",
				children: [
					/* @__PURE__ */ (0, b.jsxs)("div", {
						className: "panel-head",
						children: [/* @__PURE__ */ (0, b.jsxs)("div", { children: [/* @__PURE__ */ (0, b.jsx)("p", {
							className: "overline",
							children: "FIXED SCHEDULE / NO AUTOMATIC PROMOTION"
						}), /* @__PURE__ */ (0, b.jsx)("h2", { children: "Does updating actually help?" })] }), /* @__PURE__ */ (0, b.jsx)("a", {
							className: "button",
							href: "/api/recovery",
							download: "signalrank-recovery.json",
							children: "Export comparison"
						})]
					}),
					/* @__PURE__ */ (0, b.jsxs)("div", {
						className: "studio-controls",
						children: [
							/* @__PURE__ */ (0, b.jsxs)("label", { children: ["Recovery scenario", /* @__PURE__ */ (0, b.jsx)("select", {
								value: t,
								onChange: (e) => n(e.target.value),
								children: Array.from(new Map(l.runs.map((e) => [e.scenario, e.name]))).map(([e, t]) => /* @__PURE__ */ (0, b.jsx)("option", {
									value: e,
									children: t
								}, e))
							})] }),
							/* @__PURE__ */ (0, b.jsxs)("label", { children: ["Recovery seed", /* @__PURE__ */ (0, b.jsx)("select", {
								value: r,
								onChange: (e) => i(Number(e.target.value)),
								children: l.configuration.seeds.map((e) => /* @__PURE__ */ (0, b.jsx)("option", { children: e }, e))
							})] }),
							/* @__PURE__ */ (0, b.jsxs)("label", { children: ["Recovery chart metric", /* @__PURE__ */ (0, b.jsxs)("select", {
								value: a,
								onChange: (e) => o(e.target.value),
								children: [/* @__PURE__ */ (0, b.jsx)("option", {
									value: "brier_score",
									children: "Rolling mature Brier ↓"
								}), /* @__PURE__ */ (0, b.jsx)("option", {
									value: "average_precision",
									children: "Rolling mature average precision ↑"
								})]
							})] })
						]
					}),
					/* @__PURE__ */ (0, b.jsx)(Dn, {
						labels: u.checkpoints.map((e) => e.as_of),
						series: [{
							name: "Frozen model",
							values: u.checkpoints.map((e) => e.frozen?.[a] ?? null),
							color: "var(--muted)",
							dashed: !0
						}, {
							name: "Scheduled retraining",
							values: u.checkpoints.map((e) => e.scheduled?.[a] ?? null),
							color: "var(--accent)"
						}],
						title: a === "brier_score" ? "Rolling mature Brier score: frozen versus scheduled" : "Rolling mature average precision: frozen versus scheduled",
						xTitle: "Simulated checkpoint · previous 30 mature observation days"
					}),
					/* @__PURE__ */ (0, b.jsxs)("p", {
						className: "caption",
						children: [
							"Full-run retrospective comparison through ",
							u.end,
							". Updates at simulated days ",
							l.configuration.update_days.join(", "),
							". ",
							u.change_at ? "Generator relationship/distribution changes at " + u.change_at + "." : "No change scheduled in this control.",
							" Empty chart points are unsupported, not zero performance. This page is not an as-of replay or a live training job. ",
							l.configuration.update_days.includes(168) && "The day-168 update has no mature post-update outcome by the replay end; a completed fit is not evidence of benefit."
						]
					}),
					/* @__PURE__ */ (0, b.jsxs)("label", { children: ["Summary interval", /* @__PURE__ */ (0, b.jsxs)("select", {
						value: s,
						onChange: (e) => c(e.target.value),
						children: [/* @__PURE__ */ (0, b.jsx)("option", {
							value: "postchange_mature",
							children: "Day 91 onward, mature outcomes only"
						}), /* @__PURE__ */ (0, b.jsx)("option", {
							value: "all_mature",
							children: "All mature outcomes"
						})]
					})] }),
					/* @__PURE__ */ (0, b.jsxs)("div", {
						className: "metrics replay-metrics",
						children: [
							/* @__PURE__ */ (0, b.jsx)(bn, {
								label: "Frozen AP",
								value: pn(d.frozen?.average_precision)
							}),
							/* @__PURE__ */ (0, b.jsx)(bn, {
								label: "Scheduled AP",
								value: pn(d.scheduled?.average_precision)
							}),
							/* @__PURE__ */ (0, b.jsx)(bn, {
								label: "Frozen Brier",
								value: pn(d.frozen?.brier_score)
							}),
							/* @__PURE__ */ (0, b.jsx)(bn, {
								label: "Scheduled Brier",
								value: pn(d.scheduled?.brier_score)
							})
						]
					}),
					/* @__PURE__ */ (0, b.jsxs)("p", {
						className: "caption",
						children: [
							"Identical evaluation inputs and labels; ",
							d.frozen?.count ?? "unsupported",
							" mature records in this interval. The control's day-91 interval has no generator change. No schedule, seed or model is selected using these results."
						]
					})
				]
			}),
			/* @__PURE__ */ (0, b.jsxs)("article", {
				className: "panel",
				children: [
					/* @__PURE__ */ (0, b.jsx)("h2", { children: "Every update has a cutoff." }),
					/* @__PURE__ */ (0, b.jsx)(A, {
						label: "Retraining cutoff evidence",
						children: /* @__PURE__ */ (0, b.jsxs)("table", { children: [/* @__PURE__ */ (0, b.jsx)("thead", { children: /* @__PURE__ */ (0, b.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, b.jsx)("th", { children: "Update" }),
							/* @__PURE__ */ (0, b.jsx)("th", { children: "Training observations" }),
							/* @__PURE__ */ (0, b.jsx)("th", { children: "Calibration observations" }),
							/* @__PURE__ */ (0, b.jsx)("th", { children: "Status / fit time" }),
							/* @__PURE__ */ (0, b.jsx)("th", { children: "Version" })
						] }) }), /* @__PURE__ */ (0, b.jsx)("tbody", { children: u.updates.map((e) => /* @__PURE__ */ (0, b.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, b.jsxs)("td", { children: [
								"Day ",
								e.day,
								/* @__PURE__ */ (0, b.jsx)("span", {
									className: "caption",
									children: e.at
								})
							] }),
							/* @__PURE__ */ (0, b.jsxs)("td", { children: [e.training.count, /* @__PURE__ */ (0, b.jsxs)("span", {
								className: "caption",
								children: [
									e.training.first,
									" → ",
									e.training.last
								]
							})] }),
							/* @__PURE__ */ (0, b.jsxs)("td", { children: [e.calibration.count, /* @__PURE__ */ (0, b.jsxs)("span", {
								className: "caption",
								children: [
									e.calibration.first,
									" → ",
									e.calibration.last
								]
							})] }),
							/* @__PURE__ */ (0, b.jsxs)("td", { children: [
								e.status,
								" · ",
								e.fit_seconds.toFixed(3),
								"s",
								e.reason && /* @__PURE__ */ (0, b.jsx)("span", {
									className: "caption",
									children: e.reason
								})
							] }),
							/* @__PURE__ */ (0, b.jsx)("td", { children: /* @__PURE__ */ (0, b.jsxs)("details", { children: [/* @__PURE__ */ (0, b.jsx)("summary", { children: e.model_version?.slice(0, 10) ?? "Retain prior model" }), /* @__PURE__ */ (0, b.jsxs)("p", {
								className: "caption replay-fingerprint",
								children: [
									"Training: ",
									e.training_sha256,
									/* @__PURE__ */ (0, b.jsx)("br", {}),
									"Calibration: ",
									e.calibration_sha256,
									/* @__PURE__ */ (0, b.jsx)("br", {}),
									"Version: ",
									e.model_version ?? "No new version"
								]
							})] }) })
						] }, e.day)) })] })
					}),
					/* @__PURE__ */ (0, b.jsx)("p", {
						className: "caption",
						children: "Labels must mature strictly before fitting. Training labels mature before the calibration interval begins. Class-deficient updates are skipped without outcome-based resampling; the preceding model remains in use. Models are fitted offline and never become serving artifacts."
					})
				]
			}),
			/* @__PURE__ */ (0, b.jsxs)("article", {
				className: "panel",
				children: [
					/* @__PURE__ */ (0, b.jsx)("h2", { children: "Same mature weeks. Same review budget." }),
					/* @__PURE__ */ (0, b.jsxs)("p", { children: [
						"Up to ",
						l.configuration.weekly_budget,
						" reviews per wholly matured seven-day cohort."
					] }),
					/* @__PURE__ */ (0, b.jsx)(A, {
						label: "Recovery weekly policies",
						children: /* @__PURE__ */ (0, b.jsxs)("table", { children: [/* @__PURE__ */ (0, b.jsx)("thead", { children: /* @__PURE__ */ (0, b.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, b.jsx)("th", { children: "Policy" }),
							/* @__PURE__ */ (0, b.jsx)("th", { children: "Reviewed / population" }),
							/* @__PURE__ */ (0, b.jsx)("th", { children: "Captured / positives" })
						] }) }), /* @__PURE__ */ (0, b.jsx)("tbody", { children: u.policies.map((e) => /* @__PURE__ */ (0, b.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, b.jsx)("td", { children: e.policy === "frozen" ? "Frozen model" : "Scheduled retraining" }),
							/* @__PURE__ */ (0, b.jsxs)("td", { children: [
								e.reviewed,
								" / ",
								e.population
							] }),
							/* @__PURE__ */ (0, b.jsxs)("td", { children: [
								e.captured,
								" / ",
								e.positives
							] })
						] }, e.policy)) })] })
					})
				]
			}),
			/* @__PURE__ */ (0, b.jsxs)("article", {
				className: "panel",
				children: [
					/* @__PURE__ */ (0, b.jsx)("h2", { children: "All seeds, not a selected success." }),
					/* @__PURE__ */ (0, b.jsx)(A, {
						label: "All recovery seeds",
						children: /* @__PURE__ */ (0, b.jsxs)("table", { children: [/* @__PURE__ */ (0, b.jsx)("thead", { children: /* @__PURE__ */ (0, b.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, b.jsx)("th", { children: "Seed" }),
							/* @__PURE__ */ (0, b.jsx)("th", { children: "Frozen AP" }),
							/* @__PURE__ */ (0, b.jsx)("th", { children: "Scheduled AP" }),
							/* @__PURE__ */ (0, b.jsx)("th", { children: "Frozen Brier" }),
							/* @__PURE__ */ (0, b.jsx)("th", { children: "Scheduled Brier" })
						] }) }), /* @__PURE__ */ (0, b.jsx)("tbody", { children: l.runs.filter((e) => e.scenario === t).map((e) => /* @__PURE__ */ (0, b.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, b.jsx)("td", { children: e.seed }),
							/* @__PURE__ */ (0, b.jsx)("td", { children: pn(e.results[s].frozen?.average_precision) }),
							/* @__PURE__ */ (0, b.jsx)("td", { children: pn(e.results[s].scheduled?.average_precision) }),
							/* @__PURE__ */ (0, b.jsx)("td", { children: pn(e.results[s].frozen?.brier_score) }),
							/* @__PURE__ */ (0, b.jsx)("td", { children: pn(e.results[s].scheduled?.brier_score) })
						] }, e.seed)) })] })
					}),
					/* @__PURE__ */ (0, b.jsxs)("p", {
						className: "caption",
						children: [
							"Protocol ",
							l.protocol,
							". Retraining is not guaranteed to improve every seed or metric."
						]
					})
				]
			})
		]
	});
}
function kn() {
	let e = O({
		queryKey: ["decision"],
		queryFn: ({ signal: e }) => k("/api/decision", e),
		enabled: _n("decisions")
	}), [t, n] = (0, y.useState)(5), [r, i] = (0, y.useState)(1), [a, o] = (0, y.useState)(.1), [s, c] = (0, y.useState)("evaluation"), [l, u] = (0, y.useState)(10), [d, f] = (0, y.useState)("captured");
	if (e.error) return /* @__PURE__ */ (0, b.jsx)(yn, {
		error: e.error,
		retry: () => void e.refetch()
	});
	if (!e.data) return /* @__PURE__ */ (0, b.jsx)("p", {
		role: "status",
		children: "Loading saved decision evidence…"
	});
	let p = e.data;
	if (p.status !== "available" || !p.curves || !p.budgets || !p.configuration || !p.partitions || !p.profiles) return /* @__PURE__ */ (0, b.jsxs)("p", {
		className: "notice subtle",
		children: [
			p.warning,
			" ",
			p.reason
		]
	});
	let m = Math.min(l, p.budgets.length - 1), h = p.budgets[m], g = (e) => e.missed * t + e.selected_negatives * r + e.budget * a, _ = p.profiles.filter((e) => e.missed_cost === t && e.negative_cost === r && e.review_cost === a);
	return /* @__PURE__ */ (0, b.jsxs)("div", {
		className: "lab-workspace",
		children: [
			/* @__PURE__ */ (0, b.jsx)("p", {
				className: "notice subtle",
				children: p.warning
			}),
			/* @__PURE__ */ (0, b.jsxs)("article", {
				className: "panel",
				children: [
					/* @__PURE__ */ (0, b.jsxs)("div", {
						className: "panel-head",
						children: [/* @__PURE__ */ (0, b.jsxs)("div", { children: [/* @__PURE__ */ (0, b.jsx)("p", {
							className: "overline",
							children: "RANKING / WORKLOAD / HYPOTHETICAL COST"
						}), /* @__PURE__ */ (0, b.jsx)("h2", { children: "Make the trade-off explicit." })] }), /* @__PURE__ */ (0, b.jsx)("a", {
							className: "button",
							href: "/api/decision",
							download: "signalrank-decisions.json",
							children: "Export fixed evidence"
						})]
					}),
					/* @__PURE__ */ (0, b.jsx)("div", {
						className: "studio-controls",
						children: [
							{
								label: "Missed positive cost",
								value: t,
								setter: n,
								values: p.configuration.missed_costs
							},
							{
								label: "Selected negative cost",
								value: r,
								setter: i,
								values: p.configuration.negative_costs
							},
							{
								label: "Review cost per record",
								value: a,
								setter: o,
								values: p.configuration.review_costs
							}
						].map((e) => /* @__PURE__ */ (0, b.jsxs)("label", { children: [e.label, /* @__PURE__ */ (0, b.jsx)("select", {
							value: e.value,
							onChange: (t) => e.setter(Number(t.target.value)),
							children: e.values.map((e) => /* @__PURE__ */ (0, b.jsxs)("option", {
								value: e,
								children: [e, " units"]
							}, e))
						})] }, e.label))
					}),
					/* @__PURE__ */ (0, b.jsx)("p", {
						className: "caption",
						children: "Total hypothetical cost = missed positives × missed cost + selected negatives × negative cost + reviewed records × review cost. Costs are illustrative units, not observed money or benefits."
					}),
					/* @__PURE__ */ (0, b.jsx)("div", {
						className: "studio-comparison",
						children: _.map((e) => /* @__PURE__ */ (0, b.jsxs)("div", {
							className: "prediction-card",
							children: [
								/* @__PURE__ */ (0, b.jsx)("span", {
									className: "overline",
									children: e.policy === "model" ? "Saved model" : "Severity baseline"
								}),
								/* @__PURE__ */ (0, b.jsxs)("strong", { children: [e.chosen_budget, " reviews"] }),
								/* @__PURE__ */ (0, b.jsx)("p", { children: "Chosen on earlier validation only" }),
								/* @__PURE__ */ (0, b.jsxs)("p", {
									className: "caption",
									children: [
										"Validation cost ",
										e.validation_cost.toFixed(1),
										" · later evaluation cost ",
										e.evaluation_cost.toFixed(1),
										" units"
									]
								})
							]
						}, e.policy))
					}),
					/* @__PURE__ */ (0, b.jsxs)("p", {
						className: "caption",
						children: [p.selection_rule, " Evaluation results never change this recommendation. Different partition sizes mean different review rates."]
					}),
					/* @__PURE__ */ (0, b.jsxs)("div", {
						className: "studio-controls",
						children: [/* @__PURE__ */ (0, b.jsxs)("label", { children: ["Displayed decision cohort", /* @__PURE__ */ (0, b.jsxs)("select", {
							value: s,
							onChange: (e) => c(e.target.value),
							children: [/* @__PURE__ */ (0, b.jsx)("option", {
								value: "evaluation",
								children: "Later evaluation"
							}), /* @__PURE__ */ (0, b.jsx)("option", {
								value: "validation",
								children: "Earlier validation"
							})]
						})] }), /* @__PURE__ */ (0, b.jsxs)("label", { children: ["Decision curve metric", /* @__PURE__ */ (0, b.jsxs)("select", {
							value: d,
							onChange: (e) => f(e.target.value),
							children: [
								/* @__PURE__ */ (0, b.jsx)("option", {
									value: "captured",
									children: "Captured positives"
								}),
								/* @__PURE__ */ (0, b.jsx)("option", {
									value: "missed",
									children: "Missed positives"
								}),
								/* @__PURE__ */ (0, b.jsx)("option", {
									value: "cost",
									children: "Hypothetical total cost"
								})
							]
						})] })]
					}),
					/* @__PURE__ */ (0, b.jsx)(Dn, {
						labels: p.budgets.map(String),
						numericX: p.budgets,
						series: ["model", "severity"].map((e) => ({
							name: e === "model" ? "Saved model" : "Severity baseline",
							values: p.curves[s][e].map((e) => d === "cost" ? g(e) : d === "missed" ? e.missed : e.captured),
							color: e === "model" ? "var(--accent)" : "var(--muted)",
							dashed: e === "severity"
						})),
						title: d === "cost" ? "Hypothetical cost across fixed review budgets" : d === "missed" ? "Missed positives across fixed review budgets" : "Captured positives across fixed review budgets",
						xTitle: "Review budget · records across this entire cohort"
					}),
					/* @__PURE__ */ (0, b.jsxs)("label", {
						className: "replay-slider",
						htmlFor: "decision-budget",
						children: [
							"Inspect a fixed review budget ",
							/* @__PURE__ */ (0, b.jsxs)("output", { children: [h, " records"] }),
							/* @__PURE__ */ (0, b.jsx)("input", {
								id: "decision-budget",
								"aria-label": "Inspect a fixed review budget",
								type: "range",
								min: "0",
								max: p.budgets.length - 1,
								value: m,
								onChange: (e) => u(Number(e.target.value))
							})
						]
					}),
					/* @__PURE__ */ (0, b.jsx)(A, {
						label: "Selected decision budget",
						children: /* @__PURE__ */ (0, b.jsxs)("table", { children: [/* @__PURE__ */ (0, b.jsx)("thead", { children: /* @__PURE__ */ (0, b.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, b.jsx)("th", { children: "Policy" }),
							/* @__PURE__ */ (0, b.jsx)("th", { children: "Reviewed" }),
							/* @__PURE__ */ (0, b.jsx)("th", { children: "Captured" }),
							/* @__PURE__ */ (0, b.jsx)("th", { children: "Missed" }),
							/* @__PURE__ */ (0, b.jsx)("th", { children: "Selected negatives" }),
							/* @__PURE__ */ (0, b.jsx)("th", { children: "Precision" }),
							/* @__PURE__ */ (0, b.jsx)("th", { children: "Recall" }),
							/* @__PURE__ */ (0, b.jsx)("th", { children: "Hypothetical cost" })
						] }) }), /* @__PURE__ */ (0, b.jsx)("tbody", { children: ["model", "severity"].map((e) => {
							let t = p.curves[s][e][m];
							return /* @__PURE__ */ (0, b.jsxs)("tr", { children: [
								/* @__PURE__ */ (0, b.jsx)("td", { children: e === "model" ? "Saved model" : "Severity baseline" }),
								/* @__PURE__ */ (0, b.jsx)("td", { children: t.budget }),
								/* @__PURE__ */ (0, b.jsx)("td", { children: t.captured }),
								/* @__PURE__ */ (0, b.jsx)("td", { children: t.missed }),
								/* @__PURE__ */ (0, b.jsx)("td", { children: t.selected_negatives }),
								/* @__PURE__ */ (0, b.jsx)("td", { children: mn(t.precision) }),
								/* @__PURE__ */ (0, b.jsx)("td", { children: mn(t.recall) }),
								/* @__PURE__ */ (0, b.jsx)("td", { children: g(t).toFixed(1) })
							] }, e);
						}) })] })
					})
				]
			}),
			/* @__PURE__ */ (0, b.jsxs)("article", {
				className: "panel",
				children: [
					/* @__PURE__ */ (0, b.jsx)("h2", { children: "Choose earlier. Measure later." }),
					/* @__PURE__ */ (0, b.jsx)("div", {
						className: "replay-splits",
						children: Object.entries(p.partitions).map(([e, t]) => /* @__PURE__ */ (0, b.jsxs)("div", { children: [
							/* @__PURE__ */ (0, b.jsx)("span", {
								className: "overline",
								children: e
							}),
							/* @__PURE__ */ (0, b.jsxs)("strong", { children: [
								t.count,
								" records · ",
								t.positives,
								" positives"
							] }),
							/* @__PURE__ */ (0, b.jsxs)("p", { children: [
								t.first,
								" → ",
								t.last
							] }),
							/* @__PURE__ */ (0, b.jsx)("code", {
								className: "caption replay-fingerprint",
								children: t.dataset_sha256
							})
						] }, e))
					}),
					/* @__PURE__ */ (0, b.jsx)("p", {
						className: "caption",
						children: "The saved model was fitted/calibrated before both intervals. A 30-day label-maturity gap separates decision validation from later evaluation. These are subdivisions of already explored synthetic development data, not a new final holdout."
					}),
					/* @__PURE__ */ (0, b.jsxs)("details", { children: [/* @__PURE__ */ (0, b.jsx)("summary", { children: "Complete budget table for the displayed cohort" }), /* @__PURE__ */ (0, b.jsx)(A, {
						label: "All decision budgets",
						children: /* @__PURE__ */ (0, b.jsxs)("table", { children: [/* @__PURE__ */ (0, b.jsx)("thead", { children: /* @__PURE__ */ (0, b.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, b.jsx)("th", { children: "Budget" }),
							/* @__PURE__ */ (0, b.jsx)("th", { children: "Model captured / missed / negatives" }),
							/* @__PURE__ */ (0, b.jsx)("th", { children: "Severity captured / missed / negatives" }),
							/* @__PURE__ */ (0, b.jsx)("th", { children: "Model / severity hypothetical cost" })
						] }) }), /* @__PURE__ */ (0, b.jsx)("tbody", { children: p.budgets.map((e, t) => {
							let n = p.curves[s].model[t], r = p.curves[s].severity[t];
							return /* @__PURE__ */ (0, b.jsxs)("tr", { children: [
								/* @__PURE__ */ (0, b.jsx)("td", { children: e }),
								/* @__PURE__ */ (0, b.jsxs)("td", { children: [
									n.captured,
									" / ",
									n.missed,
									" / ",
									n.selected_negatives
								] }),
								/* @__PURE__ */ (0, b.jsxs)("td", { children: [
									r.captured,
									" / ",
									r.missed,
									" / ",
									r.selected_negatives
								] }),
								/* @__PURE__ */ (0, b.jsxs)("td", { children: [
									g(n).toFixed(1),
									" / ",
									g(r).toFixed(1)
								] })
							] }, e);
						}) })] })
					})] }),
					/* @__PURE__ */ (0, b.jsxs)("p", {
						className: "caption",
						children: [
							"Protocol ",
							p.protocol,
							". Adjusting cost assumptions is exploratory analysis, not a new accuracy result."
						]
					})
				]
			})
		]
	});
}
var An = [
	{
		view: "studio",
		title: "Make and explain a prediction",
		question: "Change severity or authentication. Which raw factors move, and what does calibration do?",
		answer: "Show the complete intercept-plus-feature decomposition. It explains the linear model, not causality."
	},
	{
		view: "diagnostics",
		title: "Inspect the failures",
		question: "Which positives were missed under the review budget? Which negatives were selected?",
		answer: "Look at actual synthetic outcome labels, subgroup support and error examples—not just a headline score."
	},
	{
		view: "replay",
		title: "Wait for the evidence",
		question: "Rewind to the first checkpoint. Why are outcomes pending? Compare input drift with mature-label performance.",
		answer: "Thirty-day label availability prevents look-ahead. Drift is a distribution question, not proof of failure."
	},
	{
		view: "recovery",
		title: "Test a response to change",
		question: "Compare fixed-schedule retraining with the frozen model across the control and changed relationships.",
		answer: "Every update uses matured history and later calibration. Updates may help or hurt; no serving model is promoted."
	},
	{
		view: "decisions",
		title: "Connect ranking to a decision",
		question: "Change hypothetical costs. Which budget is selected on earlier validation, and how does it perform later?",
		answer: "Separate operating-point selection from evaluation. Cost units and benefits are hypothetical, not business claims."
	}
];
function jn() {
	let [e, t] = (0, y.useState)(null);
	if ((0, y.useEffect)(() => {
		let e = () => {
			t(0), location.hash = "studio";
		};
		return window.addEventListener("signalrank:start-guide", e), () => window.removeEventListener("signalrank:start-guide", e);
	}, []), e === null) return null;
	let n = An[e];
	function r(e) {
		t(e), location.hash = An[e].view;
	}
	return /* @__PURE__ */ (0, b.jsxs)("section", {
		className: "guide-banner",
		"aria-label": "Guided synthetic showcase",
		children: [/* @__PURE__ */ (0, b.jsxs)("div", { children: [
			/* @__PURE__ */ (0, b.jsxs)("span", {
				className: "overline",
				children: [
					"GUIDED SHOWCASE · STEP ",
					e + 1,
					" OF ",
					An.length
				]
			}),
			/* @__PURE__ */ (0, b.jsx)("h2", { children: n.title }),
			/* @__PURE__ */ (0, b.jsx)("p", { children: n.question }),
			/* @__PURE__ */ (0, b.jsxs)("details", { children: [/* @__PURE__ */ (0, b.jsx)("summary", { children: "What to explain" }), /* @__PURE__ */ (0, b.jsx)("p", { children: n.answer })] })
		] }), /* @__PURE__ */ (0, b.jsxs)("div", {
			className: "guide-actions",
			children: [
				/* @__PURE__ */ (0, b.jsx)("button", {
					className: "button",
					disabled: e === 0,
					onClick: () => r(e - 1),
					children: "Previous step"
				}),
				/* @__PURE__ */ (0, b.jsx)("button", {
					className: "button primary",
					onClick: () => {
						e === An.length - 1 ? (t(null), location.hash = "showcase") : r(e + 1);
					},
					children: e === An.length - 1 ? "Finish walkthrough" : "Next step"
				}),
				/* @__PURE__ */ (0, b.jsx)("button", {
					className: "text-button",
					onClick: () => t(null),
					children: "End walkthrough"
				}),
				/* @__PURE__ */ (0, b.jsx)("button", {
					className: "text-button",
					onClick: () => {
						location.hash = n.view;
					},
					children: "Return to this step"
				})
			]
		})]
	});
}
function Mn() {
	return /* @__PURE__ */ (0, b.jsxs)("div", {
		className: "lab-workspace",
		children: [
			/* @__PURE__ */ (0, b.jsxs)("article", {
				className: "panel showcase-intro",
				children: [
					/* @__PURE__ */ (0, b.jsx)("p", {
						className: "overline",
						children: "FIVE QUESTIONS / ONE ML WORKFLOW"
					}),
					/* @__PURE__ */ (0, b.jsx)("h2", { children: "A project you can walk someone through." }),
					/* @__PURE__ */ (0, b.jsx)("p", { children: "Use a saved model, inspect how it works, challenge it over time, and connect its ranking to an explicit decision. All examples and measured outcomes in this tour are fictional." }),
					/* @__PURE__ */ (0, b.jsx)("button", {
						className: "button primary",
						onClick: () => window.dispatchEvent(new Event("signalrank:start-guide")),
						children: "Start guided walkthrough →"
					}),
					/* @__PURE__ */ (0, b.jsx)("a", {
						className: "button",
						href: "/api/export/report",
						download: !0,
						children: "Export research report"
					})
				]
			}),
			/* @__PURE__ */ (0, b.jsx)("div", {
				className: "showcase-grid",
				children: An.map((e, t) => /* @__PURE__ */ (0, b.jsxs)("article", {
					className: "panel",
					children: [
						/* @__PURE__ */ (0, b.jsxs)("span", {
							className: "overline",
							children: [
								"0",
								t + 1,
								" / ",
								e.view
							]
						}),
						/* @__PURE__ */ (0, b.jsx)("h2", { children: e.title }),
						/* @__PURE__ */ (0, b.jsx)("p", { children: e.question }),
						/* @__PURE__ */ (0, b.jsx)("p", {
							className: "caption",
							children: e.answer
						}),
						/* @__PURE__ */ (0, b.jsx)("a", {
							href: "#" + e.view,
							children: "Open this workspace →"
						})
					]
				}, e.view))
			}),
			/* @__PURE__ */ (0, b.jsx)("p", {
				className: "notice subtle",
				children: "Present this as a synthetic ML engineering workbench: chronological validation, calibration, explainability, drift/retraining experiments and reproducibility. It is not validated real-world accuracy, security advice, production monitoring or a guaranteed resume/ATS result."
			})
		]
	});
}
//#endregion
//#region src/Evidence.tsx
var Nn = (e) => e == null ? "Unavailable" : e.toFixed(3), Pn = (e) => (100 * e).toFixed(1) + "%", Fn = (e = 0) => (e / 1024 / 1024).toFixed(1) + " MiB";
function In() {
	let e = () => location.hash.slice(1).split(/[/?]/)[0] === "evidence", [t, n] = (0, y.useState)(e);
	(0, y.useEffect)(() => {
		let t = () => n(e());
		return window.addEventListener("hashchange", t), window.addEventListener("signalrank:view", t), () => {
			window.removeEventListener("hashchange", t), window.removeEventListener("signalrank:view", t);
		};
	}, []);
	let r = O({
		queryKey: ["evidence"],
		queryFn: ({ signal: e }) => k("/api/evidence", e),
		enabled: t
	}), i = O({
		queryKey: ["storage"],
		queryFn: ({ signal: e }) => k("/api/storage", e),
		enabled: t && !!r.data
	});
	if (!t) return null;
	if (r.error) return /* @__PURE__ */ (0, b.jsxs)("div", {
		className: "error",
		role: "alert",
		children: [/* @__PURE__ */ (0, b.jsx)("p", { children: r.error.message }), /* @__PURE__ */ (0, b.jsx)("button", {
			className: "button",
			onClick: () => void r.refetch(),
			children: "Try again"
		})]
	});
	if (!r.data) return /* @__PURE__ */ (0, b.jsx)("p", {
		role: "status",
		children: "Loading saved experiment evidence…"
	});
	let a = r.data, o = a.support;
	return /* @__PURE__ */ (0, b.jsxs)("div", {
		className: "lab-workspace evidence-workspace",
		children: [
			/* @__PURE__ */ (0, b.jsx)("p", {
				className: "notice subtle",
				children: a.warning
			}),
			/* @__PURE__ */ (0, b.jsxs)("article", {
				className: "panel evidence-summary",
				children: [
					/* @__PURE__ */ (0, b.jsxs)("div", {
						className: "panel-head",
						children: [/* @__PURE__ */ (0, b.jsxs)("div", { children: [/* @__PURE__ */ (0, b.jsx)("p", {
							className: "overline",
							children: "RESULT / BASELINE / LIMITS"
						}), /* @__PURE__ */ (0, b.jsx)("h2", { children: "What does this experiment establish?" })] }), /* @__PURE__ */ (0, b.jsxs)("div", {
							className: "evidence-actions",
							children: [/* @__PURE__ */ (0, b.jsx)("a", {
								className: "button",
								href: "/api/export/evidence",
								download: "signalrank-evidence.md",
								children: "Export concise report"
							}), /* @__PURE__ */ (0, b.jsx)("a", {
								href: "/api/evidence",
								download: "signalrank-evidence.json",
								children: "Evidence JSON ↗"
							})]
						})]
					}),
					/* @__PURE__ */ (0, b.jsx)("p", { children: "SignalRank ranks fictional records for review. This summary brings the existing evaluation together; opening it does not train or select a model." }),
					/* @__PURE__ */ (0, b.jsx)("div", {
						className: "metrics",
						children: [
							[
								"Evaluation records",
								o.count ?? "Unavailable",
								`${o.positives ?? "Unavailable"} positive outcomes`
							],
							[
								"Model average precision",
								Nn(a.comparisons[0].average_precision),
								`Severity baseline ${Nn(a.comparisons[1].average_precision)}`
							],
							[
								"Positives captured",
								o.captured ?? "Unavailable",
								`Global review budget ${o.budget ?? "unavailable"}`
							]
						].map(([e, t, n]) => /* @__PURE__ */ (0, b.jsxs)("div", {
							className: "metric",
							children: [
								/* @__PURE__ */ (0, b.jsx)("span", {
									className: "metric-label",
									children: e
								}),
								/* @__PURE__ */ (0, b.jsx)("strong", {
									className: "metric-value",
									children: t
								}),
								/* @__PURE__ */ (0, b.jsx)("span", {
									className: "metric-note",
									children: n
								})
							]
						}, e))
					}),
					/* @__PURE__ */ (0, b.jsxs)("p", {
						className: "evidence-result",
						children: [
							"AP difference versus severity: ",
							/* @__PURE__ */ (0, b.jsxs)("strong", { children: [a.average_precision_delta_vs_severity >= 0 ? "+" : "", Nn(a.average_precision_delta_vs_severity)] }),
							". Descriptive difference on this cohort; no significance claim."
						]
					}),
					/* @__PURE__ */ (0, b.jsxs)("p", {
						className: "caption",
						children: [
							"Prevalence ",
							Pn(o.prevalence),
							" · ",
							o.missed ?? "Unavailable",
							" missed positives · ",
							o.selected_negatives ?? "Unavailable",
							" selected negatives. The budget applies once across the entire evaluation cohort."
						]
					})
				]
			}),
			/* @__PURE__ */ (0, b.jsxs)("article", {
				className: "panel",
				children: [
					/* @__PURE__ */ (0, b.jsxs)("div", {
						className: "panel-head",
						children: [/* @__PURE__ */ (0, b.jsx)("h2", { children: "Compare on the same observations." }), /* @__PURE__ */ (0, b.jsx)("a", {
							href: "#models",
							children: "Full model evaluation →"
						})]
					}),
					/* @__PURE__ */ (0, b.jsx)(A, {
						label: "Evidence model comparisons",
						children: /* @__PURE__ */ (0, b.jsxs)("table", { children: [/* @__PURE__ */ (0, b.jsx)("thead", { children: /* @__PURE__ */ (0, b.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, b.jsx)("th", { children: "Candidate" }),
							/* @__PURE__ */ (0, b.jsx)("th", { children: "Average precision ↑" }),
							/* @__PURE__ */ (0, b.jsx)("th", { children: "Brier ↓" }),
							/* @__PURE__ */ (0, b.jsx)("th", { children: "Recall at 50 ↑" })
						] }) }), /* @__PURE__ */ (0, b.jsx)("tbody", { children: a.comparisons.map((e) => /* @__PURE__ */ (0, b.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, b.jsx)("td", { children: e.name }),
							/* @__PURE__ */ (0, b.jsx)("td", { children: Nn(e.average_precision) }),
							/* @__PURE__ */ (0, b.jsx)("td", { children: Nn(e.brier_score) }),
							/* @__PURE__ */ (0, b.jsx)("td", { children: Pn(e.recall_at_50) })
						] }, e.name)) })] })
					}),
					/* @__PURE__ */ (0, b.jsx)("p", {
						className: "caption",
						children: "Severity is a ranking score, so it has no Brier score. Other candidates use different inputs or calibration; this is not a controlled architecture comparison."
					})
				]
			}),
			/* @__PURE__ */ (0, b.jsxs)("div", {
				className: "evidence-grid",
				children: [/* @__PURE__ */ (0, b.jsxs)("article", {
					className: "panel",
					children: [
						/* @__PURE__ */ (0, b.jsx)("p", {
							className: "overline",
							children: "TIME / SUPPORT"
						}),
						/* @__PURE__ */ (0, b.jsx)("h2", { children: "Where the evidence comes from." }),
						/* @__PURE__ */ (0, b.jsx)("dl", {
							className: "evidence-splits",
							children: [
								"train",
								"calibration",
								"test"
							].filter((e) => a.splits[e]).map((e) => {
								let t = a.splits[e];
								return /* @__PURE__ */ (0, b.jsxs)("div", { children: [/* @__PURE__ */ (0, b.jsxs)("dt", { children: [
									e,
									" · ",
									t.count,
									" records"
								] }), /* @__PURE__ */ (0, b.jsxs)("dd", { children: [
									t.first,
									" → ",
									t.last
								] })] }, e);
							})
						}),
						/* @__PURE__ */ (0, b.jsxs)("p", { children: [
							a.evaluated_temporal_windows,
							" of ",
							a.temporal_windows,
							" saved temporal windows evaluable."
						] }),
						/* @__PURE__ */ (0, b.jsx)("p", {
							className: "caption",
							children: "Thirty-day label-maturity gaps separate the chronological partitions. These are explored synthetic development windows."
						})
					]
				}), /* @__PURE__ */ (0, b.jsxs)("article", {
					className: "panel",
					children: [
						/* @__PURE__ */ (0, b.jsx)("p", {
							className: "overline",
							children: "ERRORS / SUPPORT"
						}),
						/* @__PURE__ */ (0, b.jsx)("h2", { children: "Inspect the weaker slices." }),
						a.lowest_ap_slices.length ? /* @__PURE__ */ (0, b.jsx)("ul", {
							className: "evidence-slices",
							children: a.lowest_ap_slices.map((e) => /* @__PURE__ */ (0, b.jsxs)("li", { children: [
								/* @__PURE__ */ (0, b.jsx)("strong", { children: e.group }),
								/* @__PURE__ */ (0, b.jsxs)("span", { children: [
									e.dimension,
									" · AP ",
									Nn(e.metrics.average_precision)
								] }),
								/* @__PURE__ */ (0, b.jsxs)("span", { children: [
									e.count,
									" records · ",
									e.positives,
									" positives"
								] })
							] }, e.dimension + e.group))
						}) : /* @__PURE__ */ (0, b.jsx)("p", { children: "No supported slice metrics saved." }),
						/* @__PURE__ */ (0, b.jsx)("p", {
							className: "caption",
							children: "Up to three lowest-AP slices that pass the existing display gate. Groups overlap; the gate does not establish statistical adequacy."
						}),
						/* @__PURE__ */ (0, b.jsx)("a", {
							href: "#diagnostics",
							children: "Inspect all slices and errors →"
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, b.jsxs)("article", {
				className: "panel",
				children: [
					/* @__PURE__ */ (0, b.jsx)("h2", { children: "What we can explain—and what remains unproven." }),
					/* @__PURE__ */ (0, b.jsx)("ul", { children: a.limitations.map((e) => /* @__PURE__ */ (0, b.jsx)("li", { children: e }, e)) }),
					/* @__PURE__ */ (0, b.jsxs)("details", { children: [
						/* @__PURE__ */ (0, b.jsx)("summary", { children: "Dataset and snapshot identifiers" }),
						/* @__PURE__ */ (0, b.jsxs)("p", {
							className: "replay-fingerprint",
							children: ["Dataset ", a.dataset_sha256]
						}),
						/* @__PURE__ */ (0, b.jsxs)("p", {
							className: "replay-fingerprint",
							children: ["Snapshot ", a.provenance.snapshot_id ?? "Unavailable"]
						}),
						/* @__PURE__ */ (0, b.jsxs)("p", {
							className: "replay-fingerprint",
							children: ["Model artifact ", a.provenance.artifact_id ?? "Unavailable — startup baseline has no saved artifact"]
						}),
						/* @__PURE__ */ (0, b.jsxs)("p", {
							className: "replay-fingerprint",
							children: ["Training run ", a.provenance.run_id ?? "Unavailable"]
						})
					] })
				]
			}),
			i.data?.status === "available" && /* @__PURE__ */ (0, b.jsxs)("article", {
				className: "panel",
				children: [
					/* @__PURE__ */ (0, b.jsxs)("div", {
						className: "panel-head",
						children: [/* @__PURE__ */ (0, b.jsxs)("div", { children: [/* @__PURE__ */ (0, b.jsx)("p", {
							className: "overline",
							children: "LOCAL / STORAGE"
						}), /* @__PURE__ */ (0, b.jsx)("h2", { children: "Keep the workbench small." })] }), /* @__PURE__ */ (0, b.jsx)("button", {
							className: "button",
							onClick: () => void i.refetch(),
							children: "Refresh storage"
						})]
					}),
					/* @__PURE__ */ (0, b.jsxs)("div", {
						className: "metrics",
						children: [/* @__PURE__ */ (0, b.jsxs)("div", {
							className: "metric",
							children: [/* @__PURE__ */ (0, b.jsx)("span", {
								className: "metric-label",
								children: "Current artifact root"
							}), /* @__PURE__ */ (0, b.jsx)("strong", {
								className: "metric-value",
								children: Fn(i.data.bytes)
							})]
						}), /* @__PURE__ */ (0, b.jsxs)("div", {
							className: "metric",
							children: [
								/* @__PURE__ */ (0, b.jsx)("span", {
									className: "metric-label",
									children: "Retention preview"
								}),
								/* @__PURE__ */ (0, b.jsx)("strong", {
									className: "metric-value",
									children: Fn(i.data.reclaimable_bytes)
								}),
								/* @__PURE__ */ (0, b.jsx)("span", {
									className: "metric-note",
									children: "Potential removal, keeping three newest runs and selected/trusted runs"
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, b.jsx)("p", {
						className: "caption replay-fingerprint",
						children: i.data.root
					}),
					/* @__PURE__ */ (0, b.jsx)("p", { children: i.data.measurement }),
					/* @__PURE__ */ (0, b.jsxs)("details", { children: [/* @__PURE__ */ (0, b.jsx)("summary", { children: "Runs and retention decisions" }), /* @__PURE__ */ (0, b.jsx)(A, {
						label: "Storage retention preview",
						children: /* @__PURE__ */ (0, b.jsxs)("table", { children: [/* @__PURE__ */ (0, b.jsx)("thead", { children: /* @__PURE__ */ (0, b.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, b.jsx)("th", { children: "Run" }),
							/* @__PURE__ */ (0, b.jsx)("th", { children: "Size" }),
							/* @__PURE__ */ (0, b.jsx)("th", { children: "Retention decision" })
						] }) }), /* @__PURE__ */ (0, b.jsx)("tbody", { children: i.data.runs?.map((e) => /* @__PURE__ */ (0, b.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, b.jsx)("td", { children: /* @__PURE__ */ (0, b.jsx)("code", { children: e.run_id.slice(0, 12) }) }),
							/* @__PURE__ */ (0, b.jsx)("td", { children: Fn(e.bytes) }),
							/* @__PURE__ */ (0, b.jsx)("td", { children: e.eligible ? "Eligible for reviewed cleanup" : e.reason })
						] }, e.run_id)) })] })
					})] }),
					/* @__PURE__ */ (0, b.jsx)("p", {
						className: "caption",
						children: i.data.warning
					}),
					/* @__PURE__ */ (0, b.jsx)("p", { children: "No deletion control is exposed in the browser. Use the documented local storage CLI to create and review an exact cleanup plan." })
				]
			}),
			i.error && /* @__PURE__ */ (0, b.jsxs)("p", {
				className: "error",
				role: "alert",
				children: ["Storage inventory unavailable. ", /* @__PURE__ */ (0, b.jsx)("button", {
					className: "button",
					onClick: () => void i.refetch(),
					children: "Retry storage"
				})]
			})
		]
	});
}
//#endregion
//#region src/Study.tsx
function Ln() {
	let e = () => location.hash.slice(1).split(/[/?]/)[0] === "data", [t, n] = (0, y.useState)(e);
	(0, y.useEffect)(() => {
		let t = () => n(e());
		return window.addEventListener("hashchange", t), window.addEventListener("signalrank:view", t), () => {
			window.removeEventListener("hashchange", t), window.removeEventListener("signalrank:view", t);
		};
	}, []);
	let r = O({
		queryKey: ["study-readiness"],
		queryFn: ({ signal: e }) => k("/api/study-readiness", e),
		enabled: t,
		staleTime: Infinity
	});
	if (!t) return null;
	if (r.error) return /* @__PURE__ */ (0, b.jsxs)("article", {
		className: "panel",
		role: "alert",
		children: [
			/* @__PURE__ */ (0, b.jsx)("h2", { children: "Local evidence review unavailable" }),
			/* @__PURE__ */ (0, b.jsx)("p", { children: r.error.message }),
			/* @__PURE__ */ (0, b.jsx)("button", {
				className: "button",
				onClick: () => void r.refetch(),
				children: "Retry local review"
			})
		]
	});
	if (!r.data) return /* @__PURE__ */ (0, b.jsx)("p", {
		role: "status",
		children: "Checking existing local evidence…"
	});
	let i = r.data;
	if (i.status === "unavailable") return /* @__PURE__ */ (0, b.jsx)("p", {
		className: "notice subtle",
		children: i.reason
	});
	if (!i.cohort || !i.archive || !i.read_budget) return /* @__PURE__ */ (0, b.jsx)("p", {
		className: "error",
		role: "alert",
		children: "The local review is incomplete. No readiness decision can be inferred."
	});
	let a = i.cohort, o = i.archive, s = i.read_budget;
	return /* @__PURE__ */ (0, b.jsxs)("article", {
		className: "panel study-panel",
		children: [
			/* @__PURE__ */ (0, b.jsxs)("div", {
				className: "panel-head",
				children: [/* @__PURE__ */ (0, b.jsxs)("div", { children: [/* @__PURE__ */ (0, b.jsx)("p", {
					className: "overline",
					children: "REAL DATA / EXISTING EVIDENCE ONLY"
				}), /* @__PURE__ */ (0, b.jsx)("h2", { children: "Can this cohort support an evaluation?" })] }), /* @__PURE__ */ (0, b.jsxs)("div", {
					className: "study-actions",
					children: [/* @__PURE__ */ (0, b.jsx)("button", {
						className: "button",
						disabled: r.isFetching,
						onClick: () => void r.refetch(),
						children: r.isFetching ? "Reviewing…" : "Recheck local evidence"
					}), /* @__PURE__ */ (0, b.jsx)("a", {
						className: "button",
						href: "/api/study-readiness",
						download: "signalrank-study-review.json",
						children: "Export local review"
					})]
				})]
			}),
			/* @__PURE__ */ (0, b.jsxs)("p", {
				className: "study-decision",
				children: [
					/* @__PURE__ */ (0, b.jsx)("span", {
						className: "badge warning",
						children: "Fitting blocked"
					}),
					" ",
					i.decision
				]
			}),
			/* @__PURE__ */ (0, b.jsx)("div", {
				className: "metrics study-metrics",
				children: [
					[
						"Selected records",
						a.available ? String(a.selected) : "Unavailable",
						a.available ? `${a.processed} processed · ${a.candidates} candidates` : "Local cohort evidence could not be read"
					],
					[
						"Positive candidates",
						a.available ? String(a.candidate_labels.positive ?? 0) : "Unavailable",
						a.available ? `${a.candidate_labels["provisional negative"] ?? 0} provisional negatives; not verified negatives` : "Outcome support is unknown"
					],
					[
						"Missing historical metrics",
						a.available ? String(a.missing_metrics) : "Unavailable",
						a.available ? `Of ${a.candidates} candidates · ${a.unknown_metrics} unknown flags` : "Feature availability is unknown"
					]
				].map(([e, t, n]) => /* @__PURE__ */ (0, b.jsxs)("div", {
					className: "metric",
					children: [
						/* @__PURE__ */ (0, b.jsx)("span", {
							className: "metric-label",
							children: e
						}),
						/* @__PURE__ */ (0, b.jsx)("strong", {
							className: "metric-value",
							children: t
						}),
						/* @__PURE__ */ (0, b.jsx)("span", {
							className: "metric-note",
							children: n
						})
					]
				}, e))
			}),
			/* @__PURE__ */ (0, b.jsx)("p", {
				className: "caption",
				children: i.warning
			}),
			/* @__PURE__ */ (0, b.jsx)(A, {
				label: "Real-data feasibility gates",
				children: /* @__PURE__ */ (0, b.jsxs)("table", { children: [/* @__PURE__ */ (0, b.jsx)("thead", { children: /* @__PURE__ */ (0, b.jsxs)("tr", { children: [
					/* @__PURE__ */ (0, b.jsx)("th", { children: "Check" }),
					/* @__PURE__ */ (0, b.jsx)("th", { children: "Finding" }),
					/* @__PURE__ */ (0, b.jsx)("th", { children: "Status" })
				] }) }), /* @__PURE__ */ (0, b.jsx)("tbody", { children: i.gates?.map((e) => /* @__PURE__ */ (0, b.jsxs)("tr", { children: [
					/* @__PURE__ */ (0, b.jsx)("td", { children: e.name }),
					/* @__PURE__ */ (0, b.jsx)("td", { children: e.finding }),
					/* @__PURE__ */ (0, b.jsx)("td", { children: /* @__PURE__ */ (0, b.jsx)("span", {
						className: "badge" + (e.status === "verified" ? "" : " warning"),
						children: e.status === "verified" ? "Verified local check" : e.status === "blocked" ? "Blocked" : "Unresolved"
					}) })
				] }, e.id)) })] })
			}),
			/* @__PURE__ */ (0, b.jsxs)("div", {
				className: "study-details",
				children: [/* @__PURE__ */ (0, b.jsxs)("div", { children: [/* @__PURE__ */ (0, b.jsx)("h3", { children: "What was checked locally" }), /* @__PURE__ */ (0, b.jsxs)("ul", { children: [
					/* @__PURE__ */ (0, b.jsxs)("li", { children: [
						o.verified_payloads,
						" / ",
						o.unique_payloads,
						" unique payload files match their hashes."
					] }),
					/* @__PURE__ */ (0, b.jsxs)("li", { children: [
						o.verified_metadata,
						" / ",
						o.unique_metadata,
						" cache metadata entries agree with their references."
					] }),
					/* @__PURE__ */ (0, b.jsxs)("li", { children: [
						o.references,
						" reference entries reviewed; ",
						o.catalog_verified ? "catalog checksum matches" : "catalog evidence unresolved",
						"."
					] }),
					/* @__PURE__ */ (0, b.jsxs)("li", { children: [
						o.notices.filter((e) => e.status === "verified").length,
						" / ",
						o.notices.length,
						" archived source notices match recorded hashes."
					] })
				] })] }), /* @__PURE__ */ (0, b.jsxs)("div", { children: [
					/* @__PURE__ */ (0, b.jsx)("h3", { children: "Publication years in candidate rows" }),
					Object.keys(a.candidate_publication_years).length ? /* @__PURE__ */ (0, b.jsx)("dl", {
						className: "study-years",
						children: Object.entries(a.candidate_publication_years).map(([e, t]) => /* @__PURE__ */ (0, b.jsxs)("div", { children: [/* @__PURE__ */ (0, b.jsx)("dt", { children: e }), /* @__PURE__ */ (0, b.jsxs)("dd", { children: [t, " candidates"] })] }, e))
					}) : /* @__PURE__ */ (0, b.jsx)("p", { children: "Publication-year evidence unavailable." }),
					/* @__PURE__ */ (0, b.jsx)("p", {
						className: "caption",
						children: "A CVE identifier year does not define the publication year. This is an exploratory selection, not a new representative cohort."
					})
				] })]
			}),
			/* @__PURE__ */ (0, b.jsxs)("details", { children: [
				/* @__PURE__ */ (0, b.jsx)("summary", { children: "Read budget, missing evidence and limitations" }),
				/* @__PURE__ */ (0, b.jsxs)("p", { children: [
					(s.bytes_read / 1048576).toFixed(2),
					" / ",
					(s.limit_bytes / 1048576).toFixed(0),
					" MiB read · ",
					s.network_requests,
					" network requests · ",
					s.bytes_written,
					" bytes written. ",
					s.exhausted ? "Read limit reached; evidence remains unresolved." : "No acquisition or repair performed."
				] }),
				/* @__PURE__ */ (0, b.jsxs)("p", { children: [i.issue_count ?? 0, " local file issues. Up to 20 are shown; export the input fingerprints for reproducibility."] }),
				!!i.issues?.length && /* @__PURE__ */ (0, b.jsx)(A, {
					label: "Local archive issues",
					children: /* @__PURE__ */ (0, b.jsxs)("table", { children: [/* @__PURE__ */ (0, b.jsx)("thead", { children: /* @__PURE__ */ (0, b.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, b.jsx)("th", { children: "File" }),
						/* @__PURE__ */ (0, b.jsx)("th", { children: "Status" }),
						/* @__PURE__ */ (0, b.jsx)("th", { children: "Reason" })
					] }) }), /* @__PURE__ */ (0, b.jsx)("tbody", { children: i.issues.map((e, t) => /* @__PURE__ */ (0, b.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, b.jsx)("td", { children: /* @__PURE__ */ (0, b.jsx)("code", { children: e.file }) }),
						/* @__PURE__ */ (0, b.jsx)("td", { children: e.status }),
						/* @__PURE__ */ (0, b.jsx)("td", { children: e.reason })
					] }, t)) })] })
				}),
				/* @__PURE__ */ (0, b.jsx)("ul", { children: i.limitations?.map((e) => /* @__PURE__ */ (0, b.jsx)("li", { children: e }, e)) })
			] })
		]
	});
}
//#endregion
//#region src/Bikes.tsx
var Rn = (e) => e == null ? "Unavailable" : e.toFixed(3), zn = (e) => (100 * e).toFixed(1) + "%";
function Bn() {
	let e = () => location.hash.slice(1).split(/[/?]/)[0] === "bikes", [t, n] = (0, y.useState)(e), [r, i] = (0, y.useState)("final"), [a, o] = (0, y.useState)("logistic");
	(0, y.useEffect)(() => {
		let t = () => n(e());
		return window.addEventListener("hashchange", t), window.addEventListener("signalrank:view", t), () => {
			window.removeEventListener("hashchange", t), window.removeEventListener("signalrank:view", t);
		};
	}, []);
	let s = O({
		queryKey: ["bikes"],
		queryFn: ({ signal: e }) => k("/api/bikes", e),
		enabled: t
	}), c = O({
		queryKey: ["bikes-audit"],
		queryFn: ({ signal: e }) => k("/api/bikes/audit", e),
		enabled: t
	}), l = O({
		queryKey: ["bikes-external"],
		queryFn: ({ signal: e }) => k("/api/bikes/external", e),
		enabled: t
	});
	if (!t) return null;
	if (s.error) return /* @__PURE__ */ (0, b.jsxs)("div", {
		className: "error",
		role: "alert",
		children: [/* @__PURE__ */ (0, b.jsx)("p", { children: s.error.message }), /* @__PURE__ */ (0, b.jsx)("button", {
			className: "button",
			onClick: () => void s.refetch(),
			children: "Retry benchmark"
		})]
	});
	if (!s.data) return /* @__PURE__ */ (0, b.jsx)("p", {
		role: "status",
		children: "Loading the saved real-data benchmark…"
	});
	let u = s.data;
	if (u.status !== "available" || !u.comparisons || !u.partitions) return /* @__PURE__ */ (0, b.jsxs)("article", {
		className: "panel",
		children: [
			/* @__PURE__ */ (0, b.jsx)("h2", { children: "No saved bike benchmark loaded." }),
			/* @__PURE__ */ (0, b.jsx)("p", { children: u.reason }),
			/* @__PURE__ */ (0, b.jsxs)("p", { children: [
				"Source: ",
				/* @__PURE__ */ (0, b.jsx)("a", {
					href: "https://archive.ics.uci.edu/dataset/560/seoul+bike+sharing+demand",
					children: "UCI Seoul Bike Sharing Demand ↗"
				}),
				". This view never downloads data or fits a model."
			] })
		]
	});
	let d = u.comparisons[r], f = d.find((e) => e.id === "logistic"), p = d.find((e) => e.id === a), m = d.find((e) => e.id === "weekly"), h = u.calibration?.[a] ?? [], g = u.timeline ?? [];
	return /* @__PURE__ */ (0, b.jsxs)("div", {
		className: "lab-workspace bikes-workspace",
		children: [
			/* @__PURE__ */ (0, b.jsxs)("article", {
				className: "panel bike-intro",
				children: [/* @__PURE__ */ (0, b.jsxs)("div", { children: [
					/* @__PURE__ */ (0, b.jsx)("p", {
						className: "overline",
						children: "REAL DATA / FIXED EXPERIMENT"
					}),
					/* @__PURE__ */ (0, b.jsx)("h2", { children: "Which hours will be busy tomorrow?" }),
					/* @__PURE__ */ (0, b.jsx)("p", { children: "Rank citywide rental demand one day ahead using completed hourly counts and calendar information. Inspect the results against historical-demand baselines." }),
					/* @__PURE__ */ (0, b.jsxs)("div", {
						className: "bike-tags",
						children: [
							/* @__PURE__ */ (0, b.jsx)("span", {
								className: "badge",
								children: u.fixture ? "Original test fixture" : "UCI · Seoul · 2017–2018"
							}),
							/* @__PURE__ */ (0, b.jsx)("span", {
								className: "badge",
								children: u.source?.license
							}),
							/* @__PURE__ */ (0, b.jsx)("span", {
								className: "badge",
								children: "24-hour label horizon"
							})
						]
					})
				] }), /* @__PURE__ */ (0, b.jsxs)("div", {
					className: "bike-threshold",
					children: [
						/* @__PURE__ */ (0, b.jsx)("span", { children: "High-demand threshold" }),
						/* @__PURE__ */ (0, b.jsx)("strong", { children: u.threshold?.toLocaleString() }),
						/* @__PURE__ */ (0, b.jsx)("span", { children: "rentals / hour · derived from training targets" })
					]
				})]
			}),
			/* @__PURE__ */ (0, b.jsx)("p", {
				className: "notice subtle",
				children: u.warning
			}),
			/* @__PURE__ */ (0, b.jsxs)("div", {
				className: "bike-toolbar",
				children: [
					/* @__PURE__ */ (0, b.jsxs)("label", { children: ["Comparison table interval", /* @__PURE__ */ (0, b.jsxs)("select", {
						value: r,
						onChange: (e) => i(e.target.value),
						children: [/* @__PURE__ */ (0, b.jsx)("option", {
							value: "final",
							children: "Final · first fixed evaluation"
						}), /* @__PURE__ */ (0, b.jsx)("option", {
							value: "development",
							children: "Earlier development"
						})]
					})] }),
					/* @__PURE__ */ (0, b.jsxs)("label", { children: ["Displayed probability model", /* @__PURE__ */ (0, b.jsxs)("select", {
						value: a,
						onChange: (e) => o(e.target.value),
						children: [/* @__PURE__ */ (0, b.jsx)("option", {
							value: "logistic",
							children: "Logistic regression · prespecified primary"
						}), /* @__PURE__ */ (0, b.jsx)("option", {
							value: "boosted",
							children: "Histogram boosting · fixed comparison"
						})]
					})] }),
					/* @__PURE__ */ (0, b.jsx)("a", {
						className: "button",
						href: "/api/bikes/export",
						download: "signalrank-bike-benchmark.md",
						children: "Export benchmark report"
					}),
					/* @__PURE__ */ (0, b.jsx)("a", {
						href: "/api/bikes",
						download: "signalrank-bike-benchmark.json",
						children: "JSON evidence ↗"
					})
				]
			}),
			/* @__PURE__ */ (0, b.jsx)("div", {
				className: "metrics",
				children: [
					[
						"Average precision",
						Rn(p.average_precision),
						`Same-hour weekly baseline ${Rn(m.average_precision)}`
					],
					[
						"Brier score",
						Rn(p.brier_score),
						"Probability error · lower is better"
					],
					[
						"Positives captured",
						`${p.captured} / ${p.positives}`,
						`${p.budget} highest-ranked hours · ${zn(p.recall)} recall`
					]
				].map(([e, t, n]) => /* @__PURE__ */ (0, b.jsxs)("div", {
					className: "metric",
					children: [
						/* @__PURE__ */ (0, b.jsx)("span", {
							className: "metric-label",
							children: e
						}),
						/* @__PURE__ */ (0, b.jsx)("strong", {
							className: "metric-value",
							children: t
						}),
						/* @__PURE__ */ (0, b.jsx)("span", {
							className: "metric-note",
							children: n
						})
					]
				}, e))
			}),
			/* @__PURE__ */ (0, b.jsxs)("article", {
				className: "panel",
				children: [
					/* @__PURE__ */ (0, b.jsxs)("div", {
						className: "panel-head",
						children: [/* @__PURE__ */ (0, b.jsx)("h2", { children: "Does ML improve the ranking?" }), /* @__PURE__ */ (0, b.jsxs)("span", {
							className: "caption",
							children: [
								p.count,
								" hours · ",
								zn(p.prevalence),
								" positive · ",
								r
							]
						})]
					}),
					/* @__PURE__ */ (0, b.jsx)(A, {
						label: "Real-data model comparisons",
						children: /* @__PURE__ */ (0, b.jsxs)("table", { children: [/* @__PURE__ */ (0, b.jsx)("thead", { children: /* @__PURE__ */ (0, b.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, b.jsx)("th", { children: "Candidate" }),
							/* @__PURE__ */ (0, b.jsx)("th", { children: "Average precision ↑" }),
							/* @__PURE__ */ (0, b.jsx)("th", { children: "Brier ↓" }),
							/* @__PURE__ */ (0, b.jsx)("th", { children: "Precision · top 10%" }),
							/* @__PURE__ */ (0, b.jsx)("th", { children: "Recall · top 10%" })
						] }) }), /* @__PURE__ */ (0, b.jsx)("tbody", { children: d.map((e) => /* @__PURE__ */ (0, b.jsxs)("tr", {
							className: e.id === a ? "selected-row" : "",
							children: [
								/* @__PURE__ */ (0, b.jsxs)("td", { children: [e.name, e.id === "logistic" && /* @__PURE__ */ (0, b.jsx)("span", {
									className: "caption",
									children: "Prespecified primary"
								})] }),
								/* @__PURE__ */ (0, b.jsx)("td", { children: Rn(e.average_precision) }),
								/* @__PURE__ */ (0, b.jsx)("td", { children: Rn(e.brier_score) }),
								/* @__PURE__ */ (0, b.jsx)("td", { children: zn(e.precision) }),
								/* @__PURE__ */ (0, b.jsx)("td", { children: zn(e.recall) })
							]
						}, e.id)) })] })
					}),
					/* @__PURE__ */ (0, b.jsx)("p", {
						className: "caption",
						children: "Both model configurations were fixed before final evaluation; no winner was chosen from these results. Raw count baselines are rankings, so Brier is unavailable. The 10% budget ranks this entire historical interval, not hours available simultaneously in a live system."
					}),
					/* @__PURE__ */ (0, b.jsxs)("p", {
						className: "bike-delta",
						children: [
							"Primary-model AP minus weekly baseline: ",
							/* @__PURE__ */ (0, b.jsxs)("strong", { children: [f.average_precision - m.average_precision >= 0 ? "+" : "", Rn(f.average_precision - m.average_precision)] }),
							". Descriptive difference, not a significance test."
						]
					})
				]
			}),
			/* @__PURE__ */ (0, b.jsxs)("article", {
				className: "panel",
				children: [
					/* @__PURE__ */ (0, b.jsx)("div", {
						className: "panel-head",
						children: /* @__PURE__ */ (0, b.jsxs)("div", { children: [/* @__PURE__ */ (0, b.jsx)("p", {
							className: "overline",
							children: "DAILY / FINAL INTERVAL"
						}), /* @__PURE__ */ (0, b.jsx)("h2", { children: "Track probabilities against observed frequency." })] })
					}),
					/* @__PURE__ */ (0, b.jsx)(Dn, {
						labels: g.map((e) => e.day),
						series: [{
							name: "Observed high-demand fraction",
							values: g.map((e) => e.observed_fraction),
							color: "var(--muted)",
							dashed: !0
						}, {
							name: "Mean calibrated probability",
							values: g.map((e) => e[a]),
							color: "var(--accent)"
						}],
						title: "Daily high-demand frequency and mean forecast probability",
						xTitle: "Forecast date · Seoul local clock"
					}),
					/* @__PURE__ */ (0, b.jsx)("p", {
						className: "caption",
						children: "Daily fractions and averages summarize the final hourly predictions. Daily groups may be partial; the table retains their hour counts. These are retrospective observations, not live monitoring."
					}),
					/* @__PURE__ */ (0, b.jsxs)("details", { children: [/* @__PURE__ */ (0, b.jsx)("summary", { children: "Accessible daily evidence table" }), /* @__PURE__ */ (0, b.jsx)(A, {
						label: "Daily demand evidence",
						children: /* @__PURE__ */ (0, b.jsxs)("table", { children: [/* @__PURE__ */ (0, b.jsx)("thead", { children: /* @__PURE__ */ (0, b.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, b.jsx)("th", { children: "Date" }),
							/* @__PURE__ */ (0, b.jsx)("th", { children: "Hours" }),
							/* @__PURE__ */ (0, b.jsx)("th", { children: "Observed high-demand fraction" }),
							/* @__PURE__ */ (0, b.jsx)("th", { children: "Mean probability" })
						] }) }), /* @__PURE__ */ (0, b.jsx)("tbody", { children: g.map((e) => /* @__PURE__ */ (0, b.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, b.jsx)("td", { children: e.day }),
							/* @__PURE__ */ (0, b.jsx)("td", { children: e.hours }),
							/* @__PURE__ */ (0, b.jsx)("td", { children: zn(e.observed_fraction) }),
							/* @__PURE__ */ (0, b.jsx)("td", { children: zn(e[a]) })
						] }, e.day)) })] })
					})] })
				]
			}),
			/* @__PURE__ */ (0, b.jsxs)("div", {
				className: "bike-two-col",
				children: [/* @__PURE__ */ (0, b.jsxs)("article", {
					className: "panel",
					children: [
						/* @__PURE__ */ (0, b.jsx)("p", {
							className: "overline",
							children: "TIME / LEAKAGE CONTROLS"
						}),
						/* @__PURE__ */ (0, b.jsx)("h2", { children: "Fit earlier. Measure later." }),
						/* @__PURE__ */ (0, b.jsx)("dl", {
							className: "bike-splits",
							children: [
								"train",
								"calibration",
								"development",
								"final"
							].map((e) => {
								let t = u.partitions[e];
								return /* @__PURE__ */ (0, b.jsxs)("div", { children: [
									/* @__PURE__ */ (0, b.jsxs)("dt", { children: [
										e,
										" · ",
										t.count,
										" hours · ",
										t.positives,
										" positives"
									] }),
									/* @__PURE__ */ (0, b.jsxs)("dd", { children: [
										t.first,
										" → ",
										t.last
									] }),
									/* @__PURE__ */ (0, b.jsxs)("dd", { children: ["Latest target finishes ", t.last_target_at] })
								] }, e);
							})
						}),
						/* @__PURE__ */ (0, b.jsxs)("p", {
							className: "caption",
							children: [u.purged, " origins purged at partition boundaries. Targets must finish strictly before the next interval begins. Features use only completed counts and known calendar cycles; future weather and functioning status are excluded."]
						})
					]
				}), /* @__PURE__ */ (0, b.jsxs)("article", {
					className: "panel",
					children: [
						/* @__PURE__ */ (0, b.jsx)("p", {
							className: "overline",
							children: "PROBABILITIES / SUPPORT"
						}),
						/* @__PURE__ */ (0, b.jsx)("h2", { children: "Check calibration, including empty bins." }),
						/* @__PURE__ */ (0, b.jsx)(A, {
							label: "Bike probability calibration",
							children: /* @__PURE__ */ (0, b.jsxs)("table", { children: [/* @__PURE__ */ (0, b.jsx)("thead", { children: /* @__PURE__ */ (0, b.jsxs)("tr", { children: [
								/* @__PURE__ */ (0, b.jsx)("th", { children: "Probability bin" }),
								/* @__PURE__ */ (0, b.jsx)("th", { children: "Hours" }),
								/* @__PURE__ */ (0, b.jsx)("th", { children: "Mean predicted" }),
								/* @__PURE__ */ (0, b.jsx)("th", { children: "Observed" })
							] }) }), /* @__PURE__ */ (0, b.jsx)("tbody", { children: h.map((e) => /* @__PURE__ */ (0, b.jsxs)("tr", { children: [
								/* @__PURE__ */ (0, b.jsxs)("td", { children: [
									zn(e.lower),
									"–",
									zn(e.upper)
								] }),
								/* @__PURE__ */ (0, b.jsx)("td", { children: e.count }),
								/* @__PURE__ */ (0, b.jsx)("td", { children: e.predicted === null ? "Unavailable" : zn(e.predicted) }),
								/* @__PURE__ */ (0, b.jsx)("td", { children: e.observed === null ? "Unavailable" : zn(e.observed) })
							] }, e.lower)) })] })
						}),
						/* @__PURE__ */ (0, b.jsx)("p", {
							className: "caption",
							children: "Final interval only. Calibration was fitted on the separate earlier July interval; this table does not recalibrate or fit on the displayed outcomes."
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, b.jsxs)("article", {
				className: "panel",
				children: [
					/* @__PURE__ */ (0, b.jsxs)("div", {
						className: "panel-head",
						children: [/* @__PURE__ */ (0, b.jsx)("h2", { children: "Where does the primary model fail?" }), /* @__PURE__ */ (0, b.jsx)("span", {
							className: "caption",
							children: "Final interval · logistic regression"
						})]
					}),
					/* @__PURE__ */ (0, b.jsx)(A, {
						label: "Bike ranking errors",
						children: /* @__PURE__ */ (0, b.jsxs)("table", { children: [/* @__PURE__ */ (0, b.jsx)("thead", { children: /* @__PURE__ */ (0, b.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, b.jsx)("th", { children: "Kind / forecast cutoff" }),
							/* @__PURE__ */ (0, b.jsx)("th", { children: "Target finishes" }),
							/* @__PURE__ */ (0, b.jsx)("th", { children: "Actual rentals" }),
							/* @__PURE__ */ (0, b.jsx)("th", { children: "Probability" }),
							/* @__PURE__ */ (0, b.jsx)("th", { children: "Inspect the score" })
						] }) }), /* @__PURE__ */ (0, b.jsx)("tbody", { children: u.errors?.map((e, t) => /* @__PURE__ */ (0, b.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, b.jsxs)("td", { children: [e.kind, /* @__PURE__ */ (0, b.jsx)("span", {
								className: "caption",
								children: e.at
							})] }),
							/* @__PURE__ */ (0, b.jsx)("td", { children: e.target_at }),
							/* @__PURE__ */ (0, b.jsx)("td", { children: e.count }),
							/* @__PURE__ */ (0, b.jsx)("td", { children: zn(e.probability) }),
							/* @__PURE__ */ (0, b.jsx)("td", { children: /* @__PURE__ */ (0, b.jsxs)("details", { children: [
								/* @__PURE__ */ (0, b.jsx)("summary", { children: "All linear factors" }),
								/* @__PURE__ */ (0, b.jsxs)("p", { children: [
									"Intercept ",
									Rn(e.intercept),
									" · raw log-odds ",
									Rn(e.logit)
								] }),
								/* @__PURE__ */ (0, b.jsx)("ul", { children: e.factors.map((e) => /* @__PURE__ */ (0, b.jsxs)("li", { children: [
									e.feature,
									": ",
									e.value >= 0 ? "+" : "",
									Rn(e.value)
								] }, e.feature)) }),
								/* @__PURE__ */ (0, b.jsxs)("p", { children: [
									"Separate sigmoid calibration: ",
									Rn(e.calibration.slope),
									" × raw log-odds + ",
									Rn(e.calibration.intercept),
									". Factors explain the model, not causality."
								] })
							] }) })
						] }, t)) })] })
					}),
					/* @__PURE__ */ (0, b.jsx)("p", {
						className: "caption",
						children: "Up to six highest-ranked selected negatives and six highest-ranked missed positives, under the global top-10% budget. These are ranking-budget errors, not threshold classifications."
					}),
					/* @__PURE__ */ (0, b.jsxs)("details", { children: [
						/* @__PURE__ */ (0, b.jsx)("summary", { children: "Monthly primary-model slices" }),
						/* @__PURE__ */ (0, b.jsx)(A, {
							label: "Monthly bike demand slices",
							children: /* @__PURE__ */ (0, b.jsxs)("table", { children: [/* @__PURE__ */ (0, b.jsx)("thead", { children: /* @__PURE__ */ (0, b.jsxs)("tr", { children: [
								/* @__PURE__ */ (0, b.jsx)("th", { children: "Month" }),
								/* @__PURE__ */ (0, b.jsx)("th", { children: "Hours / positives" }),
								/* @__PURE__ */ (0, b.jsx)("th", { children: "AP" }),
								/* @__PURE__ */ (0, b.jsx)("th", { children: "Brier" })
							] }) }), /* @__PURE__ */ (0, b.jsx)("tbody", { children: u.slices?.map((e) => /* @__PURE__ */ (0, b.jsxs)("tr", { children: [
								/* @__PURE__ */ (0, b.jsx)("td", { children: e.month }),
								/* @__PURE__ */ (0, b.jsxs)("td", { children: [
									e.count,
									" / ",
									e.positives
								] }),
								/* @__PURE__ */ (0, b.jsx)("td", { children: Rn(e.metrics?.average_precision) }),
								/* @__PURE__ */ (0, b.jsx)("td", { children: Rn(e.metrics?.brier_score) })
							] }, e.month)) })] })
						}),
						/* @__PURE__ */ (0, b.jsx)("p", {
							className: "caption",
							children: "Display gate: 30 hours and five outcomes of each class; not statistical adequacy. Slice metrics use their own retrospective 10% budget."
						})
					] })
				]
			}),
			/* @__PURE__ */ (0, b.jsxs)("article", {
				className: "panel bike-audit",
				children: [/* @__PURE__ */ (0, b.jsxs)("div", {
					className: "panel-head",
					children: [/* @__PURE__ */ (0, b.jsxs)("div", { children: [/* @__PURE__ */ (0, b.jsx)("p", {
						className: "overline",
						children: "EXPLORATORY / ERROR ANALYSIS"
					}), /* @__PURE__ */ (0, b.jsx)("h2", { children: "Where does the fixed model struggle?" })] }), /* @__PURE__ */ (0, b.jsx)("span", {
						className: "badge",
						children: "Final interval already explored"
					})]
				}), c.error ? /* @__PURE__ */ (0, b.jsxs)("div", {
					role: "alert",
					children: [/* @__PURE__ */ (0, b.jsx)("p", { children: "Could not read the local subgroup audit." }), /* @__PURE__ */ (0, b.jsx)("button", {
						className: "button",
						onClick: () => void c.refetch(),
						children: "Retry audit"
					})]
				}) : c.data ? c.data.status === "available" ? /* @__PURE__ */ (0, b.jsxs)(b.Fragment, { children: [
					/* @__PURE__ */ (0, b.jsx)("p", { children: c.data.warning }),
					/* @__PURE__ */ (0, b.jsxs)("div", {
						className: "bike-audit-summary",
						children: [
							/* @__PURE__ */ (0, b.jsxs)("span", { children: ["One global review budget ", /* @__PURE__ */ (0, b.jsx)("strong", { children: c.data.global_budget })] }),
							/* @__PURE__ */ (0, b.jsxs)("span", { children: ["Positives captured ", /* @__PURE__ */ (0, b.jsx)("strong", { children: c.data.global_captured })] }),
							/* @__PURE__ */ (0, b.jsxs)("span", { children: [
								"Low recent demand ≤ ",
								/* @__PURE__ */ (0, b.jsx)("strong", { children: c.data.recent_demand_cutoff?.toFixed(1) }),
								" rentals/hour mean"
							] })
						]
					}),
					/* @__PURE__ */ (0, b.jsx)(A, {
						label: "Exploratory bike demand subgroup diagnostics",
						children: /* @__PURE__ */ (0, b.jsxs)("table", { children: [/* @__PURE__ */ (0, b.jsx)("thead", { children: /* @__PURE__ */ (0, b.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, b.jsx)("th", { children: "Dimension / group" }),
							/* @__PURE__ */ (0, b.jsx)("th", { children: "Hours / positives" }),
							/* @__PURE__ */ (0, b.jsx)("th", { children: "Observed / predicted" }),
							/* @__PURE__ */ (0, b.jsx)("th", { children: "Logistic AP" }),
							/* @__PURE__ */ (0, b.jsx)("th", { children: "Weekly AP" }),
							/* @__PURE__ */ (0, b.jsx)("th", { children: "Logistic Brier" }),
							/* @__PURE__ */ (0, b.jsx)("th", { children: "Global selected / captured" })
						] }) }), /* @__PURE__ */ (0, b.jsx)("tbody", { children: c.data.slices?.map((e) => /* @__PURE__ */ (0, b.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, b.jsxs)("td", { children: [/* @__PURE__ */ (0, b.jsx)("strong", { children: e.group }), /* @__PURE__ */ (0, b.jsx)("span", {
								className: "caption",
								children: e.dimension
							})] }),
							/* @__PURE__ */ (0, b.jsxs)("td", { children: [
								e.count,
								" / ",
								e.positives
							] }),
							/* @__PURE__ */ (0, b.jsxs)("td", { children: [
								e.prevalence == null ? "Unavailable" : zn(e.prevalence),
								" / ",
								e.mean_probability == null ? "Unavailable" : zn(e.mean_probability)
							] }),
							/* @__PURE__ */ (0, b.jsx)("td", { children: Rn(e.logistic_ap) }),
							/* @__PURE__ */ (0, b.jsx)("td", { children: Rn(e.weekly_ap) }),
							/* @__PURE__ */ (0, b.jsx)("td", { children: Rn(e.logistic_brier) }),
							/* @__PURE__ */ (0, b.jsxs)("td", { children: [
								e.global_selected,
								" / ",
								e.global_captured
							] })
						] }, e.dimension + e.group)) })] })
					}),
					/* @__PURE__ */ (0, b.jsxs)("p", {
						className: "caption",
						children: [
							c.data.selection,
							" ",
							c.data.display_gate,
							" Groups overlap across dimensions. Within-group AP is affected by group prevalence. These differences were inspected after the first final evaluation; they are not a new holdout result."
						]
					}),
					/* @__PURE__ */ (0, b.jsxs)("details", { children: [
						/* @__PURE__ */ (0, b.jsx)("summary", { children: "Audit provenance" }),
						/* @__PURE__ */ (0, b.jsxs)("p", {
							className: "replay-fingerprint",
							children: ["Audit ", c.data.audit_sha256]
						}),
						/* @__PURE__ */ (0, b.jsxs)("p", {
							className: "replay-fingerprint",
							children: ["First benchmark report ", c.data.parent_report_sha256]
						})
					] })
				] }) : /* @__PURE__ */ (0, b.jsx)("p", {
					className: "caption",
					children: c.data.reason
				}) : /* @__PURE__ */ (0, b.jsx)("p", {
					role: "status",
					children: "Loading the subgroup audit…"
				})]
			}),
			/* @__PURE__ */ (0, b.jsxs)("article", {
				className: "panel bike-external",
				children: [/* @__PURE__ */ (0, b.jsxs)("div", {
					className: "panel-head",
					children: [/* @__PURE__ */ (0, b.jsxs)("div", { children: [/* @__PURE__ */ (0, b.jsx)("p", {
						className: "overline",
						children: "2019 / INDEPENDENT SOURCE GATE"
					}), /* @__PURE__ */ (0, b.jsx)("h2", { children: "Can later data validate this model?" })] }), /* @__PURE__ */ (0, b.jsx)("span", {
						className: "badge",
						children: l.data?.gate === "blocked" ? "Evaluation blocked" : "Source check"
					})]
				}), l.error ? /* @__PURE__ */ (0, b.jsxs)("div", {
					role: "alert",
					children: [/* @__PURE__ */ (0, b.jsx)("p", { children: "Could not read the local 2019 source audit." }), /* @__PURE__ */ (0, b.jsx)("button", {
						className: "button",
						onClick: () => void l.refetch(),
						children: "Retry source audit"
					})]
				}) : l.data ? l.data.status === "available" ? /* @__PURE__ */ (0, b.jsxs)(b.Fragment, { children: [
					/* @__PURE__ */ (0, b.jsx)("p", { children: l.data.warning }),
					/* @__PURE__ */ (0, b.jsx)("a", {
						className: "button",
						href: "/api/bikes/external/export",
						download: "signalrank-2019-source-gate.md",
						children: "Export source-gate report"
					}),
					/* @__PURE__ */ (0, b.jsxs)("div", {
						className: "bike-gate-stats",
						children: [
							/* @__PURE__ */ (0, b.jsxs)("div", { children: [/* @__PURE__ */ (0, b.jsx)("span", { children: "Hourly source records" }), /* @__PURE__ */ (0, b.jsx)("strong", { children: l.data.hourly?.raw_rows.toLocaleString() })] }),
							/* @__PURE__ */ (0, b.jsxs)("div", { children: [/* @__PURE__ */ (0, b.jsx)("span", { children: "Missing 2019 hours" }), /* @__PURE__ */ (0, b.jsx)("strong", { children: (l.data.hourly?.expected_hours ?? 0) - (l.data.hourly?.observed_hours ?? 0) })] }),
							/* @__PURE__ */ (0, b.jsxs)("div", { children: [/* @__PURE__ */ (0, b.jsx)("span", { children: "Daily totals disagreeing" }), /* @__PURE__ */ (0, b.jsxs)("strong", { children: [
								l.data.daily?.mismatched_dates,
								" / ",
								l.data.daily?.comparable_dates
							] })] })
						]
					}),
					/* @__PURE__ */ (0, b.jsx)("ul", {
						className: "bike-gate-reasons",
						children: l.data.reasons?.map((e) => /* @__PURE__ */ (0, b.jsx)("li", { children: e }, e))
					}),
					/* @__PURE__ */ (0, b.jsxs)("details", { children: [
						/* @__PURE__ */ (0, b.jsx)("summary", { children: "Inspect missing periods and count mismatches" }),
						/* @__PURE__ */ (0, b.jsxs)("p", {
							className: "caption",
							children: [
								"Published daily dates: ",
								l.data.daily?.published_dates,
								" / 365. Unpublished dates: ",
								l.data.daily?.missing_dates.join(", ") || "none",
								"."
							]
						}),
						/* @__PURE__ */ (0, b.jsx)(A, {
							label: "Missing official hourly periods",
							children: /* @__PURE__ */ (0, b.jsxs)("table", { children: [/* @__PURE__ */ (0, b.jsx)("thead", { children: /* @__PURE__ */ (0, b.jsxs)("tr", { children: [
								/* @__PURE__ */ (0, b.jsx)("th", { children: "First missing hour" }),
								/* @__PURE__ */ (0, b.jsx)("th", { children: "Last missing hour" }),
								/* @__PURE__ */ (0, b.jsx)("th", { children: "Hours" })
							] }) }), /* @__PURE__ */ (0, b.jsx)("tbody", { children: l.data.hourly?.missing_hour_spans.map((e) => /* @__PURE__ */ (0, b.jsxs)("tr", { children: [
								/* @__PURE__ */ (0, b.jsx)("td", { children: e.first }),
								/* @__PURE__ */ (0, b.jsx)("td", { children: e.last }),
								/* @__PURE__ */ (0, b.jsx)("td", { children: e.hours })
							] }, e.first)) })] })
						}),
						/* @__PURE__ */ (0, b.jsx)(A, {
							label: "Examples of nonreconciling published totals",
							children: /* @__PURE__ */ (0, b.jsxs)("table", { children: [/* @__PURE__ */ (0, b.jsx)("thead", { children: /* @__PURE__ */ (0, b.jsxs)("tr", { children: [
								/* @__PURE__ */ (0, b.jsx)("th", { children: "Day" }),
								/* @__PURE__ */ (0, b.jsx)("th", { children: "Hourly use total" }),
								/* @__PURE__ */ (0, b.jsx)("th", { children: "Daily rental total" })
							] }) }), /* @__PURE__ */ (0, b.jsx)("tbody", { children: l.data.daily?.mismatch_examples.map((e) => /* @__PURE__ */ (0, b.jsxs)("tr", { children: [
								/* @__PURE__ */ (0, b.jsx)("td", { children: e.day }),
								/* @__PURE__ */ (0, b.jsx)("td", { children: e.hourly_use_total.toLocaleString() }),
								/* @__PURE__ */ (0, b.jsx)("td", { children: e.daily_rental_total.toLocaleString() })
							] }, e.day)) })] })
						}),
						/* @__PURE__ */ (0, b.jsx)("p", {
							className: "caption",
							children: "No gap was filled, date excluded from a model score, or target relabeled to make the sources agree."
						})
					] }),
					/* @__PURE__ */ (0, b.jsxs)("p", {
						className: "caption",
						children: [
							"Source: ",
							/* @__PURE__ */ (0, b.jsx)("a", {
								href: l.data.source?.catalog_url,
								children: "Seoul hourly catalog ↗"
							}),
							" · ",
							/* @__PURE__ */ (0, b.jsx)("a", {
								href: l.data.source?.daily_catalog_url,
								children: "Seoul daily-count catalog ↗"
							}),
							" · ",
							/* @__PURE__ */ (0, b.jsx)("a", {
								href: l.data.source?.license_url,
								children: l.data.source?.license
							}),
							". ",
							l.data.source?.modifications,
							" No government endorsement is implied."
						]
					}),
					/* @__PURE__ */ (0, b.jsxs)("details", { children: [/* @__PURE__ */ (0, b.jsx)("summary", { children: "Source-audit fingerprint" }), /* @__PURE__ */ (0, b.jsx)("p", {
						className: "replay-fingerprint",
						children: l.data.report_sha256
					})] })
				] }) : /* @__PURE__ */ (0, b.jsx)("p", {
					className: "caption",
					children: l.data.reason
				}) : /* @__PURE__ */ (0, b.jsx)("p", {
					role: "status",
					children: "Loading the source audit…"
				})]
			}),
			/* @__PURE__ */ (0, b.jsxs)("article", {
				className: "panel",
				children: [
					/* @__PURE__ */ (0, b.jsx)("h2", { children: "Source, reproducibility and limits." }),
					/* @__PURE__ */ (0, b.jsxs)("p", { children: [
						/* @__PURE__ */ (0, b.jsxs)("a", {
							href: u.source?.dataset_url,
							children: [u.source?.title, " ↗"]
						}),
						" · ",
						/* @__PURE__ */ (0, b.jsx)("a", {
							href: u.source?.doi,
							children: "Dataset DOI"
						}),
						" · ",
						/* @__PURE__ */ (0, b.jsx)("a", {
							href: u.source?.license_url,
							children: "CC BY 4.0"
						})
					] }),
					/* @__PURE__ */ (0, b.jsx)("pre", {
						className: "bike-attribution",
						children: u.attribution
					}),
					/* @__PURE__ */ (0, b.jsxs)("p", {
						className: "caption",
						children: [
							"Local CPU time ",
							u.cpu_seconds?.toFixed(2),
							" seconds. No GPU, paid API, pretrained weights or request-time fitting."
						]
					}),
					/* @__PURE__ */ (0, b.jsx)("ul", { children: u.limitations?.map((e) => /* @__PURE__ */ (0, b.jsx)("li", { children: e }, e)) }),
					/* @__PURE__ */ (0, b.jsxs)("details", { children: [
						/* @__PURE__ */ (0, b.jsx)("summary", { children: "Fingerprints and runtime" }),
						/* @__PURE__ */ (0, b.jsxs)("p", {
							className: "replay-fingerprint",
							children: ["Dataset ", u.dataset_sha256]
						}),
						/* @__PURE__ */ (0, b.jsxs)("p", {
							className: "replay-fingerprint",
							children: ["Report ", u.report_sha256]
						}),
						/* @__PURE__ */ (0, b.jsx)("p", { children: Object.entries(u.runtime ?? {}).map(([e, t]) => e + " " + t).join(" · ") }),
						/* @__PURE__ */ (0, b.jsxs)("p", { children: [
							"Protocol ",
							u.protocol,
							". Checksums detect changes, not authenticity. The original synthetic and KEV research scopes are separate."
						] })
					] })
				]
			})
		]
	});
}
//#endregion
//#region src/main.tsx
var Vn = class extends y.Component {
	state = { failed: !1 };
	static getDerivedStateFromError() {
		return { failed: !0 };
	}
	render() {
		return this.state.failed ? /* @__PURE__ */ (0, b.jsxs)("div", {
			className: "error",
			role: "alert",
			children: ["This workspace view could not render. ", /* @__PURE__ */ (0, b.jsx)("button", {
				className: "button",
				onClick: () => location.reload(),
				children: "Reload workspace"
			})]
		}) : this.props.children;
	}
}, Hn = new it({ defaultOptions: { queries: {
	retry: !1,
	refetchOnWindowFocus: !1
} } }), Un = document.getElementById("experiments-root");
Un && (0, yt.createRoot)(Un).render(/* @__PURE__ */ (0, b.jsx)(Vn, { children: /* @__PURE__ */ (0, b.jsx)(ne, {
	client: Hn,
	children: /* @__PURE__ */ (0, b.jsx)(Gt, {})
}) }));
for (let [e, t] of [
	["bikes-root", Bn],
	["study-root", Ln],
	["evidence-root", In],
	["diagnostics-root", Ft],
	["inference-root", Rt],
	["reliability-root", $t],
	["replay-root", on],
	["challenge-root", un],
	["studio-root", En],
	["recovery-root", On],
	["decisions-root", kn],
	["showcase-root", Mn],
	["guide-root", jn]
]) {
	let n = document.getElementById(e);
	n && (0, yt.createRoot)(n).render(/* @__PURE__ */ (0, b.jsx)(Vn, { children: /* @__PURE__ */ (0, b.jsx)(ne, {
		client: Hn,
		children: /* @__PURE__ */ (0, b.jsx)(t, {})
	}) }));
}
//#endregion
