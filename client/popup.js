let mode = localStorage.getItem("mode") === "true";
const screens = {
  login: `
          <form id="login-form">
            <input type="email" name="email" placeholder="E-Posta" required autofocus />
            <input type="password" name="password" placeholder="Şifre" required />
            <button class="btn" type="submit">Giriş Yap</button>
          </form>
          <button class="btn" id="register-btn">Üye Ol</button>
        `,
  register: `
            <form id="register-form">
              <input type="text" name="fullname" placeholder="Ad Soyad" required autofocus />
              <input type="email" name="email" placeholder="E-Posta" required />
              <input type="password" name="password" placeholder="Şifre" required />
              <input type="password" name="passwordR" placeholder="Şifre Tekrar" required />
              <button class="btn" type="submit">Üye Ol</button>
            </form>
            <button class="btn" id="login-btn">Giriş Yap</button>
          `,
  ready: `
          <small>Hoşgeldin ${
            JSON.parse(localStorage.getItem("user"))?.fullname
          }@${JSON.parse(localStorage.getItem("user"))?.id}</small>
          <button class="btn" id="open-btn">${
            mode ? "Pinboard'ı Kapat" : "Pinboard'ı Aç"
          }</button>
          <button class="btn" id="logout-btn">Çıkış yap</button>
        `,
  pending: `
          <h4>Kontrol Ediliyor...</h4>
        `,
};

const domain = "http://localhost";
const endpoints = {
  login: `${domain}/login.php`,
  register: `${domain}/register.php`,
};

document.addEventListener("DOMContentLoaded", function () {
  const user = localStorage.getItem("user");
  render(!user ? screens.login : screens.ready);
});

function render(screen) {
  document.querySelector(".app").innerHTML = screen;

  const loginBtn = document.getElementById("login-btn");
  const registerBtn = document.getElementById("register-btn");
  const logoutBtn = document.getElementById("logout-btn");
  const openBtn = document.getElementById("open-btn");
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");
  const setttingBtn = document.getElementById("settting-btn");

  loginBtn?.addEventListener("click", function () {
    render(screens.login);
  });

  registerBtn?.addEventListener("click", function () {
    render(screens.register);
  });

  logoutBtn?.addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      var tabId = tabs[0].id;
      var data = {
        action: "closePinboard",
      };
      chrome.tabs.sendMessage(tabId, data);
    });
    localStorage.removeItem("mode");
    mode = false;
    localStorage.removeItem("user");
    render(screens.login);
  });

  openBtn?.addEventListener("click", () => {
    mode = !mode;
    localStorage.setItem("mode", mode);
    openBtn.textContent = mode ? "Pinboard'ı Kapat" : "Pinboard'ı Aç";

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      var tabId = tabs[0].id;
      var data = {
        action: "togglePinboard",
        additionalData: parseInt(JSON.parse(localStorage.getItem("user"))?.id),
      };
      chrome.tabs.sendMessage(tabId, data);
    });
  });

  loginForm?.addEventListener("submit", function (e) {
    e.preventDefault();

    render(screens.pending);

    var formData = new FormData(loginForm);

    fetch(endpoints.login, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams(formData),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          alert("Doğrulama başarılı!");
          localStorage.setItem("user", JSON.stringify(data.data));
          location.reload();
        } else {
          alert(data.error);
          render(screens.login);
        }
      })
      .catch((error) => {
        console.log("Bir hata oluştu:", error);
        render(screens.login);
      });
  });

  registerForm?.addEventListener("submit", function (e) {
    e.preventDefault();

    render(screens.pending);

    var formData = new FormData(registerForm);

    fetch(endpoints.register, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams(formData),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          alert("Doğrulama başarılı!");
          localStorage.setItem("user", JSON.stringify(data.data));
          location.reload();
        } else {
          alert(data.error);
          render(screens.register);
        }
      })
      .catch((error) => {
        console.log("Bir hata oluştu:", error);
        render(screens.register);
      });
  });

  setttingBtn?.addEventListener("click", function () {
    chrome.tabs.create({
      url: `chrome-extension://${chrome.runtime.id}/settings.html`,
    });
  });
}
