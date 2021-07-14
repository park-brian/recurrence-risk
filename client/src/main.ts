import { enableProdMode } from "@angular/core";
import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";

import { AppModule } from "./app/app.module";
import { environment } from "./environments/environment";

if (environment.production) {
  enableProdMode();
}

async function bootstrapModule() {
  await platformBrowserDynamic().bootstrapModule(AppModule);
  Array.from(document.querySelectorAll("[ng-cloak]")).forEach((el) =>
    el.removeAttribute("ng-cloak"),
  );
}

bootstrapModule().catch((error) => console.error(error));
