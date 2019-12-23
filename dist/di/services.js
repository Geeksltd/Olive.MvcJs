define(["require", "exports"], function (require, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var Services = {
        Alert: "alert",
        CrossDomainEvent: "crossDomainEvent",
        Form: "form",
        Grid: "grid",
        Grouping: "grouping",
        GroupingFactory: "groupingFactory",
        LiteEvent: "liteEvent",
        MasterDetail: "masterDetail",
        Modal: "modal",
        ModalHelper: "modalHelper",
        Paging: "paging",
        Sorting: "sorting",
        Url: "url",
        Validate: "validate",
        Waiting: "waiting",
        AjaxRedirect: "ajaxRedirect",
        WindowEx: "windowEx",
        ResponseProcessor: "responseProcessor",
        ServerInvoker: "serverInvoker",
        StandardAction: "standardAction",
        AutoComplete: "autoComplete",
        AutoCompleteFactory: "autoCompleteFactory",
        CkEditorFileManager: "ckEditorFileManager",
        CKEditorFileManagerFactory: "ckEditorFileManagerFactory",
        ConfirmBoxFactory: "confirmBoxFactory",
        ConfirmBox: "confirmBox",
        CustomCheckbox: "customCheckbox",
        CustomRadio: "customRadio",
        DateDropdown: "dateDropdown",
        DatePicker: "datePicker",
        DatePickerFactory: "datePickerFactory",
        DateTimePicker: "dateTimePicker",
        DateTimePickerFactory: "dateTimePickerFactory",
        DateTimePickerBase: "dateTimePickerBase",
        FileUpload: "fileUpload",
        FileUploadFactory: "fileUploadFactory",
        GlobalSearch: "globalSearch",
        HtmlEditor: "htmlEditor",
        HtmlEditorFactory: "htmlEditorFactory",
        InstantSearch: "instantSearch",
        MultiSelect: "multiSelect",
        NumericUpDown: "numericUpDown",
        PasswordStength: "passwordStength",
        SanityAdapter: "sanityAdapter",
        Select: "select",
        Slider: "slider",
        SliderFactory: "sliderFactory",
        SubMenu: "subMenu",
        TimeControl: "timeControl",
        TimeControlFactory: "timeControlFactory",
        UserHelp: "userHelp",
        ServiceLocator: "serviceLocator",
    };
    exports.default = Services;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmljZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZGkvc2VydmljZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7SUFBQSxJQUFNLFFBQVEsR0FBRztRQUNiLEtBQUssRUFBRSxPQUFPO1FBQ2QsZ0JBQWdCLEVBQUUsa0JBQWtCO1FBQ3BDLElBQUksRUFBRSxNQUFNO1FBQ1osSUFBSSxFQUFFLE1BQU07UUFDWixRQUFRLEVBQUUsVUFBVTtRQUNwQixlQUFlLEVBQUUsaUJBQWlCO1FBQ2xDLFNBQVMsRUFBRSxXQUFXO1FBQ3RCLFlBQVksRUFBRSxjQUFjO1FBQzVCLEtBQUssRUFBRSxPQUFPO1FBQ2QsV0FBVyxFQUFFLGFBQWE7UUFDMUIsTUFBTSxFQUFFLFFBQVE7UUFDaEIsT0FBTyxFQUFFLFNBQVM7UUFDbEIsR0FBRyxFQUFFLEtBQUs7UUFDVixRQUFRLEVBQUUsVUFBVTtRQUNwQixPQUFPLEVBQUUsU0FBUztRQUNsQixZQUFZLEVBQUUsY0FBYztRQUM1QixRQUFRLEVBQUUsVUFBVTtRQUNwQixpQkFBaUIsRUFBRSxtQkFBbUI7UUFDdEMsYUFBYSxFQUFFLGVBQWU7UUFDOUIsY0FBYyxFQUFFLGdCQUFnQjtRQUNoQyxZQUFZLEVBQUUsY0FBYztRQUM1QixtQkFBbUIsRUFBRSxxQkFBcUI7UUFDMUMsbUJBQW1CLEVBQUUscUJBQXFCO1FBQzFDLDBCQUEwQixFQUFFLDRCQUE0QjtRQUN4RCxpQkFBaUIsRUFBRSxtQkFBbUI7UUFDdEMsVUFBVSxFQUFFLFlBQVk7UUFDeEIsY0FBYyxFQUFFLGdCQUFnQjtRQUNoQyxXQUFXLEVBQUUsYUFBYTtRQUMxQixZQUFZLEVBQUUsY0FBYztRQUM1QixVQUFVLEVBQUUsWUFBWTtRQUN4QixpQkFBaUIsRUFBRSxtQkFBbUI7UUFDdEMsY0FBYyxFQUFFLGdCQUFnQjtRQUNoQyxxQkFBcUIsRUFBRSx1QkFBdUI7UUFDOUMsa0JBQWtCLEVBQUUsb0JBQW9CO1FBQ3hDLFVBQVUsRUFBRSxZQUFZO1FBQ3hCLGlCQUFpQixFQUFFLG1CQUFtQjtRQUN0QyxZQUFZLEVBQUUsY0FBYztRQUM1QixVQUFVLEVBQUUsWUFBWTtRQUN4QixpQkFBaUIsRUFBRSxtQkFBbUI7UUFDdEMsYUFBYSxFQUFFLGVBQWU7UUFDOUIsV0FBVyxFQUFFLGFBQWE7UUFDMUIsYUFBYSxFQUFFLGVBQWU7UUFDOUIsZUFBZSxFQUFFLGlCQUFpQjtRQUNsQyxhQUFhLEVBQUUsZUFBZTtRQUM5QixNQUFNLEVBQUUsUUFBUTtRQUNoQixNQUFNLEVBQUUsUUFBUTtRQUNoQixhQUFhLEVBQUUsZUFBZTtRQUM5QixPQUFPLEVBQUUsU0FBUztRQUNsQixXQUFXLEVBQUUsYUFBYTtRQUMxQixrQkFBa0IsRUFBRSxvQkFBb0I7UUFDeEMsUUFBUSxFQUFFLFVBQVU7UUFDcEIsY0FBYyxFQUFFLGdCQUFnQjtLQUNuQyxDQUFDO0lBRUYsa0JBQWUsUUFBUSxDQUFDIn0=