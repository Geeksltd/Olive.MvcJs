define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Waiting {
        constructor(url) {
            this.url = url;
        }
        show(blockScreen = false, validate = true) {
            if (validate) {
                for (let i = 0; i < document.forms.length; i++)
                    if (!$(document.forms[i]).valid())
                        return;
            }
            let screen = $("<div class='wait-screen' />").appendTo("body");
            if (blockScreen) {
                $("<div class='cover' />")
                    .width(Math.max($(document).width(), $(window).width()))
                    .height(Math.max($(document).height(), $(window).height()))
                    .appendTo(screen);
            }
            var loadingContent = '';
            var customLoading = $("#loading");
            if (customLoading.length) {
                loadingContent = customLoading.html();
            }
            else {
                var imageUrl = this.url.ofContent('/img/loading.gif');
                loadingContent = "<img src='" + imageUrl + "'/>";
            }
            $("<div class='wait-container'><div class='wait-box'>" + loadingContent + "</div>")
                .appendTo(screen)
                .show();
        }
        hide() {
            $(".wait-screen").remove();
        }
    }
    exports.default = Waiting;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2FpdGluZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21wb25lbnRzL3dhaXRpbmcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBRUEsTUFBcUIsT0FBTztRQUV4QixZQUFvQixHQUFRO1lBQVIsUUFBRyxHQUFILEdBQUcsQ0FBSztRQUFJLENBQUM7UUFFMUIsSUFBSSxDQUFDLGNBQXVCLEtBQUssRUFBRSxXQUFvQixJQUFJO1lBRTlELElBQUksUUFBUSxFQUFFLENBQUM7Z0JBQ1gsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRTtvQkFDMUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFO3dCQUFFLE9BQU87WUFDbEQsQ0FBQztZQUVELElBQUksTUFBTSxHQUFHLENBQUMsQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUMvRCxJQUFJLFdBQVcsRUFBRSxDQUFDO2dCQUNkLENBQUMsQ0FBQyx1QkFBdUIsQ0FBQztxQkFDckIsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO3FCQUN2RCxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7cUJBQzFELFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUMxQixDQUFDO1lBRUQsSUFBSSxjQUFjLEdBQUcsRUFBRSxDQUFDO1lBQ3hCLElBQUksYUFBYSxHQUFHLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUNsQyxJQUFJLGFBQWEsQ0FBQyxNQUFNLEVBQUUsQ0FBQztnQkFDdkIsY0FBYyxHQUFHLGFBQWEsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUMxQyxDQUFDO2lCQUFNLENBQUM7Z0JBQ0osSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsa0JBQWtCLENBQUMsQ0FBQztnQkFDdEQsY0FBYyxHQUFHLFlBQVksR0FBRyxRQUFRLEdBQUcsS0FBSyxDQUFDO1lBQ3JELENBQUM7WUFFRCxDQUFDLENBQUMsb0RBQW9ELEdBQUcsY0FBYyxHQUFHLFFBQVEsQ0FBQztpQkFDOUUsUUFBUSxDQUFDLE1BQU0sQ0FBQztpQkFDaEIsSUFBSSxFQUFFLENBQUM7UUFDaEIsQ0FBQztRQUVNLElBQUk7WUFDUCxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDL0IsQ0FBQztLQUNKO0lBcENELDBCQW9DQyJ9