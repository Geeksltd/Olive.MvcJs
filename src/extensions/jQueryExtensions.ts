
const enableValidateForTimePicker = () => {
    $.validator.addMethod("time", function (value, element, params) {
        return this.optional(element) || /^([01]\d|2[0-3]|[0-9])(:[0-5]\d){1,2}$/.test(value);
    }, 'Please enter a valid time, between 00:00 and 23:59');
    $.validator.unobtrusive.adapters.addBool("time");
}
export { enableValidateForTimePicker }

export function screenOffset() {
    var documentOffset = this.first().offset();
    return {
        top: documentOffset.top - $(window).scrollTop(),
        left: documentOffset.left - $(window).scrollLeft()
    };
}

// [name] is the name of the event "click", "mouseover", .. 
// same as you'd pass it to bind()
// [fn] is the handler function
export function bindFirst(name, fn) {
    // bind as you normally would
    // don't want to miss out on any jQuery magic
    this.bind(name, fn);

    // Thanks to a comment by @Martin, adding support for
    // namespaced events too.
    var jq: any = $;

    var eventsData = jq._data(this.get(0), "events");
    if (eventsData) {

        var handlers = eventsData[name.split('.')[0]];
        // take out the handler we just inserted from the end
        var handler = handlers.pop();
        // move it at the beginning
        handlers.splice(0, 0, handler);
    }

    return this;
};

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
}
export { enableValidateForCheckboxList }

const raiseEvent = (event: string, owner: any, data?: any) => {
    let result = true;

    if (owner.event.hasOwnProperty(event)) {
        owner.event[event].forEach(handler => {
            let res = handler(data || {});
            if (res === false) result = false;
        });
    }
    return result;
}
export { raiseEvent };

export function getUniqueSelector() {
    if (this.length != 1) throw 'Requires one element.';
    var path, node = this;
    while (node.length) {
        let realNode = node[0];
        let name = realNode.localName;
        if (!name) break;

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