import riot from 'riot';

riot.route.start(true);
riot.route((tag)=>{
    var currTag = document.querySelector('qapp[title='+tag+']');
    var appTag = Array.from(document.querySelectorAll('qapp')).filter((t)=>{return t!==currTag;});

    currTag.style.cssText += `transform: translateY(5%) scale(1)`;
    appTag.forEach(function(t) {
        t.style.opacity = 0;
    });
});
