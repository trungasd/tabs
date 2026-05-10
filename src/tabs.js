function Tabs(selector) {
  this.container = document.querySelector(selector);
  if (!this.container) {
    console.error(`Tabs: No container found for selector '${selector}'`);
    return;
  }

  console.log(this);

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

  this._init();
}

Tabs.prototype._init = function () {
  this._activeTab(this.tabs[0]);

  this.tabs.forEach((tab) => {
    tab.onclick = (event) => this._handleTabClick(event, tab);
  });
};

Tabs.prototype._handleTabClick = function (event, tab) {
  event.preventDefault();

  this._activeTab(tab);
};

Tabs.prototype._activeTab = function (tab) {
  this.tabs.forEach((tab) => {
    tab.closest("li").classList.remove("tabs--active");
  });

  tab.closest("li").classList.add("tabs--active");

  this.panels.forEach((panel) => (panel.hidden = true));

  const panelActive = document.querySelector(tab.getAttribute("href"));
  panelActive.hidden = false;
};

Tabs.prototype.switch = function (input) {
  let tabToActive = null;

  if (typeof input === "string") {
    tabToActive = this.tabs.find((tab) => tab.getAttribute("href") === input);

    if (!tabToActive) {
      console.error(`Tabs: No panel found with ID '${input}'`);
      return;
    }
  } else if (this.tabs.includes(input)) {
    tabToActive = input;
  }

  if (!tabToActive) {
    console.error(`Tabs: Invalid input '${input}'`);
    return;
  }

  this._activeTab(tabToActive);
};

Tabs.prototype.destroy = function () {
  this.container.innerHTML = this._originalHTML;
  this.panels.forEach((panel) => (panel.hidden = false));
  this.container = null;
  this.tabs = null;
  this.panels = null;
};
