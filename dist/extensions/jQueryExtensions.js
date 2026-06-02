define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getUniqueSelector = exports.raiseEvent = exports.enableValidateForCheckboxList = exports.bindFirst = exports.screenOffset = exports.enableValidateForTimePicker = void 0;
    const enableValidateForTimePicker = () => {
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
        // Use .on() instead of deprecated .bind()
        this.on(name, fn);
        // Thanks to a comment by @Martin, adding support for
        // namespaced events too.
        var jq = $;
        // Use $._data() with jQuery 3.x compatible approach
        var element = this.get(0);
        if (element) {
            var eventsData = jq._data ? jq._data(element, "events") : $(element).data("events");
            if (eventsData) {
                var handlers = eventsData[name.split('.')[0]];
                if (handlers && handlers.length > 0) {
                    // take out the handler we just inserted from the end
                    var handler = handlers.pop();
                    // move it at the beginning
                    handlers.splice(0, 0, handler);
                }
            }
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
    const enableValidateForCheckboxList = () => {
        $.validator.unobtrusive.adapters.add("selection-required", (options) => {
            if (options.element.tagName.toUpperCase() == "INPUT" && options.element.type.toUpperCase() == "CHECKBOX") {
                var $element = $(options.element);
                options.rules["required"] = true;
                options.messages["required"] = $element.data('valRequired');
            }
        });
    };
    exports.enableValidateForCheckboxList = enableValidateForCheckboxList;
    const raiseEvent = (event, owner, data) => {
        let result = true;
        if (owner.event.hasOwnProperty(event)) {
            owner.event[event].forEach(handler => {
                let res = handler(data || {});
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
            let realNode = node[0];
            let name = realNode.localName;
            if (!name)
                break;
            name = name.toLowerCase();
            let parent = node.parent();
            let siblings = parent.children(name);
            if (siblings.length > 1) {
                name += ':eq(' + siblings.index(realNode) + ')';
            }
            path = name + (path ? '>' + path : '');
            node = parent;
        }
        return path;
    }
    exports.getUniqueSelector = getUniqueSelector;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoialF1ZXJ5RXh0ZW5zaW9ucy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9leHRlbnNpb25zL2pRdWVyeUV4dGVuc2lvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztJQUNBLE1BQU0sMkJBQTJCLEdBQUcsR0FBRyxFQUFFO1FBQ3JDLENBQUMsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxVQUFVLEtBQUssRUFBRSxPQUFPLEVBQUUsTUFBTTtZQUMxRCxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLElBQUksd0NBQXdDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzFGLENBQUMsRUFBRSxvREFBb0QsQ0FBQyxDQUFDO1FBQ3pELENBQUMsQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDckQsQ0FBQyxDQUFBO0lBQ1Esa0VBQTJCO0lBRXBDLFNBQWdCLFlBQVk7UUFDeEIsSUFBSSxjQUFjLEdBQUcsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQzNDLE9BQU87WUFDSCxHQUFHLEVBQUUsY0FBYyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsU0FBUyxFQUFFO1lBQy9DLElBQUksRUFBRSxjQUFjLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxVQUFVLEVBQUU7U0FDckQsQ0FBQztJQUNOLENBQUM7SUFORCxvQ0FNQztJQUVELDREQUE0RDtJQUM1RCxrQ0FBa0M7SUFDbEMsK0JBQStCO0lBQy9CLFNBQWdCLFNBQVMsQ0FBQyxJQUFJLEVBQUUsRUFBRTtRQUM5QiwwQ0FBMEM7UUFDMUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFFbEIscURBQXFEO1FBQ3JELHlCQUF5QjtRQUN6QixJQUFJ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