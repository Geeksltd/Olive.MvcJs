///<reference path="../require.d.ts"/>
///<reference path="../require.config.ts"/>

import $ =require('jquery');
export namespace Olive{
    export class Helper{
         private static instance: Singleton;

         static getInstance() {
            if (!Singleton.instance) {
                Singleton.instance = new Singleton();
            }
            return Singleton.instance;
         }

         public isWindowModal() {
            if ($(this.getContainerIFrame()).closest(".modal").length === 0) return false;
            return true;
         }

         public getContainerIFrame() {
          if (parent == null || parent == self) return null;
          return $(parent.document).find("iframe").filter((i, f: any) => (f.contentDocument || f.contentWindow.document) == document).get(0);
         }
    }
}
