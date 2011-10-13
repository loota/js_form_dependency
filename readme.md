Manages dependencies between HTML form elements such as disabling, enabling and hiding an input after
another input has been assigned some value. Custom effects can be configured via
function callbacks.

Installation
--------------------
Include the script dependency.js and the MooTools JavaScript library in your webpage.

Quick start
-----------
Synopsis:
new DependencyManager(MASTER, SLAVE[, EFFECT][, TRIGGER]);

Disable element with id 'two' when element with id 'one' has value
new DependencyManager('one', 'two');

Hide element with id 'two' when element with id 'one' has value
new DependencyManager('one', 'two', 'hide');

Disable element with id 'two' when element with id 'one' has value '42'.
new DependencyManager('one', 'two', 'disable', '42');

Make sure the value of element with id 'two' is 'affected' when element with id
'one' has value, and the value is 'unaffected' when element with id 'one' has no
value.

new DependencyManager('one', 'two', 'disable', 
    {
        affect: function(slave) {
            slave._field.set('value',  'affected');
        } 
        unaffect: function(slave) {
            slave._field.set('value',  'unaffected');
        } 
    }
);

Disable element with id 'two' when element with id 'one' has a value divisible
by 10.
new DependencyManager('one', 'two', 'disable',
    function (master) {
        return master.getValue() > 0 && master.getValue() % 10 === 0;
    }
);

Detailed description
--------------------
Some elements, called slaves in this document, are defined to depend on other elements, called masters in this document.

Triggering value is by default any value other than empty string in the HTML input element.

At minimum, the dependency manager takes a master and a slave, and adds an event to the onchange and onkeyup events on the master. In these events the dependency manager checks if the value of the master matches the triggering value and if it does, it initiates an effect on the slaves.

Tha masters and slaves can be passed as arrays and in that case, any master having the triggering value will cause the effect upon all the slaves.

The effect can be passed as a string, which should be one of the following: hide, disable, enable or wipe. Wipe sets the element as disabled and removes the value, or if removing is impossible as with select lists, set a default value. 

A custom effect can be supplied in an object, which must contain two functions: one for defining the effect when master is assigned the defined value, and one for defining what happens when the master no longer has the defined value.

A triggering value can be supplied as a string or as a function, which returns the triggering value. This function may receive a parameter, which is the HtmlWrapper of the master element. The function is called once for each master defined in the dependency, and if any of them has the same value as the function returns, the effect will take place.
