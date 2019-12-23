define(["require", "exports"], function (require, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var ServiceDescription = /** @class */ (function () {
        function ServiceDescription(key, singleton, container) {
            var _this = this;
            this.key = key;
            this.singleton = singleton;
            this.container = container;
            this.factory = function () { throw new Error("factory is not provided for type '" + _this.key + "'."); };
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmljZURlc2NyaXB0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2RpL3NlcnZpY2VEZXNjcmlwdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztJQUVBO1FBS0ksNEJBQW1CLEdBQVcsRUFBVSxTQUFrQixFQUFVLFNBQTJCO1lBQS9GLGlCQUNDO1lBRGtCLFFBQUcsR0FBSCxHQUFHLENBQVE7WUFBVSxjQUFTLEdBQVQsU0FBUyxDQUFTO1lBQVUsY0FBUyxHQUFULFNBQVMsQ0FBa0I7WUFKdkYsWUFBTyxHQUFzQyxjQUFRLE1BQU0sSUFBSSxLQUFLLENBQUMsdUNBQXFDLEtBQUksQ0FBQyxHQUFHLE9BQUksQ0FBQyxDQUFBLENBQUMsQ0FBQyxDQUFDO1lBQzFILGlCQUFZLEdBQUcsSUFBSSxLQUFLLEVBQVUsQ0FBQztZQVdwQyxrQkFBYSxHQUFHLFVBQUMsR0FBVztnQkFDL0IsS0FBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBRTVCLE9BQU8sS0FBSSxDQUFDO1lBQ2hCLENBQUMsQ0FBQTtZQUVNLG9CQUFlLEdBQUc7Z0JBQUMsY0FBaUI7cUJBQWpCLFVBQWlCLEVBQWpCLHFCQUFpQixFQUFqQixJQUFpQjtvQkFBakIseUJBQWlCOztnQkFDdkMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFBLEdBQUc7b0JBQ1osS0FBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDNUIsQ0FBQyxDQUFDLENBQUM7Z0JBRUgsT0FBTyxLQUFJLENBQUM7WUFDaEIsQ0FBQyxDQUFBO1lBWU0sZ0JBQVcsR0FBRztnQkFDakIsSUFBSSxLQUFJLENBQUMsU0FBUyxFQUFFO29CQUNoQixJQUFJLENBQUMsS0FBSSxDQUFDLFFBQVEsRUFBRTt3QkFDaEIsS0FBSSxDQUFDLFFBQVEsR0FBRyxLQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7cUJBQ3pDO29CQUVELE9BQU8sS0FBSSxDQUFDLFFBQVEsQ0FBQztpQkFDeEI7cUJBQ0k7b0JBQ0QsT0FBTyxLQUFJLENBQUMsY0FBYyxFQUFFLENBQUE7aUJBQy9CO1lBQ0wsQ0FBQyxDQUFBO1lBRU8sbUJBQWMsR0FBRztnQkFDckIsSUFBTSxJQUFJLEdBQUcsS0FBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsVUFBQSxDQUFDLElBQUksT0FBQSxLQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBNUIsQ0FBNEIsQ0FBQyxDQUFDO2dCQUV0RSxPQUFPLEtBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUUsRUFBTSxJQUFJLENBQUMsQ0FBQztZQUM1QyxDQUFDLENBQUE7UUFoREQsQ0FBQztRQUVNLHVDQUFVLEdBQWpCLFVBQWtCLE9BQTBDO1lBQ3hELElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO1lBQ3ZCLE9BQU8sSUFBSSxDQUFDO1FBQ2hCLENBQUM7UUFnQk0sNkNBQWdCLEdBQXZCO1lBQUEsaUJBUUM7WUFSdUIsY0FBaUI7aUJBQWpCLFVBQWlCLEVBQWpCLHFCQUFpQixFQUFqQixJQUFpQjtnQkFBakIseUJBQWlCOztZQUNyQyxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksS0FBSyxFQUFVLENBQUM7WUFFeEMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFBLEdBQUc7Z0JBQ1osS0FBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUM1QixDQUFDLENBQUMsQ0FBQztZQUVILE9BQU8sSUFBSSxDQUFDO1FBQ2hCLENBQUM7UUFvQkwseUJBQUM7SUFBRCxDQUFDLEFBdkRELElBdURDO0lBdkRZLGdEQUFrQiJ9