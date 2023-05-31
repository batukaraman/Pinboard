let userId;

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === "togglePinboard") togglePinboard();
  userId = message.additionalData;
  if (message.action === "closePinboard") closePinboard();
});

let mode = false;

let markers;

const markerTypes = [
  {
    name: "Yorum",
    color: "#7B8FA1",
  },
  {
    name: "Not",
    color: "#FEC868",
  },
  {
    name: "Şikayet",
    color: "#F55050",
  },
];

const domain = "http://localhost";
const endpoints = {
  pin: `${domain}/pin.php`,
};

var mousePosition = { x: 0, y: 0 };

document.onmousemove = (e) => {
  mousePosition.x = e.pageX;
  mousePosition.y = e.pageY;
};

document.onkeyup = (e) => {
  if (document.querySelector(".pinboard-area") && e.key == "Escape") {
    removeArea();
    [...document.querySelectorAll(".pinboard_marker")].forEach((marker) => {
      marker.style.visibility = "visible";
    });
  }
};

function togglePinboard() {
  mode = !mode;

  if (mode) openPinboard();
  else closePinboard();
}

function openPinboard() {
  if (!localStorage.pinboardMarkers) {
    localStorage.pinboardMarkers = JSON.stringify([]);
  }
  markers = JSON.parse(localStorage.pinboardMarkers);
  createPinboard();
  createOverlay();
  loadMarkers();
}

function createPinboard() {
  const pinboard = document.createElement("div");
  pinboard.classList.add("pinboard");
  document.body.append(pinboard);
}

function createOverlay() {
  const overlay = document.createElement("div");
  overlay.classList.add("pinboard_overlay");
  overlay.style.setProperty("z-index", getMaxZIndex() + 1);
  overlay.addEventListener("mouseover", (e) => {
    removeTooltip();
    createCursorTooltip();
    document.querySelector(".pinboard_cursor-tooltip").textContent =
      "Yazmak İçin Tıkla";
  });
  overlay.addEventListener("click", (e) => {
    [...document.querySelectorAll(".pinboard_marker")].forEach((marker) => {
      marker.style.visibility = "visible";
    });
    removeArea();
    let position = {
      x: (e.pageX / window.innerWidth) * 100,
      y: e.pageY,
    };
    createArea(position.x, position.y);
  });

  document.querySelector(".pinboard").append(overlay);
}

function createCursorTooltip() {
  const cursorTooltip = document.createElement("span");
  cursorTooltip.classList.add("pinboard_cursor-tooltip");
  cursorTooltip.textContent = "Yazmak İçin Tıkla";
  cursorTooltip.style.setProperty("z-index", getMaxZIndex() + 2);
  document.querySelector(".pinboard").append(cursorTooltip);

  followCursorTooltip(mousePosition.x, mousePosition.y);
  document.onmousemove = (e) => {
    mousePosition.x = e.pageX;
    mousePosition.y = e.pageY;
    followCursorTooltip(e.pageX, e.pageY);
  };

  function followCursorTooltip(x, y) {
    if (x >= window.innerWidth - (cursorTooltip.offsetWidth + 50)) {
      cursorTooltip.style.setProperty(
        "left",
        x - (cursorTooltip.offsetWidth + 20) + "px"
      );
    } else {
      cursorTooltip.style.setProperty("left", x + 20 + "px");
    }

    cursorTooltip.style.setProperty("top", y + "px");
  }
}

function loadMarkers() {
  getAllPins()
    .then((response) => {
      markers = response.data;

      markers = markers.filter((marker) => {
        if (marker.url === window.location.href && marker.publish === 1) {
          return true;
        }
        if (marker.publish === 0 && marker.userId === userId) {
          return true;
        }
        return false;
      });

      markers &&
        markers.map((marker) => {
          console.log(marker);
          const button = document.createElement("button");
          button.classList.add("pinboard_marker");
          button.textContent = `${marker.id}`;
          button.style.setProperty("left", marker.positionX + "%");
          button.style.setProperty("top", marker.positionY - 26 + "px");
          button.style.setProperty("--pinboard-color", `${marker.typeColor}`);
          button.addEventListener("mouseover", (e) => {
            document.querySelector(".pinboard_cursor-tooltip").textContent =
              "Görmek İçin Tıkla";
            button.style.setProperty("z-index", getMaxZIndex() + 1);
          });
          button.addEventListener("click", (e) => {
            [...document.querySelectorAll(".pinboard_marker")].forEach(
              (marker) => {
                marker.style.visibility = "visible";
              }
            );
            e.target.style.visibility = "hidden";
            createArea(
              marker.positionX,
              marker.positionY,
              marker.typeColor,
              marker.publish == 1 ? true : false,
              marker.content,
              marker.id
            );
          });
          button.style.setProperty("z-index", getMaxZIndex() + 1);
          document.querySelector(".pinboard").append(button);
        });
    })
    .catch((error) => {
      console.error("İstek hatası:", error);
    });
}

