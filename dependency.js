var Dependency = new Class({
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
  _getWrappedElement: function(element) {
    if (element.type === 'text') {
      var wrappedElement = new TextInput();
      wrappedElement.setField(element);
    }
    if (element.type === 'checkbox') {
      var wrappedElement = new CheckboxInput();
      wrappedElement.setField(element);
    }
    return wrappedElement;
  },
  _getEnhancedSlaves: function(slaves) {
    var wrappedSlaves = [];
    var parentFunction = this;
    slaves.each(function (decoratedSlave) {
      wrappedSlave = parentFunction._getWrappedElement(decoratedSlave);
      wrappedSlaves.push(wrappedSlave);
    });
    return wrappedSlaves;
  },
  affectSlaves: function(slaves) {
    var parentFunction = this;
    slaves.each(function (currentSlave) {
      if (parentFunction.getEffect() === 'wipe') {
          currentSlave.wipe();
      } else {
        currentSlave.disable();
      }
    });
  },
  unaffectSlaves: function(wrappedSlaves) {
    wrappedSlaves.each(function (currentSlave) {
      currentSlave.enable();
    });
  },
  createDependency: function(master, slave, effect) {
    this.setEffect(effect);
    parentFunction = this;
    if (!master.length) {
      masters = [master];
    } else {
      masters = master;
    }

    var wrappedMasters = [];
    masters.each(function (currentMaster) {
      var wrappedMaster = parentFunction._getWrappedElement(currentMaster);
      wrappedMasters.push(wrappedMaster);
    });
    this.setMasters(wrappedMasters);
    var parentFunction = this;
    masters.each(function (currentMaster) {
      currentMaster = parentFunction._getWrappedElement(currentMaster);
      currentMaster.getField().addEvent('keyup', function() {
        if (!slave.length) {
          slaves = [slave];
        } else {
          slaves = slave;
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


var text = new TextInput();
text.setField($('foo'));

var slave = new TextInput();
slave.setField($('slave'));

var slaveCheckbox = new CheckboxInput();
slaveCheckbox.setField($('slaveCheckbox'));

var slaveCheckbox2 = new CheckboxInput();
slaveCheckbox2.setField($('slaveCheckbox2'));

//var dep = new Dependency();
//dep.createDependency(text, slave, 'wipe');
//dep.createDependency(text, slave);

//var depTextToCheckbox = new Dependency();
//depTextToCheckbox.createDependency(text, slaveCheckbox, 'wipe');

//var depTextToCheckbox2 = new Dependency();
 //depTextToCheckbox2.createDependency(text, slaveCheckbox2);

//var depTextToCheckbox = new Dependency();
//depTextToCheckbox.createDependency(text, document.getElements('.checkbox_class'), 'wipe');

var depTextToCheckbox = new Dependency();
depTextToCheckbox.createDependency(document.getElements('.text_class'), document.getElements('.checkbox_class'), 'wipe');
