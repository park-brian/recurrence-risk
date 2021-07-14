import {
  ActivatedRouteSnapshot,
  DetachedRouteHandle,
  RouteReuseStrategy,
} from "@angular/router";

type RouteHandles = {
  [name: string]: DetachedRouteHandle | null;
};

export class CustomReuseStrategy implements RouteReuseStrategy {
  routeHandles: RouteHandles = {};

  shouldDetach(route: ActivatedRouteSnapshot): boolean {
    return true;
  }

  store(
    route: ActivatedRouteSnapshot,
    handle: DetachedRouteHandle | null,
  ): void {
    const path = route.routeConfig?.path;
    if (path) {
      this.routeHandles[path] = handle;
    }
  }

  shouldAttach(route: ActivatedRouteSnapshot): boolean {
    const path = route.routeConfig?.path;
    return Boolean(path && this.routeHandles[path]);
  }

  retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
    const path = route.routeConfig?.path;
    return path ? this.routeHandles[path] : null;
  }

  shouldReuseRoute(
    future: ActivatedRouteSnapshot,
    curr: ActivatedRouteSnapshot,
  ): boolean {
    return future.routeConfig === curr.routeConfig;
  }
}
