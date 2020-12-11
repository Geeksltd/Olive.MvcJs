define(["require", "exports"], function (require, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getUniqueSelector = exports.raiseEvent = exports.enableValidateForCheckboxList = exports.bindFirst = exports.screenOffset = exports.enableValidateForTimePicker = void 0;
    var enableValidateForTimePicker = function () {
        $.validator.addMethod("time", function (value, element, params) {
            return this.optional(element) || /^([01]\d|2[0-3]|[0-9])(:[0-5]\d){1,2}$/.test(value);
        }, 'Please enter a valid time, between 00:00 and 23:59');
        $.validator.unobtrusive.adapters.addBool("time");
    };
    exports.enableValidateForTimePicker = enableValidateForTimePicker;
    function screenOffset() {
        var documentOffset = this.first().offset();
        return {
            top: documentOffset.top - $(window).scrollTop(),
            left: documentOffset.left - $(window).scrollLeft()
        };
    }
    exports.screenOffset = screenOffset;
    // [name] is the name of the event "click", "mouseover", .. 
    // same as you'd pass it to bind()
    // [fn] is the handler function
    function bindFirst(name, fn) {
        // bind as you normally would
        // don't want to miss out on any jQuery magic
        this.bind(name, fn);
        // Thanks to a comment by @Martin, adding support for
        // namespaced events too.
        var jq = $;
        var eventsData = jq._data(this.get(0), "events");
        if (eventsData) {
            var handlers = eventsData[name.split('.')[0]];
            // take out the handler we just inserted from the end
            var handler = handlers.pop();
            // move it at the beginning
            handlers.splice(0, 0, handler);
        }
        return this;
    }
    exports.bindFirst = bindFirst;
    ;
    //export function clone(original) {
    //    var result = original.apply(this, arguments),
    //        my_textareas = this.find('textarea').add(this.filter('textarea')),
    //        result_textareas = result.find('textarea').add(result.filter('textarea')),
    //        my_selects = this.find('select').add(this.filter('select')),
    //        result_selects = result.find('select').add(result.filter('select'));
    //    for (var i = 0, l = my_textareas.length; i < l; ++i) $(result_textareas[i]).val($(my_textareas[i]).val());
    //    for (var i = 0, l = my_selects.length; i < l; ++i) result_selects[i].selectedIndex = my_selects[i].selectedIndex;
    //    return result;
    //}
    var enableValidateForCheckboxList = function () {
        $.validator.unobtrusive.adapters.add("selection-required", function (options) {
            if (options.element.tagName.toUpperCase() == "INPUT" && options.element.type.toUpperCase() == "CHECKBOX") {
                var $element = $(options.element);
                options.rules["required"] = true;
                options.messages["required"] = $element.data('valRequired');
            }
        });
    };
    exports.enableValidateForCheckboxList = enableValidateForCheckboxList;
    var raiseEvent = function (event, owner, data) {
        var result = true;
        if (owner.event.hasOwnProperty(event)) {
            owner.event[event].forEach(function (handler) {
                var res = handler(data || {});
                if (res === false)
                    result = false;
            });
        }
        return result;
    };
    exports.raiseEvent = raiseEvent;
    function getUniqueSelector() {
        if (this.length != 1)
            throw 'Requires one element.';
        var path, node = this;
        while (node.length) {
            var realNode = node[0];
            var name_1 = realNode.localName;
            if (!name_1)
                break;
            name_1 = name_1.toLowerCase();
            var parent_1 = node.parent();
            var siblings = parent_1.children(name_1);
            if (siblings.length > 1) {
                name_1 += ':eq(' + siblings.index(realNode) + ')';
            }
            path = name_1 + (path ? '>' + path : '');
            node = parent_1;
        }
        return path;
    }
    exports.getUniqueSelector = getUniqueSelector;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoialF1ZXJ5RXh0ZW5zaW9ucy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9leHRlbnNpb25zL2pRdWVyeUV4dGVuc2lvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBQ0EsSUFBTSwyQkFBMkIsR0FBRztRQUNoQyxDQUFDLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsVUFBVSxLQUFLLEVBQUUsT0FBTyxFQUFFLE1BQU07WUFDMUQsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxJQUFJLHdDQUF3QyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUMxRixDQUFDLEVBQUUsb0RBQW9ELENBQUMsQ0FBQztRQUN6RCxDQUFDLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ3JELENBQUMsQ0FBQTtJQUNRLGtFQUEyQjtJQUVwQyxTQUFnQixZQUFZO1FBQ3hCLElBQUksY0FBYyxHQUFHLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUMzQyxPQUFPO1lBQ0gsR0FBRyxFQUFFLGNBQWMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLFNBQVMsRUFBRTtZQUMvQyxJQUFJLEVBQUUsY0FBYyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsVUFBVSxFQUFFO1NBQ3JELENBQUM7SUFDTixDQUFDO0lBTkQsb0NBTUM7SUFFRCw0REFBNEQ7SUFDNUQsa0NBQWtDO0lBQ2xDLCtCQUErQjtJQUMvQixTQUFnQixTQUFTLENBQUMsSUFBSSxFQUFFLEVBQUU7UUFDOUIsNkJBQTZCO1FBQzdCLDZDQUE2QztRQUM3QyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQztRQUVwQixxREFBcUQ7UUFDckQseUJBQXlCO1FBQ3pCLElB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