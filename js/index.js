// merged-analytics.js
(function() {
  'use strict';

  // LA 配置
  const laConfig = {
    id: "3KkEpLxmzacRhipz",
    ck: "3KkEpLxmzacRhipz",
    autoTrack: true,
    hashMode: true,
    screenRecord: true
  };

  // Perf 配置
  const perfConfig = {
    id: "3KlOuZC0Fi3bgsEF",
    sendSuspicious: true,
    sendSpaPv: true
  };

  function initLAnalytics() {
    if (!document.querySelector('#LA_COLLECT')) {
      const script = document.createElement('script');
      script.src = `http${location.protocol === 'https:' ? 's' : ''}://sdk.51.la/js-sdk-pro.min.js`;
      script.id = 'LA_COLLECT';
      script.async = true;
      script.charset = 'UTF-8';

      script.onload = () => {
        window.LA = window.LA || function(){ 
          (LA.ids = LA.ids || []).push(laConfig);
          LA.init?.(laConfig);
        };
        
        // 强制初始化
        if(typeof LA !== 'undefined') {
          LA.ids = LA.ids || [];
          LA.ids.push(laConfig);
          LA.init?.(laConfig);
        }
      };

      script.onerror = () => console.error('LA SDK加载失败');
      document.head.prepend(script); // 提前加载
    }
  }

  function initPerfAnalytics() {
    if (!document.querySelector('script[src*="js-sdk-perf.min.js"]')) {
      const script = document.createElement('script');
      script.src = 'https://sdk.51.la/perf/js-sdk-perf.min.js';
      script.crossOrigin = 'anonymous';

      script.onload = () => {
        window.LingQue?.Monitor?.init(perfConfig);
        window.LingQue?.Monitor?.enableSPATracking(); // 显式启用SPA跟踪
      };

      script.onerror = () => console.error('Perf SDK加载失败');
      document.head.appendChild(script);
    } else {
      window.LingQue?.Monitor?.init(perfConfig);
    }
  }

  // SPA路由跟踪
  function trackSPANavigation() {
    // 初始化首次PV
    window.LA?.trackPageView?.();
    window.LingQue?.Monitor?.trackPV?.();

    // 监听路由变化
    const trackPV = () => {
      setTimeout(() => {
        window.LA?.trackPageView?.();
        window.LingQue?.Monitor?.trackPV?.();
      }, 50);
    };

    // Hash路由
    window.addEventListener('hashchange', trackPV);

    // History API
    const _pushState = history.pushState;
    history.pushState = function(...args) {
      _pushState.apply(this, args);
      trackPV();
    };
  }

  // 立即初始化核心SDK
  initLAnalytics();
  initPerfAnalytics();

  // 延迟绑定路由监听
  if(document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', trackSPANavigation);
  } else {
    trackSPANavigation();
  }
})();