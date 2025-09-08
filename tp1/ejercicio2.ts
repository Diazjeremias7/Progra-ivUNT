// figuraGeometrica.ts - Clase abstracta en TypeScript
abstract class FiguraGeometrica {
    protected nombre: string;

    constructor(nombre: string) {
        this.nombre = nombre;
    }

    abstract calcularArea(): number;

    getNombre(): string {
        return this.nombre;
    }

    mostrarInfo(): void {
        console.log(`figura: ${this.nombre}, area: ${this.calcularArea()}`);
    }
}

//Cuadrado 
class Cuadrado extends FiguraGeometrica {
    private lado: number;

    constructor(lado: number) {
        super("Cuadrado");
        this.lado = lado;
    }

    calcularArea(): number {
        return this.lado * this.lado;
    }
}

//Triangulo
class Triangulo extends FiguraGeometrica {
    private base: number;
    private altura: number;

    constructor(base: number, altura: number) {
        super("Triángulo");
        this.base = base;
        this.altura = altura;
    }

    calcularArea(): number {
        return (this.base * this.altura) / 2;
    }
}

//Circulo 
class Circulo extends FiguraGeometrica {
    private radio: number;

    constructor(radio: number) {
        super("circulo");
        this.radio = radio;
    }

    calcularArea(): number {
        return Math.PI * this.radio * this.radio;
    }
}


function main(): void {
    console.log("Probando figuras geometricas:");

    const cuadrado: FiguraGeometrica = new Cuadrado(5);
    const triangulo: FiguraGeometrica = new Triangulo(6, 8);
    const circulo: FiguraGeometrica = new Circulo(3);

    cuadrado.mostrarInfo();
    triangulo.mostrarInfo();
    circulo.mostrarInfo();
}


main();