const showMessage = function (text) {
  var message = document.getElementById("message");
  message.innerHTML = text;
  message.style.display = "block";
  setTimeout(() => (message.style.display = "none"), 5000);
};

document.addEventListener("DOMContentLoaded", function () {
  var form = document.getElementById("inputForm");
  chrome.storage.sync.get(
    ["username", "password", "loginMin", "logoutMin"],
    function (result) {
      if (Object.keys(result).length) {
        document.querySelector("input[name='username']").value =
          result.username;
        document.querySelector("input[name='password']").value =
          result.password;
        document.querySelector("input[name='loginMin']").value =
          result.loginMin;
        document.querySelector("input[name='logoutMin']").value =
          result.logoutMin;
      }
    }
  );

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    formInputs = document.querySelectorAll("#inputForm input");
    for (var i in formInputs) {
      chrome.storage.sync.set({ [formInputs[i].name]: formInputs[i].value });
    }
    chrome.storage.sync.set({ lastUpdateDate: new Date().toString() });
    showMessage("Updated successfully");
  });
});
