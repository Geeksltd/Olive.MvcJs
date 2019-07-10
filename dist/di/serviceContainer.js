define(["require", "exports", "./serviceDescription"], function (require, exports, serviceDescription_1) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var ServiceContainer = /** @class */ (function () {
        function ServiceContainer() {
            this.services = new Array();
        }
        ServiceContainer.prototype.tryAddSingleton = function (key, factory, serviceOut) {
            var _this = this;
            return this.try(key, serviceOut, function () { return _this.addSingleton(key, factory); });
        };
        ServiceContainer.prototype.tryAddTransient = function (key, factory, serviceOut) {
            var _this = this;
            return this.try(key, serviceOut, function () { return _this.addTransient(key, factory); });
        };
        ServiceContainer.prototype.addSingleton = function (key, factory) {
            return this.add(key, true, factory);
        };
        ;
        ServiceContainer.prototype.addTransient = function (key, factory) {
            return this.add(key, false, factory);
        };
        ServiceContainer.prototype.getService = function (key) {
            var service = this.services.filter(function (x) { return x.key === key; })[0];
            if (!!service)
                return service.getInstance();
            else
                throw "No service registered for '" + key + "'.";
        };
        ServiceContainer.prototype.try = function (key, serviceOut, action) {
            if (this.services.some(function (s) { return s.key === key; })) {
                serviceOut.value = this.services.filter(function (x) { return x.key === key; })[0];
                return false;
            }
            serviceOut.value = action();
            return true;
        };
        ServiceContainer.prototype.add = function (key, singleton, factory) {
            if (this.services.some(function (s) { return s.key === key; }))
                throw "A service with the same key (" + key + ") is already added";
            var result = new serviceDescription_1.ServiceDescription(key, singleton, this);
            result.setFactory(factory);
            this.services.push(result);
            return result;
        };
        return ServiceContainer;
    }());
    exports.ServiceContainer = ServiceContainer;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmljZUNvbnRhaW5lci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9kaS9zZXJ2aWNlQ29udGFpbmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0lBRUE7UUFBQTtZQUNJLGFBQVEsR0FBOEIsSUFBSSxLQUFLLEVBQXNCLENBQUM7UUErQzFFLENBQUM7UUE3Q1UsMENBQWUsR0FBdEIsVUFBdUIsR0FBVyxFQUFFLE9BQTBDLEVBQUUsVUFBeUM7WUFBekgsaUJBRUM7WUFERyxPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLFVBQVUsRUFBRSxjQUFNLE9BQUEsS0FBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLEVBQS9CLENBQStCLENBQUMsQ0FBQztRQUM1RSxDQUFDO1FBRU0sMENBQWUsR0FBdEIsVUFBdUIsR0FBVyxFQUFFLE9BQTBDLEVBQUUsVUFBeUM7WUFBekgsaUJBRUM7WUFERyxPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLFVBQVUsRUFBRSxjQUFNLE9BQUEsS0FBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLEVBQS9CLENBQStCLENBQUMsQ0FBQztRQUM1RSxDQUFDO1FBRU0sdUNBQVksR0FBbkIsVUFBb0IsR0FBVyxFQUFFLE9BQTBDO1lBQ3ZFLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ3hDLENBQUM7UUFBQSxDQUFDO1FBRUssdUNBQVksR0FBbkIsVUFBb0IsR0FBVyxFQUFFLE9BQTBDO1lBQ3ZFLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ3pDLENBQUM7UUFFTSxxQ0FBVSxHQUFqQixVQUFzQyxHQUFXO1lBQzdDLElBQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLFVBQUEsQ0FBQyxJQUFJLE9BQUEsQ0FBQyxDQUFDLEdBQUcsS0FBSyxHQUFHLEVBQWIsQ0FBYSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFNUQsSUFBSSxDQUFDLENBQUMsT0FBTztnQkFDVCxPQUFVLE9BQU8sQ0FBQyxXQUFXLEVBQUUsQ0FBQzs7Z0JBRWhDLE1BQU0sZ0NBQThCLEdBQUcsT0FBSSxDQUFDO1FBQ3BELENBQUM7UUFFTyw4QkFBRyxHQUFYLFVBQVksR0FBVyxFQUFFLFVBQXlDLEVBQUUsTUFBZ0M7WUFDaEcsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxVQUFBLENBQUMsSUFBSSxPQUFBLENBQUMsQ0FBQyxHQUFHLEtBQUssR0FBRyxFQUFiLENBQWEsQ0FBQyxFQUFFO2dCQUN4QyxVQUFVLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLFVBQUEsQ0FBQyxJQUFJLE9BQUEsQ0FBQyxDQUFDLEdBQUcsS0FBSyxHQUFHLEVBQWIsQ0FBYSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQy9ELE9BQU8sS0FBSyxDQUFDO2FBQ2hCO1lBRUQsVUFBVSxDQUFDLEtBQUssR0FBRyxNQUFNLEVBQUUsQ0FBQztZQUM1QixPQUFPLElBQUksQ0FBQztRQUNoQixDQUFDO1FBRU8sOEJBQUcsR0FBWCxVQUFZLEdBQVcsRUFBRSxTQUFrQixFQUFFLE9BQTBDO1lBQ25GLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsVUFBQSxDQUFDLElBQUksT0FBQSxDQUFDLENBQUMsR0FBRyxLQUFLLEdBQUcsRUFBYixDQUFhLENBQUM7Z0JBQ3RDLE1BQU0sa0NBQWdDLEdBQUcsdUJBQW9CLENBQUM7WUFFbEUsSUFBSSxNQUFNLEdBQUcsSUFBSSx1Q0FBa0IsQ0FBQyxHQUFHLEVBQUUsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQzFELE1BQU0sQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDM0IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7WUFFM0IsT0FBTyxNQUFNLENBQUM7UUFDbEIsQ0FBQztRQUNMLHVCQUFDO0lBQUQsQ0FBQyxBQWhERCxJQWdEQztJQWhEWSw0Q0FBZ0IifQ==