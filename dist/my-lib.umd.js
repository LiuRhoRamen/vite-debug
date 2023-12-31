(function(factory) {
  typeof define === "function" && define.amd ? define(factory) : factory();
})(function() {
  "use strict";
  var commonjsGlobal = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
  function getDefaultExportFromCjs(x) {
    return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
  }
  var store2 = { exports: {} };
  /*! store2 - v2.14.2 - 2022-07-18
  * Copyright (c) 2022 Nathan Bubna; Licensed (MIT OR GPL-3.0) */
  (function(module) {
    (function(window2, define2) {
      var _ = {
        version: "2.14.2",
        areas: {},
        apis: {},
        nsdelim: ".",
        // utilities
        inherit: function(api, o) {
          for (var p in api) {
            if (!o.hasOwnProperty(p)) {
              Object.defineProperty(o, p, Object.getOwnPropertyDescriptor(api, p));
            }
          }
          return o;
        },
        stringify: function(d, fn) {
          return d === void 0 || typeof d === "function" ? d + "" : JSON.stringify(d, fn || _.replace);
        },
        parse: function(s, fn) {
          try {
            return JSON.parse(s, fn || _.revive);
          } catch (e) {
            return s;
          }
        },
        // extension hooks
        fn: function(name, fn) {
          _.storeAPI[name] = fn;
          for (var api in _.apis) {
            _.apis[api][name] = fn;
          }
        },
        get: function(area, key) {
          return area.getItem(key);
        },
        set: function(area, key, string) {
          area.setItem(key, string);
        },
        remove: function(area, key) {
          area.removeItem(key);
        },
        key: function(area, i) {
          return area.key(i);
        },
        length: function(area) {
          return area.length;
        },
        clear: function(area) {
          area.clear();
        },
        // core functions
        Store: function(id, area, namespace) {
          var store4 = _.inherit(_.storeAPI, function(key, data, overwrite) {
            if (arguments.length === 0) {
              return store4.getAll();
            }
            if (typeof data === "function") {
              return store4.transact(key, data, overwrite);
            }
            if (data !== void 0) {
              return store4.set(key, data, overwrite);
            }
            if (typeof key === "string" || typeof key === "number") {
              return store4.get(key);
            }
            if (typeof key === "function") {
              return store4.each(key);
            }
            if (!key) {
              return store4.clear();
            }
            return store4.setAll(key, data);
          });
          store4._id = id;
          try {
            var testKey = "__store2_test";
            area.setItem(testKey, "ok");
            store4._area = area;
            area.removeItem(testKey);
          } catch (e) {
            store4._area = _.storage("fake");
          }
          store4._ns = namespace || "";
          if (!_.areas[id]) {
            _.areas[id] = store4._area;
          }
          if (!_.apis[store4._ns + store4._id]) {
            _.apis[store4._ns + store4._id] = store4;
          }
          return store4;
        },
        storeAPI: {
          // admin functions
          area: function(id, area) {
            var store4 = this[id];
            if (!store4 || !store4.area) {
              store4 = _.Store(id, area, this._ns);
              if (!this[id]) {
                this[id] = store4;
              }
            }
            return store4;
          },
          namespace: function(namespace, singleArea, delim) {
            delim = delim || this._delim || _.nsdelim;
            if (!namespace) {
              return this._ns ? this._ns.substring(0, this._ns.length - delim.length) : "";
            }
            var ns = namespace, store4 = this[ns];
            if (!store4 || !store4.namespace) {
              store4 = _.Store(this._id, this._area, this._ns + ns + delim);
              store4._delim = delim;
              if (!this[ns]) {
                this[ns] = store4;
              }
              if (!singleArea) {
                for (var name in _.areas) {
                  store4.area(name, _.areas[name]);
                }
              }
            }
            return store4;
          },
          isFake: function(force) {
            if (force) {
              this._real = this._area;
              this._area = _.storage("fake");
            } else if (force === false) {
              this._area = this._real || this._area;
            }
            return this._area.name === "fake";
          },
          toString: function() {
            return "store" + (this._ns ? "." + this.namespace() : "") + "[" + this._id + "]";
          },
          // storage functions
          has: function(key) {
            if (this._area.has) {
              return this._area.has(this._in(key));
            }
            return !!(this._in(key) in this._area);
          },
          size: function() {
            return this.keys().length;
          },
          each: function(fn, fill) {
            for (var i = 0, m = _.length(this._area); i < m; i++) {
              var key = this._out(_.key(this._area, i));
              if (key !== void 0) {
                if (fn.call(this, key, this.get(key), fill) === false) {
                  break;
                }
              }
              if (m > _.length(this._area)) {
                m--;
                i--;
              }
            }
            return fill || this;
          },
          keys: function(fillList) {
            return this.each(function(k, v, list) {
              list.push(k);
            }, fillList || []);
          },
          get: function(key, alt) {
            var s = _.get(this._area, this._in(key)), fn;
            if (typeof alt === "function") {
              fn = alt;
              alt = null;
            }
            return s !== null ? _.parse(s, fn) : alt != null ? alt : s;
          },
          getAll: function(fillObj) {
            return this.each(function(k, v, all) {
              all[k] = v;
            }, fillObj || {});
          },
          transact: function(key, fn, alt) {
            var val = this.get(key, alt), ret = fn(val);
            this.set(key, ret === void 0 ? val : ret);
            return this;
          },
          set: function(key, data, overwrite) {
            var d = this.get(key), replacer;
            if (d != null && overwrite === false) {
              return data;
            }
            if (typeof overwrite === "function") {
              replacer = overwrite;
              overwrite = void 0;
            }
            return _.set(this._area, this._in(key), _.stringify(data, replacer), overwrite) || d;
          },
          setAll: function(data, overwrite) {
            var changed, val;
            for (var key in data) {
              val = data[key];
              if (this.set(key, val, overwrite) !== val) {
                changed = true;
              }
            }
            return changed;
          },
          add: function(key, data, replacer) {
            var d = this.get(key);
            if (d instanceof Array) {
              data = d.concat(data);
            } else if (d !== null) {
              var type = typeof d;
              if (type === typeof data && type === "object") {
                for (var k in data) {
                  d[k] = data[k];
                }
                data = d;
              } else {
                data = d + data;
              }
            }
            _.set(this._area, this._in(key), _.stringify(data, replacer));
            return data;
          },
          remove: function(key, alt) {
            var d = this.get(key, alt);
            _.remove(this._area, this._in(key));
            return d;
          },
          clear: function() {
            if (!this._ns) {
              _.clear(this._area);
            } else {
              this.each(function(k) {
                _.remove(this._area, this._in(k));
              }, 1);
            }
            return this;
          },
          clearAll: function() {
            var area = this._area;
            for (var id in _.areas) {
              if (_.areas.hasOwnProperty(id)) {
                this._area = _.areas[id];
                this.clear();
              }
            }
            this._area = area;
            return this;
          },
          // internal use functions
          _in: function(k) {
            if (typeof k !== "string") {
              k = _.stringify(k);
            }
            return this._ns ? this._ns + k : k;
          },
          _out: function(k) {
            return this._ns ? k && k.indexOf(this._ns) === 0 ? k.substring(this._ns.length) : void 0 : (
              // so each() knows to skip it
              k
            );
          }
        },
        // end _.storeAPI
        storage: function(name) {
          return _.inherit(_.storageAPI, { items: {}, name });
        },
        storageAPI: {
          length: 0,
          has: function(k) {
            return this.items.hasOwnProperty(k);
          },
          key: function(i) {
            var c = 0;
            for (var k in this.items) {
              if (this.has(k) && i === c++) {
                return k;
              }
            }
          },
          setItem: function(k, v) {
            if (!this.has(k)) {
              this.length++;
            }
            this.items[k] = v;
          },
          removeItem: function(k) {
            if (this.has(k)) {
              delete this.items[k];
              this.length--;
            }
          },
          getItem: function(k) {
            return this.has(k) ? this.items[k] : null;
          },
          clear: function() {
            for (var k in this.items) {
              this.removeItem(k);
            }
          }
        }
        // end _.storageAPI
      };
      var store3 = (
        // safely set this up (throws error in IE10/32bit mode for local files)
        _.Store("local", function() {
          try {
            return localStorage;
          } catch (e) {
          }
        }())
      );
      store3.local = store3;
      store3._ = _;
      store3.area("session", function() {
        try {
          return sessionStorage;
        } catch (e) {
        }
      }());
      store3.area("page", _.storage("page"));
      if (typeof define2 === "function" && define2.amd !== void 0) {
        define2("store2", [], function() {
          return store3;
        });
      } else if (module.exports) {
        module.exports = store3;
      } else {
        if (window2.store) {
          _.conflict = window2.store;
        }
        window2.store = store3;
      }
    })(commonjsGlobal, commonjsGlobal && commonjsGlobal.define);
  })(store2);
  var store2Exports = store2.exports;
  const store = /* @__PURE__ */ getDefaultExportFromCjs(store2Exports);
  console.log("store", store);
});
