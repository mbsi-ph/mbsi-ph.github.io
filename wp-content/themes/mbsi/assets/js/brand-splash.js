(() => {
  window.mbsiSyncBrandLogos?.();
  const root = document.documentElement;
  const splash = document.querySelector("[data-mbsi-brand-splash]");

  if (!splash || !root.classList.contains("mbsi-brand-splash-pending")) {
    splash?.remove();
    return;
  }

  const duration = 5000;
  const assetWaitLimit = 3000;
  let fallbackTimer = 0;
  let isFinished = false;
  let hasStarted = false;

  const waitForImage = (image) => {
    const loaded = new Promise((resolve) => {
      if (image.complete) {
        resolve();
        return;
      }

      image.addEventListener("load", resolve, { once: true });
      image.addEventListener("error", resolve, { once: true });
    });

    return loaded.then(() => {
      if (typeof image.decode !== "function" || !image.naturalWidth) {
        return undefined;
      }

      return image.decode().catch(() => undefined);
    });
  };

  const waitForAssets = () => {
    const logo = splash.querySelector(".mbsi-brand-splash__logo");

    const assets = [];

    if (logo) {
      assets.push(waitForImage(logo).then(() => { if (logo.naturalWidth > 0) splash.classList.add("mbsi-brand-splash--logo-ready"); }));
    }



    return Promise.race([
      Promise.allSettled(assets),
      new Promise((resolve) => window.setTimeout(resolve, assetWaitLimit)),
    ]);
  };

  const finish = () => {
    if (isFinished) return;
    isFinished = true;
    window.clearTimeout(fallbackTimer);
    window.clearTimeout(window.mbsiBrandSplashSafetyTimer);
    root.classList.remove(
      "mbsi-brand-splash-pending",
      "mbsi-brand-splash-running"
    );
    splash.remove();
    window.dispatchEvent(new CustomEvent("mbsi:splash-complete"));
  };

  const handleLifecycleAnimationEvent = (event) => {
    if (
      event.target === splash &&
      event.animationName === "mbsi-brand-splash-lifecycle"
    ) {
      finish();
    }
  };


  splash.addEventListener("animationend", handleLifecycleAnimationEvent);
  splash.addEventListener("animationcancel", handleLifecycleAnimationEvent);

  const syncBackground = () => {
    const hero = document.querySelector('.hero');
    if (!hero || isFinished) return Promise.resolve();
    const style = getComputedStyle(hero);
    const match = style.backgroundImage.match(/url\(["']?(.*?)["']?\)/);
    if (!match) return Promise.resolve();
    return new Promise(resolve => {
    const image = new Image();
    image.onerror = resolve;
    image.onload = () => {
      if (isFinished) { resolve(); return; }
      const rect = hero.getBoundingClientRect();
      const factor = Math.max(rect.width / image.naturalWidth, rect.height / image.naturalHeight);
      const width = image.naturalWidth * factor, height = image.naturalHeight * factor;
      const layers = (style.backgroundImage.match(/gradient\(/g) || []).length;
      const size = Array(layers).fill('100% 100%');
      const position = Array(layers).fill('0px 0px');
      size.push(width + 'px ' + height + 'px');
      position.push((rect.left + (rect.width - width) / 2) + 'px ' + (rect.top + (rect.height - height) / 2) + 'px');
      const contrasted = style.backgroundImage.replace(/rgba\(1, 18, 54, ([\d.]+)\)/g, (_, opacity) => 'rgba(1, 18, 54, ' + Math.min(1, Number(opacity) + 0.06).toFixed(2) + ')');
      splash.style.setProperty('background-image', contrasted, 'important');
      splash.style.setProperty('background-size', size.join(','), 'important');
      splash.style.setProperty('background-position', position.join(','), 'important');
      splash.style.setProperty('background-repeat', 'no-repeat', 'important');
      resolve();
    };
    image.src = match[1];
    });
  };
  window.addEventListener('resize', syncBackground);
  const startTimeline = async () => {
    if (hasStarted || isFinished) return;
    hasStarted = true;
    // The backdrop is decorative and must never block the intro timeline.
    syncBackground().catch(() => undefined);
    if (isFinished) return;
    root.classList.add("mbsi-brand-splash-running");
    window.clearTimeout(fallbackTimer);
    fallbackTimer = window.setTimeout(finish, duration + 240);
  };

  fallbackTimer = window.setTimeout(finish, assetWaitLimit + duration + 500);
  waitForAssets().then(() => {
    if (!splash.classList.contains("mbsi-brand-splash--logo-ready")) { finish(); return; }
    /* Allow the loaded hero and its CSS background to complete layout first. */
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(startTimeline);
    });
  });
})();
