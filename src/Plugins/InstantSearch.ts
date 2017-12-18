export default class InstantSearch {
    input: any;

    constructor(targetInput: any) {
        this.input = targetInput;
    }

    public enable() {
        // TODO: Make it work with List render mode too.
        this.input.off("keyup.immediate-filter").on("keyup.immediate-filter", this.onChanged);

        this.input.on("keydown", e => {
            if (e.keyCode == 13) e.preventDefault();
        });
    }

    onChanged(event: any) {
        var keywords = this.input.val().toLowerCase().split(' ');
        var rows = this.input.closest('[data-module]').find(".grid > tbody > tr");

        rows.each((index, e) => {
            var row = $(e);
            var content = row.text().toLowerCase();
            var hasAllKeywords = keywords.filter((i) => content.indexOf(i) == -1).length == 0;
            if (hasAllKeywords) row.show(); else row.hide();
        });
    }
}