import * as $ from '../../../lib/jquery/dist/jquery.js'
    export class WindowContext {

        static setting = {
            TIME_FORMAT: "HH:mm",
            MINUTE_INTERVALS : 5,
            DATE_LOCALE:"en-gb"
        };

        public static isWindowModal(): boolean {
            if ($(this.getContainerIFrame()).closest(".modal").length === 0) return false;
            return true;
        }

        public static getContainerIFrame() {
            if (parent == null || parent == self) return null;
            return $(parent.document).find("iframe").filter((i, f: any) => (f.contentDocument || f.contentWindow.document) == document).get(0);
        }

        public static adjustModalHeightForDataPicker(target: any) {
            var datepicker = $(target.currentTarget).siblings('.bootstrap-datetimepicker-widget');

            if (datepicker.length === 0) {
                this.adjustModalHeight();
                return;
            }

            var offset = Math.ceil(datepicker.offset().top + datepicker[0].offsetHeight) - document.body.offsetHeight + 6;
            var overflow = Math.max(offset, 0);
            this.adjustModalHeight(overflow);
        }

       public static adjustModalHeight(overflow?: number) {
            if (this.isWindowModal()) {
                var frame = $(this.getContainerIFrame());
                if (frame.attr("data-has-explicit-height") != 'true')
                    frame.height(document.body.offsetHeight + (overflow || 0));
            }
        }
    }

    

