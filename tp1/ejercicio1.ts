// animal.ts - Interface en TypeScript
interface Animal {
    hacerSonido(): void;
    moverse(): void;
}

// perro.ts - Implementación de la interface
class Perro implements Animal {
    hacerSonido(): void {
        console.log("Guau!");
    }

    moverse(): void {
        console.log("El perro corre");
    }
}

// main.ts - Archivo principal para probar
function main(): void {
    const miPerro: Animal = new Perro();

    console.log("Probando la interface Animal:");
    miPerro.hacerSonido();  // Imprime: Guau!
    miPerro.moverse();      // Imprime: El perro corre
}

// Ejecutar el programa
main();