import { match } from "./utils.js";

export default class Router extends HTMLElement {
  connectedCallback() {
    // console.log("Router element is rendered");
  }

  get routes() {
    return Array.from(this.querySelectorAll("wc-route"))
      .filter((node) => node.parentNode === this)
      .map((r) => ({
        path: r.getAttribute("path"),
        title: r.getAttribute("title"),
        component: r.getAttribute("component"),
        resourceUrl: r.getAttribute("resourceUrl"),
      }));
  }

  get outlet() {
    return this.querySelector("wc-outlet");
  }

  navigate(url) {
    const matchedRoute = match(this.routes, url);
    if (matchedRoute !== null) {
      window.history.pushState(null, null, url);

      const {
        component,
        title,
        params = {},
        resourceUrl = null,
      } = matchedRoute;

      if (component) {
        const updateView = () => {
          while (this.outlet.firstChild) {
            this.outlet.removeChild(this.outlet.firstChild);
          }
          const view = document.createElement(component);
          document.title = title || document.title;
          for (let key in params) {
            if (key !== "*") view.setAttribute(key, params[key]);
          }
          this.outlet.appendChild(view);
          //this.updateLinks();
        };
        if (resourceUrl !== null) {
          import(resourceUrl).then(updateView);
        } else {
          updateView();
        }
      }
    }
  }

  connectedCallback() {
    this.updateLinks();
    this.navigate(window.location.pathname);
    window.addEventListener("popstate", this._handlePopstate);
  }

  _handlePopstate = () => {
    this.navigate(window.location.pathname);
  };

  disconnectedCallback() {
    window.removeEventListener("popstate", this._handlePopstate);
  }

  updateLinks() {
    this.querySelectorAll("a[route]").forEach((link) => {
      const target = link.getAttribute("route");
      link.setAttribute("href", target);
      link.addEventListener("click", (e) => {
        e.preventDefault();
        this.navigate(target);
      });
    });
  }
}
customElements.define("wc-router", Router);
