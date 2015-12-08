import './components/qapp.tag';
import 'yo/lib/core/reset.scss';
<app>
    <qapp title="hy-transparent" style="transform:scale(.9) translateY(0);transition: all .5s;"></qapp>
    <qapp title="hy-none" style="transform:scale(.93) translateY(15%);transition: all .5s;"></qapp>
    <qapp title="hy-normal" style="transform:scale(.96) translateY(40%);transition: all .5s;"></qapp>
    <qapp title="webVC" style="transform:scale(1) translateY(70%);transition: all .5s;"></qapp>
    <style scoped>
    :scope{
        width: 6rem;
        height: 8rem;
    }
    </style>
</app>
