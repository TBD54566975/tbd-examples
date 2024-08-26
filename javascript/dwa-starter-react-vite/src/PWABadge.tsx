import { useRegisterSW } from "virtual:pwa-register/react";
import { Button } from "./components/ui/button";

function PWABadge() {
  // check for updates every hour
  const period = 60 * 60 * 1000;

  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, r) {
      if (period <= 0) return;
      if (r?.active?.state === "activated") {
        registerPeriodicSync(period, swUrl, r);
      } else if (r?.installing) {
        r.installing.addEventListener("statechange", (e) => {
          const sw = e.target as ServiceWorker;
          if (sw.state === "activated") registerPeriodicSync(period, swUrl, r);
        });
      }
    },
  });

  function close() {
    console.info({ offlineReady });
    setOfflineReady(false);
    setNeedRefresh(false);
  }

  return (
    <div className="PWABadge" role="alert" aria-labelledby="toast-message">
      {needRefresh && (
        <div className="fixed right-0 bottom-0 m-4 p-3 border-solid border-2 rounded-lg bg-background z-50 shadow-md">
          <div>
            {/* TODO: introduce offline notification when offline work is ready
             {offlineReady ? (
              <span>App ready to work offline</span>
            ) : ( */}
            <span>
              New content available, click on reload button to update.
            </span>
            {/* )} */}
          </div>
          <div className="mt-4 space-x-2 text-right">
            {needRefresh && (
              <Button onClick={() => updateServiceWorker(true)} size="sm">
                Reload
              </Button>
            )}
            <Button variant="outline" onClick={() => close()} size="sm">
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PWABadge;

/**
 * This function will register a periodic sync check every hour, you can modify the interval as needed.
 */
function registerPeriodicSync(
  period: number,
  swUrl: string,
  r: ServiceWorkerRegistration
) {
  if (period <= 0) return;

  setInterval(async () => {
    if ("onLine" in navigator && !navigator.onLine) return;

    const resp = await fetch(swUrl, {
      cache: "no-store",
      headers: {
        cache: "no-store",
        "cache-control": "no-cache",
      },
    });

    if (resp?.status === 200) await r.update();
  }, period);
}
