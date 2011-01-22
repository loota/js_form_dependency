var Dependency = new Class({
  setDependent: function(dependent) {
    this._dependent = dependent;
  },
  setMaster: function(master) {
    this._master = master;
  },
  createDependency: function(master, slave, effect) {
    master.getField().addEvent('keyup', function() {
      if (!slave.lenght) {
        slaves = [slave];
      }
      if (master.hasValue()) {
        if (effect === 'wipe') {
          slaves.each(function (currentSlave) {
            currentSlave.wipe();
          });
        } else {
          slave.disable();
        }
      } else {
        slave.enable();
      }
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

var Dependent = new Class({
  Extends: HtmlWrapper
});

var TextInput = new Class({
  Extends: Dependent,
  enable: function() {
    this._field.disabled = false;
  },
  disable: function() {
    this._field.disabled = "disabled";
  },
  wipe: function() {
    this.disable();
    this._field.value = "";
  }
});

var CheckboxInput = new Class({
  Extends: TextInput,
  wipe: function() {
    this.disable();
    this._field.checked = false;
  }
});

var TextMaster = new Class({
  Extends: HtmlWrapper,
  hasValue: function() {
    if (this._field.value) {
      return true;
    }
    return false;
  }
});

var text = new TextMaster();
text.setField($('foo'));

var slave = new TextInput();
slave.setField($('slave'));

var slaveCheckbox = new CheckboxInput();
slaveCheckbox.setField($('slaveCheckbox'));

var slaveCheckbox2 = new CheckboxInput();
slaveCheckbox2.setField($('slaveCheckbox2'));

var dep = new Dependency();
//dep.createDependency(text, slave, 'wipe');
dep.createDependency(text, slave);

var depTextToCheckbox = new Dependency();
depTextToCheckbox.createDependency(text, slaveCheckbox, 'wipe');

var depTextToCheckbox2 = new Dependency();
 depTextToCheckbox2.createDependency(text, slaveCheckbox2);
