export default class Select {

    public static enhance(selectControl: JQuery) {
        selectControl.chosen({ disable_search_threshold: 5 });
    }
}