let irefBootstrap = setInterval(() => {
    let head = document.getElementsByTagName('head')[0];
    
    if (head) {
        clearInterval(irefBootstrap);
        let link = document.createElement("link");
        link.type = "text/css";
        link.rel = "stylesheet";
        // Remote URL (commented out for local development)
        // link.href = "https://jason-murray.github.io/irefined/extension.css?" + new Date().getTime();
        // Local file loading
        link.href = "http://127.0.0.1:8080/extension.css?" + new Date().getTime();
        head.appendChild(link);
    
        let script = document.createElement('script');
        // Remote URL (commented out for local development)
        // script.src = "https://jason-murray.github.io/irefined/main.js?" + new Date().getTime();
        // Local file loading
        script.src = "http://127.0.0.1:8080/main.js?" + new Date().getTime();
        script.type = 'module';
        head.appendChild(script);
    }
}, 100);