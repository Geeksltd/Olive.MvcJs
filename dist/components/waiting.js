define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Waiting {
        constructor(url) {
            this.url = url;
            // One overlay is shown for as long as any caller still holds a token. A caller that
            // passes its token back to hide() only clears the overlay when it is the last one out,
            // so a request that finishes early cannot take the spinner away from one still running.
            // Calling hide() with no token keeps the original clear-everything behaviour, which is
            // what the callers that hide without a matching show rely on.
            this.tokens = [];
            this.tokenSeed = 0;
        }
        show(blockScreen = false, validate = true) {
            if (validate) {
                for (let i = 0; i < document.forms.length; i++)
                    if (!$(document.forms[i]).valid())
                        return null;
            }
            const token = "wait-" + (++this.tokenSeed);
            this.tokens.push(token);
            const existing = $(".wait-screen");
            if (existing.length) {
                if (blockScreen && !existing.find(".cover").length) {
                    this.addCover(existing.first());
                }
                return token;
            }
            let screen = $("<div class='wait-screen' />").appendTo("body");
            if (blockScreen) {
                this.addCover(screen);
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
            return token;
        }
        hide(token) {
            if (token) {
                this.tokens = this.tokens.filter(t => t !== token);
                if (this.tokens.length)
                    return;
            }
            else {
                this.tokens = [];
            }
            $(".wait-screen").remove();
        }
        addCover(screen) {
            $("<div class='cover' />")
                .width(Math.max($(document).width(), $(window).width()))
                .height(Math.max($(document).height(), $(window).height()))
                .appendTo(screen);
        }
    }
    exports.default = Waiting;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2FpdGluZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21wb25lbnRzL3dhaXRpbmcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBRUEsTUFBcUIsT0FBTztRQVV4QixZQUFvQixHQUFRO1lBQVIsUUFBRyxHQUFILEdBQUcsQ0FBSztZQVI1QixvRkFBb0Y7WUFDcEYsdUZBQXVGO1lBQ3ZGLHdGQUF3RjtZQUN4Rix1RkFBdUY7WUFDdkYsOERBQThEO1lBQ3RELFdBQU0sR0FBYSxFQUFFLENBQUM7WUFDdEIsY0FBUyxHQUFHLENBQUMsQ0FBQztRQUVVLENBQUM7UUFFMUIsSUFBSSxDQUFDLGNBQXVCLEtBQUssRUFBRSxXQUFvQixJQUFJO1lBRTlELElBQUksUUFBUSxFQUFFLENBQUM7Z0JBQ1gsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRTtvQkFDMUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFO3dCQUFFLE9BQU8sSUFBSSxDQUFDO1lBQ3ZELENBQUM7WUFFRCxNQUFNLEtBQUssR0FBRyxPQUFPLEdBQUcsQ0FBQyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUMzQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUV4QixNQUFNLFFBQVEsR0FBRyxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUM7WUFDbkMsSUFBSSxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUM7Z0JBQ2xCLElBQUksV0FBVyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztvQkFDakQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztnQkFDcEMsQ0FBQztnQkFDRCxPQUFPLEtBQUssQ0FBQztZQUNqQixDQUFDO1lBRUQsSUFBSSxNQUFNLEdBQUcsQ0FBQyxDQUFDLDZCQUE2QixDQUFDLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQy9ELElBQUksV0FBVyxFQUFFLENBQUM7Z0JBQ2QsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUMxQixDQUFDO1lBRUQsSUFBSSxjQUFjLEdBQUcsRUFBRSxDQUFDO1lBQ3hCLElBQUksYUFBYSxHQUFHLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUNsQyxJQUFJLGFBQWEsQ0FBQyxNQUFNLEVBQUUsQ0FBQztnQkFDdkIsY0FBYyxHQUFHLGFBQWEsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUMxQyxDQUFDO2lCQUFNLENBQUM7Z0JBQ0osSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsa0JBQWtCLENBQUMsQ0FBQztnQkFDdEQsY0FBYyxHQUFHLFlBQVksR0FBRyxRQUFRLEdBQUcsS0FBSyxDQUFDO1lBQ3JELENBQUM7WUFFRCxDQUFDLENBQUMsb0RBQW9ELEdBQUcsY0FBYyxHQUFHLFFBQVEsQ0FBQztpQkFDOUUsUUFBUSxDQUFDLE1BQU0sQ0FBQztpQkFDaEIsSUFBSSxFQUFFLENBQUM7WUFFWixPQUFPLEtBQUssQ0FBQztRQUNqQixDQUFDO1FBRU0sSUFBSSxDQUFDLEtBQWM7WUFDdEIsSUFBSSxLQUFLLEVBQUUsQ0FBQztnQkFDUixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLEtBQUssQ0FBQyxDQUFDO2dCQUNuRCxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTTtvQkFBRSxPQUFPO1lBQ25DLENBQUM7aUJBQU0sQ0FBQztnQkFDSixJQUFJLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBQztZQUNyQixDQUFDO1lBRUQsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQy9CLENBQUM7UUFFTyxRQUFRLENBQUMsTUFBYztZQUMzQixDQUFDLENBQUMsdUJBQXVCLENBQUM7aUJBQ3JCLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztpQkFDdkQsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO2lCQUMxRCxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDMUIsQ0FBQztLQUNKO0lBcEVELDBCQW9FQyJ9