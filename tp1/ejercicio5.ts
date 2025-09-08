interface Electrico {
  cargarBateria(): void;
  mostrarAutonomia(): number;
}

abstract class Vehiculo {
  protected marca: string;
  protected modelo: string;
  protected anio: number;

  constructor(marca: string, modelo: string, anio: number) {
    this.marca = marca;
    this.modelo = modelo;
    this.anio = anio;
  }

  abstract encender(): void;
  abstract apagar(): void;
}

class Auto extends Vehiculo implements Electrico {
  private cantidadPuertas: number;
  private bateria: number; 

  constructor(marca: string, modelo: string, anio: number, cantidadPuertas: number) {
    super(marca, modelo, anio);
    this.cantidadPuertas = cantidadPuertas;
    this.bateria = 100;
  }

  encender(): void {
    console.log(`${this.marca} ${this.modelo} encendido.`);
  }

  apagar(): void {
    console.log(`${this.marca} ${this.modelo} apagado.`);
  }

  tocarBocina(): void {
    console.log("¡Beep Beep!");
  }

  cargarBateria(): void {
    this.bateria = 100;
    console.log("Batería cargada al 100%.");
  }

  mostrarAutonomia(): number {
    const autonomia = this.bateria * 3; 
    console.log(`Autonomía restante: ${autonomia} km`);
    return autonomia;
  }
}

class Moto extends Vehiculo {
  private cilindrada: number;

  constructor(marca: string, modelo: string, anio: number, cilindrada: number) {
    super(marca, modelo, anio);
    this.cilindrada = cilindrada;
  }

  encender(): void {
    console.log(`${this.marca} ${this.modelo} rugiendo con ${this.cilindrada}cc.`);
  }

  apagar(): void {
    console.log(`${this.marca} ${this.modelo} apagada.`);
  }

  hacerWheelie(): void {
    console.log("¡Haciendo un wheelie! 🏍️");
  }
}

const tesla = new Auto("Tesla", "Model 3", 2024, 4);
tesla.encender();
tesla.tocarBocina();
tesla.mostrarAutonomia();
tesla.cargarBateria();
tesla.apagar();

const yamaha = new Moto("Yamaha", "MT-07", 2022, 689);
yamaha.encender();
yamaha.hacerWheelie();
yamaha.apagar();
