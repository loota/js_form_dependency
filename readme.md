
Manages dependencies between HTML form elements such as disabling, enabling and hiding an input after
another input has been assigned some value. Custom effects can be configured via
function callbacks.

Installation
--------------------
Include the script dependency.js and the MooTools JavaScript library in your
webpage.

Detailed description
--------------------
Some elements, called slaves in this document, are defined to depend on other elements,
called masters in this document.

At minimum, the dependency manager takes a master and a slave, and adds an event to the
onchange and onkeyup events on the master. In this event the dependency manager
checks if the value of the master matches the triggering value and if it does, it
initiates an effect on the slaves.

There are predefined effects:
 * hide
 * disable
 * enable
 * wipe (set the element as disabled and remove the value, or if impossible, set a default value) 

A custom effect can be supplied in an object, which may contain two
functions: one for defining the effect when master is assigned the defined value, and one for defining
what happens when the master no longer has the defined value.

A triggering value can be supplied as a string or as a function, which should
return the triggering value.
