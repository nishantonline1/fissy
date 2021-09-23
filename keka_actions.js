const holidays = {
  10: [2, 12, 13, 14, 15],
  11: [4],
  12: [25],
};

var loginMin = getRandomInt(1, 59);
var logoutMin = getRandomInt(1, 59);
var currentDate = null;

chrome.storage.sync.get(
  ["loginMin", "logoutMin", "lastUpdateDate"],
  function (result) {
    if (result.loginMin) {
      loginMin = result.loginMin;
    }
    if (result.logoutMin) {
      logoutMin = result.logoutMin;
    }
    if (result.lastUpdateDate) {
      result.lastUpdateDate = new Date(result.lastUpdateDate);
      currentDate = result.lastUpdateDate.getDate();
    }
  }
);

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const triggerAction = () => {
  const date_obj = new Date();

  const monthDate = date_obj.getDate();
  const day = date_obj.getDay();
  const month = date_obj.getMonth();
  const minute = date_obj.getMinutes();
  const hour = date_obj.getHours();

  if (!currentDate || currentDate != monthDate) {
    currentDate = monthDate;
    loginMin = getRandomInt(1, 59);
    logoutMin = getRandomInt(1, 59);
    chrome.storage.sync.set({ loginMin: loginMin });
    chrome.storage.sync.set({ logoutMin: logoutMin });
  }

  const checkBtnExist = document.querySelector(
    "home-attendance-clockin-widget"
  );
  if (
    checkBtnExist &&
    day != 0 &&
    (!holidays[month] || holidays[month].indexOf(monthDate) == -1)
  ) {
    const web_clockOutBtn = document.querySelector(
      "home-attendance-clockin-widget .btn-danger"
    );
    const web_clockInBtn = document.querySelector(
      "home-attendance-clockin-widget .btn-white"
    );
    clocked_in = web_clockOutBtn ? true : false;

    // exclude sunday & office holidays

    if (hour < 11 && hour >= 10 && !clocked_in && minute == loginMin) {
      console.log("Clocked In", hour + ":" + minute);
      web_clockInBtn.click();
    }
    if (hour >= 19 && hour < 21 && clocked_in && minute == logoutMin) {
      console.log("clocked Out", hour + ":" + minute);
      web_clockOutBtn.click();
      setTimeout(() => {
        const second_web_clockOutBtn = document.querySelector(
          "home-attendance-clockin-widget .btn-danger"
        );
        console.log("second_web_clockOutBtn", second_web_clockOutBtn);
        second_web_clockOutBtn.click();
      }, 5000);
    }
  }
};

const clock_in_action = () =>
  setInterval(() => {
    triggerAction();
  }, 1000 * 60);

window.onload = function (e) {
  if (location.host == "app.keka.com") {
    setTimeout(() => {
      const loginBtn = document.querySelector('button[type="submit"]');
      if (loginBtn) {
        chrome.storage.sync.get(["username", "password"], function (result) {
          const email = document.getElementById("email");
          const password = document.getElementById("password");
          email.value = result.username;
          password.value = result.password;
          loginBtn.click();
        });
      }
    }, 5000);
  }
  setTimeout(() => {
    triggerAction();
    clock_in_action();
  }, 10000);
};
