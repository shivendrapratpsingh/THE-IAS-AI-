// IAS Prep Companion - small client-side helpers (no frameworks, no AI calls)

document.addEventListener("DOMContentLoaded", function () {
  // Live word counter for the answer-writing textarea
  var textarea = document.getElementById("answer-text");
  var counter = document.getElementById("word-count");

  if (textarea && counter) {
    var update = function () {
      var text = textarea.value.trim();
      var words = text.length ? text.split(/\s+/).length : 0;
      var limit = parseInt(counter.dataset.limit || "0", 10);
      counter.textContent = words + (limit ? " / " + limit : "") + " words";
      if (limit && words > limit) {
        counter.style.color = "#d6453d";
      } else {
        counter.style.color = "";
      }
    };
    textarea.addEventListener("input", update);
    update();
  }

  // Auto-submit checklist toggles in the study plan
  document.querySelectorAll(".task-toggle-form").forEach(function (form) {
    var checkbox = form.querySelector("input[type=checkbox]");
    if (checkbox) {
      checkbox.addEventListener("change", function () {
        form.submit();
      });
    }
  });
});
