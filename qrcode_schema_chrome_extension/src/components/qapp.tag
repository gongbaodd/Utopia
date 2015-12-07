import './header/header.tag';
import 'riot';
<qapp onclick={chosen}>
    <yo-header></yo-header>
    <script>
        this.title = opts.title;
        this.chosen = function() {
            riot.route(this.title);
        };
    </script>
    <style>
    :scope{
        overflow: hidden;
        position: relative;
    }
    </style>
</qapp>
