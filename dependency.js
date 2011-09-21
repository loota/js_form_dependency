/**
 * License: MIT-style license
 */
var DependencyManager = new Class({
  setMasters: function(masters) {
    this._masters = masters;
  },
  getMasters: function() {
    return this._masters;
  },
  setEffect: function(effect) {
    this._effect = effect;
  },
  getEffect: function() {
    return this._effect;
  },
  // @param DOM element element
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
  // @param array slaves of DOM elements
  _getEnhancedSlaves: function(slaves) {
    var wrappedSlaves = [];
    var parentFunction = this;
    slaves.each(function (decoratedSlave) {
      wrappedSlave = parentFunction._getWrappedElement(decoratedSlave);
      wrappedSlaves.push(wrappedSlave);
    });
    return wrappedSlaves;
  },
  // @param array slaves of enhanced slave elements
  affectSlaves: function(slaves) {
    var parentFunction = this;
    slaves.each(function (currentSlave) {
      if (parentFunction.getEffect() === 'wipe') {
          currentSlave.wipe();
      } else if (parentFunction.getEffect() === 'hide') {
        currentSlave.hide();
      } else if (parentFunction.getEffect() === 'enable') {
        currentSlave.enable();
      } else if (typeOf(parentFunction.getEffect()) === 'object') {
          parentFunction.getEffect()['affect'](currentSlave);
      } else {
        currentSlave.disable();
      }
    });
  },
  // @param array slaves of enhanced slave elements
  unaffectSlaves: function(wrappedSlaves) {
    parentFunction = this;
    wrappedSlaves.each(function (currentSlave) {
      if (parentFunction.getEffect() === 'wipe') {
        currentSlave.enable();
      } else if (parentFunction.getEffect() === 'hide') {
        currentSlave.show();
      } else if (parentFunction.getEffect() === 'enable') {
        currentSlave.disable();
      } else if (typeOf(parentFunction.getEffect()) === 'object') {
          parentFunction.getEffect()['unaffect'](currentSlave);
      } else {
        currentSlave.enable();
      }
    });
  },
  // @param array|string|mootools element  master  the element or elements of which slave or slaves depend on
  // @param array|string|mootools element  slave  the element or elements which depend on the master or masters
  // @param string|object  effect  the effect which happens to the slave element
  // or elements. One of hide, disable, enable, wipe. If given an object, there
  // must be two members: 'affect' and 'unaffect'.
  // 'affect' must contain a function which is run when the
  // master has the preferred value and should contain functionality for
  // defining what happens to the slave. 
  // The 'unaffect' is run when the master gains other than the preferred value
  // and defines what happens to slaves in that case.
  // @param string|function  triggerValue  the value that the master or masters must to have in
  // order to affect the slave or slaves. If given a function, the function's
  // return value must match the master's value in order for the slave to react.
  createDependency: function(master, slave, effect, triggerValue) {

    if (typeOf(master) === 'string') {
        master = $(master);
    }
    if (typeOf(slave) === 'string') {
        slave = $(slave);
    }
    this.setEffect(effect);
    parentFunction = this;
    if (typeOf(master) === 'array' || typeOf(master) === 'elements') {
      masters = master;
    } else {
      masters = [master];
    }

    var wrappedMasters = [];
    masters.each(function (currentMaster) {
      var wrappedMaster = parentFunction._getWrappedElement(currentMaster);
      wrappedMasters.push(wrappedMaster);
    });
    this.setMasters(wrappedMasters);
    var parentFunction = this;
    this.getMasters().each(function (currentMaster) {
      currentMaster.getField().addEvent('keyup', function() {
          parentFunction.checkEffectToSlaves(currentMaster, slave, triggerValue, parentFunction);
      });
      currentMaster.getField().addEvent('change', function() {
          parentFunction.checkEffectToSlaves(currentMaster, slave, triggerValue, parentFunction);
      });
    });
  },
  
  // @param array|string|mootools element  master  the element or elements of which slave or slaves depend on
  // @param array|string|mootools element  slave  the element or elements which depend on the master or masters
  // @param string|function  triggerValue  the value that the master or masters must to have in
  // order to affect the slave or slaves. @see createDependency
  checkEffectToSlaves: function (currentMaster, slave, triggerValue, parentFunction){
    if (typeOf(slave) === 'array' || typeOf(slave) === 'elements') {
      slaves = slave;
    } else {
      slaves = [slave];
    }
    if (typeOf(triggerValue) === 'function') {
        var result = triggerValue(currentMaster);
        triggerValue = result;
    }
    wrappedSlaves = this._getEnhancedSlaves(slaves);
    var effectShouldHappen = false;
    if (triggerValue === currentMaster.getValue()) {
      effectShouldHappen = true;
    } else if (!triggerValue) {
      if (currentMaster.hasValue()) {
        effectShouldHappen = true;
      }
    }
    if (effectShouldHappen) {
      this.affectSlaves(wrappedSlaves);
    } else {
      this.getMasters().each(function (otherMaster) {
        if (triggerValue === otherMaster.getValue()) {
          effectShouldHappen = true;
        } else if (!triggerValue) {
          if (otherMaster.hasValue()) {
            effectShouldHappen = true;
          }
        }
        if (effectShouldHappen) {
          this.affectSlaves(wrappedSlaves);
        }
      });
    }
    if (triggerValue && triggerValue !== currentMaster.getValue() || (!triggerValue && !effectShouldHappen)) {
      this.unaffectSlaves(wrappedSlaves);
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
