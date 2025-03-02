// utils.js
function initAnalytics() {
  // 检查是否已存在SDK
  if (!document.querySelector('script[src*="js-sdk-perf.min.js"]')) {
    const script = document.createElement('script');
    script.src = 'https://sdk.51.la/perf/js-sdk-perf.min.js';
    script.crossOrigin = 'anonymous';
    
    script.onload = initMonitor;
    script.onerror = () => console.error('SDK加载失败');
    
    document.head.appendChild(script);
  } else {
    initMonitor();
  }

  function initMonitor() {
    window.LingQue?.Monitor && new LingQue.Monitor().init({
      id: "3KlOuZC0Fi3bgsEF",
      sendSuspicious: true,
      sendSpaPv: true
    });
  }
}

// 在需要的地方调用
initAnalytics();