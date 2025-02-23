let irefBootstrap = setInterval(() => {
    let head = document.getElementsByTagName('head')[0];
    
    if (head) {
        clearInterval(irefBootstrap);
        let link = document.createElement("link");
        link.type = "text/css";
        link.rel = "stylesheet";
        link.href = "http://127.0.0.1:8080/extension.css?" + new Date().getTime();
        head.appendChild(link);
    
        let script = document.createElement('script');
        script.src = "http://127.0.0.1:8080/main.js?" + new Date().getTime();
        script.type = 'module';
        head.appendChild(script);
    }
}, 100);