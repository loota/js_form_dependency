/**
 * License: MIT-style license
 */

var DependencyManager = new Class({

    /**
     * @param array|string|mootools element masters  the element or elements of which slave or slaves depend on
     * @param array|string|mootools element slaves  the element or elements which depend on the master or masters
     * @param string|object  effect  the effect which happens to the slave element
     *  or elements. One of hide, disable, enable, wipe. If given an object, there
     *  must be two members: 'affect' and 'unaffect'.
     *  'affect' must contain a function which is run when the
     *  master has the preferred value and should contain functionality for
     *  defining what happens to the slaves. 
     *  The 'unaffect' is run when the master gains other than the preferred value
     *  and defines what happens to slaves in that case.
     * @param string|function  triggerValue  the value that the master or masters must to have in
     *  order to affect the slave or slaves. If given a function, the function
     *  receives an object representing the master and the function's
     *  return value decides if the slave or slaves will be affected.
     */
    initialize: function(masters, slaves, effect, trigger) {
        this._initMasters(masters);
        this._initSlaves(slaves);
        this.setEffect(effect);
        this.triggerValue = trigger;
        this._addEvents();
    },
    /**
     * @param string|DOM element masters
     */
    _initMasters: function(masters) {
        if (typeOf(masters) === 'string') {
            masters = $(masters);
        }
        if (typeOf(masters) !== 'array' && typeOf(masters) !== 'elements') {
            var masters = [masters];
        }

        var wrappedMasters = [];
        var that = this;
        masters.each(function (currentMaster) {
            var wrappedMaster = that._getWrappedElement(currentMaster);
            wrappedMasters.push(wrappedMaster);
        });
        this.setMasters(wrappedMasters);
    },

    /**
     * @param string|DOM element slaves
     */
    _initSlaves: function(slaves) {
        if (typeOf(slaves) === 'string') {
            slaves = $(slaves);
        }
        if (typeOf(slaves) !== 'array' && typeOf(slaves) !== 'elements') {
            slaves = [slaves];
        }
        this.setSlaves(slaves);
    },

    /**
     * @param array masters array of HtmlWrapper
     */
    setMasters: function(masters) {
        this._masters = masters;
    },
    getMasters: function() {
        return this._masters;
    },
    /**
     * @param string|DOM element slaves
     */
    setSlaves: function(slaves) {
        this._slaves = slaves;
    },
    getSlaves: function() {
        return this._slaves;
    },
    setEffect: function(effect) {
        this._effect = effect;
    },
    getEffect: function() {
        return this._effect;
    },

    /**
     * @param DOM element element
     */
    _getWrappedElement: function(element) {
        if (element.type === 'text') {
            var wrappedElement = new TextInput();
        }
        if (element.type === 'checkbox') {
            var wrappedElement = new CheckboxInput();
        }
        if (element.type === 'select-one') {
            var wrappedElement = new SelectInput();
        }
        if (element.type === 'radio') {
            var wrappedElement = new SelectInput();
        }
        if (wrappedElement) {
            wrappedElement.setField(element);
        }
        return wrappedElement;
    },

    /**
     * @param array slaves of DOM elements
     */
    _getEnhancedSlaves: function(slaves) {
        var wrappedSlaves = [];
        var that = this;
        slaves.each(function (slave) {
            wrappedSlave = that._getWrappedElement(slave);
            wrappedSlaves.push(wrappedSlave);
        });
        return wrappedSlaves;
    },

    /**
     * @param array slaves enhanced slave elements
     */
    affectSlaves: function(slaves) {
        var effect = this.getEffect();
        slaves.each(function (currentSlave) {
            if (effect === 'wipe') {
                currentSlave.wipe();
            } else if (effect === 'hide') {
                currentSlave.hide();
            } else if (effect === 'enable') {
                currentSlave.enable();
            } else if (typeOf(effect) === 'object') {
                effect['affect'](currentSlave);
            } else {
                currentSlave.disable();
            }
      });
    },
    /**
     * @param array wrappedSlaves enhanced slave elements
     */
    unaffectSlaves: function(wrappedSlaves) {
        parentFunction = this;
        var effect = this.getEffect();
        wrappedSlaves.each(function (currentSlave) {
            if (effect === 'wipe') {
                currentSlave.enable();
            } else if (effect === 'hide') {
                currentSlave.show();
            } else if (effect === 'enable') {
                currentSlave.disable();
            } else if (typeOf(effect) === 'object') {
                effect['unaffect'](currentSlave);
            } else {
                currentSlave.enable();
            }
        });
    },

    _addEvents: function () {
        var parentFunction = this;
        this.getMasters().each(function (currentMaster) {
            currentMaster.getField().addEvent('keyup', function() {
                parentFunction._checkEffectToSlaves(currentMaster, parentFunction.getSlaves());
            });
            currentMaster.getField().addEvent('change', function() {
                parentFunction._checkEffectToSlaves(currentMaster, parentFunction.getSlaves());
            });
        });
    },
    /**
     * @param mixed triggerValue
     * @param HtmlWrapper master
     */
    _shouldEffectHappen: function (triggerValue, master) {
        if (typeOf(triggerValue) === 'function') {
            var result = triggerValue(master);
            if (result) {
                return true;
            }
        }
        if (triggerValue === master.getValue()) {
            return true;
        } else if (!triggerValue) {
            if (master.hasValue()) {
                return true;
            }
        }
        return false;
    },
    /** 
     * @param array|string|mootools element  currentMaster  the element or elements of which slave or slaves depend on
     * @param array|string|mootools element  slaves  the element or elements which depend on the master or masters
     */
    _checkEffectToSlaves: function (currentMaster, slaves) {
        triggerValue = this.triggerValue;
        wrappedSlaves = this._getEnhancedSlaves(slaves);
        var effectShouldHappen = false;
        var that = this;
        var shouldReturn = false;
        this.getMasters().each(function (master) {
            effectShouldHappen = that._shouldEffectHappen(triggerValue, master);
            if (effectShouldHappen) {
                that.affectSlaves(wrappedSlaves);
                shouldReturn = true;
            }
        });
        if (shouldReturn) {
            return;
        }
        if (triggerValue && triggerValue !== currentMaster.getValue() ||
            (!triggerValue && !effectShouldHappen)) {
            that.unaffectSlaves(wrappedSlaves);
        }
    }
});

