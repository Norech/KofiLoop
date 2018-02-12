//@ts-check
var kofiloop = require('./dist/KofiLoop');

var planets = ["Mercure", "Venus", "Earth", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"];

console.log("What are the planets of the solar system?")

kofiloop.startLoop(function() {
    var planet = planets[this.step - 1];
    this.value = planet;

    if (planet == "Pluto")
        throw "Since 2006, Pluto is a dwarf planet.";
}, 500)

.stepStart(loop => {
    if (loop.step == planets.length - 1)
        loop.stop();
})

.step((loop, planet) => console.log(planet))

.error(err => console.error("Whoops: " + err))

.end(() => console.log("And that's all!"));