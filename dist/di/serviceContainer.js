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
                throw new Error("No service registered for '" + key + "'.");
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
                throw new Error("A service with the same key (" + key + ") is already added");
            var result = new serviceDescription_1.ServiceDescription(key, singleton, this);
            result.setFactory(factory);
            this.services.push(result);
            return result;
        };
        return ServiceContainer;
    }());
    exports.ServiceContainer = ServiceContainer;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmljZUNvbnRhaW5lci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9kaS9zZXJ2aWNlQ29udGFpbmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0lBRUE7UUFBQTtZQUNZLGFBQVEsR0FBOEIsSUFBSSxLQUFLLEVBQXNCLENBQUM7UUErQ2xGLENBQUM7UUE3Q1UsMENBQWUsR0FBdEIsVUFBdUIsR0FBVyxFQUFFLE9BQTBDLEVBQUUsVUFBeUM7WUFBekgsaUJBRUM7WUFERyxPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLFVBQVUsRUFBRSxjQUFNLE9BQUEsS0FBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLEVBQS9CLENBQStCLENBQUMsQ0FBQztRQUM1RSxDQUFDO1FBRU0sMENBQWUsR0FBdEIsVUFBdUIsR0FBVyxFQUFFLE9BQTBDLEVBQUUsVUFBeUM7WUFBekgsaUJBRUM7WUFERyxPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLFVBQVUsRUFBRSxjQUFNLE9BQUEsS0FBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLEVBQS9CLENBQStCLENBQUMsQ0FBQztRQUM1RSxDQUFDO1FBRU0sdUNBQVksR0FBbkIsVUFBb0IsR0FBVyxFQUFFLE9BQTBDO1lBQ3ZFLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ3hDLENBQUM7UUFBQSxDQUFDO1FBRUssdUNBQVksR0FBbkIsVUFBb0IsR0FBVyxFQUFFLE9BQTBDO1lBQ3ZFLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ3pDLENBQUM7UUFFTSxxQ0FBVSxHQUFqQixVQUFzQyxHQUFXO1lBQzdDLElBQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLFVBQUEsQ0FBQyxJQUFJLE9BQUEsQ0FBQyxDQUFDLEdBQUcsS0FBSyxHQUFHLEVBQWIsQ0FBYSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFNUQsSUFBSSxDQUFDLENBQUMsT0FBTztnQkFDVCxPQUFVLE9BQU8sQ0FBQyxXQUFXLEVBQUUsQ0FBQzs7Z0JBRWhDLE1BQU0sSUFBSSxLQUFLLENBQUMsZ0NBQThCLEdBQUcsT0FBSSxDQUFDLENBQUM7UUFDL0QsQ0FBQztRQUVPLDhCQUFHLEdBQVgsVUFBWSxHQUFXLEVBQUUsVUFBeUMsRUFBRSxNQUFnQztZQUNoRyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFVBQUEsQ0FBQyxJQUFJLE9BQUEsQ0FBQyxDQUFDLEdBQUcsS0FBSyxHQUFHLEVBQWIsQ0FBYSxDQUFDLEVBQUU7Z0JBQ3hDLFVBQVUsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsVUFBQSxDQUFDLElBQUksT0FBQSxDQUFDLENBQUMsR0FBRyxLQUFLLEdBQUcsRUFBYixDQUFhLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDL0QsT0FBTyxLQUFLLENBQUM7YUFDaEI7WUFFRCxVQUFVLENBQUMsS0FBSyxHQUFHLE1BQU0sRUFBRSxDQUFDO1lBQzVCLE9BQU8sSUFBSSxDQUFDO1FBQ2hCLENBQUM7UUFFTyw4QkFBRyxHQUFYLFVBQVksR0FBVyxFQUFFLFNBQWtCLEVBQUUsT0FBMEM7WUFDbkYsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxVQUFBLENBQUMsSUFBSSxPQUFBLENBQUMsQ0FBQyxHQUFHLEtBQUssR0FBRyxFQUFiLENBQWEsQ0FBQztnQkFDdEMsTUFBTSxJQUFJLEtBQUssQ0FBQyxrQ0FBZ0MsR0FBRyx1QkFBb0IsQ0FBQyxDQUFDO1lBRTdFLElBQUksTUFBTSxHQUFHLElBQUksdUNBQWtCLENBQUMsR0FBRyxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUMxRCxNQUFNLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQzNCLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBRTNCLE9BQU8sTUFBTSxDQUFDO1FBQ2xCLENBQUM7UUFDTCx1QkFBQztJQUFELENBQUMsQUFoREQsSUFnREM7SUFoRFksNENBQWdCIn0=