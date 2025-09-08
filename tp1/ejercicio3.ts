// empleado.ts - Clase abstracta
abstract class Empleado {
    protected nombre: string;
    protected salarioBase: number;

    constructor(nombre: string, salarioBase: number) {
        this.nombre = nombre;
        this.salarioBase = salarioBase;
    }

    abstract calcularSalario(): number;

    getNombre(): string {
        return this.nombre;
    }

    mostrarInfo(): void {
        console.log(`Empleado: ${this.nombre}, Salario calculado: $${this.calcularSalario()}`);
    }
}

// empleadoTiempoCompleto.ts - Subclase
class EmpleadoTiempoCompleto extends Empleado {
    private bonoFijo: number = 20000;

    constructor(nombre: string, salarioBase: number) {
        super(nombre, salarioBase);
    }

    calcularSalario(): number {
        return this.salarioBase + this.bonoFijo;
    }
}

// empleadoMedioTiempo.ts - Subclase
class EmpleadoMedioTiempo extends Empleado {
    constructor(nombre: string, salarioBase: number) {
        super(nombre, salarioBase);
    }

    calcularSalario(): number {
        return this.salarioBase * 0.5;
    }
}

// main.ts - Archivo principal
function main(): void {
    console.log("Probando empleados (Herencia y Polimorfismo):");

    const empleados: Empleado[] = [
        new EmpleadoTiempoCompleto("Ana", 80000),
        new EmpleadoMedioTiempo("Luis", 60000),
        new EmpleadoTiempoCompleto("María", 100000),
    ];

    for (const empleado of empleados) {
        empleado.mostrarInfo();
    }
}

// Ejecutar
main();
