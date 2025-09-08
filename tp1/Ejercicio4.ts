interface Volador {
  volar(): void;
}

abstract class Animal {
  protected nombre: string;

  constructor(nombre: string) {
    this.nombre = nombre;
  }

  abstract hacerSonido(): void;
}

class Pajaro extends Animal implements Volador {
  private especie: string;

  constructor(nombre: string, especie: string) {
    super(nombre);
    this.especie = especie;
  }

  hacerSonido(): void {
    console.log(`${this.nombre} (${this.especie}) Pio pio`);
  }

  volar(): void {
    console.log(`${this.nombre} (${this.especie}) esta volando`);
  }
}

class Zorro extends Animal {
  private especie: string;

  constructor(nombre: string, especie: string) {
    super(nombre);
    this.especie = especie;
  }

  hacerSonido(): void {
    console.log(`${this.nombre} (${this.especie}) Guau guau`);
  }
}
