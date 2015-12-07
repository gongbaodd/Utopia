import 'yo/lib/fragment/yo-header.scss';

<yo-header class="yo-header {title}">
    <h2 class="title">{title}</h2>
    <span class="regret yo-ico">{left}</span>
    <span class="affirm yo-ico"></span>
    <script>
        var title = this.parent.title;
        var left = '\uf07d';
        if (title == 'webVC') {
            left = '\uf077';
        }
        this.title = title;
        this.left = left;
    </script>
    <style scoped>
        :scope {
            display: block;
            border-top-left-radius: 3px;
            border-top-right-radius: 3px;
        }

        :scope .title{
            font-weight: normal;
        }
        :scope.hy-transparent{
            border-color: transparent;
            background-color: transparent;
            color: #212121;
        }
        :scope.hy-transparent > .regret::before {
            content: '';
            width: .25rem;
            height: .25rem;
            position: absolute;
            border: 1px solid #7cd;
            background-color: rgba(27,169,186,.4);
            border-radius: 50%;
            top: .09rem;
            left: .13rem;
        }
        :scope.hy-none{
            border-color: transparent;
            background-color: transparent;
            color: #212121;
        }
        :scope.hy-none > .regret {
            display: none;
        }
        :scope.hy-none > .affirm {
            display: none;
        }
    </style>
</yo-header>
