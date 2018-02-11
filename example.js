var kofiloop = require('./dist/KofiLoop');

var i = 0;
var planets = ["Mercure", "Venus", "Earth", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"];

console.log("What are the planets of the solar system?")

kofiloop.startLoop(function() {
    var planet = planets[i];
    this.value = planet;

    if (planet === "Pluto")
        throw "Since 2006, Pluto is a dwarf planet.";

    i++;
}, 2000)

.step(loop => {
    if (i >= planets.length)
        loop.stop();
})

.step((loop, planet) => console.log(planet))

.end(() => console.log("And that's all!"))

.error(err => console.error("Whoops: " + err));