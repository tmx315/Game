// merged-analytics.js
(function() {
    'use strict';

    // 来自001.js的配置和初始化逻辑（修改为动态加载方式）
    var laConfig = {
        id: "3KkEpLxmzacRhipz",
        ck: "3KkEpLxmzacRhipz",
        autoTrack: true,
        hashMode: true,
        screenRecord: true
    };

    function initLAnalytics() {
        if (!document.querySelector('script[src*="js-sdk-pro.min.js"]')) {
            var script = document.createElement('script');
            script.src = (document.location.protocol === 'https:' ? 'https://' : 'http://') + 'sdk.51.la/js-sdk-pro.min.js';
            script.id = 'LA_COLLECT';
            script.async = true;
            script.charset = 'UTF-8';
            
            script.onload = function() {
                window.LA = window.LA || function(){ (LA.ids = LA.ids || []).push(laConfig) };
                LA.ids && LA.ids.push(laConfig);
            };
            
            script.onerror = function() { console.error('LA SDK加载失败'); };
            document.head.appendChild(script);
        }
    }

    // 来自002.js的初始化逻辑
    function initPerfAnalytics() {
        if (!document.querySelector('script[src*="js-sdk-perf.min.js"]')) {
            const script = document.createElement('script');
            script.src = 'https://sdk.51.la/perf/js-sdk-perf.min.js';
            script.crossOrigin = 'anonymous';
            
            script.onload = function() {
                window.LingQue?.Monitor && new LingQue.Monitor().init({
                    id: "3KlOuZC0Fi3bgsEF",
                    sendSuspicious: true,
                    sendSpaPv: true
                });
            };
            
            script.onerror = () => console.error('Perf SDK加载失败');
            document.head.appendChild(script);
        } else {
            window.LingQue?.Monitor && new LingQue.Monitor().init({
                id: "3KlOuZC0Fi3bgsEF",
                sendSuspicious: true,
                sendSpaPv: true
            });
        }
    }

    // 执行初始化
    document.addEventListener('DOMContentLoaded', function() {
        initLAnalytics();
        initPerfAnalytics();
    });
})();