function createArea(x, y, color, publish, content, id) {
  removeArea();
  const div = document.createElement("div");
  div.classList.add("pinboard-area");
  div.style.setProperty(
    "--pinboard-color",
    `${color ? color : markerTypes[0].color}`
  );
  div.style.setProperty("left", x + "%");
  div.style.setProperty("top", y + 8 + "px");
  div.style.setProperty("z-index", getMaxZIndex() + 2);
  div.addEventListener("mouseover", (e) => {
    removeTooltip();
    div.style.setProperty("z-index", getMaxZIndex() + 2);
  });

  document.querySelector(".pinboard").append(div);

  createForm();
  createColorList(color);
  createAreaSwitch(publish);
  createAreaCloseButton();
  createAreaText(content);

  if (id) {
    createAreaSaveButton(x, y, id);
    createAreaDeleteButton(id);
  } else {
    createAreaSaveButton(x, y);
  }
}

function createForm() {
  const form = document.createElement("form");
  form.classList.add("row", "g-2", "align-items-center");
  form.setAttribute("method", "post");
  form.setAttribute("action", "#");
  document.querySelector(".pinboard-area").append(form);
}

function createColorList(color) {
  const col = document.createElement("div");
  col.classList.add("col-6");

  const select = document.createElement("select");
  select.classList.add("form-select", "form-select-sm", "pinboard-color-list");

  markerTypes.forEach((type, index) => {
    const option = document.createElement("option");
    option.classList.add("pinboard-color");
    option.value = index;
    option.text = type.name;
    select.append(option);
  });
  [...select.querySelectorAll(".pinboard-color")].forEach((colorItem) => {
    markerTypes.forEach((type, index) => {
      if (colorItem.textContent == type.name && color == type.color) {
        colorItem.setAttribute("selected", true);
      }
    });
  });
  select.addEventListener("change", (e) => {
    let color = markerTypes[parseInt(select.value)].color;
    document
      .querySelector(".pinboard-area")
      .style.setProperty("--pinboard-color", color);
  });

  col.append(select);
  document.querySelector(".pinboard-area").querySelector("form").append(col);
}

function createAreaSwitch(publish) {
  const col = document.createElement("div");
  col.classList.add("col-4");

  const div = document.createElement("div");
  div.classList.add("form-check", "form-switch", "pinboard-area-switch");

  const input = document.createElement("input");
  input.classList.add("form-check-input");
  input.id = "switch";
  input.type = "checkbox";
  input.checked = publish;
  input.role = "switch";

  const label = document.createElement("label");
  label.classList.add("form-check-label", "text-light");
  label.textContent = "Yayınla";
  label.style.cssText = `-webkit-user-select: none;
                         -ms-user-select: none;
                         user-select: none;`;
  label.htmlFor = "switch";

  div.append(input);
  div.append(label);

  col.append(div);

  document.querySelector(".pinboard-area").querySelector("form").append(col);
}

function createAreaCloseButton() {
  const col = document.createElement("div");
  col.classList.add("col-2", "text-end");

  const button = document.createElement("button");
  button.classList.add("btn-close");
  button.type = "button";
  button.style.cssText = `background-image: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='white'><path d='M.293.293a1 1 0 0 1 1.414 0L8 6.586 14.293.293a1 1 0 1 1 1.414 1.414L9.414 8l6.293 6.293a1 1 0 0 1-1.414 1.414L8 9.414l-6.293 6.293a1 1 0 0 1-1.414-1.414L6.586 8 .293 1.707a1 1 0 0 1 0-1.414z'/></svg>");
  `;
  button.onclick = (e) => {
    e.preventDefault();
    removeArea();
    [...document.querySelectorAll(".pinboard_marker")].forEach((marker) => {
      marker.style.visibility = "visible";
    });
  };

  col.append(button);
  document.querySelector(".pinboard-area").querySelector("form").append(col);
}

