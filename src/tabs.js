function Tabs(selector, options = {}) {
  this.container = document.querySelector(selector);
  if (!this.container) {
    console.error(`Tabs: No container found for selector '${selector}'`);
    return;
  }

  this.tabs = Array.from(this.container.querySelectorAll("li a"));
  if (!this.tabs.length) {
    console.error(`Tabs: no tabs found inside the contaner`);
    return;
  }

  this.panels = this.tabs
    .map((tab) => {
      const panel = document.querySelector(tab.getAttribute("href"));
      if (!panel) {
        console.error(
          `Tabs: No panel found for selector '${tab.getAttribute("href")}'`,
        );
      }
      return panel;
    })
    .filter(Boolean);

  if (this.tabs.length !== this.panels.length) return;

  this.opt = Object.assign(
    {
      remember: false,
      onChange: null,
    },
    options,
  );

  this.paramKey = selector.replace(/[^a-zA-Z0-9]/g, "");
  this._originalHTML = this.container.innerHTML;

  this._init();
}

Tabs.prototype._getCleanHash = function (tab) {
  const href = tab.getAttribute("href") || "";
  return href.replace(/[^a-zA-Z0-9]/g, "");
};

Tabs.prototype._tryActivateTab = function (tab) {
  if (this.currentTab !== tab) {
    this._activateTab(tab);
    this.currentTab = tab;
  }
};

Tabs.prototype._init = function () {
  const params = new URLSearchParams(location.search);
  const tabSelector = params.get(this.paramKey);
  const tab =
    (this.opt.remember &&
      tabSelector &&
      this.tabs.find((tab) => this._getCleanHash(tab) === tabSelector)) ||
    this.tabs[0];

  this.currentTab = tab;
  this._activateTab(tab);

  this.tabs.forEach((tab) => {
    tab.onclick = (event) => this._handleTabClick(event, tab);
  });
};

Tabs.prototype._handleTabClick = function (event, tab) {
  event.preventDefault();
  this._tryActivateTab(tab, false);
};

Tabs.prototype._activateTab = function (tab, triggerOnChange = true) {
  this.tabs.forEach((tab) => {
    tab.closest("li").classList.remove("tabs--active");
  });
  tab.closest("li").classList.add("tabs--active");

  this.panels.forEach((panel) => (panel.hidden = true));
  const panelActive = document.querySelector(tab.getAttribute("href"));
  panelActive.hidden = false;

  if (this.opt.remember) {
    const params = new URLSearchParams(location.search);
    const paramValue = this._getCleanHash(tab);
    params.set(this.paramKey, paramValue);
    history.replaceState(null, null, `?${params}`);
  }

  if (triggerOnChange && typeof this.opt.onChange === "function") {
    this.opt.onChange({
      tab,
      panel: panelActive,
    });
  }
};

Tabs.prototype.switch = function (input) {
  let tabToActivate = null;

  if (typeof input === "string") {
    tabToActivate = this.tabs.find((tab) => tab.getAttribute("href") === input);

    if (!tabToActivate) {
      console.error(`Tabs: No panel found with ID '${input}'`);
      return;
    }
  } else if (this.tabs.includes(input)) {
    tabToActivate = input;
  }

  if (!tabToActivate) {
    console.error(`Tabs: Invalid input '${input}'`);
    return;
  }

  this._tryActivateTab(tabToActivate);
};

Tabs.prototype.destroy = function () {
  this.container.innerHTML = this._originalHTML;
  this.panels.forEach((panel) => (panel.hidden = false));
  this.container = null;
  this.tabs = null;
  this.panels = null;
  this.currentTab = null;
};
