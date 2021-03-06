<material-textarea>
    <div class="label-placeholder"></div>
    <div class="{{textarea-content:true,not-empty:value,error:error}}">
        <label for="{{opts.name}}" name="label" if="{{opts.label}}">{{opts.label}}</label>
        <div class="mirror" name="mirror"></div>
        <div class="textarea-container">
            <textarea disabled="{{disabled}}" name="{{opts.name}}" value="{{value}}"></textarea>
        </div>
    </div>
    <div class="{{underline:true,focused:focused,error:error}}">
        <div class="unfocused-line"></div>
        <div class="focused-line"></div>
    </div>
    <script type="es6">
        // Defaults
        this["{{opts.name}}"].scrollTop = this["{{opts.name}}"].scrollHeight;
        // For Validation Mixin
        this.opts = opts;
        // From options
        this.disabled = opts.disabled || false;
        // Ready
        this.on('mount',()=>{
            // Set max height to mirror, if we have max-rows option.
            if(opts['max-rows']) this.mirror.style.maxHeight = opts['max-rows']*this["{{opts.name}}"].getBoundingClientRect().height + 'px';
        })
        /**
         * When element focus changed update expressions.
         */
        this.changeFocus = (e)=>{
           if(this.disabled) return false;
           let focused = this["{{opts.name}}"]==document.activeElement;
           this.update({focused:focused});
           this.trigger('focusChanged',focused);
        }
        /**
         * Change input value should change tag behavior.
         * @param e
         */
        this.inputHandler = (e)=>{
            let value = this["{{opts.name}}"].value;
            this.mirror.innerHTML = this.format(value);
            this.update({value:value});
            this.trigger('valueChanged',value);
        }
        // Add event listeners to input. It is wat which will help us
        // to provide focus\blur on material-input
        this["{{opts.name}}"].addEventListener('focus',this.changeFocus);
        this["{{opts.name}}"].addEventListener('blur',this.changeFocus);
        this["{{opts.name}}"].addEventListener('input',this.inputHandler);
        // Validation
        this.on('update',(updated)=>{
            if(updated && updated.value!=undefined) {
                if(this.validationType) {
                    this.isValid(this.validate(updated.value));
                }
            }
        });
        /**
         * Behevior after validation
         * @param isValid - (true/false)
         */
        this.isValid = (isValid)=>{
            this.update({error:!isValid});
        }
        /**
         * Format the value of textarea
         */
        this.format = (value)=>{
            return value.replace(/\n/g,'<br/>&nbsp;');
        }
        this.mixin('validate');
    </script>
</material-textarea>