function Tabs(selector, options = {}) {
  this.container = document.querySelector(selector);

  //Kiểm tra tồn tại của container
  if (!this.container) {
    console.error(`Tabs: No container found for selector '${selector}'`);
    return;
  }

  //Chuyển đổi nodelist các link tab thành Array để sử dụng được các hàm như .map .find
  this.tabs = Array.from(this.container.querySelectorAll("li a"));
  if (!this.tabs.length) {
    console.error(`Tabs: no tabs found inside the contaner`);
    return;
  }

  //Tìm các panel tương ứng dựa trên giá trị href của mỗi tab
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
    .filter(Boolean); //Loại bỏ các giá trị null/undifined nếu không tìm thấy panel

  //Số lượng tab và panel không khớp thì dừng khởi tạo
  if (this.tabs.length !== this.panels.length) return;

  //Thiết lập các tham số mặc định và ghi đè bằng options từ người dùng
  this.opt = Object.assign(
    {
      activeClassName: "tabs--active",
      remember: false,
      onChange: null,
    },
    options,
  );

  //Tạo key duy nhất từ selector để lưu vào URL, loại bỏ ký tự đặc biệt
  this.paramKey = selector.replace(/[^a-zA-Z0-9]/g, "");
  //Lưu lại HTML gốc để khôi phục khi gọi hàm destroy
  this._originalHTML = this.container.innerHTML;

  this._init();
}

//Lấy giá trị ID của tab, loại bỏ ký tự '#' hoặc ký tự đặc biệt
Tabs.prototype._getCleanHash = function (tab) {
  const href = tab.getAttribute("href") || "";
  return href.replace(/[^a-zA-Z0-9]/g, "");
};

//Kiểm tra trước khi click tab, tránh click lại tab đang hiển thị
Tabs.prototype._tryActivateTab = function (tab) {
  if (this.currentTab !== tab) {
    this._activateTab(tab);
    this.currentTab = tab;
  }
};

//Khởi tạo trạng thái ban đầu, xác định tab mặc định và gán sự kiện click
Tabs.prototype._init = function () {
  const params = new URLSearchParams(location.search);
  const tabSelector = params.get(this.paramKey);

  //Ưu tiện tab từ URL khi 'remember' bật, nếu không thì lấy tab đầu tiên
  const tab =
    (this.opt.remember &&
      tabSelector &&
      this.tabs.find((tab) => this._getCleanHash(tab) === tabSelector)) ||
    this.tabs[0];

  this.currentTab = tab;
  this._activateTab(tab);

  //Gán sự kiện click cho tất cả các tab
  this.tabs.forEach((tab) => {
    tab.onclick = (event) => {
      event.preventDefault();
      this._tryActivateTab(tab, false);
    };
  });
};

//Xử lý chuyển đổi tab
Tabs.prototype._activateTab = function (tab, triggerOnChange = true) {
  this.tabs.forEach((tab) => {
    tab.closest("li").classList.remove(this.opt.activeClassName);
  });
  tab.closest("li").classList.add(this.opt.activeClassName);

  //Ẩn tất cả panel và hiển thị panel tương ứng với tab
  this.panels.forEach((panel) => (panel.hidden = true));
  const panelActive = document.querySelector(tab.getAttribute("href"));
  panelActive.hidden = false;

  //Update URL nếu 'remember' bật
  if (this.opt.remember) {
    const params = new URLSearchParams(location.search);
    const paramValue = this._getCleanHash(tab);
    params.set(this.paramKey, paramValue);
    history.replaceState(null, null, `?${params}`);
  }

  //Gọi hàm callback onChange nếu được định nghĩa trong options
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

//Khôi phục HTML ban đầu, hiển thị lại và giải phóng bộ nhớ
Tabs.prototype.destroy = function () {
  this.container.innerHTML = this._originalHTML;
  this.panels.forEach((panel) => (panel.hidden = false));
  this.container = null;
  this.tabs = null;
  this.panels = null;
  this.currentTab = null;
};
