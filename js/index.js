// 并行加载
const loadScript = url => new Promise(resolve => {
  const script = document.createElement('script');
  script.src = url;
  script.onload = resolve;
  document.head.appendChild(script);
});

Promise.all([loadScript('001.js'), loadScript('002.js')]);