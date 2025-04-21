// middleware.js
export function middleware(request) {
  const response = new NextResponse();
  const script = `
    <script>
      var _hmt = _hmt || [];
      (function() {
        var hm = document.createElement("script");
        hm.src = "https://hm.baidu.com/hm.js?e53c8abfa5ead706b525a49b3f2e8acc";
        var s = document.getElementsByTagName("script")[0]; 
        s.parentNode.insertBefore(hm, s);
      })();
    </script>
  `;
  response.headers.set('Content-Type', 'text/html');
  response.body = request.body.pipeThrough(
    new TransformStream({
      transform(chunk, controller) {
        const modifiedChunk = chunk.replace(
          '</body>',
          `${script}</body>`
        );
        controller.enqueue(modifiedChunk);
      },
    })
  );
  return response;
}
