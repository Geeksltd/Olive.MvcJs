export default class PasswordStength {
    container: any;

    static enable(selector: JQuery) { selector.each((i, e) => new PasswordStength($(e))); }

    constructor(targetContainer: any) {
        this.container = targetContainer;
    }

    enable() {
        // for configuration options : https://github.com/ablanco/jquery.pwstrength.bootstrap/blob/master/OPTIONS.md

        if (this.container.find(".progress").length !== 0) return;

        let formGroup = this.container.closest(".form-group");

        let options = {
            common: {},
            rules: {}, 
            ui: {
                container: formGroup,
                showVerdictsInsideProgressBar: true,
                showStatus: true,
                showPopover: false,
                showErrors: false,
                viewports: {
                    progress: this.container
                },
                verdicts: [
                    "<span class='fa fa-exclamation-triangle'></span> Weak",
                    "<span class='fa fa-exclamation-triangle'></span> Normal",
                    "Medium",
                    "<span class='fa fa-thumbs-up'></span> Strong",
                    "<span class='fa fa-thumbs-up'></span> Very Strong"],
            }
        };

        let password = formGroup.find(":password");
        if (password.length == 0) {
            console.log('Error: no password field found for password strength.');
            console.log(this.container);
        }
        else password.pwstrength(options);
    }
}
