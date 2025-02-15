import React, { useEffect } from "react";

export default function App(): React.ReactNode {
  useEffect(() => {
    const onMessage = (msg: any): void => {
      // TODO can we make this typesafe?
      console.log(msg);
    };

    browser.runtime.onMessage.addListener(onMessage);

    return () => {
      browser.runtime.onMessage.removeListener(onMessage);
    };
  }, []);

  return <div></div>;
}
