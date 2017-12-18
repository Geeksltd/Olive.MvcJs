export default class PasswordStength {
    public static enable(container: any) {
        // for configuration options : https://github.com/ablanco/jquery.pwstrength.bootstrap/blob/master/OPTIONS.md

        if (container.find(".progress").length !== 0) return;

        var formGroup = container.closest(".form-group");

        var options = {
            common: {},
            rules: {},
            ui: {
                container: formGroup,
                showVerdictsInsideProgressBar: true,
                showStatus: true,
                showPopover: false,
                showErrors: false,
                viewports: {
                    progress: container
                },
                verdicts: [
                    "<span class='fa fa-exclamation-triangle'></span> Weak",
                    "<span class='fa fa-exclamation-triangle'></span> Normal",
                    "Medium",
                    "<span class='fa fa-thumbs-up'></span> Strong",
                    "<span class='fa fa-thumbs-up'></span> Very Strong"],
            }
        };

        var password = formGroup.find(":password");
        if (password.length == 0) {
            console.log('Error: no password field found for password strength.');
            console.log(container);
        }
        else password.pwstrength(options);
    }
}