var HtmlWrapper = new Class({
    setField: function(field) {
        this._field = field;
    },
    getField: function() {
        return this._field;
    },
    hide: function() {
        this._field.setStyle('display', 'none');
    },
    show: function() {
        this._field.setStyle('display', 'inline');
    }
});

var TextInput = new Class({
    Extends: HtmlWrapper,
    enable: function() {
        this._field.disabled = false;
    },
    disable: function() {
        this._field.disabled = "disabled";
    },
    wipe: function() {
        this.disable();
        this._field.value = "";
    },
    hasValue: function() {
        if (this._field.value) {
            return true;
        }
        return false;
    },
    getValue: function() {
        return this._field.value;
    }
});

var CheckboxInput = new Class({
    Extends: TextInput,
    wipe: function() {
        this.disable();
        this._field.checked = false;
    }
});

var SelectInput = new Class({
    Extends: TextInput,
    wipe: function() {
        this.disable();
        this._field.selectedIndex = 0;
    },
    hasValue: function() {
        return true;
    },
    getValue: function() {
        return this._field.getSelected().get('value')[0];
    }
});

var RadioInput = new Class({
    Extends: TextInput,
    wipe: function() {
        this.disable();
        this._field.set('checked', false);
    },
    hasValue: function() {
        return true;
    },
    getValue: function() {
        return this._field.get('checked');
    }
});
