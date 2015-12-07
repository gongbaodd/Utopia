import riot from 'riot';

riot.route.start(true);

riot.route((tag)=>{
    var app = window.__APP__;

    var currTag = app.tags['qapp'].filter((t)=>t.title===tag);
    var appTag = app.tags['qapp'].filter((t)=>t.title!==tag);

    currTag.forEach((t)=>t.trigger('show'));
    appTag.forEach((t)=>t.trigger('hide'));
});
