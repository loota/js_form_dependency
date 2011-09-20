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
      wrappedElement.setField(element);
    }
    if (element.type === 'checkbox') {
      var wrappedElement = new CheckboxInput();
      wrappedElement.setField(element);
    }
    if (element.type === 'select-one') {
      var wrappedElement = new SelectInput();
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
      } else {
        currentSlave.enable();
      }
    });
  },
  // @param array|string|mootools element  master  the element or elements of which slave or slaves depend on
  // @param array|string|mootools element  slave  the element or elements which depend on the master or masters
  createDependency: function(master, slave, effect) {

    // @param string  effect  the effect which happens to the slave element or elements. One of hide, disable, enable, wipe
    this.setEffect(effect);
    parentFunction = this;
    if (typeOf(master) === 'array') {
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
        if (typeOf(slave) === 'array') {
          slaves = slave;
        } else {
          slaves = [slave];
        }
        wrappedSlaves = parentFunction._getEnhancedSlaves(slaves);
        var masterHasValue = false;
        if (currentMaster.hasValue()) {
          masterHasValue = true;
          parentFunction.affectSlaves(wrappedSlaves);
        } else {
          parentFunction.getMasters().each(function (otherMaster) {
            if (otherMaster.hasValue()) {
              masterHasValue = true;
              parentFunction.affectSlaves(wrappedSlaves);
            }
          });
        }
        if (!masterHasValue) {
          parentFunction.unaffectSlaves(wrappedSlaves);
        }
      });
    });
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
  }
});
