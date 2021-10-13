console.log("Mounted");

const holidays = {
  10: [2, 12, 13, 14, 15],
  11: [4],
  12: [25],
};

var loginMin = getRandomInt(1, 59);
var logoutMin = getRandomInt(1, 59);
var currentDate = null;

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function EwebClockIn(status) {
  fetch("https://bizhero.keka.com/k/api/mytime/attendance/webclockin", {
    headers: {
      accept: "application/json, text/plain, */*",
      "accept-language": "en-GB,en-US;q=0.9,en;q=0.8,hi;q=0.7",
      authorization: "Bearer " + localStorage.getItem("access_token"),
      "content-type": "application/json; charset=UTF-8",
      "sec-ch-ua":
        '"Google Chrome";v="93", " Not;A Brand";v="99", "Chromium";v="93"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"macOS"',
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "x-requested-with": "XMLHttpRequest",
    },
    body: JSON.stringify({
      timestamp: new Date().toISOString(),
      attendanceLogSource: 1,
      locationAddress: {
        longitude: 88.3368406,
        latitude: 22.6019072,
        zip: "711106",
        countryCode: "IN",
        state: "West Bengal",
        city: "Howrah",
        addressLine1:
          "Pilkhana, 58, Sitanath Bose Lane, Pilkhana, Howrah 711106, West Bengal",
        addressLine2: "Howrah",
      },
      manualClockinType: 1,
      note: "",
      originalPunchStatus: status,
    }),
    method: "POST",
    mode: "cors",
    credentials: "include",
  }).then(() => location.reload());
}

const triggerAction = () => {
  const date_obj = new Date();

  const monthDate = date_obj.getDate();
  const day = date_obj.getDay();
  const month = date_obj.getMonth();
  const minute = date_obj.getMinutes();
  const hour = date_obj.getHours();

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

      if (!currentDate || currentDate != monthDate) {
        currentDate = monthDate;
        loginMin = getRandomInt(1, 59);
        logoutMin = getRandomInt(1, 59);
        chrome.storage.sync.set({ loginMin: loginMin });
        chrome.storage.sync.set({ logoutMin: logoutMin });
        chrome.storage.sync.set({ lastUpdateDate: new Date().toString() });
      }

      const checkBtnExist = document.querySelector(
        "home-attendance-clockin-widget"
      );
      if (
        checkBtnExist &&
        day != 0 &&
        (!holidays[month + 1] || holidays[month + 1].indexOf(monthDate) == -1)
      ) {
        const web_clockOutBtn = document.querySelector(
          "home-attendance-clockin-widget .btn-danger"
        );
        const web_clockInBtn = document.querySelector(
          "home-attendance-clockin-widget .btn-white"
        );
        const clocked_in = web_clockOutBtn ? true : false;

        // exclude sunday & office holidays

        if (hour < 11 && hour >= 10 && !clocked_in && minute >= loginMin) {
          console.log("Clocked In", hour + ":" + minute);
          EwebClockIn(0);
        }
        if (hour >= 19 && hour < 20 && clocked_in && minute >= logoutMin) {
          console.log("clocked Out", hour + ":" + minute);
          EwebClockIn(1);
        }
      }
    }
  );
};

const clock_in_action = () =>
  setInterval(() => {
    if (location.hash.indexOf("dashboard") != -1) {
      triggerAction();
    } else {
      location.href = "https://bizhero.keka.com/#/home/dashboard";
    }
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
  if (location.host == "bizhero.keka.com") {
    setTimeout(() => {
      triggerAction();
      clock_in_action();
    }, 10000);
  }
};