function createAreaText(content) {
  const div = document.createElement("div");
  div.classList.add("col-12");

  const areaText = document.createElement("textarea");
  areaText.classList.add("form-control", "pinboard-area-text");
  areaText.value = content ? content : "";
  areaText.rows = "4";
  areaText.required = true;

  div.append(areaText);

  document.querySelector(".pinboard-area").querySelector("form").append(div);
}

function createAreaSaveButton(x, y, id) {
  const div = document.createElement("div");
  div.classList.add("text-end", "footer");

  const button = document.createElement("button");
  button.textContent = "Kaydet";
  button.type = "submit";
  button.classList.add("btn", "btn-light", "btn-sm");

  button.addEventListener("click", (e) => {
    if (document.querySelector(".pinboard-area-text").value) {
      const content = document.querySelector(".pinboard-area-text").value;
      const typeId =
        parseInt(document.querySelector(".pinboard-color-list").value) + 1;
      const publish = document
        .querySelector(".pinboard-area-switch")
        .querySelector("input").checked;
      const url = window.location.href;
      const positionX = x;
      const positionY = y;

      const marker = {
        publish,
        content,
        url,
        positionX,
        positionY,
        userId: 1,
        typeId,
      };

      if (id) {
        updatePin(id, marker);
      } else {
        addPin(marker);
      }

      localStorage.setItem("pinboardMarkers", JSON.stringify(markers));
      removeArea();
    }
  });

  div.append(button);
  document.querySelector(".pinboard-area").querySelector("form").append(div);
}

function createAreaDeleteButton(id) {
  const button = document.createElement("button");
  button.textContent = "Sil";
  button.type = "submit";
  button.classList.add("btn", "btn-dark", "btn-sm", "ms-2");
  button.addEventListener("click", (e) => {
    e.preventDefault();
    deletePin(id);
    removeArea();
  });
  document
    .querySelector(".pinboard-area")
    .querySelector("form")
    .querySelector(".footer")
    .append(button);
}

function closePinboard() {
  mode = false;
  document.querySelector(".pinboard").remove();
}

function removeArea() {
  const area = document.querySelector(".pinboard-area");
  area && area.remove();
}

function removeMarkers() {
  const markers = document.querySelectorAll(".pinboard_marker");
  markers &&
    [...markers].forEach((marker) => {
      marker.remove();
    });
}

function removeOverlay() {
  const area = document.querySelector(".pinboard_overlay");
  area && area.remove();
}

function removeTooltip() {
  const area = document.querySelector(".pinboard_cursor-tooltip");
  area && area.remove();
}

async function getAllPins() {
  try {
    const response = await fetch(endpoints.pin);
    if (response.ok) {
      return await response.json();
    } else {
      throw new Error("Hata: " + response.statusText);
    }
  } catch (error) {
    console.error("İstek hatası:", error);
    throw error;
  }
}

async function addPin(pinData) {
  try {
    const response = await fetch(endpoints.pin, {
      method: "POST",
      body: JSON.stringify(pinData),
    });

    if (response.ok) {
      const data = await response.json();
      console.log("Yeni pin eklendi. ID:", data.id);
      loadMarkers();
    } else {
      throw new Error("Hata: " + response.statusText);
    }
  } catch (error) {
    console.error("İstek hatası:", error);
    throw error;
  }
}

async function deletePin(pinId) {
  try {
    const response = await fetch(`http://localhost/pin.php?pinId=${pinId}`, {
      method: "DELETE",
    });

    if (response.ok) {
      console.log("Pin başarıyla silindi.");
      loadMarkers();
    } else {
      throw new Error("Hata: " + response.statusText);
    }
  } catch (error) {
    console.error("İstek hatası:", error);
    throw error;
  }
}

async function updatePin(pinId, pinData) {
  try {
    const response = await fetch(`${endpoints.pin}?pinId=${pinId}`, {
      method: "PUT",
      body: JSON.stringify(pinData),
    });

    if (response.ok) {
      console.log("Pin güncellendi. ID:", pinId);
      loadMarkers(); // Pin güncellendikten sonra markerları tekrar yükle
    } else {
      throw new Error("Hata: " + response.statusText);
    }
  } catch (error) {
    console.error("İstek hatası:", error);
    throw error;
  }
}

function getMaxZIndex() {
  return Math.max(
    ...Array.from(document.querySelectorAll("body *"), (el) =>
      parseFloat(window.getComputedStyle(el).zIndex)
    ).filter((zIndex) => !Number.isNaN(zIndex)),
    0
  );
}
