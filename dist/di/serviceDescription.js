define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ServiceDescription = void 0;
    var ServiceDescription = /** @class */ (function () {
        function ServiceDescription(key, singleton, container) {
            var _this = this;
            this.key = key;
            this.singleton = singleton;
            this.container = container;
            this.factory = function () { throw new Error("factory is not provided for type '".concat(_this.key, "'.")); };
            this.dependencies = new Array();
            this.addDependency = function (dep) {
                _this.dependencies.push(dep);
                return _this;
            };
            this.addDependencies = function () {
                var deps = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    deps[_i] = arguments[_i];
                }
                deps.forEach(function (dep) {
                    _this.addDependency(dep);
                });
                return _this;
            };
            this.getInstance = function () {
                if (_this.singleton) {
                    if (!_this.instance) {
                        _this.instance = _this.createInstance();
                    }
                    return _this.instance;
                }
                else {
                    return _this.createInstance();
                }
            };
            this.createInstance = function () {
                var deps = _this.dependencies.map(function (k) { return _this.container.getService(k); });
                return _this.factory.apply({}, deps);
            };
        }
        ServiceDescription.prototype.setFactory = function (factory) {
            this.factory = factory;
            return this;
        };
        ServiceDescription.prototype.withDependencies = function () {
            var _this = this;
            var deps = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                deps[_i] = arguments[_i];
            }
            this.dependencies = new Array();
            deps.forEach(function (dep) {
                _this.addDependency(dep);
            });
            return this;
        };
        return ServiceDescription;
    }());
    exports.ServiceDescription = ServiceDescription;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmljZURlc2NyaXB0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2RpL3NlcnZpY2VEZXNjcmlwdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0lBRUE7UUFLSSw0QkFBbUIsR0FBVyxFQUFVLFNBQWtCLEVBQVUsU0FBMkI7WUFBL0YsaUJBQ0M7WUFEa0IsUUFBRyxHQUFILEdBQUcsQ0FBUTtZQUFVLGNBQVMsR0FBVCxTQUFTLENBQVM7WUFBVSxjQUFTLEdBQVQsU0FBUyxDQUFrQjtZQUp2RixZQUFPLEdBQXNDLGNBQVEsTUFBTSxJQUFJLEtBQUssQ0FBQyw0Q0FBcUMsS0FBSSxDQUFDLEdBQUcsT0FBSSxDQUFDLENBQUEsQ0FBQyxDQUFDLENBQUM7WUFDMUgsaUJBQVksR0FBRyxJQUFJLEtBQUssRUFBVSxDQUFDO1lBV3BDLGtCQUFhLEdBQUcsVUFBQyxHQUFXO2dCQUMvQixLQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFFNUIsT0FBTyxLQUFJLENBQUM7WUFDaEIsQ0FBQyxDQUFBO1lBRU0sb0JBQWUsR0FBRztnQkFBQyxjQUFpQjtxQkFBakIsVUFBaUIsRUFBakIscUJBQWlCLEVBQWpCLElBQWlCO29CQUFqQix5QkFBaUI7O2dCQUN2QyxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQUEsR0FBRztvQkFDWixLQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUM1QixDQUFDLENBQUMsQ0FBQztnQkFFSCxPQUFPLEtBQUksQ0FBQztZQUNoQixDQUFDLENBQUE7WUFZTSxnQkFBVyxHQUFHO2dCQUNqQixJQUFJLEtBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztvQkFDakIsSUFBSSxDQUFDLEtBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQzt3QkFDakIsS0FBSSxDQUFDLFFBQVEsR0FBRyxLQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7b0JBQzFDLENBQUM7b0JBRUQsT0FBTyxLQUFJLENBQUMsUUFBUSxDQUFDO2dCQUN6QixDQUFDO3FCQUNJLENBQUM7b0JBQ0YsT0FBTyxLQUFJLENBQUMsY0FBYyxFQUFFLENBQUE7Z0JBQ2hDLENBQUM7WUFDTCxDQUFDLENBQUE7WUFFTyxtQkFBYyxHQUFHO2dCQUNyQixJQUFNLElBQUksR0FBRyxLQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxVQUFBLENBQUMsSUFBSSxPQUFBLEtBQUksQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxFQUE1QixDQUE0QixDQUFDLENBQUM7Z0JBRXRFLE9BQU8sS0FBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRSxFQUFNLElBQUksQ0FBQyxDQUFDO1lBQzVDLENBQUMsQ0FBQTtRQWhERCxDQUFDO1FBRU0sdUNBQVUsR0FBakIsVUFBa0IsT0FBMEM7WUFDeEQsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7WUFDdkIsT0FBTyxJQUFJLENBQUM7UUFDaEIsQ0FBQztRQWdCTSw2Q0FBZ0IsR0FBdkI7WUFBQSxpQkFRQztZQVJ1QixjQUFpQjtpQkFBakIsVUFBaUIsRUFBakIscUJBQWlCLEVBQWpCLElBQWlCO2dCQUFqQix5QkFBaUI7O1lBQ3JDLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxLQUFLLEVBQVUsQ0FBQztZQUV4QyxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQUEsR0FBRztnQkFDWixLQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQzVCLENBQUMsQ0FBQyxDQUFDO1lBRUgsT0FBTyxJQUFJLENBQUM7UUFDaEIsQ0FBQztRQW9CTCx5QkFBQztJQUFELENBQUMsQUF2REQsSUF1REM7SUF2RFksZ0RBQWtCIn0=