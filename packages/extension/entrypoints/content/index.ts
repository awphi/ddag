// simple content scripts that acts as a message forwarder between devtools and @ddag/core running on the page
export default defineContentScript({
  matches: ["*://*/*"],
  main() {
    window.addEventListener("message", ({ data }) => {
      if (data.ddag && data.from === "page") {
        browser.runtime.sendMessage(data);
      }
    });

    window.postMessage({ ddag: true, from: "ext", type: "canary" });
  },
});
