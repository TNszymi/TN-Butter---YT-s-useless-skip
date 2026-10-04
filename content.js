(function () {
  const _SIG = "tnszymi";

  function verifyChecksum(s) {
    let h = 0;
    for (let i = 0; i < s.length; i++) {
      h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
    }
    return h;
  }

  const isIntegrityValid = verifyChecksum(_SIG) === 1386444855;
  const MAX_SPEED = isIntegrityValid ? 16.0 : 1.0;

  // --- OBSŁUGA REKLAM: MAKSYMALIZACJA SZANS DLA TWÓRCY ---
  function handleAds() {
    if (!isIntegrityValid) return;

    const player = document.querySelector(".html5-video-player");
    const video = document.querySelector("video");

    if (!player || !video) return;

    const isAdActive =
      player.classList.contains("ad-showing") ||
      player.classList.contains("ad-interrupting");

    if (isAdActive) {
      // 1. Natychmiastowe wyciszenie dla komfortu uszu użytkownika
      video.muted = true;

      // 2. Maksymalne legalne tempo odtwarzacza
      video.playbackRate = MAX_SPEED;

      // 3. Kliknięcie oficjalnego przycisku Pomiń, gdy YouTube na to pozwoli
      const skipButtons = document.querySelectorAll(
        ".ytp-ad-skip-button, .ytp-ad-skip-button-modern, .ytp-skip-ad-button"
      );
      skipButtons.forEach((btn) => btn.click());
    }
  }

  setInterval(handleAds, 50);

  // --- STATYSTYKI I OCENY FILMU ---
  let lastVideoId = "";

  function getVideoId() {
    return new URLSearchParams(window.location.search).get("v");
  }

  async function fetchStats(videoId) {
    try {
      const res = await fetch(
        `https://returnyoutubedislikeapi.com/votes?videoId=${videoId}`
      );
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  function renderStatsBadge(data) {
    if (!isIntegrityValid) return;

    const existing = document.getElementById("tn-butter-stats");
    if (existing) existing.remove();

    const targetContainer = document.querySelector("#above-the-fold, #meta");
    if (!targetContainer || !data) return;

    const likes = (data.likes || 0).toLocaleString();
    const dislikes = (data.dislikes || 0).toLocaleString();
    const views = (data.viewCount || 0).toLocaleString();

    const totalVotes = (data.likes || 0) + (data.dislikes || 0);
    const ratingPct =
      totalVotes > 0
        ? Math.round(((data.likes || 0) / totalVotes) * 100)
        : 100;

    const box = document.createElement("div");
    box.id = "tn-butter-stats";
    box.style.cssText = `
      display: flex;
      gap: 14px;
      align-items: center;
      background: #181818;
      color: #eaeaea;
      padding: 7px 12px;
      border-radius: 6px;
      font-size: 12px;
      font-family: Roboto, Arial, sans-serif;
      margin: 8px 0;
      width: fit-content;
      border: 1px solid #333;
    `;

    box.innerHTML = `
      <span>👁️ <strong>${views}</strong></span>
      <span>👍 <strong>${likes}</strong></span>
      <span style="color: #ff6565;">👎 <strong>${dislikes}</strong></span>
      <span style="color: #51cf66;">📊 <strong>${ratingPct}%</strong></span>
      <span style="border-left: 1px solid #383838; padding-left: 8px; color: #777; font-size: 11px;">
        TN Butter • dev: <strong>${_SIG}</strong>
      </span>
    `;

    targetContainer.prepend(box);
  }

  async function checkVideoChange() {
    const currentVideoId = getVideoId();
    if (currentVideoId && currentVideoId !== lastVideoId) {
      lastVideoId = currentVideoId;
      const data = await fetchStats(currentVideoId);
      if (data) renderStatsBadge(data);
    }
  }

  setInterval(checkVideoChange, 1000);
})();